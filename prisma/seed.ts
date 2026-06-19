import { PrismaClient, LecturerRank, StudentStatus, StaffStatus, FeeType, InvoiceStatus, PaymentStatus, SemesterName, AudienceType, RegistrationStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as crypto from 'crypto';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function hashPassword(password: string): Promise<string> {
  // Simple SHA-256 for seeding purposes. 
  // In production, use bcrypt or argon2.
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('🌱 Starting Database Seeding...');

  // 1. Roles & Permissions Setup
  const adminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: {
      name: 'SUPER_ADMIN',
      description: 'Super Administrator with full ERP permissions',
    },
  });

  const lecturerRole = await prisma.role.upsert({
    where: { name: 'LECTURER' },
    update: {},
    create: {
      name: 'LECTURER',
      description: 'Academic staff offering courses and grading',
    },
  });

  const studentRole = await prisma.role.upsert({
    where: { name: 'STUDENT' },
    update: {},
    create: {
      name: 'STUDENT',
      description: 'Enrolled students at CrestOak College',
    },
  });

  const applicantRole = await prisma.role.upsert({
    where: { name: 'APPLICANT' },
    update: {},
    create: {
      name: 'APPLICANT',
      description: 'Prospective students applying for admission',
    },
  });

  console.log('✅ Roles created/upserted.');

  // Create permissions
  const permissions = [
    { name: 'read:students', description: 'Read student profiles' },
    { name: 'write:students', description: 'Modify student profiles' },
    { name: 'grade:courses', description: 'Grade allocated courses' },
    { name: 'approve:results', description: 'Approve semester grades' },
    { name: 'process:payments', description: 'Manage financial payments' },
  ];

  for (const perm of permissions) {
    const createdPerm = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });

    // Assign all to SUPER_ADMIN
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: createdPerm.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: createdPerm.id,
      },
    });

    // Assign grading to LECTURER
    if (perm.name.startsWith('grade')) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: lecturerRole.id,
            permissionId: createdPerm.id,
          },
        },
        update: {},
        create: {
          roleId: lecturerRole.id,
          permissionId: createdPerm.id,
        },
      });
    }
  }

  console.log('✅ Permissions mapped to Roles.');

  // 2. Academic Session and Semester
  const currentSession = await prisma.academicSession.upsert({
    where: { name: '2025/2026' },
    update: {},
    create: {
      name: '2025/2026',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2026-07-31'),
      isActive: true,
    },
  });

  // Check if semesters exist, otherwise create them
  const existingSemesters = await prisma.semester.findMany({
    where: { sessionId: currentSession.id }
  });

  let firstSemester;
  let secondSemester;

  if (existingSemesters.length === 0) {
    firstSemester = await prisma.semester.create({
      data: {
        name: SemesterName.FIRST,
        startDate: new Date('2025-09-01'),
        endDate: new Date('2026-02-15'),
        isActive: true,
        sessionId: currentSession.id,
      },
    });

    secondSemester = await prisma.semester.create({
      data: {
        name: SemesterName.SECOND,
        startDate: new Date('2026-02-20'),
        endDate: new Date('2026-07-31'),
        isActive: false,
        sessionId: currentSession.id,
      },
    });
  } else {
    firstSemester = existingSemesters.find(s => s.name === SemesterName.FIRST) || existingSemesters[0];
    secondSemester = existingSemesters.find(s => s.name === SemesterName.SECOND) || existingSemesters[1];
  }

  console.log('✅ Sessions and Semesters established.');

  // 3. User Accounts (Super Admin)
  const passwordHash = await hashPassword('Adm1nSecureP@ss123!');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@crestoakcollege.edu.ng' },
    update: {},
    create: {
      email: 'admin@crestoakcollege.edu.ng',
      passwordHash,
      firstName: 'Elizabeth',
      lastName: 'Adebayo',
      middleName: 'Oluwatoyin',
      phoneNumber: '+2348011223344',
      roleId: adminRole.id,
      isActive: true,
    },
  });

  console.log('✅ Admin user created.');

  // 4. Faculties, Departments, and Programmes
  const scienceFaculty = await prisma.faculty.upsert({
    where: { code: 'SCI' },
    update: {},
    create: {
      name: 'Faculty of Science',
      code: 'SCI',
      description: 'Department of computer science, mathematics, statistics, chemistry etc.',
    },
  });

  const cscDepartment = await prisma.department.upsert({
    where: { code: 'CSC' },
    update: {},
    create: {
      name: 'Computer Science & Information Technology',
      code: 'CSC',
      facultyId: scienceFaculty.id,
    },
  });

  const bscCscProg = await prisma.programme.upsert({
    where: { code: 'BSC-CSC' },
    update: {},
    create: {
      name: 'B.Sc. Computer Science',
      code: 'BSC-CSC',
      durationYears: 4,
      degreeAwarded: 'B.Sc.',
      departmentId: cscDepartment.id,
    },
  });

  console.log('✅ Academic structure (Faculty, Dept, Programme) seeded.');

  // 5. Courses
  const csc101 = await prisma.course.upsert({
    where: { code: 'CSC101' },
    update: {},
    create: {
      code: 'CSC101',
      title: 'Introduction to Computer Science',
      creditUnits: 3,
      level: 100,
      semesterName: SemesterName.FIRST,
      departmentId: cscDepartment.id,
    },
  });

  const csc102 = await prisma.course.upsert({
    where: { code: 'CSC102' },
    update: {},
    create: {
      code: 'CSC102',
      title: 'Structured Programming in C',
      creditUnits: 3,
      level: 100,
      semesterName: SemesterName.SECOND,
      departmentId: cscDepartment.id,
    },
  });

  // Link Courses to Programme
  await prisma.programmeCourse.upsert({
    where: { programmeId_courseId: { programmeId: bscCscProg.id, courseId: csc101.id } },
    update: {},
    create: { programmeId: bscCscProg.id, courseId: csc101.id },
  });

  await prisma.programmeCourse.upsert({
    where: { programmeId_courseId: { programmeId: bscCscProg.id, courseId: csc102.id } },
    update: {},
    create: { programmeId: bscCscProg.id, courseId: csc102.id },
  });

  console.log('✅ Courses registered and mapped to programmes.');

  // 6. Staff & Lecturer Profile
  const lecturerUser = await prisma.user.upsert({
    where: { email: 'f.samuel@crestoakcollege.edu.ng' },
    update: {},
    create: {
      email: 'f.samuel@crestoakcollege.edu.ng',
      passwordHash: await hashPassword('LecturerPass123!'),
      firstName: 'Festus',
      lastName: 'Samuel',
      phoneNumber: '+2348055554444',
      roleId: lecturerRole.id,
    },
  });

  const lecturerStaff = await prisma.staff.upsert({
    where: { id: lecturerUser.id },
    update: {},
    create: {
      id: lecturerUser.id,
      staffNo: 'EMP-CSC-001',
      designation: 'Senior Lecturer',
      status: StaffStatus.ACTIVE,
      joiningDate: new Date('2020-03-15'),
      departmentId: cscDepartment.id,
    },
  });

  const lecturerProfile = await prisma.lecturer.upsert({
    where: { id: lecturerStaff.id },
    update: {},
    create: {
      id: lecturerStaff.id,
      rank: LecturerRank.SENIOR_LECTURER,
      specialization: 'Artificial Intelligence & Machine Learning',
    },
  });

  // Allocate course to Lecturer
  const existingAllocation = await prisma.courseAllocation.findFirst({
    where: {
      lecturerId: lecturerProfile.id,
      courseId: csc101.id,
      sessionId: currentSession.id,
      semesterId: firstSemester.id,
    }
  });

  if (!existingAllocation) {
    await prisma.courseAllocation.create({
      data: {
        lecturerId: lecturerProfile.id,
        courseId: csc101.id,
        sessionId: currentSession.id,
        semesterId: firstSemester.id,
      },
    });
  }

  console.log('✅ Staff, Lecturer profiles, and Course allocations completed.');

  // 7. Student Profile
  const studentUser = await prisma.user.upsert({
    where: { email: 'j.doe@crestoakcollege.edu.ng' },
    update: {},
    create: {
      email: 'j.doe@crestoakcollege.edu.ng',
      passwordHash: await hashPassword('StudentPass123!'),
      firstName: 'John',
      lastName: 'Doe',
      middleName: 'Alexander',
      phoneNumber: '+2348099998888',
      roleId: studentRole.id,
    },
  });

  const studentProfile = await prisma.student.upsert({
    where: { id: studentUser.id },
    update: {},
    create: {
      id: studentUser.id,
      matricNo: 'UG/2025/CSC/1001',
      status: StudentStatus.ACTIVE,
      level: 100,
      departmentId: cscDepartment.id,
      programmeId: bscCscProg.id,
      entrySessionId: currentSession.id,
      currentSessionId: currentSession.id,
      currentSemesterId: firstSemester.id,
    },
  });

  console.log('✅ Student accounts, profiles created.');

  // 8. Course Registration & Result Entry
  const existingReg = await prisma.courseRegistration.findFirst({
    where: {
      studentId: studentProfile.id,
      courseId: csc101.id,
      sessionId: currentSession.id,
      semesterId: firstSemester.id,
    }
  });

  if (!existingReg) {
    await prisma.courseRegistration.create({
      data: {
        studentId: studentProfile.id,
        courseId: csc101.id,
        sessionId: currentSession.id,
        semesterId: firstSemester.id,
        status: RegistrationStatus.APPROVED,
      },
    });
  }

  const existingResult = await prisma.result.findFirst({
    where: {
      studentId: studentProfile.id,
      courseId: csc101.id,
      sessionId: currentSession.id,
      semesterId: firstSemester.id,
    }
  });

  if (!existingResult) {
    await prisma.result.create({
      data: {
        studentId: studentProfile.id,
        courseId: csc101.id,
        sessionId: currentSession.id,
        semesterId: firstSemester.id,
        caScore: 28.00,
        examScore: 62.00,
        totalScore: 90.00,
        grade: 'A',
        gp: 5.00,
        isPublished: true,
        gradedById: lecturerProfile.id,
      },
    });
  }

  // Update GPA/CGPA for student
  await prisma.student.update({
    where: { id: studentProfile.id },
    data: {
      gpa: 5.00,
      cgpa: 5.00,
    },
  });

  console.log('✅ Course registration and grading completed.');

  // 9. Billing & Invoicing
  const existingInvoice = await prisma.invoice.findUnique({
    where: { invoiceNo: 'INV-2025-0001' }
  });

  let tuitionInvoice;
  if (!existingInvoice) {
    tuitionInvoice = await prisma.invoice.create({
      data: {
        invoiceNo: 'INV-2025-0001',
        amount: 150000.00,
        description: 'Tuition Fee - 100 Level Computer Science (First Semester)',
        feeType: FeeType.TUITION,
        status: InvoiceStatus.PAID,
        dueDate: new Date('2025-10-31'),
        userId: studentUser.id,
        sessionId: currentSession.id,
        semesterId: firstSemester.id,
      },
    });

    await prisma.payment.create({
      data: {
        reference: 'TXN-REMITA-928374928',
        amountPaid: 150000.00,
        method: 'REMITA',
        status: PaymentStatus.PAID,
        paidAt: new Date('2025-09-15'),
        invoiceId: tuitionInvoice.id,
        metadata: { gateway: 'remita', status_code: '01', ip: '127.0.0.1' },
      },
    });
  }

  console.log('✅ Financial invoices and payments generated.');

  // 10. News, Announcements, Gallery
  const adminAuthorId = adminUser.id;
  const existingNews = await prisma.news.findUnique({
    where: { slug: 'welcome-academic-session-2025-2026' }
  });

  if (!existingNews) {
    await prisma.news.create({
      data: {
        title: 'Welcome to CrestOak College Academic Session 2025/2026',
        slug: 'welcome-academic-session-2025-2026',
        content: 'We are thrilled to welcome all new and returning students to the 2025/2026 academic session. Registration commences on Monday.',
        isPublished: true,
        publishedAt: new Date(),
        authorId: adminAuthorId,
      },
    });
  }

  const existingAnnounce = await prisma.sentAnnouncements.findFirst({
    where: { title: 'Orientation Lecture for Freshman Students' }
  });

  if (!existingAnnounce) {
    await prisma.sentAnnouncements.create({
      data: {
        title: 'Orientation Lecture for Freshman Students',
        content: 'All 100-level students should attend the mandatory orientation session at the main college auditorium by 10 AM on Friday.',
        audience: AudienceType.STUDENTS,
        senderId: adminAuthorId,
      },
    });
  }

  const existingGallery = await prisma.gallery.findFirst({
    where: { imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80' }
  });

  if (!existingGallery) {
    await prisma.gallery.create({
      data: {
        title: 'College Main Campus Entrance',
        imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80',
        album: 'Campus Infrastructure',
        uploadedById: adminAuthorId,
      },
    });
  }

  // 11. Audit Logs
  await prisma.auditLog.create({
    data: {
      action: 'CREATE_STUDENT_RECORD',
      entity: 'Student',
      entityId: studentProfile.id,
      newValues: { matricNo: studentProfile.matricNo, name: 'John Doe' },
      userId: adminAuthorId,
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  });

  console.log('🌱 Seeding Completed Successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
