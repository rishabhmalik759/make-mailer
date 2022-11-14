import * as http from "http";
import * as express from "express";
import routes from "./routes.js";
import { loadScheduledMail } from "./service/mailer.js";
require("dotenv").config();

// Initializing Express
const app = express();

// Installing middleware routes
app.use(express.json());

app.use(routes);
// Initializing HTTP server instances
const httpServer = http.createServer(app);

// Starting HTTP server
try {
  httpServer.listen(process.env.HTTP_PORT ?? 8080, () => {
    return console.log(
      `Node Mailer Microservice running successfully on port ${
        process.env.HTTP_PORT ?? 8080
      }!`
    );
  });
} catch (error) {
  console.error("SERVER ERROR:", error);
}

loadScheduledMail();
