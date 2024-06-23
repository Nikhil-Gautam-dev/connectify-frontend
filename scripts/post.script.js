import {
  getCookie,
  getDateSeparated,
  getQueryParams,
  isUserLoggedIn,
  toggleDisplay,
} from "./utils.script.js";
import { USER_URL, POST_URL } from "../config.js";
import { customHeader } from "./footerAndHeader.script.js";

const followBtn = document.getElementById("follow-btn");
let isFollowed;

const fetchPost = async (postId) => {
  const URL = POST_URL + postId;
  const token = getCookie("accessToken");
  let post = "";

  await fetch(URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (res.status == 200) {
        return res.json();
      } else {
        return null;
      }
    })
    .then((res) => {
      if (res) {
        post = res.data;
        return;
      } else {
        return null;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return post;
};

const fetchUserInfo = async (username, id = "") => {
  const URL = USER_URL + `query/find?username=${username}`;
  const token = getCookie("accessToken");

  let user = "";

  await fetch(URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (res.status == 200) {
        return res.json();
      } else {
        return null;
      }
    })
    .then((res) => {
      if (res) {
        user = res.data;
        return;
      } else {
        return null;
      }
    })
    .catch((err) => {
      console.log(err);
    });

  return user;
};

const renderLoginElements = () => {
  const loaderDiv = document.getElementById("loader");
  const userAvatarElement = document.getElementById("avatar");
  const errElement = document.getElementById("err-info");

  toggleDisplay(loaderDiv, false);
  toggleDisplay(errElement, false);
  toggleDisplay(userAvatarElement, false);
};

const renderErrElements = () => {
  const errElement = document.getElementById("err-info");
  const loaderDiv = document.getElementById("loader");

  toggleDisplay(loaderDiv, false);
  toggleDisplay(errElement, true);
};

const renderLoadingScreen = () => {
  const loaderDiv = document.getElementById("loader");
  const notLoginSectionElement = document.getElementById("not-login-section");
  const userAvatarElement = document.getElementById("avatar");
  const loginbtns = document.getElementsByClassName("login-btn");

  toggleDisplay(notLoginSectionElement, false);
  toggleDisplay(loaderDiv, true);
  toggleDisplay(userAvatarElement, true);

  userAvatarElement.setAttribute(
    "src",
    getCookie("avatar") || "../assests/avatar.jpg"
  );
  Array.from(loginbtns).forEach((btn) => {
    toggleDisplay(btn, false);
  });
};

const renderPost = async (post) => {
  const postSection = document.getElementsByClassName("post-section")[0];
  const userInfoSection =
    document.getElementsByClassName("user-info-section")[0];
  const loaderDiv = document.getElementById("loader");

  toggleDisplay(postSection, true);
  toggleDisplay(userInfoSection, true);
  toggleDisplay(loaderDiv, false);

  const titleElement = document.getElementById("title");
  const postImgElement = document.getElementById("postImg");
  const contentElement = document.getElementById("content");

  titleElement.innerText = post.title;
  postImgElement.setAttribute(
    "src",
    post.postImgUrl || "../assests/no-img.png"
  );

  let content = post.content;

  content = content.replaceAll("&lt;", "<");
  content = content.replaceAll("&gt;", ">");
  content = content.replaceAll("<br>", "");

  contentElement.innerHTML = "";
  contentElement.innerHTML = content;
};

const renderUserInfo = async (user, dateString) => {
  const { month, date, year } = getDateSeparated(dateString);
  const authorAvatarTag = document.getElementById("writer-avatar");
  const usernameElement = document.getElementById("username");
  const followBtn = document.getElementById("follow-btn");
  const monthTag = document.getElementById("month");
  const dateTag = document.getElementById("date");
  const yearTag = document.getElementById("year");

  usernameElement.innerText = user.username;

  followBtn.setAttribute("data-username", user.username);

  authorAvatarTag.setAttribute("src", user.avatar || "../assests/avatar.jpg");
  authorAvatarTag.setAttribute("data-username", user.username);

  authorAvatarTag.onclick = () => {
    document.location.href = `../pages/profile.html?username=${authorAvatarTag.dataset.username}`;
  };

  monthTag.innerText = month;
  dateTag.innerText = date + ",";
  yearTag.innerText = year;
};

const renderFollowBtn = async (user) => {
  const followBtn = document.getElementById("follow-btn");
  let isFollowed = user.followers.includes(getCookie("id"));

  followBtn.setAttribute("data-username", user.username);
  if (getCookie("username") == followBtn.dataset.username) {
    const followBtnContainer = document.getElementById("follow-btn-container");
    toggleDisplay(followBtnContainer, false);
    return null;
  }
  followBtn.innerText = isFollowed ? "unfollow" : "follow";
  toggleDisplay(followBtn, true);
  return isFollowed;
};

window.onload = async () => {
  customHeader();

  const errElement = document.getElementById("err-info");

  toggleDisplay(errElement, false);

  if (!isUserLoggedIn()) {
    renderLoginElements();
  } else {
    const { postId } = getQueryParams(document.location.href);

    if (!postId) {
      renderErrElements();
    } else {
      renderLoadingScreen();

      const post = await fetchPost(postId);
      if (!post) {
        renderErrElements();
      } else {
        renderPost(post);
        const users = await fetchUserInfo(post.createdby);
        renderUserInfo(users[0], post.createdAt);
        isFollowed = await renderFollowBtn(users[0]);
      }
    }
  }
};

const followUser = async (username, method) => {
  const URL = USER_URL + `username/${username}/follow`;

  const token = getCookie("accessToken");

  let check = false;

  await fetch(URL, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (res.status == 200) {
        return res.json();
      } else {
        return null;
      }
    })
    .then((res) => {
      if (res) {
        check = true;
        return;
      } else {
        return null;
      }
    })
    .catch((err) => {});

  return check;
};

const handleFollowBtn = async (followBtn, isFollowed) => {
  const loader = document.getElementById("follow-loader");
  loader.style.display = "flex";
  followBtn.style.display = "none";
  const following = await followUser(
    followBtn.dataset.username,
    isFollowed ? "DELETE" : "POST"
  );

  if (following) {
    followBtn.style.display = "flex";
    loader.style.display = "none";
    followBtn.innerText = isFollowed ? "follow" : "unfollow";
    isFollowed = !isFollowed;
  } else {
    followBtn.style.display = "flex";
    loader.style.display = "none";
    alert("something went wrong while following try again");
  }

  return { isFollowed, following };
};

followBtn.addEventListener("click", async (e) => {
  isFollowed = await handleFollowBtn(e.target, isFollowed);
});

export { renderFollowBtn, followUser, handleFollowBtn };
