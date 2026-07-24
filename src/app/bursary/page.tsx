import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Coins, Lock } from "lucide-react";
import { BursaryCalculator } from "@/components/bursary/BursaryCalculator";
import { getSafeSession } from "@/lib/session";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import BursaryDashboardClient from "@/components/bursary/BursaryDashboardClient";
import { StructuredData } from "@/components/seo/StructuredData";

export default async function BursaryDashboardPage() {
  const session = await getSafeSession();

  // Check if logged in user is a Bursar or general Administrator
  const isBursar = session && ["Bursary", "Admin", "Super Admin"].includes(session.user.role);

  let payments: any[] = [];
  let invoices: any[] = [];
  let auditLogs: any[] = [];
  let students: any[] = [];
  let userDetails: any = null;

  if (isBursar) {
    userDetails = await db.user.findUnique({
      where: { id: session.user.id }
    });
    // 1. Fetch financial ledger payments
    const paymentsList = await db.payment.findMany({
      where: { isDeleted: false },
      include: {
        invoice: {
          include: {
            user: {
              include: {
                student: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    payments = paymentsList.map((p: any) => ({
      id: p.id,
      reference: p.reference,
      amountPaid: Number(p.amountPaid),
      method: p.method,
      status: p.status,
      paidAt: p.paidAt ? p.paidAt.toISOString() : "",
      createdAt: p.createdAt.toISOString(),
      invoiceId: p.invoiceId,
      invoice: {
        invoiceNo: p.invoice.invoiceNo,
        description: p.invoice.description,
        feeType: p.invoice.feeType,
        user: {
          firstName: p.invoice.user.firstName,
          lastName: p.invoice.user.lastName,
          email: p.invoice.user.email,
          student: p.invoice.user.student ? {
            matricNo: p.invoice.user.student.matricNo
          } : null
        }
      }
    }));

    // 2. Fetch student billing invoices
    const invoicesList = await db.invoice.findMany({
      where: { isDeleted: false },
      include: {
        user: {
          include: {
            student: true
          }
        },
        payments: true
      },
      orderBy: { createdAt: "desc" }
    });

    invoices = invoicesList.map((i: any) => ({
      id: i.id,
      invoiceNo: i.invoiceNo,
      amount: Number(i.amount),
      description: i.description,
      feeType: i.feeType,
      status: i.status,
      dueDate: i.dueDate ? i.dueDate.toISOString() : "",
      createdAt: i.createdAt.toISOString(),
      user: {
        firstName: i.user.firstName,
        lastName: i.user.lastName,
        email: i.user.email,
        student: i.user.student ? {
          matricNo: i.user.student.matricNo
        } : null
      },
      payments: i.payments.map((p: any) => ({
        id: p.id,
        amountPaid: Number(p.amountPaid),
        paidAt: p.paidAt ? p.paidAt.toISOString() : ""
      }))
    }));

    // 3. Fetch financial audit logs
    const auditLogsList = await db.auditLog.findMany({
      where: {
        entity: { in: ["Payment", "Invoice", "ClearanceRequest"] }
      },
      include: {
        user: true
      },
      orderBy: { createdAt: "desc" },
      take: 150
    });

    auditLogs = auditLogsList.map((log: any) => ({
      id: log.id,
      action: log.action,
      entity: log.entity,
      details: log.details,
      createdAt: log.createdAt.toISOString(),
      user: log.user ? {
        firstName: log.user.firstName,
        lastName: log.user.lastName
      } : null
    }));

    // 4. Fetch list of students for invoicing dropdown
    const studentsList = await db.student.findMany({
      where: { isDeleted: false },
      include: {
        user: true
      }
    });

    students = studentsList.map((s: any) => ({
      id: s.user.id,
      firstName: s.user.firstName,
      lastName: s.user.lastName,
      email: s.user.email,
      matricNo: s.matricNo
    }));
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.crestoak.com.ng"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Bursary Guide",
        "item": "https://www.crestoak.com.ng/bursary"
      }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the tuition payment structure at CrestOak College?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CrestOak College offers a flexible installment structure. Students can pay session fees in two installments: 70% before first-semester course registration, and the remaining 30% balance before the start of second-semester examinations."
        }
      },
      {
        "@type": "Question",
        "name": "What payment channels does the college support?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We support secure online gateway checkouts via Paystack (using credit/debit cards, USSD codes, or direct bank transfers) as well as manual bank transfers directly to the official CrestOak College Escrow bank account."
        }
      },
      {
        "@type": "Question",
        "name": "Is there a hostel accommodation fee?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, optional hostel accommodation is available for interested students. The fee is NGN 200,000 per academic session, payable along with the tuition installments."
        }
      }
    ]
  };

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={faqSchema} />
      <Header />

      <main className="flex-grow bg-slate-50 print:bg-white pb-12">
        {isBursar ? (
          // Authenticated secure Bursar dashboard view
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 flex flex-col gap-6">
            <BursaryDashboardClient
              payments={payments}
              invoices={invoices}
              auditLogs={auditLogs}
              students={students}
              bursarName={userDetails ? `${userDetails.firstName} ${userDetails.lastName}` : "Bursary Officer"}
              bursarEmail={session?.user?.email || ""}
            />
          </div>
        ) : (
          // Public calculator view for anonymous users
          <>
            {/* HERO SECTION */}
            <section className="bg-brand-blue-dark text-white py-20 relative overflow-hidden print:hidden">
              <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-blue/40 via-slate-900 to-slate-950" />
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10 text-center flex flex-col gap-4">
                <span className="text-brand-gold font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 font-display">
                  <Coins size={14} className="text-brand-gold animate-bounce" />
                  Bursary Department
                </span>
                <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">
                  Approved Fee Structure
                </h1>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto font-medium">
                  Official fees schedules and installment payment pathways for the 2026/2027 Academic Session. Plan your education finances transparently.
                </p>
              </div>
            </section>

            {/* Interactive Fee Calculator Grid */}
            <BursaryCalculator />
          </>
        )}
      </main>

      <Footer />
    </>
  );
}
