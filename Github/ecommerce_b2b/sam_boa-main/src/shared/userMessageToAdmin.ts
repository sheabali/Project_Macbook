import nodemailer from "nodemailer";
import config from "../config";

// Admin's email address
const ADMIN_EMAIL = "akonhasan680@gmail.com";

const userMessageToAdmin = async (userEmail: string, message: string, subject: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 2525,
      secure: false,
      auth: {
        user: "88803c001@smtp-brevo.com",
        pass: "OzqM8PBhVxbNYEUt",
      },
    });

    const html = `
      <h3>New Message from User</h3>
      <p><b>From:</b> ${userEmail}</p>
      <p><b>Message:</b></p>
      <p>${message}</p>
    `;

    const mailOptions = {
      from: `"User Message" <${ADMIN_EMAIL}>`, // must match authorized sender
      to: ADMIN_EMAIL, // admin receives
      replyTo: userEmail, // lets admin reply directly to user
      subject,
      text: message,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    return info.messageId;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Failed to send user message to admin. Please try again later.");
  }
};

export default userMessageToAdmin;
