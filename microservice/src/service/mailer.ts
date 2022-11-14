import { createMailer, Mailer } from "../utils/mailerUtils";
import { ImapFlow, MailboxObject } from "imapflow";
import { MessageEnvelopeObject } from "imapflow";

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
