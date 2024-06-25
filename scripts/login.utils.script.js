import { isUserLoggedIn, toggleDisplay } from "./utils.script.js";

const handleLogin = () => {
  const notLoginSection = document.getElementById("not-login-section");
  const loginBtns = document.getElementsByClassName("login-btn");
  const postSection = document.querySelector("section#posts");

  if (isUserLoggedIn()) {
    toggleDisplay(notLoginSection, false);
    Array.from(loginBtns).map((btn) => {
      toggleDisplay(btn, false);
    });
    toggleDisplay(postSection, true);
    return;
  }
  toggleDisplay(notLoginSection, true);
  toggleDisplay(postSection, false);

  Array.from(loginBtns).forEach((btn) => {
    toggleDisplay(btn, true);
    btn.addEventListener("click", () => {
      document.location.href = "../pages/login.html";
    });
  });
};

export { handleLogin };
