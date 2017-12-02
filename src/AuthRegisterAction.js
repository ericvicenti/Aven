import DatabaseService from "./DatabaseService";
import { sendSMS } from "./PhoneService";
import { sendEmail } from "./EmailService";
import Utilities from "./Utilities";

const validator = require("validator");

const looksLikeAnEmail = str =>
  typeof str === "string" && str.length > 5 && str.split("@").length === 2;

const cleanPhoneString = str =>
  str
    .replace(/-/g, "")
    .replace(/\+/g, "")
    .replace(/\(/g, "")
    .replace(/\)/g, "")
    .replace(/ /g, "");
const looksLikeAPhoneNumber = str => {
  if (typeof str !== "string") return false;
  return validator.isNumeric(cleanPhoneString(str));
};

export default async function AuthRegisterAction(action) {
  const user = {
    emailVerification: null,
    phoneVerification: null
  };
  const validatedName = action.name
    .trim()
    .replace(/ /g, "-")
    .replace(/_/g, "-");

  const email = looksLikeAnEmail(action.email)
    ? action.email
    : looksLikeAnEmail(action.email_or_phone) ? action.email_or_phone : null;
  const phone = looksLikeAPhoneNumber(action.phone)
    ? action.phone
    : looksLikeAPhoneNumber(action.email_or_phone)
        ? action.email_or_phone
        : null;
  if (email) {
    user.emailVerification = {
      verificationTime: Date.now() / 1000,
      email,
      code: await Utilities.genAuthCode()
    };
  } else if (phone) {
    user.phoneVerification = {
      verificationTime: Date.now() / 1000,
      phone,
      code: await Utilities.genAuthCode()
    };
  } else {
    throw "No valid email address or phone number!";
  }
  try {
    await DatabaseService.createDoc(validatedName, user);
  } catch (e) {
    if (e.constraint === "primarykey") {
      throw {
        detail: `A user with the name '${validatedName}' already exists.`,
        code: "DUPE_USER"
      };
    }
    throw e.detail;
  }
  if (user.emailVerification) {
    await sendEmail(
      user.emailVerification.email,
      `Welcome to Aven`,
      `Hello, ${validatedName}! Your auth code is ${user.emailVerification.code}
Or, click here:

https://aven.io/auth/verify?username=${validatedName}&code=${user.emailVerification.code}
      `
    );
  }
  if (user.phoneVerification) {
    await sendSMS(
      cleanPhoneString(user.phoneVerification.phone),
      `Your Aven authentication code is ${user.phoneVerification.code}`
    );
  }
  return { name: validatedName };
}
