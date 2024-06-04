import { getCookie } from "./utils.script.js";
import { USER_URL,POST_URL } from "../config.js";


const postSection = document.getElementsByClassName("post-section")[0];
const userInfoSection = document.getElementsByClassName("user-info-section")[0];
const loaderDiv = document.getElementById("loader");
const loginbtns = document.getElementsByClassName("login-btn");
const userAvatarElement = document.getElementById("avatar");
const avatarElement = document.getElementById("writer-avatar");
const notLoginSectionElement = document.getElementById("not-login-section");
const followBtn = document.getElementById("follow-btn");
const token = getCookie("accessToken");
let isFollowed; 

Array.from(loginbtns).forEach((btn) => {
  btn.addEventListener("click", () => {
    window.location.href = "./login.html";
  });
});

const getPost = async (postId) => {
  const URL = POST_URL + postId

  //  `https://connectify-backend-api.onrender.com/api/v1/posts/${postId}`;

  let post = "";
  await fetch(URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      console.log(res.status);
      if (res.status == 200) {
        return res.json();
      } else {
        return null;
      }
    })
    .then((res) => {
      if (res) {
        console.log(res);
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

const getUserInfo = async (username, id = "") => {
  const URL = USER_URL + `query/find?username=${username}`
  // `https://connectify-backend-api.onrender.com/api/v1/users/query/find?username=${username}`;

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

const setPostAndUser = (post, user) => {
  postSection.style.display = "flex";
  userInfoSection.style.display = "flex";
  loaderDiv.style.display = "none";

  const titleElement = document.getElementById("title");
  titleElement.innerText = post.title;

  const postImgElement = document.getElementById("postImg");
  postImgElement.setAttribute("src", post.postImgUrl || "../assests/bg2.jpg");

  const contentElement = document.getElementById("content");

  contentElement.innerHTML = post.content;

 
  avatarElement.setAttribute("src", user.avatar || "../assests/avatar.jpg");
  avatarElement.setAttribute("data-username",user.username);

  const usernameElement = document.getElementById("username");

  usernameElement.innerText = user.username;

  const followerCountElement = document.getElementById("follower-count");

  followerCountElement.innerText = user.followers.length;
};

window.onload = async () => {
  console.log(document.cookie);

  if (!token) {
    console.log("token");
    loaderDiv.style.display = "none";
    userAvatarElement.style.display = "none";
    notLoginSectionElement.style.display = "flex";
  } else {
    const postId = window.location.href.split("=")[1];
    notLoginSectionElement.style.display = "none";
    loaderDiv.style.display = "flex";
    userAvatarElement.style.display = "flex";
    userAvatarElement.setAttribute(
      "src",
      getCookie("avatar") || "../assests/avatar.jpg"
    );
    Array.from(loginbtns).forEach((btn) => {
      btn.style.display = "none";
    });

    console.log(getCookie("username"))
    console.log(followBtn.dataset.username)
    

    if (postId) {
      const post = await getPost(postId);
      console.log(post.createdby);
      const users = await getUserInfo(post.createdby);

      setPostAndUser(post, users[0]);

      isFollowed = users[0].followers.includes(getCookie("id"))

      followBtn.setAttribute("data-username",users[0].username)
      if(getCookie("username") == followBtn.dataset.username){ 
        followBtn.style.display = "none"
      }
      followBtn.innerText = isFollowed?"unfollow":"follow";
      followBtn.style.backgroundColor = isFollowed?"#dd0606":"#06dd6d";
      followBtn.style.border = "2px solid " + isFollowed?"#dd0606":"#06dd6d";
      console.log(users[0]);
    } else {
      const errElement = document.getElementById("err-info");
      loaderDiv.style.display = "none";
      errElement.style.display = "flex";
      console.log("no post id");
    }
  }
};

const followUser = async (username,method)=>{
    const URL = USER_URL + `username/${username}/follow`;

    //  `https://connectify-backend-api.onrender.com/api/v1/users/username/${username}/follow`;

    console.log(URL)

    let check=false 

    await fetch(URL, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => {
        console.log(res.status);
        if (res.status == 200) {
          return res.json();
        } else {
          return null;
        }
      })
      .then((res) => {
        if (res) {
          check=true
          return;
        } else {
          return null;
        }
      })
      .catch((err) => {
        console.log(err);
      });

      return check
}

followBtn.addEventListener("click", async (e) => {
 
  const loader = document.getElementById("follow-loader")
  loader.style.display = "flex"
  followBtn.style.display = "none"
    console.log(isFollowed)
    const following = await followUser(followBtn.dataset.username, isFollowed?"DELETE":"POST")

    if(following){
      followBtn.style.display = "flex"
      loader.style.display = "none"
    followBtn.innerText = isFollowed?"follow":"unfollow";
    followBtn.style.backgroundColor = isFollowed?"#06dd6d":"#dd0606";
    followBtn.style.border = "2px solid " + isFollowed?"#06dd6d":"#dd0606";
    isFollowed=!isFollowed
    console.log(isFollowed)}
    else{
      followBtn.style.display = "flex"
      loader.style.display = "none"
      alert("something went wrong while following try again")
    }
});


avatarElement.addEventListener("click",()=>{
  
  document.location.href = `../pages/profile.html?username=${avatarElement.dataset.username}`
})

userAvatarElement.addEventListener("click",()=>{
  
  document.location.href = `../pages/profile.html`
})