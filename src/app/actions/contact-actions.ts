"use server";

import nodemailer from "nodemailer";

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactActionResult {
  success: boolean;
  message: string;
}

export async function sendContactEnquiry(data: ContactFormData): Promise<ContactActionResult> {
  const { name, email, subject, message } = data;

  if (!name || !email || !subject || !message) {
    return {
      success: false,
      message: "All fields (Name, Email, Subject, Message) are required.",
    };
  }

  // Whogohost DirectAdmin SMTP configuration from environment variables
  const host = process.env.SMTP_HOST || "da34.host-ww.net";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const secure = process.env.SMTP_SECURE !== "false"; // default true for port 465
  const user = process.env.SMTP_USER || "info@crestoakcollege.com.ng";
  const pass = process.env.SMTP_PASS;
  const receiver = process.env.CONTACT_RECEIVER_EMAIL || "info@crestoakcollege.com.ng";

  if (!pass) {
    console.warn("SMTP_PASS is not configured in environment variables.");
    return {
      success: false,
      message: "Server mailer configuration incomplete: SMTP_PASS is missing in environment variables. Please add SMTP_PASS to your .env file.",
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: `"${name} via CrestOak College" <${user}>`,
      replyTo: email,
      to: receiver,
      subject: `[Website Enquiry] ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #1e3a8a; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">New Website Enquiry</h2>
          <p><strong>Full Name:</strong> ${name}</p>
          <p><strong>Sender Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p><strong>Message Content:</strong></p>
          <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #1e3a8a; border-radius: 4px; line-height: 1.6; white-space: pre-wrap;">${message}</div>
          <p style="font-size: 12px; color: #888; margin-top: 30px;">This enquiry was sent from the CrestOak College Contact Us page.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: "Your message has been sent successfully to info@crestoakcollege.com.ng!",
    };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Failed to send email via SMTP server.";
    console.error("Error sending enquiry email:", error);
    return {
      success: false,
      message: errMessage,
    };
  }
}
