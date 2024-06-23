import { handleLogin } from "./login.utils.script.js";
import { logoutHandler } from "./logout.script.js";
import { getCookie } from "./utils.script.js";
const customHeader = () => {
  const mainElement = document.getElementById("main");
  const header = document.createElement("header");
  header.innerHTML = `
<nav>
  <div class="logo-container">
    <div class="logo">Connectify</div>
  </div>
  <div class="nav-items">
    <span class="h-icon" id="h-icon">
      <img src="../assests/h-w-icon.png" alt="">
    </span>
    <ul class="nav-item-list" id="nav-item-list">
    <span id="avatar-li"><a href="../pages/profile.html"><img src="../assests/avatar.jpg" alt="avatar" id="avatar"/></a></span>
    <li class="login-btn" id="login-btn"><a href="../pages/login.html">login</a></li>
    <li id="home"><a href="../pages/home.html">home</a></li>
    <li id="write"><a href="../pages/write.html">write</a></li>
    <li id="posts"><a href="#posts">posts</a></li>
    <li id="about"><a href="#">about</a></li>
    <li class="logout-btn" id="logout-btn"><a>logout</a></li>
    </ul>
  </div>
</nav>`;

  mainElement.prepend(header);

  const hIcon = document.getElementById("h-icon");
  const navItemList = document.getElementById("nav-item-list");
  const userAvatar = document.getElementById("avatar");

  userAvatar.setAttribute(
    "src",
    getCookie("avatar") || "../assests/avatar.jpg"
  );
  if (window.innerWidth <= 480) {
    hIcon.style.display = "flex";
    navItemList.style.display = "none";
  } else {
    hIcon.style.display = "none";
    navItemList.style.display = "flex";
  }
  hIcon?.addEventListener("click", () => {
    navItemList.style.display =
      navItemList.style.display == "flex" ? "none" : "flex";
  });

  logoutHandler();

  handleLogin();
};

export { customHeader };
