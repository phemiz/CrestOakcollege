import { NextResponse } from "next/server";
import * as crypto from "crypto";
import { verifyPaystackPayment } from "@/app/actions/paystack-actions";

export const dynamic = "force-static";

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const isMockMode = !secretKey || secretKey === "mock" || secretKey.startsWith("mock_");
    const isSimulator = request.headers.get("x-simulator-mock") === "true";

    // 1. Verify Webhook Signature for Security
    if (!isSimulator || !isMockMode) {
      if (!signature) {
        return NextResponse.json({ error: "Missing x-paystack-signature header" }, { status: 400 });
      }

      const hmac = crypto.createHmac("sha512", secretKey || "");
      const expectedSignature = hmac.update(bodyText).digest("hex");

      if (signature !== expectedSignature) {
        console.warn("Unauthorized webhook attempt: signature mismatch.");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    // 2. Parse Webhook Event Body
    const payload = JSON.parse(bodyText);
    const eventType = payload.event;

    console.log(`[Paystack Webhook] Received event: ${eventType}`);

    // 3. Process the event type
    if (eventType === "charge.success") {
      const reference = payload.data.reference;
      
      if (!reference) {
        return NextResponse.json({ error: "No reference found in webhook data" }, { status: 400 });
      }

      const verificationResult = await verifyPaystackPayment(reference);

      if (verificationResult.success) {
        return NextResponse.json({ 
          success: true, 
          message: "Webhook processed successfully: payment settled.",
          reference 
        });
      } else {
        return NextResponse.json({ 
          success: false, 
          error: verificationResult.error || "Failed to settle payment.",
          reference 
        }, { status: 400 });
      }
    }

    // Return success response for other unhandled events to prevent Paystack from retrying
    return NextResponse.json({ 
      success: true, 
      message: `Event '${eventType}' received but not processed (ignored).` 
    });

  } catch (error: any) {
    console.error("[Paystack Webhook Exception]:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Webhook processing error" 
    }, { status: 500 });
  }
}
