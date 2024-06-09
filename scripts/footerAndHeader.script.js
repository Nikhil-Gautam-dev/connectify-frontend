
const customHeader = () => {
  console.log("hlo world")
  const mainElement = document.getElementById("main");
  const header = document.createElement("header");
  header.innerHTML = `
<nav>
  <div class="logo-container">
    <div class="logo">Connectify</div>
  </div>
  <div class="nav-items">
    <span class="h-icon" id="h-icon">
      <img src="../assests/h-icon.webp" alt="">
    </span>
    <ul class="nav-item-list" id="nav-item-list">
      <li id="home"><a href="../pages/home.html">home</a></li>
      <li id="write"><a href="../pages/write.html">write</a></li>
      <li id="posts"><a href="#posts">posts</a></li>
      <li id="about"><a href="#">about</a></li>
      <span id="avatar-li"><img src="../assests/avatar.jpg" alt="avatar" id="avatar"/></span>
      <li class="login-btn" id="login-btn"><a href="#">login</a></li>
    </ul>
  </div>
</nav>`;

  mainElement.prepend(header);

  const hIcon = document.getElementById("h-icon");
  const navItemList = document.getElementById("nav-item-list");
  console.log(window.innerWidth)
  if (window.innerWidth <= 480) {
    console.log("mobile")
    hIcon.style.display = "flex";
    navItemList.style.display = "none";
  }
  else {
    console.log("pc")
    hIcon.style.display = "none";
    navItemList.style.display = "flex";
  }
  hIcon?.addEventListener("click", () => {
    navItemList.style.display =
      navItemList.style.display == "flex" ? "none" : "flex";
  });
};


export { customHeader }