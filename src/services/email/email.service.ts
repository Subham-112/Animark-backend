import resend from "./resend.service";
import { SendEmailOptions, SendEmailResponse } from "./email.types";

const DEFAULT_FROM =
  process.env.EMAIL_FROM || "Animark <onboarding@resend.dev>";

export const sendEmail = async ({
  to,
  subject,
  html,
  from = DEFAULT_FROM,
  cc,
  bcc,
  replyTo,
}: SendEmailOptions): Promise<SendEmailResponse> => {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      cc,
      bcc,
      replyTo,
    });

    if (error) {
      return {
        success: false,
        message: "Failed to send email.",
        error,
      };
    }

    return {
      success: true,
      message: "Email sent successfully.",
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Unexpected error while sending email.",
      error,
    };
  }
};

export default sendEmail;
