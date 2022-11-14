import { Router } from "express";
import {
  getMail,
  GetMailOptions,
  Mail,
  Message,
  reset,
  sendMail,
} from "./service/mailer";

// Using a generic error for send-mail error
const GENERIC_SENDMAIL_EXTERNAL_ERROR =
  "There was a problem with sending mail, please try again.";

// Creating middleware routes
const router = Router();
const mailRouter = Router();
router.use("/mail", mailRouter);

mailRouter.post<{}, { message: string } | unknown, Mail>( "/", async (req, res, next) => {
    const mail = req.body;
    const response: boolean | unknown = await sendMail(mail);
    const responseResult = response as boolean;
    const responseError = response as Error;

    if (responseResult === true) {
      return res.status(200).json({
        message: `Email sent successfully to ${mail.to}`,
      });
    } else if (responseError) {
      return res.status(404).json({ message: responseError });
    } else {
      console.error(GENERIC_SENDMAIL_EXTERNAL_ERROR);
      return res.status(400).json({ message: GENERIC_SENDMAIL_EXTERNAL_ERROR });
    }
  }
);

mailRouter.post("/reset", async (req, res, next) => {
  reset();
  res.status(200).json({ message: "Reset was successful!" });
});

mailRouter.get<{}, Message[] | ResponseError, GetMailOptions>(
  "/",
  async (req, res, next) => {
    const { mailbox } = req.body;
    if (!(mailbox && mailbox != "")) {
      console.error(
        `Mailbox name is required to create a get mail request. body: {mailbox: "INBOX"}`
      );
      return res.status(400).json({
        message: `Mailbox name is required to create a get mail request. body: {mailbox: "INBOX"}`,
      });
    }
    const response = await getMail({ mailbox });
    const messages = response as Message[];

    if (messages && Array.isArray(messages)) {
      return res.status(200).json(messages);
    } else
      return res.status(400).json({
        message: `ERROR FETCHING MAIL, ${response}`,
      });
  }
);

export default router;

export interface ResponseError {
  message: string;
}
