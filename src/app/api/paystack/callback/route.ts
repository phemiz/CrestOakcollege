import { NextResponse } from "next/server";
import { verifyPaystackPayment } from "@/app/actions/paystack-actions";
import db from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.redirect(
      new URL("/portal/billing?status=failed&error=No+reference+provided", request.url)
    );
  }

  try {
    // 1. Verify payment status server-side
    const verificationResult = await verifyPaystackPayment(reference);

    // 2. Locate payment/user role to determine redirect destination
    const payment = await db.payment.findUnique({
      where: { reference },
      include: {
        invoice: {
          include: {
            user: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });

    const isApplicant = payment?.invoice?.user?.role?.name === "APPLICANT";
    const successRedirectUrl = isApplicant
      ? `/admissions/portal?status=success&reference=${reference}`
      : `/portal/billing?status=success&reference=${reference}`;

    const failedRedirectUrl = isApplicant
      ? `/admissions/portal?status=failed&error=${encodeURIComponent(verificationResult.error || "Payment verification failed")}`
      : `/portal/billing?status=failed&error=${encodeURIComponent(verificationResult.error || "Payment verification failed")}`;

    if (verificationResult.success) {
      return NextResponse.redirect(new URL(successRedirectUrl, request.url));
    } else {
      return NextResponse.redirect(new URL(failedRedirectUrl, request.url));
    }
  } catch (error: any) {
    console.error("Paystack Callback Endpoint Error:", error);
    return NextResponse.redirect(
      new URL(`/portal/billing?status=failed&error=${encodeURIComponent(error.message || "Unknown callback verification error")}`, request.url)
    );
  }
}
