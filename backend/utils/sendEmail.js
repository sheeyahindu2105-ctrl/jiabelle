import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, message) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("Email skipped: credentials missing");
      return;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Admin" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: message,
    });

    console.log("✅ Email sent to:", to);
  } catch (error) {
    console.error("❌ Email failed:", error.message);
    // ⚠️ DO NOT THROW ERROR
  }
};
