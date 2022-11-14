import { createMailer, Mailer } from "../utils/mailerUtils";
import { ImapFlow, MailboxObject } from "imapflow";
import { MessageEnvelopeObject } from "imapflow";
import { schedule } from "node-cron";
import { getScheduledMails, putScheduledMails } from "../db";

let mailer: Mailer | undefined;

export const setMailer = (_mailer: Mailer | undefined) => {
  mailer = _mailer;
};

export const getMailer = () => {
  return mailer;
};

export const sendMail = async (mail: Mail): Promise<boolean | unknown> => {
  if (mail?.to && mail?.subject) {
    const mailer: Mailer | undefined = await createMailer();
    if (!(mailer && mailer.user)) {
      console.error("cannot create mailer");
      return false;
    }

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

  return false;
};

export const sendScheduledMail = async (
  date: Date | string,
  mail: Mail,
  timezone?: string
) => {
  const dateNew = new Date(date);
  if (dateNew instanceof Date && !isNaN(dateNew.getDay())) {
    const minute = dateNew.getMinutes();
    const hours = dateNew.getHours();
    const day = dateNew.getDate();
    const month = dateNew.getMonth();
    const cronString = `* ${minute} ${hours} ${day} ${monthNames[month]} *`;
    schedule(
      cronString,
      () => {
        sendMail(mail);
      },
      { timezone: timezone ?? "CET" }
    );
    putScheduledMails(dateNew, mail, (error, result) => {
      if (error) {
        console.error(`Error saving scheduled job to database, ${error}`);
      }
    });
  }
};

export const getMail = async (
  options: GetMailOptions
): Promise<Message[] | unknown> => {
  const mailer: Mailer | undefined = await createMailer();
  if (!(mailer && mailer.user)) {
    console.error("Cannot create mailer");
    return undefined;
  }
  const imap = mailer?.imapTransporter;
  if (imap) {
    const response = await getMailbox(imap, options);
    const messages = response as Message[];
    return messages;
  }
  return undefined;
};

async function getMailbox(
  imap: ImapFlow,
  options: GetMailOptions
): Promise<Message[] | unknown> {
  if (!imap.authenticated) await imap.connect();
  let lock;

  try {
    lock = await imap.getMailboxLock(options.mailbox);
  } catch (error) {
    return error;
  }

  try {
    const mailbox = imap.mailbox as MailboxObject;

    //Check if the mailbox exist
    await imap.fetchOne(mailbox.exists.toString(), {
      source: true,
    });
    let messages: Message[] = [];

    //Fetch all messages from the mailbox
    for await (let message of imap.fetch("1:*", {
      envelope: true,
      source: true,
    })) {
      messages.push({
        uid: message.uid,
        envelop: message.envelope,
        source: message.source,
      });
    }
    return messages;
  } catch (error) {
    // console.error(`ERROR IN FETCHING MAIL, ${error}`);
    return error;
  } finally {
    // Releasing lock
    lock.release();
  }
}

export const reset = () => {
  mailer = undefined;
};

export const loadScheduledMail = () => {
  let scheduledMails: { date: Date; mail: Mail }[] = [];
  getScheduledMails((error, result) => {
    if (error) {
      console.error(
        `Fetching scheduled mails from the database failed, please check the configurations and try again!, ${error}`
      );
    }
    scheduledMails = result;
  });

  scheduledMails.forEach((schedule) => {
    sendScheduledMail(schedule.date, schedule.mail);
  });
};

export interface GetMailOptions {
  mailbox: "INBOX" | string;
}

export interface Mail {
  from?: string;
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

export interface Message {
  uid: number;
  envelop: MessageEnvelopeObject;
  source: Buffer;
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
