import { USER_LOGIN_URL } from "../config.js";
import { setCookieWithExpirationInSeconds } from "./utils.script.js";
import { toggleDisplay } from "./utils.script.js";
const form = document.getElementById("form");
const regBtn = document.getElementById("reg-btn");

regBtn.addEventListener("click", () => {
  window.location.href = "./signup.html";
});

const postLoginRequest = async (username, password) => {
  const URL = USER_LOGIN_URL;

  const res = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  }).then((res) => {
    if (res.status == 400) {
      handleResponseOnError("username or email is required");
      return null;
    } else if (res.status == 404) {
      handleResponseOnError("user doesn't exist");
      return null;
    } else if (res.status == 401) {
      handleResponseOnError("Invalid password");
      return null;
    } else if (res.status == 500) {
      handleResponseOnError("something went wrong while loging");
      return null;
    } else if (res.status == 200) {
      return res.json();
    }
  });

  return res ? res : null;
};

const renderLoadingScreen = (render) => {
  const loaderDiv = document.getElementById("loader");
  toggleDisplay(loaderDiv, render);
};

const renderSubmitBtn = (isDisable, backgroundColor) => {
  const submitbtn = document.getElementById("submit");

  submitbtn.disabled = isDisable;
  submitbtn.style.background = backgroundColor;
};

const handleResponseOnError = (message) => {
  alert(message);
  renderLoadingScreen(false);
  renderSubmitBtn(false, "#22577a");
  location.reload();
};

const handleResponseOnSuccess = (data) => {
  setCookieWithExpirationInSeconds(
    "accessToken",
    data.accessToken,
    parseInt(data.expiry)
  );
  setCookieWithExpirationInSeconds("id", data.user._id, parseInt(data.expiry));
  setCookieWithExpirationInSeconds(
    "username",
    data.user.username,
    parseInt(data.expiry)
  );
  setCookieWithExpirationInSeconds(
    "avatar",
    data.user.avatar,
    parseInt(data.expiry)
  );
  document.location.href = "../pages/home.html";
  return;
};

const getFormData = () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (!username.trim()) {
    return null;
  }

  return { username, password };
};

const handleLoginForm = async (event) => {
  event.preventDefault();
  renderLoadingScreen(true);
  renderSubmitBtn(true, "#0084db");

  const formData = getFormData();

  if (!formData) {
    alert("username can't be empty !");
    renderLoadingScreen(false);
    renderSubmitBtn(false, "#22577a");
    location.reload();
    return;
  }

  const { username, password } = formData;

  const res = await postLoginRequest(username, password);

  if (res) {
    handleResponseOnSuccess(res.data);
  }
};

form.addEventListener("submit", handleLoginForm);
