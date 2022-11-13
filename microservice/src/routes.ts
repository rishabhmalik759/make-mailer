import { Router } from "express";
import {
  getMail,
  GetMailOptions,
  Mail,
  reset,
  sendMail,
} from "./service/mailer";

// Using a generic error for send-mail error
const GENERIC_BACKEND_EXTERNAL_ERROR =
  "There was a problem with sending mail, please try again.";

// Creating middleware routes
const router = Router();
const mailRouter = Router();
router.use("/mail", mailRouter);

mailRouter.post<{}, {}, Mail>("/", async (req, res, next) => {
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
    console.error(GENERIC_BACKEND_EXTERNAL_ERROR);
    res.status(400).json({ err: GENERIC_BACKEND_EXTERNAL_ERROR });
  }
});

mailRouter.post("/reset", async (req, res, next) => {
  reset();
  res.status(200).json({ message: "Reset was successful!" });
});

mailRouter.get<{}, {}, GetMailOptions>("/", async (req, res, next) => {
  const { mailbox } = req.body;
  if (!(mailbox && mailbox != "")) {
    console.error(
      `Mailbox name is required to create a get mail request. body: {mailbox: "INBOX"}`
    );
    return res.status(400).json({
      message: `Mailbox name is required to create a get mail request. body: {mailbox: "INBOX"}`,
    });
  }
  const messages = await getMail({ mailbox });

  if (messages) {
    res.status(200).json({ messages });
  }
});

export default router;
