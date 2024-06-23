import { isUserLoggedIn, toggleDisplay } from "./utils.script.js";

const handleLogin = () => {
  const notLoginSection = document.getElementById("not-login-section");
  const loginBtns = document.getElementsByClassName("login-btn");

  if (isUserLoggedIn()) {
    toggleDisplay(notLoginSection, false);
    Array.from(loginBtns).map((btn) => {
      toggleDisplay(btn, false);
    });
    return;
  }
  toggleDisplay(notLoginSection, true);

  Array.from(loginBtns).forEach((btn) => {
    toggleDisplay(btn, true);
    btn.addEventListener("click", () => {
      document.location.href = "../pages/login.html";
    });
  });
};

export { handleLogin };
