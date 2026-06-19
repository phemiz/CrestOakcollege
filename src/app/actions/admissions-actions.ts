"use server";

import db from "@/lib/db";
import { hashPassword } from "@/lib/hash";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";

// Helper to check if applicant is authenticated
async function checkApplicantAuth() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized: Access denied");
  }
  return session;
}

// ----------------------------------------------------
// 1. APPLICANT REGISTRATION
// ----------------------------------------------------
export async function registerApplicantUser(data: {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phoneNumber?: string;
}) {
  try {
    // 1. Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: data.email }
    });
    if (existingUser) {
      return { success: false, error: "An account with this email address already exists." };
    }

    // 2. Find APPLICANT role
    const applicantRole = await db.role.findFirst({
      where: { name: "APPLICANT" }
    });
    if (!applicantRole) {
      return { success: false, error: "APPLICANT role is not configured in the database." };
    }

    // 3. Hash Password (use default password123 if not provided)
    const pass = data.password || "password123";
    const hashed = await hashPassword(pass);

    // 4. Create User
    const user = await db.user.create({
      data: {
        email: data.email,
        passwordHash: hashed,
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName || null,
        phoneNumber: data.phoneNumber || null,
        roleId: applicantRole.id,
        isActive: true
      }
    });

    // Send initial simulated sign-up email/SMS
    await db.notificationLog.createMany({
      data: [
        {
          userId: user.id,
          type: "EMAIL",
          recipient: user.email,
          subject: "Welcome to CrestOak College Admissions Portal",
          message: `Hello ${user.firstName}, your applicant account has been registered successfully. Use your email to log in and start your application.`,
          status: "SENT"
        },
        ...(user.phoneNumber ? [{
          userId: user.id,
          type: "SMS",
          recipient: user.phoneNumber,
          message: `CrestOak Admissions: Welcome ${user.firstName}! Your applicant portal access is active.`,
          status: "SENT"
        }] : [])
      ]
    });

    return { success: true, userId: user.id };
  } catch (error: any) {
    console.error("[admissions-actions] registerApplicantUser error:", error);
    return { success: false, error: error.message || "Failed to register applicant account" };
  }
}

// ----------------------------------------------------
// 2. SAVE DRAFT APPLICATION
// ----------------------------------------------------
export async function saveDraftApplication(data: {
  programmeId: string;
  gender: string;
  level: string; // undergraduate / postgraduate
  jambScore?: string;
  firstDegreeInstitution?: string;
  firstDegreeClass?: string;
  olevelCredits?: string;
}) {
  try {
    const session = await checkApplicantAuth();
    const applicantId = session.user.id;

    // Find if application already exists for this applicant
    const existingApp = await db.application.findFirst({
      where: { applicantId, isDeleted: false }
    });

    let application;
    if (existingApp) {
      // Update existing draft
      application = await db.application.update({
        where: { id: existingApp.id },
        data: {
          programmeId: data.programmeId,
          status: "DRAFT"
        }
      });
    } else {
      // Create new draft
      const applicationNo = `APP/2026/${Math.floor(100000 + Math.random() * 900000)}`;
      application = await db.application.create({
        data: {
          applicationNo,
          status: "DRAFT",
          applicantId,
          programmeId: data.programmeId
        }
      });
    }

    // Cache details in a local application profile context or custom fields if database schema was rigid.
    // For our PostgreSQL schema, Application model connects to Programme and User applicant.
    // The details of the academic and personal items can be captured on submission or logged inside audit metadata.

    return { success: true, applicationId: application.id };
  } catch (error: any) {
    console.error("[admissions-actions] saveDraftApplication error:", error);
    return { success: false, error: error.message || "Failed to save draft" };
  }
}

// ----------------------------------------------------
// 3. SUBMIT APPLICATION
// ----------------------------------------------------
export async function submitApplicationForm(data: {
  applicationId: string;
  gender: string;
  level: string;
  jambScore?: string;
  firstDegreeInstitution?: string;
  firstDegreeClass?: string;
  olevelCredits: string;
  documents: { name: string; url: string }[];
}) {
  try {
    const session = await checkApplicantAuth();
    const applicantId = session.user.id;

    const application = await db.application.findUnique({
      where: { id: data.applicationId }
    });

    if (!application || application.applicantId !== applicantId) {
      return { success: false, error: "Application folder not found." };
    }

    // 1. Save uploaded documents records
    if (data.documents && data.documents.length > 0) {
      // Delete old doc links
      await db.applicationDocument.deleteMany({
        where: { applicationId: data.applicationId }
      });

      // Create new ones
      await db.applicationDocument.createMany({
        data: data.documents.map((doc) => ({
          applicationId: data.applicationId,
          documentName: doc.name,
          documentUrl: doc.url
        }))
      });
    }

    // 2. Update Application Status to SUBMITTED
    const updatedApp = await db.application.update({
      where: { id: data.applicationId },
      data: {
        status: "SUBMITTED"
      },
      include: {
        programme: true
      }
    });

    // 3. Generate Simulated Notifications
    const recipientEmail = session.user.email || "";
    const phoneNo = session.user.registrationNumber || ""; // NextAuth mapped value

    await db.notificationLog.createMany({
      data: [
        {
          userId: applicantId,
          type: "EMAIL",
          recipient: recipientEmail,
          subject: `Application Submitted: ${updatedApp.applicationNo}`,
          message: `Dear ${session.user.name}, your application for ${updatedApp.programme.name} has been successfully submitted. Your tracking number is ${updatedApp.applicationNo}. Our registry is reviewing your credentials.`,
          status: "SENT"
        },
        ...(phoneNo ? [{
          userId: applicantId,
          type: "SMS",
          recipient: phoneNo,
          message: `CrestOak ERP: Application ${updatedApp.applicationNo} submitted successfully. Track your status under your dashboard.`,
          status: "SENT"
        }] : [])
      ]
    });

    await createAuditLog({
      userId: applicantId,
      action: "UPDATE",
      entity: "Application",
      entityId: data.applicationId,
      newValues: { applicationNo: updatedApp.applicationNo, status: "SUBMITTED" }
    });

    revalidatePath("/admissions/portal");
    return { success: true };
  } catch (error: any) {
    console.error("[admissions-actions] submitApplicationForm error:", error);
    return { success: false, error: error.message || "Failed to submit application" };
  }
}

