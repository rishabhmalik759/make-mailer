import { Router } from "express";
import { Mail, sendMail } from "./service/mailer";

// Using a generic error for send-mail error
const GENERIC_BACKEND_EXTERNAL_ERROR =
  "There was a problem with sending mail, please try again.";

// Creating middleware routes
const router = Router();
const mailRouter = Router();
router.use("/mail", mailRouter);

mailRouter.post<{}, {}, Mail>("/", async (req, res, next) => {
  const mail = req.body;
  const response = await sendMail(mail);
  if (response) {
    return res.status(200).json({
      message: `Email sent successfully to ${mail.to}`,
    });
  } else {
    console.error(GENERIC_BACKEND_EXTERNAL_ERROR);
    res.json({ err: GENERIC_BACKEND_EXTERNAL_ERROR });
  }
});

export default router;
