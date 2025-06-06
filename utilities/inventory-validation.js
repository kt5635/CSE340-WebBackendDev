const utilities = require(".")
  const { body, validationResult } = require("express-validator");
  const validate = {}

  // check classification rules and validate classification data
validate.classificationRules = () => [
  body("classification_name")
    .trim()
    .escape()
    .notEmpty()
    .matches(/^[a-zA-Z0-9]+$/)
    .withMessage("Classification name cannot contain spaces or special characters."),
];

validate.checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req);
  let nav = await utilities.getNav();

  if (!errors.isEmpty()) {
    req.flash("notice", "Validation errors occurred. Please correct the issues.");
    return res.status(400).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors,
    });
  }
  next();
};

// check inventory rules and validate inventory data
validate.inventoryRules = () => [
  body("inv_make").trim().escape().notEmpty().withMessage("Make is required."),
  body("inv_model").trim().escape().notEmpty().withMessage("Model is required."),
  body("inv_year")
    .isInt({ min: 1900, max: new Date().getFullYear() }) 
    .withMessage(`Year must be between 1900 and ${new Date().getFullYear()}.`),
  body("inv_description").trim().escape().notEmpty().withMessage("Description is required."),
  body("inv_price").isNumeric().withMessage("Price must be a number."),
  body("inv_miles")
    .isInt({ min: 0 }) 
    .withMessage("Miles must be a non-negative whole number."),
  body("inv_color").trim().escape().notEmpty().withMessage("Color is required."),

];

validate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req);
  let nav = await utilities.getNav();
  let classificationList = await utilities.buildClassificationList(req.body.classification_id);

  if (!errors.isEmpty()) {
    return res.status(400).render("inventory/add-inventory", {
      title: "Add New Inventory Item",
      nav,
      classificationList,
      errors,
      ...req.body
    });
  }
  next();
};

// check and validate inventory update data
validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req);
  let nav = await utilities.getNav();
  let classificationList = await utilities.buildClassificationList(req.body.inv_id);

  if (!errors.isEmpty()) {
    return res.status(400).render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationList,
      inv_id,
      errors,
      ...req.body
    });
  }
  next();
};

module.exports = validate