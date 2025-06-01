const invModel = require("../models/inventory-model")
const Util = require("../utilities/")
const utilities = require("../utilities/")
const { validationResult } = require("express-validator");

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;

  // Validate classification_id early
  if (isNaN(classification_id) || !Number.isInteger(Number(classification_id))) {
    return next({ status: 400, message: "Invalid classification ID. Please provide a valid number." });
  }

  try {
    const data = await invModel.getInventoryByClassificationId(classification_id);
    let nav = await utilities.getNav();

    if (!data || data.length === 0) {
      return next({ status: 404, message: "No vehicles found for this classification." });
    }

    const className = data[0].classification_name;
    const grid = await utilities.buildClassificationGrid(data);

    res.render("./inventory/classification", {
      title: `${className} vehicles`,
      nav,
      grid,
    });

  } catch (error) {
    console.error("Error retrieving classification:", error);
    return next({ status: 500, message: "An internal error occurred. Please try again later." });
  }
};

/* ***************************
 *  Build inventory by single view
 * ************************** */

invCont.buildByInventoryId = async function (req, res, next) {
  const inv_id = req.params.inventoryId;

  if (isNaN(inv_id) || !Number.isInteger(Number(inv_id))) {
    return next({ status: 400, message: "Page not found." });
  }

  try {
    const data = await invModel.getInventoryByInventoryId(inv_id);
    let nav = await utilities.getNav();

    if (!data || data.length === 0) {
      return next({ status: 404, message: "Vehicle not found." });
    }

    const vehicle = data[0];
    const vehicleHTML = Util.buildVehicleDetail(vehicle);
    res.render("./inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicleHTML,
    });

  } catch (error) {
    console.error("Error retrieving vehicle:", error);
    return next({ status: 500, message: "An internal error occurred. Please try again later." });
  }
};

/* ***************************
 *  Build management view
 * ************************** */

invCont.buildManagementView = async function (req, res, next) {
  let nav;
  try {
    nav = await utilities.getNav();
  } catch (error) {
    console.error("Navigation error:", error);
    return next({ status: 500, message: "Failed to load navigation." });
  }

  res.render("inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null 
  });
};

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassificationView = async function (req, res) {
    let nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null
  });
}

invCont.processClassification = async function (req, res) {
  let nav = await utilities.getNav();
  const { classification_name } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash("notice", "Validation errors occurred.");
    return res.status(400).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors,
    });
  }

  try {
    const insertResult = await invModel.addClassification(classification_name);

    if (insertResult) {
      req.flash("success", "Classification added successfully!");
      nav = await utilities.getNav();
      return res.status(201).render("inventory/add-classification", { 
        title: "Add New Classification",
        nav,
        errors: null
      });
    } else {
      req.flash("notice", "Failed to add classification.");
      return res.status(500).render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: null
      });
    }
  } catch (error) {
    console.error("Error adding classification:", error);
    req.flash("notice", "An error occurred.");
    return res.status(500).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null
    });
  }
}
  module.exports = invCont