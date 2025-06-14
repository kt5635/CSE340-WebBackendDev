const utilities = require("../utilities");
  const { body, validationResult } = require("express-validator")
  const validate = {}
const accountModel = require("../models/account-model")

  /*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
  validate.registrationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), 
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), 
  
      // valid email is required and cannot already exist in the DB
      body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail() 
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists){
            throw new Error("Email exists. Please log in or use different email")
        }
      }),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }

/* ******************************
* Check data and return errors or continue to registration
* ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/* ******************************
* Check data and return errors or continue to account
* ***************************** */
validate.loginRules = () => [
  body("account_email").isEmail().withMessage("A valid email is required."),
  body("account_password").trim().notEmpty().withMessage("Password is required."),
];

validate.checkLoginData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/login", {
      title: "Login",
      nav,
      errors,
      account_email: req.body.account_email || "",
    });
    return;
  }
  next();
};

/* ******************************
* Check data and return errors for updating account information and password
* ***************************** */
validate.checkUpdateData = () => [

  body("account_firstname")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Please provide a valid first name.")
    .custom((value) => {
      console.log("Validating first name:", value);
      return true;
    }),

  body("account_lastname")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Please provide a valid last name.")
    .custom((value) => {
      console.log("Validating last name:", value);
      return true;
    }),

  body("account_email")
  .trim()
  .escape()
  .notEmpty()
  .isEmail()
  .normalizeEmail()
  .withMessage("A valid email is required.")
  .custom(async (account_email, { req }) => {
    const existingAccount = await accountModel.getAccountById(req.body.account_id);
    
    if (existingAccount && existingAccount.account_email !== account_email) {
      const emailExists = await accountModel.checkExistingEmail(account_email);
      if (emailExists) {
        throw new Error("Email already exists. Please choose a different email.");
      }
    }
  })
];

validate.checkPasswordChange = () => [

    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements.")
      .custom((value) => {
      console.log("Validating password:", value);
      return true;
    }),
    ]

/* ******************************
* Check update employee access data
* ***************************** */
validate.checkManageEmployeeData = () => [
  body("account_id")
    .isInt({ min: 1 })
    .withMessage("Account ID must be a valid positive integer."),
  
  body("account_type")
    .isIn(["Client", "Employee", "Admin"])
    .withMessage("Invalid account type. Choose Client, Employee, or Admin.")
];

module.exports = validate