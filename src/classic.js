import Base from './index';
import AskSocialNetwork from './cred/social/ask_social_network';
import AskSocialNetworkOrLogin from './cred/or/ask_social_network_or_login';
import Login from './database/login';
import SignUp from './database/sign_up';
import ResetPassword from './database/reset_password';
import { renderSSOScreens } from './lock/sso/index';
import { getScreen, initDatabase } from './database/index';
import { initSocial } from './social/index';
import * as l from './lock/index';

export default class Auth0Lock extends Base {

  constructor(...args) {
    super("classic", dict, ...args);
  }

  didInitialize(model, options) {
    model = initSocial(model, options);
    model = initDatabase(model, options);
    this.setModel(model);
  }

  didReceiveClientSettings(m) {
    const anyDBConnection = l.getEnabledConnections(m, "database").count() > 0;
    const anySocialConnection = l.getEnabledConnections(m, "social").count() > 0;

    if (!anyDBConnection && !anySocialConnection) {
      // TODO: improve message
      throw new Error("At least one database or social connection needs to be available.");
    }
  }

  render(m) {
    const ssoScreen = renderSSOScreens(m);
    if (ssoScreen) return ssoScreen;

    if (l.getEnabledConnections(m, "database").count() === 0) {
      return new AskSocialNetwork();
    }

    const screen = getScreen(m);
    switch(screen) {
      case "login":
      return l.getEnabledConnections(m, "social").count() > 0
        ? new AskSocialNetworkOrLogin()
        : new Login();

      case "signUp":
      return new SignUp();

      case "resetPassword":
      return new ResetPassword();

      default: // TODO: show a crashed screen.
      throw new Error("unknown screen");
    }
  }

}

const dict = {
  lastLogin: {
    headerText: "Last time you logged in with",
    skipLastLoginLabel: "Not your account?"
  },
  login: {
    emailInputPlaceholder: "yours@example.com",
    footerText: "",
    forgotPasswordLabel: "Don't remember your password?",
    headerText: "",
    loginTabLabel: "Login",
    passwordInputPlaceholder: "your password",
    signUpTabLabel: "Sign Up",
    usernameInputPlaceholder: "your username"
  },
  network: {
    footerText: "",
    headerText: "",
    smallSocialButtonsHeader: "Login with"
  },
  networkOrLogin: {
    emailInputPlaceholder: "yours@example.com",
    footerText: "",
    forgotPasswordLabel: "Don't remember your password?",
    headerText: "",
    loginTabLabel: "Login",
    passwordInputPlaceholder: "your password",
    separatorText: "or",
    signUpTabLabel: "Sign Up",
    smallSocialButtonsHeader: "",
    usernameInputPlaceholder: "your username"
  },
  resetPassword: {
    emailInputPlaceholder: "yours@example.com",
    footerText: "",
    headerText: "Please enter your email and the new password. We will send you an email to confirm the password change.",
    passwordConfirmationInputPlaceholder: "confirm new password",
    passwordInputPlaceholder: "your new password",
    usernameInputPlaceholder: "your username"
  },
  signUp: {
    emailInputPlaceholder: "yours@example.com",
    footerText: "",
    headerText: "",
    loginTabLabel: "Login",
    passwordInputPlaceholder: "your password",
    signUpTabLabel: "Sign Up",
    usernameInputPlaceholder: "your username",
  },
  signedIn: {
    success: "Thanks for signing in."
  },
  signedUp: {
    success: "Thanks for signing up."
  }
};