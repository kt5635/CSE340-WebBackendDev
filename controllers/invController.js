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
  let nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()
  res.render("inventory/management", {
    title: "Vehicle Management",
    nav,
    classificationSelect,
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
        let nav = await utilities.getNav();
        return res.redirect("/inv");
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

/* ***************************
 *  Build add inventory view
 * ************************** */

invCont.buildAddInventoryView = async function (req, res) {
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList();

    res.render("inventory/add-inventory", {
      title: "Add New Inventory Item",
      nav,
      classificationList,
      errors: null,
      inv_make: "",
      inv_model: "",
      inv_year: "",
      inv_description: "",
      inv_price: "",
      inv_miles: "",
      inv_image: "/images/vehicles/no-image.png",
      inv_thumbnail: "/images/vehicles/no-image-tn.png",
      inv_color: ""
    });
};

invCont.processInventory = async function (req, res) {
  let nav = await utilities.getNav();
  let classificationList = await utilities.buildClassificationList();
  const errors = validationResult(req);

if (!errors.isEmpty()) {
    req.flash("notice", "Validation errors occurred.");
    return res.status(400).render("inventory/add-inventory", {
      title: "Add New Inventory Item",
      nav,
      classificationList,
      errors,
      ...req.body
    });
}

  try {
    const insertResult = await invModel.addInventory(req.body);

    if (insertResult) {
      req.flash("success", "Inventory item added successfully!");
      return res.redirect("/inv");
    } else {
      req.flash("notice", "Failed to add inventory item.");
      return res.status(500).render("inventory/add-inventory", {
        title: "Add New Inventory Item",
        nav,
        classificationList,
        errors: null
      });
    }
  } catch (error) {
    console.error("Error adding inventory:", error);
    req.flash("notice", "An error occurred.");
    return res.status(500).render("inventory/add-inventory", {
      title: "Add New Inventory Item",
      nav,
      classificationList,
      errors: null
    });
  }
};

/* ***************************
*  Return Inventory by Classification As JSON
* ************************** */
invCont.getInventoryJSON = async(req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
*  build edit Inventory view
* ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = (await invModel.getInventoryByInventoryId(inv_id))[0];
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

  module.exports = invCont