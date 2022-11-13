import { createMailer, Mailer } from "../utils/mailerUtils";
import { ImapFlow, MailboxObject } from "imapflow";
import { response } from "express";

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

export const getMail = async (options: GetMailOptions) => {
  const mailer: Mailer | undefined = await createMailer();
  if (!(mailer && mailer.user)) {
    console.error("cannot create mailer");
    return false;
  }
  const imap = mailer?.imapTransporter;
  if (imap) {
    const messages = await getMailbox(imap, options);

    console.log("Messages are ", messages);
    return messages;
  }
  return undefined;
};

async function getMailbox(imap: ImapFlow, options: GetMailOptions) {
  console.log("I am in get mail");
  if (!imap.authenticated) await imap.connect();

  let lock = await imap.getMailboxLock(options.mailbox);

  try {
    // fetch latest message source
    // client.mailbox includes information about currently selected mailbox
    // "exists" value is also the largest sequence number available in the mailbox
    const mailbox = imap.mailbox as MailboxObject;
    await imap.fetchOne(mailbox.exists.toString(), {
      source: true,
    });
    let messages = [];
    // console.log(message.source.toString());

    // list subjects for all messages
    // uid value is always included in FETCH response, envelope strings are in unicode.
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
    console.log(messages);
    return messages;
  } catch (error) {
    console.error(`ERROR IN FETCHING MAIL, ${error}`);
    return response.status(404).json({ message: error });
  } finally {
    // Make sure lock is released, otherwise next `getMailboxLock()` never returns
    lock.release();
  }

  // log out and close connection
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
