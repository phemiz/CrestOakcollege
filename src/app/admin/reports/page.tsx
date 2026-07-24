import React from "react";
import db from "@/lib/db";
import ReportsClient from "@/components/admin/ReportsClient";

export const revalidate = 0; // Fresh metrics always

export default async function ReportsPage() {
  const [students, payments, unpaidInvoices, departments] = await Promise.all([
    db.student.findMany({
      where: { isDeleted: false },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        department: { select: { name: true } },
      },
    }),
    db.payment.findMany({
      where: {
        status: "PAID",
        isDeleted: false,
      },
      include: {
        invoice: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                student: { select: { matricNo: true } },
              },
            },
          },
        },
      },
    }),
    db.invoice.findMany({
      where: {
        status: "UNPAID",
        isDeleted: false,
      },
      select: {
        amount: true,
      },
    }),
    db.department.findMany({
      where: { isDeleted: false },
      select: { name: true },
    }),
  ]);

  // Calculate Summary metrics
  const totalStudents = students.length;
  
  const totalRevenue = payments.reduce(
    (acc: number, pay: any) => acc + Number(pay.amountPaid),
    0
  );

  const avgCgpa =
    students.length > 0
      ? students.reduce((acc: number, stu: any) => acc + Number(stu.cgpa), 0) / students.length
      : 0;

  const unpaidAmount = unpaidInvoices.reduce(
    (acc: number, inv: any) => acc + Number(inv.amount),
    0
  );

  // Group departments demographics
  const deptMap: { [key: string]: number } = {};
  departments.forEach((d: any) => {
    deptMap[d.name] = 0;
  });
  students.forEach((s: any) => {
    const deptName = s.department.name;
    deptMap[deptName] = (deptMap[deptName] || 0) + 1;
  });
  const deptDistribution = Object.keys(deptMap).map((key) => ({
    name: key,
    count: deptMap[key],
  }));

  // Group revenue by Fee Type
  const feeTypeMap: { [key: string]: number } = {
    TUITION: 0,
    ACCOMMODATION: 0,
    ACCEPTANCE: 0,
    APPLICATION: 0,
    OTHER: 0,
  };
  payments.forEach((pay: any) => {
    const type = pay.invoice.feeType;
    feeTypeMap[type] = (feeTypeMap[type] || 0) + Number(pay.amountPaid);
  });
  const revenueByFeeType = Object.keys(feeTypeMap).map((key) => ({
    type: key,
    amount: feeTypeMap[key],
  }));

  // Map raw students list for CSV export
  const rawStudents = students.map((s: any) => ({
    matricNo: s.matricNo,
    name: `${s.user.firstName} ${s.user.lastName}`,
    department: s.department.name,
    level: s.level,
    cgpa: Number(s.cgpa),
    email: s.user.email,
  }));

  // Map raw payments list for CSV export
  const rawPayments = payments.map((p: any) => ({
    reference: p.reference,
    amountPaid: Number(p.amountPaid),
    method: p.method,
    status: p.status,
    paidAt: p.paidAt ? p.paidAt.toLocaleDateString() : "—",
    studentName: `${p.invoice.user.firstName} ${p.invoice.user.lastName}`,
    matricNo: p.invoice.user.student?.matricNo || "—",
    feeType: p.invoice.feeType,
  }));

  return (
    <ReportsClient
      summaryStats={{ totalStudents, totalRevenue, avgCgpa, unpaidAmount }}
      deptDistribution={deptDistribution}
      revenueByFeeType={revenueByFeeType}
      rawStudents={rawStudents}
      rawPayments={rawPayments}
    />
  );
}
