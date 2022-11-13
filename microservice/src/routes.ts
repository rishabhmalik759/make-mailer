import { Router } from "express";

// Using a generic error for send-mail error
const GENERIC_BACKEND_EXTERNAL_ERROR =
  "There was a problem with sending mail, please try again.";

// Creating middleware routes
const router = Router();
const sendMailRouter = Router();

router.use("/send-mail", sendMailRouter);

export default router;
