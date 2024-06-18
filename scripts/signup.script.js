import { USER_URL,POST_URL } from "../config.js";

const form = document.getElementById("form");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const loaderDiv = document.getElementById("loader");
  loaderDiv.classList.toggle("loader-visible");

  const submitbtn = document.getElementById("submit");

  submitbtn.disabled = true;
  submitbtn.style.background =
    "linear-gradient(90deg, rgba(131,58,180,1) 0%, rgba(253,29,29,0.4515056022408963) 56%, rgba(252,176,69,1) 100%)";
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  var gender = document.getElementsByName("gender");

  for (let i = 0; i < gender.length; i++) {
    if (gender[i].checked) gender = gender[i].value;
  }
  const file = document.getElementById("avatar")?.files[0];

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email)) {
    alert("invalid email");
  }

  const newFormData = new FormData();
  newFormData.append("username", username);
  newFormData.append("email", email);
  newFormData.append("password", password);
  newFormData.append("gender", gender);

  if (file) {
    newFormData.append("avatar", file);
  }

  const URL =  USER_URL + "auth/signup"

  fetch(URL, {
    method: "POST",
    body: newFormData,
  })
    .then((res) => {

      if (res.status == 409) {
        alert("user already exist with email or username");
        submitbtn.disabled = false;
        submitbtn.style.background =
          "linear-gradient(90deg, rgba(131,58,180,1) 0%, rgba(253,29,29,1) 50%, rgba(252,176,69,1) 100%)";

        location.reload()
        return;
      } 
      else if (res.status == 500){
        alert("something went wrong while signing-up");
        submitbtn.disabled = false;
        submitbtn.style.background =
          "linear-gradient(90deg, rgba(131,58,180,1) 0%, rgba(253,29,29,1) 50%, rgba(252,176,69,1) 100%)";
        loaderDiv.classList.toggle("loader-visible");
        location.reload()
        return;
      }
      else {
        res = res.json();
        loaderDiv.classList.toggle("loader-visible");
        window.location.href = "./login.html";
        return
      }
    })
    .catch((error) => {
    });
});
