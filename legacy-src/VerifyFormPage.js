import CreateSmallFormPage from "./CreateSmallFormPage";
import React from "react";

const LoginFormPage = CreateSmallFormPage({
  submitButtonLabel: "Verify",
  title: "Verify",
  heading: "Verification",
  successNavigationAction: { uri: "/" },
  inputs: [
    {
      type: "text",
      name: "username",
      hidden: true,
      label: "Username"
    },
    {
      type: "text",
      name: "code",
      hidden: true,
      label: "Code that we sent you"
    },
    {
      type: "password",
      name: "password",
      label: "New Password"
    }
  ],
  getActionForInput: state => ({ type: "AuthVerifyAction", ...state }),
  validate: state => {
    if (!state.username || !state.code) {
      return "Must provide both the username and the validation code";
    }
    if (state.password.length < 6) {
      return "Please choose a longer _password_";
    }
    return null;
  }
});

export default LoginFormPage;