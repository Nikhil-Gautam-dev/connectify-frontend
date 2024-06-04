import { USER_LOGIN_URL} from "../config";

const form = document.getElementById("form");
const regBtn = document.getElementById("reg-btn") 

regBtn.addEventListener("click",()=>{
  window.location.href = "./signup.html"
})


form.addEventListener("submit", (e) => {
  e.preventDefault();

  const loaderDiv = document.getElementById("loader");
  const submitbtn = document.getElementById("submit");

  const refreshOnError = (refresh) => {
    if (refresh) {
      loaderDiv.classList.remove("loader-visible");
      submitbtn.disabled = false;
      submitbtn.style.background =
        "linear-gradient(90deg, rgba(131,58,180,1) 0%, rgba(253,29,29,1) 50%, rgba(252,176,69,1) 100%)";
      location.reload();
      return;
    }

    loaderDiv.classList.add("loader-visible");
    submitbtn.disabled = true;
    submitbtn.style.background =
      "linear-gradient(90deg, rgba(131,58,180,1) 0%, rgba(253,29,29,0.4515056022408963) 56%, rgba(252,176,69,1) 100%)";
  };

  function setCookieWithExpirationInSeconds(name, value, seconds) {
    let date = new Date();
    date.setTime(date.getTime() + (seconds * 1000)); // Convert seconds to milliseconds
    let expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + "; " + expires + "; path=/";
}

  refreshOnError(false)

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const URL = USER_LOGIN_URL

  fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  })
    .then((res) => {

    console.log(res.status)
      if (res.status == 400) {
        alert("username or email is required");
        refreshOnError(true)
      } 
      if (res.status == 404) {
        alert("user doesn't exist");
        refreshOnError(true)
      } 
      else if (res.status == 401) {
        alert("Invalid password");
        refreshOnError(true)
      } 
      else if (res.status == 500) {
        alert("something went wrong while loging");
        refreshOnError(true)
        
      } 

      return res.json()
    })
    .then(res =>{
       console.log(res.data)
       loaderDiv.classList.remove("loader-visible");
       setCookieWithExpirationInSeconds("accessToken",res.data.accessToken,parseInt(res.data.expiry))
       setCookieWithExpirationInSeconds("id",res.data.user._id,parseInt(res.data.expiry))
       setCookieWithExpirationInSeconds("username",res.data.user.username,parseInt(res.data.expiry))
       setCookieWithExpirationInSeconds("avatar",res.data.user.avatar,parseInt(res.data.expiry))
       return
    })
    .catch((err) => {
        
      console.log(err);
    });
});


