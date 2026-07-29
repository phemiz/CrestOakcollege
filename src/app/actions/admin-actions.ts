import db from "@/lib/db";
import { getSafeSession } from "@/lib/session";
import { createAuditLog } from "@/lib/audit";

const revalidatePath = (...args: any[]) => {
  if (typeof window === "undefined") {
    try {
      require("next/cache").revalidatePath(...args);
    } catch {}
  }
};

// Helper to check if user has admin permissions
async function checkAdminAuth() {
  const session = await getSafeSession();
  if (!session || !["Super Admin", "Admin", "Bursary", "Staff"].includes(session.user.role)) {
    throw new Error("Unauthorized: Access denied");
  }
  return session;
}

// ----------------------------------------------------
// 1. STUDENTS MANAGEMENT
// ----------------------------------------------------
export async function upsertStudentProfile(data: {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phoneNumber?: string;
  matricNo: string;
  level: number;
  departmentId: string;
  programmeId: string;
  entrySessionId: string;
  currentSessionId: string;
  currentSemesterId: string;
}) {
  const session = await checkAdminAuth();
  const operatorId = session.user.id;

  try {
    // Find or create SUPER_ADMIN/STUDENT role ID from database
    const studentRole = await db.role.findFirst({
      where: { name: "STUDENT" }
    });
    if (!studentRole) throw new Error("STUDENT role not configured in database.");

    let user;
    if (data.id) {
      // Edit mode
      const oldStudent = await db.student.findUnique({
        where: { id: data.id },
        include: { user: true }
      });

      user = await db.user.update({
        where: { id: data.id },
        data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          middleName: data.middleName || null,
          phoneNumber: data.phoneNumber || null,
          student: {
            update: {
              matricNo: data.matricNo,
              level: Number(data.level),
              departmentId: data.departmentId,
              programmeId: data.programmeId,
              entrySessionId: data.entrySessionId,
              currentSessionId: data.currentSessionId,
              currentSemesterId: data.currentSemesterId
            }
          }
        },
        include: { student: true }
      });

      await createAuditLog({
        userId: operatorId,
        action: "UPDATE",
        entity: "Student",
        entityId: data.id,
        oldValues: oldStudent,
        newValues: user
      });
    } else {
      // Create mode
      // Generate default password hash for new students: password123
      // In production, send a reset email. For setup, use simple password.
      const defaultPasswordHash = "$argon2id$v=19$m=4096,t=3,p=1$q1UFpU6weAGvKsmmhdEiHA$JOyPNbM6RRFsU3r4wen+FEnh6uCJ3ODrwWlSZl1fr8A"; 

      user = await db.user.create({
        data: {
          email: data.email,
          passwordHash: defaultPasswordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          middleName: data.middleName || null,
          phoneNumber: data.phoneNumber || null,
          roleId: studentRole.id,
          student: {
            create: {
              matricNo: data.matricNo,
              level: Number(data.level),
              departmentId: data.departmentId,
              programmeId: data.programmeId,
              entrySessionId: data.entrySessionId,
              currentSessionId: data.currentSessionId,
              currentSemesterId: data.currentSemesterId
            }
          }
        },
        include: { student: true }
      });

      await createAuditLog({
        userId: operatorId,
        action: "CREATE",
        entity: "Student",
        entityId: user.id,
        newValues: user
      });
    }

    revalidatePath("/admin/students");
    return { success: true, student: user };
  } catch (error: any) {
    console.error("[admin-actions] upsertStudentProfile error:", error);
    return { success: false, error: error.message || "Failed to save student profile" };
  }
}

export async function deleteStudentProfile(studentId: string) {
  const session = await checkAdminAuth();
  const operatorId = session.user.id;

  try {
    // Soft delete student profile and user account
    await db.$transaction([
      db.student.update({
        where: { id: studentId },
        data: { isDeleted: true, deletedAt: new Date() }
      }),
      db.user.update({
        where: { id: studentId },
        data: { isDeleted: true, deletedAt: new Date(), isActive: false }
      })
    ]);

    await createAuditLog({
      userId: operatorId,
      action: "DELETE",
      entity: "Student",
      entityId: studentId,
      newValues: { status: "SOFT_DELETED" }
    });

    revalidatePath("/admin/students");
    return { success: true };
  } catch (error: any) {
    console.error("[admin-actions] deleteStudentProfile error:", error);
    return { success: false, error: error.message || "Failed to delete student" };
  }
}

