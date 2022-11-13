import * as http from "http";
import * as express from "express";
import * as config from "./config/dbConfig.json";
import routes from "./routes.js";
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
  httpServer.listen(config.httpPort, () => {
    return console.log(
      `Node Mailer Microservice running successfully on port ${config.httpPort}!`
    );
  });
} catch (error) {
  console.error("SERVER ERROR:", error);
}
