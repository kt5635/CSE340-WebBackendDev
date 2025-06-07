const utilities = require("../utilities");
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");
const validate = require("../utilities/account-validation");
require("dotenv").config()
const { validationResult } = require("express-validator");

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
  })
}

/* ****************************************
*  Process login information
* *************************************** */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3000 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000})
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000})
      }
      return res.redirect("/account/account")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error("Access Forbidden")
  }
}

/* ****************************************
*  build account page view
* *************************************** */
async function buildAccount(req, res, next) {
  let nav = await utilities.getNav()
  const accountData = res.locals.accountData;
  res.render("account/account", {
    title: "Account",
    nav,
    accountData,
    errors: null,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
    account_firstname: "",
    account_lastname: "",
    account_email: ""
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors,  
      locals: req.body 
    });
  }
}

/* ****************************************
*  Update account view
* *************************************** */
async function buildupdateAccountView(req, res, next) {
  const account_id = parseInt(req.params.account_id)
  let nav = await utilities.getNav()
  const accountData = await accountModel.getAccountById(account_id);
  res.render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
  })
}

/* ****************************************
*  Process updated account information
* *************************************** */
async function processAccountUpdate(req, res) {
  let nav = await utilities.getNav()
  const {account_id, account_firstname, account_lastname, account_email } = req.body

  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   req.flash("notice", "Error updating account. Please try again.")
  //   return res.render("account/update", {
  //     title: "Update Account",
  //     nav, 
  //     errors: errors.array(),
  //     account_firstname,
  //     account_lastname,
  //     account_email,
  //   })
  // }

  try {
    const updateResult = await accountModel.updateAccountInfo(account_id, account_firstname, account_lastname, account_email);
    console.log("Database update result:", updateResult);

    if (updateResult) {
      req.flash("notice", "Account updated successfully!");
      return res.redirect("/account");
    } else {
      console.error("Error: No rows updated.");
      req.flash("notice", "Error updating account.");
      return res.redirect("/account/update/" + account_id);
    }
  } catch (error) {
    console.error("Update Error:", error.message);
    req.flash("notice", "Error updating account.");
    return res.redirect("/account/update/" + account_id);
  }
}

//   const updateResult = await accountModel.updateAccountInfo(account_id, account_firstname, account_lastname, account_email)
//   if (updateResult) {
//     req.flash("notice", "Account updated successfully!");
//     return res.redirect("/account");
//     } else {
//     req.flash("notice", "Error updating account.");
//     return res.redirect("/account/update/" + account_id);
//   }
// }

/* ****************************************
*  Process updated account password
* *************************************** */
async function processPasswordChange(req, res) {
  let nav = await utilities.getNav();
  const { account_id, account_password } = req.body;



  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   req.flash("notice", "Error changing password. Please try again.");
  //   return res.render("account/update", { 
  //     title: "Update Account", 
  //     nav,
  //     errors: errors.array(),
  //     account_id
  //   });
  // }

  try {

    const hashedPassword = await bcrypt.hash(account_password, 10);
    const updateResult = await accountModel.updatePassword(account_id, hashedPassword);

    if (updateResult) {
      req.flash("notice", "Password updated successfully!");
      return res.redirect("/account");
    } else {
      req.flash("notice", "Error updating password.");
      return res.redirect("/account/update/" + account_id);
    }
  } catch (error) {
    console.error("Error updating password:", error.message);
    req.flash("notice", "Error updating password.");
    return res.redirect("/account/update/" + account_id);
  }
}

/* ****************************************
*  Logout of account
* *************************************** */
async function logoutUser(req, res) {
  try {
    res.clearCookie("jwt"); 
    res.redirect("/"); 
  } catch (error) {
    console.error("Logout Error:", error);
    req.flash("notice", "Error logging out.");
    res.redirect("/account");
  }
}

module.exports = {buildLogin, buildRegister, registerAccount, accountLogin, buildAccount, buildupdateAccountView, processAccountUpdate, processPasswordChange, logoutUser}