// ----------------------------------------------------
// 4. SCHEDULE SCREENING SLOT
// ----------------------------------------------------
export async function scheduleScreening(data: {
  applicationId: string;
  screeningDate: Date;
  venue: string;
}) {
  try {
    const session = await checkApplicantAuth();
    const applicantId = session.user.id;

    const application = await db.application.findUnique({
      where: { id: data.applicationId }
    });

    if (!application || application.applicantId !== applicantId) {
      return { success: false, error: "Application not found." };
    }

    // Create or update screening schedule
    const screening = await db.screeningSchedule.upsert({
      where: { applicationId: data.applicationId },
      update: {
        screeningDate: data.screeningDate,
        venue: data.venue,
        status: "PENDING"
      },
      create: {
        applicationId: data.applicationId,
        screeningDate: data.screeningDate,
        venue: data.venue,
        status: "PENDING"
      }
    });

    // Transition Application Status to UNDER_REVIEW
    await db.application.update({
      where: { id: data.applicationId },
      data: { status: "UNDER_REVIEW" }
    });

    // Logs Notifications
    const formattedDate = new Date(data.screeningDate).toLocaleString();
    await db.notificationLog.createMany({
      data: [
        {
          userId: applicantId,
          type: "EMAIL",
          recipient: session.user.email || "",
          subject: "Screening Appointment Booked",
          message: `Dear ${session.user.name}, your entrance screening has been scheduled successfully. Date: ${formattedDate}. Venue: ${data.venue}. Please bring original copies of all uploaded documents.`,
          status: "SENT"
        },
        ...(session.user.registrationNumber ? [{
          userId: applicantId,
          type: "SMS",
          recipient: session.user.registrationNumber,
          message: `CrestOak Admissions: Screening booked for ${formattedDate} at ${data.venue}. Bring all documents.`,
          status: "SENT"
        }] : [])
      ]
    });

    await createAuditLog({
      userId: applicantId,
      action: "CREATE",
      entity: "ScreeningSchedule",
      entityId: screening.id,
      newValues: { date: data.screeningDate, venue: data.venue }
    });

    revalidatePath("/admissions/portal");
    return { success: true };
  } catch (error: any) {
    console.error("[admissions-actions] scheduleScreening error:", error);
    return { success: false, error: error.message || "Failed to schedule screening" };
  }
}

// ----------------------------------------------------
// 5. GET APPLICANT DATA & LOGS
// ----------------------------------------------------
export async function getApplicantData(userId: string) {
  try {
    const application = await db.application.findFirst({
      where: { applicantId: userId, isDeleted: false },
      include: {
        programme: true,
        documents: true,
        screening: true,
        admission: true
      }
    });

    return { success: true, application };
  } catch (error: any) {
    console.error("[admissions-actions] getApplicantData error:", error);
    return { success: false, error: error.message || "Failed to retrieve applicant records" };
  }
}

export async function getSimulatedLogs(userId: string) {
  try {
    const logs = await db.notificationLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    return { success: true, logs };
  } catch (error: any) {
    console.error("[admissions-actions] getSimulatedLogs error:", error);
    return { success: false, error: error.message || "Failed to load notification logs" };
  }
}

export async function adminUpdateScreening(data: {
  applicationId: string;
  status: "PENDING" | "COMPLETED" | "MISSED";
  notes?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["Super Admin", "Admin", "Staff"].includes(session.user.role)) {
      throw new Error("Unauthorized: Access denied");
    }

    const screening = await db.screeningSchedule.update({
      where: { applicationId: data.applicationId },
      data: {
        status: data.status,
        notes: data.notes || null
      },
      include: {
        application: {
          include: {
            applicant: true
          }
        }
      }
    });

    const applicant = screening.application.applicant;

    await db.notificationLog.create({
      data: {
        userId: applicant.id,
        type: "EMAIL",
        recipient: applicant.email,
        subject: "Admission Screening Status Updated",
        message: `Dear ${applicant.firstName}, your entrance screening status has been updated to: ${data.status}. Notes: ${data.notes || "None"}.`,
        status: "SENT"
      }
    });

    revalidatePath("/admin/admissions");
    revalidatePath("/admissions/portal");
    return { success: true };
  } catch (error: any) {
    console.error("[admissions-actions] adminUpdateScreening error:", error);
    return { success: false, error: error.message || "Failed to update screening" };
  }
}
