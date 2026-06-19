import React from "react";
import db from "@/lib/db";
import ProgrammesClient from "@/components/admin/ProgrammesClient";

export const revalidate = 0; // Fresh details always

export default async function ProgrammesPage() {
  const [programmes, departments] = await Promise.all([
    db.programme.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        code: "asc",
      },
    }),
    db.department.findMany({
      where: { isDeleted: false },
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    })
  ]);

  return <ProgrammesClient programmes={programmes} departments={departments} />;
}
