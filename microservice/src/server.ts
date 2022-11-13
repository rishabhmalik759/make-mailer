import * as http from "http";
import * as express from "express";
import * as config from "./config.json";
import routes from "./routes.js";

// Initializing Express
const app = express();

// Installing middleware routes
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
