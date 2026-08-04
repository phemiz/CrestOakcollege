export interface User {
  id: string;
  username: string;
  name: string;
  role: 'Student' | 'Lecturer' | 'Staff' | 'Bursary' | 'Admin';
  email: string;
  registrationNumber?: string;
  department?: string;
  faculty?: string;
}

export const mockUsers: User[] = [
  {
    id: "user-stu-001",
    username: "student1",
    name: "Adebayo Chukwuma",
    email: "student1@crestoakcollege.com.ng",
    role: "Student",
    registrationNumber: "STU-2026-001",
    department: "Computer Science",
    faculty: "Science and Technology",
  },
  {
    id: "user-lec-001",
    username: "lecturer1",
    name: "Dr. Elizabeth Johnson",
    email: "e.johnson@crestoakcollege.com.ng",
    role: "Lecturer",
    department: "Computer Science",
    faculty: "Science and Technology",
  },
  {
    id: "user-stf-001",
    username: "staff1",
    name: "Mr. Samuel Alao",
    email: "s.alao@crestoakcollege.com.ng",
    role: "Staff",
    department: "Registry",
  },
  {
    id: "user-bur-001",
    username: "bursary1",
    name: "Mrs. Victoria Folayan",
    email: "v.folayan@crestoakcollege.com.ng",
    role: "Bursary",
  },
  {
    id: "user-adm-001",
    username: "admin1",
    name: "Admin Officer",
    email: "admin1@crestoakcollege.com.ng",
    role: "Admin",
  }
];
