import nodemailer from "nodemailer";

const sendEmail = async (email, subject, text) => {
  //
  console.log("--- Check Environment Variables ---");
  console.log("EMAIL_USER exists:", process.env.EMAIL_USER ? "YES ✅" : "NO ❌");
  console.log("EMAIL_PASS length:", process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);

  try {
    console.log("Checking Env:", process.env.EMAIL_USER);
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: process.env.EMAIL_PORT || 465, // 
      secure: true, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // 
      },
      connectionTimeout: 10000, // 10 
    });

    await transporter.sendMail({
      from: `"MYE 3 ACADEMY" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      text: text,
    });

    console.log("✅ Email sent successfully");
    return true;
  } catch (error) {
    console.error("❌ Nodemailer Error:", error.message);
    return false;
  }
};

export default sendEmail;