// ----------------------------------------------------
// 2. STAFF & LECTURERS MANAGEMENT
// ----------------------------------------------------
export async function upsertStaffProfile(data: {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phoneNumber?: string;
  staffNo: string;
  designation: string;
  joiningDate: Date;
  departmentId: string;
  roleName: "STAFF" | "LECTURER" | "BURSAR" | "REGISTRAR";
  rank?: string; // Lecturer only
  specialization?: string; // Lecturer only
}) {
  const session = await checkAdminAuth();
  const operatorId = session.user.id;

  try {
    const targetRole = await db.role.findFirst({
      where: { name: data.roleName }
    });
    if (!targetRole) throw new Error(`${data.roleName} role not configured in database.`);

    let user;
    if (data.id) {
      // Edit Mode
      user = await db.user.update({
        where: { id: data.id },
        data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          middleName: data.middleName || null,
          phoneNumber: data.phoneNumber || null,
          roleId: targetRole.id,
          staff: {
            update: {
              staffNo: data.staffNo,
              designation: data.designation,
              joiningDate: data.joiningDate,
              departmentId: data.departmentId
            }
          }
        },
        include: { staff: true }
      });

      // Update Lecturer rank/specialization if applicable
      if (data.roleName === "LECTURER") {
        await db.lecturer.upsert({
          where: { id: data.id },
          update: {
            rank: (data.rank || "LECTURER_II") as any,
            specialization: data.specialization || ""
          },
          create: {
            id: data.id,
            rank: (data.rank || "LECTURER_II") as any,
            specialization: data.specialization || ""
          }
        });
      } else {
        // If demoted from lecturer, remove lecturer record
        await db.lecturer.deleteMany({
          where: { id: data.id }
        });
      }

      await createAuditLog({
        userId: operatorId,
        action: "UPDATE",
        entity: "Staff",
        entityId: data.id,
        newValues: user
      });
    } else {
      // Create Mode
      const defaultPasswordHash = "$argon2id$v=19$m=4096,t=3,p=1$q1UFpU6weAGvKsmmhdEiHA$JOyPNbM6RRFsU3r4wen+FEnh6uCJ3ODrwWlSZl1fr8A"; // password123

      user = await db.user.create({
        data: {
          email: data.email,
          passwordHash: defaultPasswordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          middleName: data.middleName || null,
          phoneNumber: data.phoneNumber || null,
          roleId: targetRole.id,
          staff: {
            create: {
              staffNo: data.staffNo,
              designation: data.designation,
              joiningDate: data.joiningDate,
              departmentId: data.departmentId
            }
          }
        },
        include: { staff: true }
      });

      if (data.roleName === "LECTURER") {
        await db.lecturer.create({
          data: {
            id: user.id,
            rank: (data.rank || "LECTURER_II") as any,
            specialization: data.specialization || ""
          }
        });
      }

      await createAuditLog({
        userId: operatorId,
        action: "CREATE",
        entity: "Staff",
        entityId: user.id,
        newValues: user
      });
    }

    revalidatePath("/admin/staff");
    return { success: true, staff: user };
  } catch (error: any) {
    console.error("[admin-actions] upsertStaffProfile error:", error);
    return { success: false, error: error.message || "Failed to save staff profile" };
  }
}

export async function deleteStaffProfile(staffId: string) {
  const session = await checkAdminAuth();
  const operatorId = session.user.id;

  try {
    // Soft delete staff profile and user account
    await db.$transaction([
      db.staff.update({
        where: { id: staffId },
        data: { isDeleted: true, deletedAt: new Date() }
      }),
      db.user.update({
        where: { id: staffId },
        data: { isDeleted: true, deletedAt: new Date(), isActive: false }
      })
    ]);

    await createAuditLog({
      userId: operatorId,
      action: "DELETE",
      entity: "Staff",
      entityId: staffId,
      newValues: { status: "SOFT_DELETED" }
    });

    revalidatePath("/admin/staff");
    return { success: true };
  } catch (error: any) {
    console.error("[admin-actions] deleteStaffProfile error:", error);
    return { success: false, error: error.message || "Failed to delete staff member" };
  }
}

