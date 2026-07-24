import React from "react";
import db from "@/lib/db";
import FacultiesClient from "@/components/admin/FacultiesClient";

export const revalidate = 0; // Fresh details always

export default async function FacultiesPage() {
  const [faculties, lecturers] = await Promise.all([
    db.faculty.findMany({
      where: {
        isDeleted: false
      },
      include: {
        dean: {
          select: {
            id: true,
            staff: {
              select: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        },
        departments: {
          where: {
            isDeleted: false
          },
          include: {
            headOfDepartment: {
              select: {
                id: true,
                staff: {
                  select: {
                    user: {
                      select: {
                        firstName: true,
                        lastName: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        code: "asc"
      }
    }),
    db.lecturer.findMany({
      where: {
        isDeleted: false,
        staff: { isDeleted: false }
      },
      include: {
        staff: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    })
  ]);

  // Map lecturers to simple dropdown items
  const mappedLecturers = lecturers.map((lec: any) => ({
    id: lec.id,
    name: `${lec.staff.user.firstName} ${lec.staff.user.lastName}`
  }));

  // Re-map types to prevent deep type nesting conflicts
  const mappedFaculties = faculties.map((fac: any) => ({
    id: fac.id,
    name: fac.name,
    code: fac.code,
    description: fac.description,
    dean: fac.dean ? {
      staff: {
        user: {
          firstName: fac.dean.staff.user.firstName,
          lastName: fac.dean.staff.user.lastName
        }
      }
    } : null,
    departments: fac.departments.map((dept: any) => ({
      id: dept.id,
      name: dept.name,
      code: dept.code,
      description: dept.description,
      headOfDepartment: dept.headOfDepartment ? {
        staff: {
          user: {
            firstName: dept.headOfDepartment.staff.user.firstName,
            lastName: dept.headOfDepartment.staff.user.lastName
          }
        }
      } : null
    }))
  }));

  return <FacultiesClient faculties={mappedFaculties} lecturers={mappedLecturers} />;
}
