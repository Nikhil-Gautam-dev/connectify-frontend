import { USER_URL } from "../config.js";
import {toggleDisplay} from "../scripts/utils.script.js";

const postFormData = async (formData) => {
  const URL = USER_URL + "auth/signup";

  const res = await fetch(URL, {
    method: "POST",
    body: formData,
  })
    .then((res) => {
      return res;
    })
    .catch((err) => {
      console.log(err);
    });

    return res
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

const getFormData = () => {
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  let gender = document.getElementsByName("gender");

  for (let i = 0; i < gender.length; i++) {
    if (gender[i].checked) gender = gender[i].value;
  }
  const file = document.getElementById("avatar")?.files[0];

  return { username, email, password, gender, file };
};

const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const handleResponse = (res) =>{

  if(res.status == 409){
    alert("user already exist with username or email!");
    renderLoadingScreen(false)
    renderSubmitBtn(false,"#22577a")
    location.reload();
  }

  else if (res.status == 500) {
    alert("something went wrong while signing-up");
    renderLoadingScreen(false)
    renderSubmitBtn(false,"#22577a")
    location.reload();
  }

  else if(res.status == 201){
    window.location.href = "./login.html";
  }
}

const handleForm = async (event) => {
  event.preventDefault();

  renderLoadingScreen(true);
  renderSubmitBtn(true, "#0084db");

  const { username, email, password, gender, file } = getFormData();

  if (!validateEmail(email)) {
    alert("invalid email");
    renderLoadingScreen(false);
    renderSubmitBtn(false, "#22577a");
    location.reload()
    return;
  }

  const newFormData = new FormData();
  newFormData.append("username", username);
  newFormData.append("email", email);
  newFormData.append("password", password);
  newFormData.append("gender", gender);

  if (file) {
    newFormData.append("avatar", file);
  }

  const res = await postFormData(newFormData)

  handleResponse(res)
};

const form = document.getElementById("form");

form.addEventListener("submit", handleForm)
  
export {
  renderLoadingScreen,
  renderSubmitBtn,
  validateEmail
}