// ----------------------------------------------------
// 3. ADMISSIONS & APPLICATIONS MANAGEMENT
// ----------------------------------------------------
export async function processApplicationDecision(applicationId: string, decision: "APPROVED" | "REJECTED") {
  const session = await checkAdminAuth();
  const operatorId = session.user.id;

  try {
    const application = await db.application.findUnique({
      where: { id: applicationId },
      include: { applicant: true, programme: true }
    });

    if (!application) throw new Error("Application not found.");

    if (decision === "APPROVED") {
      // 1. Update application status
      await db.application.update({
        where: { id: applicationId },
        data: { status: "APPROVED" }
      });

      // 2. Fetch or create staff member context for approver
      const staff = await db.staff.findFirst({
        where: { user: { id: operatorId } }
      });

      const approverId = staff?.id || (await db.staff.findFirst())?.id;
      if (!approverId) throw new Error("No registry staff found to approve this application.");

      // 3. Create Admission Record
      const admission = await db.admission.upsert({
        where: { applicationId },
        update: { status: "ACCEPTED" },
        create: {
          status: "OFFERED",
          admissionLetterUrl: "https://documents.crestoakcollege.com.ng/admission-letters/default.pdf",
          applicationId,
          admittedProgrammeId: application.programmeId,
          admittedById: approverId
        }
      });

      // 4. Create Student profile
      const matricNo = `CCHMS/2026/${application.programme.code}/${String(Math.floor(1 + Math.random() * 999)).padStart(4, "0")}`;
      
      const activeSession = await db.academicSession.findFirst({ where: { isActive: true } });
      const firstSemester = await db.semester.findFirst({ where: { name: "FIRST", sessionId: activeSession?.id } });
      
      if (!activeSession || !firstSemester) throw new Error("No active session/semester configured.");

      const studentRole = await db.role.findFirst({ where: { name: "STUDENT" } });
      if (!studentRole) throw new Error("STUDENT role not configured.");

      // Update User role to STUDENT
      await db.user.update({
        where: { id: application.applicantId },
        data: { roleId: studentRole.id }
      });

      await db.student.upsert({
        where: { id: application.applicantId },
        update: { matricNo },
        create: {
          id: application.applicantId,
          matricNo,
          departmentId: application.programme.departmentId,
          programmeId: application.programmeId,
          entrySessionId: activeSession.id,
          currentSessionId: activeSession.id,
          currentSemesterId: firstSemester.id,
          admissionId: admission.id
        }
      });

      // 5. Seed default billing invoices for the new student
      // Acceptance fee (N50,000) & Tuition (N300,000)
      await db.invoice.createMany({
        data: [
          {
            invoiceNo: `INV-2026-ACC-${Math.floor(1000 + Math.random() * 9000)}`,
            amount: 50000.00,
            description: "Admissions Acceptance Fee",
            feeType: "ACCEPTANCE",
            status: "UNPAID",
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks due
            userId: application.applicantId,
            sessionId: activeSession.id,
            semesterId: firstSemester.id
          },
          {
            invoiceNo: `INV-2026-TUI-${Math.floor(1000 + Math.random() * 9000)}`,
            amount: 300000.00,
            description: "Tuition Fee - Year 1 (First Semester)",
            feeType: "TUITION",
            status: "UNPAID",
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month due
            userId: application.applicantId,
            sessionId: activeSession.id,
            semesterId: firstSemester.id
          }
        ]
      });

      await createAuditLog({
        userId: operatorId,
        action: "CREATE",
        entity: "Admission",
        entityId: admission.id,
        newValues: { matricNo, applicant: application.applicant.email }
      });
    } else {
      // Rejection
      await db.application.update({
        where: { id: applicationId },
        data: { status: "REJECTED" }
      });
    }

    revalidatePath("/admin/admissions");
    return { success: true };
  } catch (error: any) {
    console.error("[admin-actions] processApplicationDecision error:", error);
    return { success: false, error: error.message || "Failed to decide application" };
  }
}

