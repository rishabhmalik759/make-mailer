import { createMailer } from "../utils/mailerUtils";

export const sendMail = async (mail: Mail): Promise<boolean | unknown> => {
  if (mail?.to && mail?.subject) {
    const mailer = await createMailer();
    if (!mailer || !mailer.user) console.error("cannot create mailer");
    const smtpTransporter = mailer?.smtpTransporter;
    mail.from = mail.from ?? mailer?.user ?? "";
    try {
      await smtpTransporter?.sendMail(mail);
      return true;
    } catch (error) {
      console.error(`ERROR SENDING MAIL, ${error}`);
      return error;
    }
  }

  console.log("I am here");
  return false;
};

export interface Mail {
  from?: string;
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}
