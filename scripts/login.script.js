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
    console.log(res.status);
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

  console.log(res);

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

  return { username, password };
};

const handleLoginForm = async (event) => {
  event.preventDefault();
  renderLoadingScreen(true);
  renderSubmitBtn(true, "#0084db");

  const { username, password } = getFormData();

  console.log(password);

  const res = await postLoginRequest(username, password);

  if (res) {
    handleResponseOnSuccess(res.data);
  }
};

form.addEventListener("submit", handleLoginForm);

//   {
//   e.preventDefault();

//   const loaderDiv = document.getElementById("loader");
//   const submitbtn = document.getElementById("submit");

//   const refreshOnError = (refresh) => {
//     if (refresh) {
//       loaderDiv.classList.remove("loader-visible");
//       submitbtn.disabled = false;
//       submitbtn.style.background =
//         "linear-gradient(90deg, rgba(131,58,180,1) 0%, rgba(253,29,29,1) 50%, rgba(252,176,69,1) 100%)";
//       location.reload();
//       return;
//     }

//     loaderDiv.classList.add("loader-visible");
//     submitbtn.disabled = true;
//     submitbtn.style.background =
//       "linear-gradient(90deg, rgba(131,58,180,1) 0%, rgba(253,29,29,0.4515056022408963) 56%, rgba(252,176,69,1) 100%)";
//   };

//   refreshOnError(false)

//   const username = document.getElementById("username").value;
//   const password = document.getElementById("password").value;

//   const URL = USER_LOGIN_URL

//   fetch(URL, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       username,
//       password,
//     }),
//   })
//     .then((res) => {

//       if (res.status == 400) {
//         alert("username or email is required");
//         refreshOnError(true)
//       }
//       if (res.status == 404) {
//         alert("user doesn't exist");
//         refreshOnError(true)
//       }
//       else if (res.status == 401) {
//         alert("Invalid password");
//         refreshOnError(true)
//       }
//       else if (res.status == 500) {
//         alert("something went wrong while loging");
//         refreshOnError(true)

//       }

//       return res.json()
//     })
//     .then(res =>{
//        loaderDiv.classList.remove("loader-visible");
//        setCookieWithExpirationInSeconds("accessToken",res.data.accessToken,parseInt(res.data.expiry))
//        setCookieWithExpirationInSeconds("id",res.data.user._id,parseInt(res.data.expiry))
//        setCookieWithExpirationInSeconds("username",res.data.user.username,parseInt(res.data.expiry))
//        setCookieWithExpirationInSeconds("avatar",res.data.user.avatar,parseInt(res.data.expiry))
//        document.location.href = "../pages/home.html"
//        return
//     })
//     .catch((err) => {

//       console.log(err);
//     });
// }
