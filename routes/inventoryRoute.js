// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities");

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build inventory details by inventory view
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildByInventoryId));

// intentional error route
router.get("/trigger-error", (req, res, next) => {
  const error = new Error("Intentional 500 Server Error: This is a test.");
  error.status = 500; 
  next(error); 
});

module.exports = router;
