"use server";

import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";

/**
 * Updates the contact details of the currently authenticated student.
 */
export async function updateStudentProfile(formData: { phoneNumber: string; middleName: string }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "Student") {
    return { success: false, error: "Unauthorized access" };
  }
  const studentId = session.user.id;

  try {
    const oldUser = await db.user.findUnique({
      where: { id: studentId },
    });

    const updatedUser = await db.user.update({
      where: { id: studentId },
      data: {
        phoneNumber: formData.phoneNumber,
        middleName: formData.middleName,
      },
    });

    // Create Audit Log
    await createAuditLog({
      userId: studentId,
      action: "UPDATE",
      entity: "User",
      entityId: studentId,
      oldValues: { phoneNumber: oldUser?.phoneNumber, middleName: oldUser?.middleName },
      newValues: { phoneNumber: formData.phoneNumber, middleName: formData.middleName },
    });

    revalidatePath("/portal/profile");
    revalidatePath("/portal");
    return { success: true, user: updatedUser };
  } catch (error: any) {
    console.error("[student-actions] updateStudentProfile error:", error);
    return { success: false, error: error.message || "Failed to update profile" };
  }
}

/**
 * Registers semester courses for the student, enforcing credit limits (12 to 24 units).
 */
export async function registerStudentCourses(courseIds: string[]) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "Student") {
    return { success: false, error: "Unauthorized access" };
  }
  const studentId = session.user.id;

  try {
    // Retrieve student's current session & semester
    const student = await db.student.findUnique({
      where: { id: studentId },
      include: {
        currentSession: true,
        currentSemester: true,
      },
    });

    if (!student) {
      return { success: false, error: "Student profile not found in database" };
    }

    // Verify course units selection
    const courses = await db.course.findMany({
      where: { id: { in: courseIds } },
    });

    const totalCredits = courses.reduce((acc, c) => acc + c.creditUnits, 0);
    if (totalCredits < 12 || totalCredits > 24) {
      return {
        success: false,
        error: `Credit limit violation: You selected ${totalCredits} credits. Standard limits are 12 to 24 credits.`,
      };
    }

    // Remove existing registrations for this session/semester to prevent duplicate entries
    await db.courseRegistration.deleteMany({
      where: {
        studentId,
        sessionId: student.currentSessionId,
        semesterId: student.currentSemesterId,
      },
    });

    // Create new course registrations
    const registrations = await Promise.all(
      courseIds.map((courseId) =>
        db.courseRegistration.create({
          data: {
            studentId,
            courseId,
            sessionId: student.currentSessionId,
            semesterId: student.currentSemesterId,
            status: "APPROVED", // Auto-approved for development/seeding convenience
          },
        })
      )
    );

    // Audit Log
    await createAuditLog({
      userId: studentId,
      action: "CREATE",
      entity: "CourseRegistration",
      newValues: { registeredCourseIds: courseIds, totalCredits },
    });

    revalidatePath("/portal/courses");
    revalidatePath("/portal");
    return { success: true, registrationsCount: registrations.length };
  } catch (error: any) {
    console.error("[student-actions] registerStudentCourses error:", error);
    return { success: false, error: error.message || "Failed to register courses" };
  }
}

/**
 * Simulates a card or transfer payment transaction, updates the invoice, and logs the payment.
 */
export async function processStudentPayment(invoiceId: string, paymentMethod: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "Student") {
    return { success: false, error: "Unauthorized access" };
  }
  const studentId = session.user.id;

  try {
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return { success: false, error: "Invoice not found in database" };
    }

    if (invoice.status === "PAID") {
      return { success: false, error: "This invoice has already been fully paid" };
    }

    // Generate unique transaction reference
    const reference = `TXN-${paymentMethod.toUpperCase()}-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    // Create Payment Record
    const payment = await db.payment.create({
      data: {
        reference,
        amountPaid: invoice.amount,
        method: paymentMethod,
        status: "PAID",
        paidAt: new Date(),
        invoiceId,
      },
    });

    // Update Invoice status
    await db.invoice.update({
      where: { id: invoiceId },
      data: { status: "PAID" },
    });

    // Audit Log
    await createAuditLog({
      userId: studentId,
      action: "RECORD_PAYMENT",
      entity: "Payment",
      entityId: payment.id,
      newValues: { invoiceId, reference, amountPaid: invoice.amount },
    });

    revalidatePath("/portal/billing");
    revalidatePath("/portal");
    return { success: true, paymentId: payment.id, reference };
  } catch (error: any) {
    console.error("[student-actions] processStudentPayment error:", error);
    return { success: false, error: error.message || "Failed to process payment" };
  }
}

/**
 * Submits clearance verification requests. Logs requests into database auditing.
 */
export async function requestClearance(clearanceType: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "Student") {
    return { success: false, error: "Unauthorized access" };
  }
  const studentId = session.user.id;

  try {
    // Record clearance request in Audit Log since there is no standalone Clearance model in the schema.
    await createAuditLog({
      userId: studentId,
      action: "CREATE",
      entity: "ClearanceRequest",
      newValues: { clearanceType, requestDate: new Date(), status: "PENDING_REVIEW" },
    });

    revalidatePath("/portal/clearance");
    return { success: true, message: `Your clearance request for ${clearanceType} has been submitted.` };
  } catch (error: any) {
    console.error("[student-actions] requestClearance error:", error);
    return { success: false, error: error.message || "Failed to submit clearance request" };
  }
}

/**
 * Creates dummy notifications or dismisses notifications.
 */
export async function dismissNotification(announcementId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "Student") {
    return { success: false, error: "Unauthorized access" };
  }
  const studentId = session.user.id;

  try {
    await createAuditLog({
      userId: studentId,
      action: "UPDATE",
      entity: "NotificationAlert",
      entityId: announcementId,
      newValues: { status: "DISMISSED" },
    });

    revalidatePath("/portal");
    return { success: true };
  } catch (error: any) {
    console.error("[student-actions] dismissNotification error:", error);
    return { success: false, error: error.message || "Failed to dismiss notification" };
  }
}