// ----------------------------------------------------
// 4. FINANCIAL & FEE MANAGEMENT
// ----------------------------------------------------
export async function createCustomInvoice(data: {
  userId: string;
  amount: number;
  description: string;
  feeType: "TUITION" | "ACCOMMODATION" | "APPLICATION" | "ACCEPTANCE" | "LATE_REGISTRATION" | "TRANSCRIPT" | "OTHER";
  dueDate: Date;
}) {
  const session = await checkAdminAuth();
  const operatorId = session.user.id;

  try {
    const activeSession = await db.academicSession.findFirst({ where: { isActive: true } });
    const firstSemester = await db.semester.findFirst({ where: { name: "FIRST", sessionId: activeSession?.id } });

    const invoiceNo = `INV-2026-CUSTOM-${Math.floor(100000 + Math.random() * 900000)}`;

    const invoice = await db.invoice.create({
      data: {
        invoiceNo,
        amount: Number(data.amount),
        description: data.description,
        feeType: data.feeType,
        status: "UNPAID",
        dueDate: data.dueDate,
        userId: data.userId,
        sessionId: activeSession?.id || null,
        semesterId: firstSemester?.id || null
      }
    });

    await createAuditLog({
      userId: operatorId,
      action: "CREATE",
      entity: "Invoice",
      entityId: invoice.id,
      newValues: invoice
    });

    revalidatePath("/admin/fees");
    return { success: true, invoice };
  } catch (error: any) {
    console.error("[admin-actions] createCustomInvoice error:", error);
    return { success: false, error: error.message || "Failed to create invoice" };
  }
}

// ----------------------------------------------------
// 5. NEWS MANAGEMENT
// ----------------------------------------------------
export async function upsertNewsPost(data: {
  id?: string;
  title: string;
  content: string;
  featuredImage?: string;
  isPublished: boolean;
}) {
  const session = await checkAdminAuth();
  const operatorId = session.user.id;

  try {
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    let news;
    if (data.id) {
      news = await db.news.update({
        where: { id: data.id },
        data: {
          title: data.title,
          slug,
          content: data.content,
          featuredImage: data.featuredImage || null,
          isPublished: data.isPublished,
          publishedAt: data.isPublished ? new Date() : null
        }
      });

      await createAuditLog({
        userId: operatorId,
        action: "UPDATE",
        entity: "News",
        entityId: data.id,
        newValues: news
      });
    } else {
      news = await db.news.create({
        data: {
          title: data.title,
          slug,
          content: data.content,
          featuredImage: data.featuredImage || null,
          isPublished: data.isPublished,
          publishedAt: data.isPublished ? new Date() : null,
          authorId: operatorId
        }
      });

      await createAuditLog({
        userId: operatorId,
        action: "CREATE",
        entity: "News",
        entityId: news.id,
        newValues: news
      });
    }

    revalidatePath("/admin/news");
    return { success: true, news };
  } catch (error: any) {
    console.error("[admin-actions] upsertNewsPost error:", error);
    return { success: false, error: error.message || "Failed to save news article" };
  }
}

export async function deleteNewsPost(newsId: string) {
  const session = await checkAdminAuth();
  const operatorId = session.user.id;

  try {
    await db.news.update({
      where: { id: newsId },
      data: { isDeleted: true, deletedAt: new Date(), isPublished: false }
    });

    await createAuditLog({
      userId: operatorId,
      action: "DELETE",
      entity: "News",
      entityId: newsId,
      newValues: { status: "SOFT_DELETED" }
    });

    revalidatePath("/admin/news");
    return { success: true };
  } catch (error: any) {
    console.error("[admin-actions] deleteNewsPost error:", error);
    return { success: false, error: error.message || "Failed to delete news article" };
  }
}

// ----------------------------------------------------
// 6. GALLERY MANAGEMENT
// ----------------------------------------------------
export async function upsertGalleryItem(data: {
  id?: string;
  title: string;
  description?: string;
  imageUrl: string;
  album?: string;
}) {
  const session = await checkAdminAuth();
  const operatorId = session.user.id;

  try {
    let gallery;
    if (data.id) {
      gallery = await db.gallery.update({
        where: { id: data.id },
        data: {
          title: data.title,
          description: data.description || null,
          imageUrl: data.imageUrl,
          album: data.album || null
        }
      });
    } else {
      gallery = await db.gallery.create({
        data: {
          title: data.title,
          description: data.description || null,
          imageUrl: data.imageUrl,
          album: data.album || null,
          uploadedById: operatorId
        }
      });
    }

    revalidatePath("/admin/gallery");
    return { success: true, gallery };
  } catch (error: any) {
    console.error("[admin-actions] upsertGalleryItem error:", error);
    return { success: false, error: error.message || "Failed to save gallery item" };
  }
}

export async function deleteGalleryItem(id: string) {
  const session = await checkAdminAuth();
  const operatorId = session.user.id;

  try {
    await db.gallery.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() }
    });

    revalidatePath("/admin/gallery");
    return { success: true };
  } catch (error: any) {
    console.error("[admin-actions] deleteGalleryItem error:", error);
    return { success: false, error: error.message || "Failed to delete gallery item" };
  }
}

