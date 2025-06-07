// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities");
const invValidate = require("../utilities/inventory-validation");

// Route to build inventory by classification view and inventory details by inventory view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildByInventoryId));

// Route to build management view
router.get("/", utilities.checkLogin, utilities.checkAdminOrEmployee, utilities.handleErrors(invController.buildManagementView));

// Route to build add classification view
router.get("/add-classification", utilities.checkAdminOrEmployee, utilities.handleErrors(invController.buildAddClassificationView));

// Route to get inventory by classification in inventory management view
router.get("/getInventory/:classification_id", utilities.checkAdminOrEmployee, utilities.handleErrors(invController.getInventoryJSON))

// Route to update/edit inventory and delete inventory
router.get("/edit/:inv_id", utilities.checkAdminOrEmployee, utilities.handleErrors(invController.editInventoryView))
router.get("/delete/:inv_id", utilities.checkAdminOrEmployee, utilities.handleErrors(invController.deleteInventoryView))

// Route to post new classification
router.post(
  "/add-classification",
  utilities.checkAdminOrEmployee,
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.processClassification)
);

// Route to build add inventory view
router.get("/add-inventory", utilities.checkAdminOrEmployee, utilities.handleErrors(invController.buildAddInventoryView));

// Route to post new inventory view
router.post(
  "/add-inventory",
  utilities.checkAdminOrEmployee,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.processInventory)
);

// Route to post edited inventory and delete inventory 
router.post( 
  "/update/", 
  utilities.checkAdminOrEmployee,
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);
router.post( 
  "/delete/", 
  utilities.checkAdminOrEmployee,
  utilities.handleErrors(invController.deleteInventory)
);

// intentional error route
router.get("/trigger-error", (req, res, next) => {
  const error = new Error("Intentional 500 Server Error: This is a test.");
  error.status = 500; 
  next(error); 
});

module.exports = router;
