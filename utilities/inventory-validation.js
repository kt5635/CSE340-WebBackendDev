const utilities = require(".")
  const { body, validationResult } = require("express-validator");
  const validate = {}

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

module.exports = validate