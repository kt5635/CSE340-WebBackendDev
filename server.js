/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require('./utilities')

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout","./layouts/layout") // not at views root

/* ***********************
 * Middleware
 *************************/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ***********************
 * Routes
 *************************/
app.use(static)
// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))
// Inventory routes
app.use("/inv", inventoryRoute);

app.use("/inventory", inventoryRoute);
// File Not Found Route 
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);

  let statusCode = err.status || 500;
  let message = statusCode === 404 
    ? err.message 
    : "Something went wrong on our end.";

  res.status(statusCode).render("errors/error", {
    title: statusCode === 500 ? "500" : err.status,
    message,
    nav,
  });
});


/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);

  let message;
  if (err.status === 404) {
    message = err.message;
  } else if (err.status === 500) {
    message = "500 - Internal Server Error! Something went wrong on our end.";
  } else {
    message = "Unexpected error occurred.";
  }

  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
  });
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
