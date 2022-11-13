import { Transporter, createTransport } from "nodemailer";
import { ImapFlowOptions } from "imapflow";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { ImapFlow, MailboxObject } from "imapflow";
import { getMailer, setMailer } from "../service/mailer";

export const createMailer = async (): Promise<Mailer | undefined> => {
  const currentMailer = getMailer();
  if (
    currentMailer?.user &&
    currentMailer.imapTransporter &&
    currentMailer.smtpTransporter
  ) {
    return currentMailer;
  }
  const mailerOptions = await createMailerOptions();
  const smtpTransporter = await createSmtpTransporter();
  const imapTransporter = await createImapTransporter();

  if (mailerOptions && smtpTransporter && imapTransporter) {
    const { smtpOptions, imapOptions } = mailerOptions;
    const _mailer: Mailer = {
      user: smtpOptions.auth.user,
      smtpConfig: {
        host: smtpOptions.host,
        port: smtpOptions.port,
      },
      imapConfig: {
        host: imapOptions.host,
        port: imapOptions.port,
      },
      imapTransporter,
      smtpTransporter,
    };
    setMailer(_mailer);
    return _mailer;
  } else {
    console.error(
      `Mailer configurations are not valid, please verify .env file and try again.`
    );
    return undefined;
  }
};

export const createMailerOptions = (): MailerOptions | undefined => {
  const smtpOptions: SmtpOptions = {
    host: process.env.SMTP_HOST ?? "",
    port: Number(process.env.SMTP_PORT) ?? 0,
    secure: process.env.TLS_SECURE === "true" ? true : false,
    auth: {
      user: process.env.MAILUSER ?? "",
      pass: process.env.MAILPASS ?? "",
    },
  };
  const imapOptions: ImapOptions = {
    host: process.env.IMAP_HOST ?? "",
    port: Number(process.env.IMAP_PORT) ?? 0,
    secure: process.env.TLS_SECURE === "true" ? true : false,
    auth: {
      user: process.env.MAILUSER ?? "",
      pass: process.env.MAILPASS ?? "",
    },
  };

  if (
    (smtpOptions.auth.user,
    smtpOptions.auth.pass,
    smtpOptions.host,
    imapOptions.host) != "" &&
    (smtpOptions.port, imapOptions.port) != 0
  ) {
    return { smtpOptions, imapOptions };
  } else {
    console.error(
      "Mailer configurations are incorrect, please verify the .env file and try again."
    );
    return undefined;
  }
};

export const createSmtpTransporter = async (): Promise<
  Transporter<SMTPTransport.SentMessageInfo> | undefined
> => {
  const mailerOptions = createMailerOptions();
  if (mailerOptions?.smtpOptions) {
    console.log(mailerOptions.smtpOptions);
    const transporter: Transporter<SMTPTransport.SentMessageInfo> =
      createTransport(mailerOptions.smtpOptions);
    try {
      await transporter?.verify();
    } catch (error) {
      console.error(`ERROR CREATING SMTP TRANSPORT ${error}`);
      return undefined;
    }
    return transporter;
  }
  return undefined;
};

export const createImapTransporter = async (): Promise<
  ImapFlow | undefined
> => {
  const mailerOptions = createMailerOptions();
  if (mailerOptions?.imapOptions) {
    const _imap = new ImapFlow({ ...mailerOptions.imapOptions });
    if (_imap) return _imap;
    else return undefined;
  }
  return undefined;
};

export interface Mailer {
  user: string; // will be used as from email
  smtpConfig: {
    host: string;
    port: number;
  };
  imapConfig: {
    host: string;
    port: number;
  };
  smtpTransporter: Transporter<SMTPTransport.SentMessageInfo>;
  imapTransporter: ImapFlow;
}

export interface SmtpOptions extends SMTPTransport.Options {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface ImapOptions extends ImapFlowOptions {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface MailerOptions {
  imapOptions: ImapOptions;
  smtpOptions: SmtpOptions;
}
