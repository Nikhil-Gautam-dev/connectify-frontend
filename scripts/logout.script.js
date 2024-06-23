import { USER_URL } from "../config.js";
import { getCookie, isUserLoggedIn, toggleDisplay } from "./utils.script.js";

const clearAllCookies = () => {
  // Get all cookies as a single string
  const cookies = document.cookie.split(";");

  // Iterate through each cookie
  for (let i = 0; i < cookies.length; i++) {
    // Get the cookie name
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;

    // Delete the cookie by setting its expiration date to a past date
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
  }
};

const postLogoutRequest = async () => {
  const URL = USER_URL + "auth/logout";

  const token = getCookie("accessToken");

  const islogout = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      console.log(res);
      if (res.status == 201) {
        return true;
      }
      return false;
    })
    .catch((_) => {
      return false;
    });

  return islogout;
};

const logoutHandler = () => {
  const logoutBtn = document.getElementById("logout-btn");
  if (!isUserLoggedIn()) {
    toggleDisplay(logoutBtn, false);
    return;
  }
  toggleDisplay(logoutBtn, true);

  logoutBtn.addEventListener("click", async () => {
    const islogout = await postLogoutRequest();
    if (!islogout) {
      alert("something went wrong !");
      return;
    }
    clearAllCookies();
    location.reload();
  });
};

export { logoutHandler };
