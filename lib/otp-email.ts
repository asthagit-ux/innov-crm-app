import nodemailer from "nodemailer";

type SendOtpEmailInput = {
  email: string;
  otp: string;
};

export async function sendOtpEmail({ email, otp }: SendOtpEmailInput) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  if (!host || !user || !pass || !from) {
    throw new Error(
      "SMTP configuration is missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM.",
    );
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  const otpTemplate = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Your sign-in code</title>
  </head>
  <body style="margin:0; padding:0; background:#ffffff; color:#111111;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px; border-collapse:collapse;">
            <tr>
              <td style="font-family:Arial, Helvetica, sans-serif; font-size:16px; line-height:1.6;">
                <p style="margin:0 0 16px 0;">Your one-time sign-in code is:</p>
                <p style="margin:0 0 20px 0; font-size:34px; letter-spacing:10px; font-weight:700;">
                  ${otp}
                </p>
                <p style="margin:0 0 10px 0;">This code expires in 5 minutes.</p>
                <p style="margin:0;">If you did not request this, you can ignore this email.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim();

  await transporter.sendMail({
    from,
    to: email,
    subject: "Your Innov CRM sign-in code",
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    html: otpTemplate,
  });
}
