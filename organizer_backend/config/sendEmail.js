import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmailOTP = async (to, otp) => {
  try {
    await resend.emails.send({
      from: "Organizer <onboarding@resend.dev>",
      to,
      subject: "Your OTP Code",
      html: `
        <div style="font-family:Arial; padding:20px; border:1px solid #ddd; border-radius:10px;">
          <h2>Organizer Verification</h2>
          <p>Here is your OTP:</p>
          <h1 style="color:#5A2EFE">${otp}</h1>
          <p><b>Valid for 10 minutes.</b></p>
        </div>
      `
    });
    console.log("✅ OTP email sent");
  } catch (error) {
    console.log("❌ Email send error:", error);
  }
};
