import React from "react";
import db from "@/lib/db";
import FeesClient from "@/components/admin/FeesClient";

export const revalidate = 0; // Fresh ledger details always

export default async function FeesPage() {
  const [invoices, students] = await Promise.all([
    db.invoice.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        payments: {
          select: {
            reference: true,
            amountPaid: true,
            paidAt: true,
          },
          where: {
            isDeleted: false,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    db.student.findMany({
      where: {
        isDeleted: false,
        user: { isDeleted: false },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        matricNo: "asc",
      },
    }),
  ]);

  // Convert aggregate Decimal values to standard JS numbers
  const mappedInvoices = invoices.map((inv: any) => ({
    id: inv.id,
    invoiceNo: inv.invoiceNo,
    amount: Number(inv.amount),
    description: inv.description,
    feeType: inv.feeType,
    status: inv.status,
    dueDate: inv.dueDate,
    createdAt: inv.createdAt,
    user: inv.user,
    payments: inv.payments.map((pay: any) => ({
      reference: pay.reference,
      amountPaid: Number(pay.amountPaid),
      paidAt: pay.paidAt,
    })),
  }));

  const mappedStudents = students.map((stu: any) => ({
    id: stu.id,
    matricNo: stu.matricNo,
    user: {
      firstName: stu.user.firstName,
      lastName: stu.user.lastName,
    },
  }));

  return <FeesClient invoices={mappedInvoices} students={mappedStudents} />;
}
