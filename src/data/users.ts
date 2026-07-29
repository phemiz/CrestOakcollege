export interface User {
  id: string;
  username: string;
  name: string;
  passwordHash: string;
  role: 'Student' | 'Lecturer' | 'Staff' | 'Bursary' | 'Admin' | 'Super Admin';
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
    email: "student1@crestoak.edu.ng",
    passwordHash: "$argon2id$v=19$m=4096,t=3,p=1$q1UFpU6weAGvKsmmhdEiHA$JOyPNbM6RRFsU3r4wen+FEnh6uCJ3ODrwWlSZl1fr8A", // password123
    role: "Student",
    registrationNumber: "STU-2026-001",
    department: "Computer Science",
    faculty: "Science and Technology",
  },
  {
    id: "user-lec-001",
    username: "lecturer1",
    name: "Dr. Elizabeth Johnson",
    email: "e.johnson@crestoak.edu.ng",
    passwordHash: "$argon2id$v=19$m=4096,t=3,p=1$lH8zQIq4yKZMoQSILYPTPg$bfWRehjd6xCGHZa2Op/bnScnywEEmRvor0yUlbX84Q8", // password123
    role: "Lecturer",
    department: "Computer Science",
    faculty: "Science and Technology",
  },
  {
    id: "user-stf-001",
    username: "staff1",
    name: "Mr. Samuel Alao",
    email: "s.alao@crestoak.edu.ng",
    passwordHash: "$argon2id$v=19$m=4096,t=3,p=1$bk5Y867i19U3gVtwH6boNQ$qKHbtEVj7Eq4jKtZEbSUinpIhYt/DGJd9sSW0SAnqvs", // password123
    role: "Staff",
    department: "Registry",
  },
  {
    id: "user-bur-001",
    username: "bursary1",
    name: "Mrs. Victoria Folayan",
    email: "v.folayan@crestoak.edu.ng",
    passwordHash: "$argon2id$v=19$m=4096,t=3,p=1$l7sb2Zzw173jv9hMXUpDmw$oEBdlbCB4j0Strlsz7UyUPhFW2qEBxmmMt4hwrGbjVQ", // password123
    role: "Bursary",
  },
  {
    id: "user-adm-001",
    username: "admin1",
    name: "Admin Officer",
    email: "admin1@crestoak.edu.ng",
    passwordHash: "$argon2id$v=19$m=4096,t=3,p=1$r5qJdqlk/pK+6vAF79JkWQ$VOwk13v+ZpX/pw8em4JEh9SrJS7kBa20J0d3mkLuRvc", // password123
    role: "Admin",
  },
  {
    id: "user-sad-001",
    username: "admin",
    name: "Super Administrator",
    email: "admin@crestoakcollege.com.ng",
    passwordHash: "92e6cebcd5df35bf76aee5eb621aaf0c25c9252da48c1a4386d9de9e8e0f6947", // Adm1nSecureP@ss123!
    role: "Super Admin",
  },
];