// ----------------------------------------------------
// 7. PROGRAMMES MANAGEMENT
// ----------------------------------------------------
export async function upsertAcademicProgramme(data: {
  id?: string;
  name: string;
  code: string;
  durationYears: number;
  degreeAwarded: string;
  departmentId: string;
}) {
  const session = await checkAdminAuth();
  const operatorId = session.user.id;

  try {
    let programme;
    if (data.id) {
      programme = await db.programme.update({
        where: { id: data.id },
        data: {
          name: data.name,
          code: data.code,
          durationYears: Number(data.durationYears),
          degreeAwarded: data.degreeAwarded,
          departmentId: data.departmentId
        }
      });
    } else {
      programme = await db.programme.create({
        data: {
          name: data.name,
          code: data.code,
          durationYears: Number(data.durationYears),
          degreeAwarded: data.degreeAwarded,
          departmentId: data.departmentId
        }
      });
    }

    revalidatePath("/admin/programmes");
    return { success: true, programme };
  } catch (error: any) {
    console.error("[admin-actions] upsertAcademicProgramme error:", error);
    return { success: false, error: error.message || "Failed to save academic programme" };
  }
}

export async function deleteAcademicProgramme(id: string) {
  const session = await checkAdminAuth();

  try {
    await db.programme.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() }
    });

    revalidatePath("/admin/programmes");
    return { success: true };
  } catch (error: any) {
    console.error("[admin-actions] deleteAcademicProgramme error:", error);
    return { success: false, error: error.message || "Failed to delete programme" };
  }
}

// ----------------------------------------------------
// 8. FACULTIES & DEPARTMENTS MANAGEMENT
// ----------------------------------------------------
export async function upsertFaculty(data: {
  id?: string;
  name: string;
  code: string;
  description?: string;
  deanId?: string;
}) {
  const session = await checkAdminAuth();

  try {
    let faculty;
    if (data.id) {
      faculty = await db.faculty.update({
        where: { id: data.id },
        data: {
          name: data.name,
          code: data.code,
          description: data.description || null,
          deanId: data.deanId || null
        }
      });
    } else {
      faculty = await db.faculty.create({
        data: {
          name: data.name,
          code: data.code,
          description: data.description || null,
          deanId: data.deanId || null
        }
      });
    }

    revalidatePath("/admin/faculties");
    return { success: true, faculty };
  } catch (error: any) {
    console.error("[admin-actions] upsertFaculty error:", error);
    return { success: false, error: error.message || "Failed to save faculty" };
  }
}

export async function upsertDepartment(data: {
  id?: string;
  name: string;
  code: string;
  description?: string;
  facultyId: string;
  headOfDepartmentId?: string;
}) {
  const session = await checkAdminAuth();

  try {
    let department;
    if (data.id) {
      department = await db.department.update({
        where: { id: data.id },
        data: {
          name: data.name,
          code: data.code,
          description: data.description || null,
          facultyId: data.facultyId,
          headOfDepartmentId: data.headOfDepartmentId || null
        }
      });
    } else {
      department = await db.department.create({
        data: {
          name: data.name,
          code: data.code,
          description: data.description || null,
          facultyId: data.facultyId,
          headOfDepartmentId: data.headOfDepartmentId || null
        }
      });
    }

    revalidatePath("/admin/faculties");
    return { success: true, department };
  } catch (error: any) {
    console.error("[admin-actions] upsertDepartment error:", error);
    return { success: false, error: error.message || "Failed to save department" };
  }
}

export async function deleteFaculty(id: string) {
  const session = await checkAdminAuth();

  try {
    await db.faculty.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() }
    });

    revalidatePath("/admin/faculties");
    return { success: true };
  } catch (error: any) {
    console.error("[admin-actions] deleteFaculty error:", error);
    return { success: false, error: error.message || "Failed to delete faculty" };
  }
}

export async function deleteDepartment(id: string) {
  const session = await checkAdminAuth();

  try {
    await db.department.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() }
    });

    revalidatePath("/admin/faculties");
    return { success: true };
  } catch (error: any) {
    console.error("[admin-actions] deleteDepartment error:", error);
    return { success: false, error: error.message || "Failed to delete department" };
  }
}
