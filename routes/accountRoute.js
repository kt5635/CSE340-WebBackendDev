// Needed Resources
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/")
const regValidate = require('../utilities/account-validation')

// Route to account

router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))
router.get("/account", utilities.checkLogin, utilities.handleErrors(accountController.buildAccount))
router.get('/account/logout', (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/");
});

// Route to update account information
router.get("/update/:account_id", utilities.checkLogin, utilities.handleErrors(accountController.buildupdateAccountView))

// Route to logout
router.get("/logout", utilities.handleErrors(accountController.logoutUser))

// Process the registration data
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// process to update account information and password
router.post(
  "/update",
  utilities.checkLogin,
  // regValidate.checkUpdateData,
  utilities.handleErrors(accountController.processAccountUpdate)
)

router.post(
  "/update-password",
  utilities.checkLogin, 
  // regValidate.checkPasswordChange,
  utilities.handleErrors(accountController.processPasswordChange)
);


module.exports = router;