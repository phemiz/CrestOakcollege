import React from "react";
import db from "@/lib/db";
import StaffClient from "@/components/admin/StaffClient";

export const revalidate = 0; // Fresh staff list always

export default async function StaffPage() {
  const [staffList, departments] = await Promise.all([
    db.staff.findMany({
      where: {
        isDeleted: false,
        user: { isDeleted: false }
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            middleName: true,
            email: true,
            phoneNumber: true,
            role: {
              select: {
                name: true
              }
            }
          }
        },
        department: {
          select: {
            id: true,
            name: true
          }
        },
        lecturer: {
          select: {
            rank: true,
            specialization: true
          }
        }
      },
      orderBy: {
        staffNo: "asc"
      }
    }),
    db.department.findMany({
      where: { isDeleted: false },
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    })
  ]);

  return <StaffClient staffList={staffList} departments={departments} />;
}
