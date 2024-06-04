import { getCookie, getQueryParams } from "./utils.script.js";
import { POST_URL, USER_URL } from "../config.js";

const token = getCookie("accessToken");
const postListContainerElement = document.getElementById("post-list-container");
const loaderDiv = document.getElementById("loader");

const editBioBtn = document.getElementById("edit-bio-btn");

const currURL = window.location.href;

const isNotUser = currURL.includes("username");

const getUserPosts = async (username) => {
  const URL = POST_URL + "query/search/?page=1&limit=8&creator=" + username
  let posts = "";

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
        posts = res.posts;
        return;
      } else {
        return null;
      }
    });

  return posts;
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

const createPostElement = (postId, author, title, content, postImgUrl) => {
  const liElement = document.createElement("li");
  const imgContainer = document.createElement("div");
  const imgElement = document.createElement("img");
  const authorSpan = document.createElement("span");
  const h2Element = document.createElement("h2");
  const paraElement = document.createElement("p");

  if (content.includes("<")) {
    content = content.replace(/<\/?[^>]+(>|$)/g, "");
  }

  imgContainer.classList.add("img-container");
  authorSpan.classList.add("author");
  h2Element.classList.add("post-title");
  paraElement.classList.add("post-content");
  liElement.classList.add("post-card");

  imgContainer.setAttribute("data-postid", postId);
  authorSpan.setAttribute("data-postid", postId);
  h2Element.setAttribute("data-postid", postId);
  paraElement.setAttribute("data-postid", postId);
  imgElement.setAttribute("data-postid", postId);

  authorSpan.innerText = author;
  h2Element.innerText =
    title.length > 20 ? title.substring(0, 20) + "..." : title;
  paraElement.innerText =
    content.length > 30 ? content.substring(0, 30) + "..." : content;

  imgElement.setAttribute("src", postImgUrl);
  imgElement.setAttribute("alt", "postImg");

  imgContainer.appendChild(imgElement);
  imgContainer.appendChild(authorSpan);

  liElement.appendChild(imgContainer);
  liElement.appendChild(h2Element);
  liElement.appendChild(paraElement);

  liElement.setAttribute("data-postId", postId);
  return liElement;
};

const setUserInfo = (user) => {
  const usernameElement = document.getElementById("username");
  const profileAvatarElement = document.getElementById("avatar");
  const followersCountElement = document.getElementById("follower-count");
  const bio = document.getElementById("bio");

  usernameElement.innerText = user.username;
  profileAvatarElement.setAttribute(
    "src",
    user.avatar || "../assests/avatar.jpg"
  );
  followersCountElement.innerText = user.posts.length;
  bio.innerText = user?.bio || "This is your bio section you can edit it !";
};

const setPosts = (posts) => {
  posts.forEach((post) => {
    let liElement = createPostElement(
      post._id,
      post.createdBy,
      post.title,
      post.content,
      post.postImgUrl
    );

    if (!isNotUser) {
      const delEditBtnContainer = document.createElement("div");
      const deleteBtn = document.createElement("button");
      const EditBtn = document.createElement("button");

      delEditBtnContainer.classList.add("del-edit-btn-container");

      deleteBtn.classList.add("del");
      deleteBtn.id = "del";
      deleteBtn.innerText = "Delete";

      EditBtn.classList.add("edit");
      EditBtn.id = "edit";
      EditBtn.innerText = "Edit";

      deleteBtn.setAttribute("data-postid", post._id);
      EditBtn.setAttribute("data-postid", post._id);

      delEditBtnContainer.append(deleteBtn);
      delEditBtnContainer.append(EditBtn);

      liElement.append(delEditBtnContainer);
    }

    postListContainerElement.appendChild(liElement);
  });
};

const deletePost = async (postId) => {
  const URL = POST_URL + postId
  
    // "https://connectify-backend-api.onrender.com/api/v1/posts/" + postId;

  let check = false;

  await fetch(URL, {
    method: "DELETE",
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
    });

  return check;
};

const updateBio = async (newBio)=>{
  const URL = USER_URL + "bio"
  // "https://connectify-backend-api.onrender.com/api/v1/users/bio";
  let check = false 
  const data = {
    bio:newBio
  }
  await fetch(URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body:JSON.stringify(data)
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
        check=true
        return;
      } else {
        return null;
      }
    })
    .catch((err) => {
      console.log(err);
    });

    return check; 
}

window.onload = async () => {
  console.log(isNotUser);
  console.log(getQueryParams(currURL));
  editBioBtn.style.display = isNotUser ? "none" : "flex"
  const posts = await getUserPosts(
    isNotUser ? getQueryParams(currURL).username : getCookie("username")
  );
  const users = await getUserInfo(
    isNotUser ? getQueryParams(currURL).username : getCookie("username")
  );

  setPosts(posts);
  setUserInfo(users[0]);
};

postListContainerElement.addEventListener("click", async (e) => {
  if (e.target.classList.contains("del")) {
    postListContainerElement.style.display = "none";
    loaderDiv.style.display = "flex";
    await deletePost(e.target.dataset.postid);
    const posts = await getUserPosts(
      isNotUser ? getQueryParams(currURL).username : getCookie("username")
    );
    setPosts(posts);
    console.log("deleted");
    postListContainerElement.style.display = "grid";
    loaderDiv.style.display = "none";
  } else if (e.target.classList.contains("edit")) {
    window.location.href =
      "../pages/write.html?edit=true&postId=" + e.target.dataset.postid;
  } else if (e.target.classList.length == 0) {
    console.log("nothing");
  } else {
    console.log(e.target.dataset.postid);
    window.location.href = `../pages/posts.html?id=${e.target.dataset.postid}`;
  }
});


editBioBtn.addEventListener("click", async (e) => {
  const bioTextArea = document.getElementById("edit-bio-textarea");
  const bio = document.getElementById("bio");
  const editLoader = document.getElementById("edit-loader")
 
  if (e.target.innerText == "edit") {
    editBioBtn.innerText = "save";

    bioTextArea.style.display = "flex";
    bio.style.display = "none";
  } else {
    console.log("hello");
    editLoader.style.display="flex"
    editBioBtn.style.display="none"

    const newBio = bioTextArea.value 

    if(newBio == ""){
      alert("No bio to update")
      editLoader.style.display="none"
      editBioBtn.style.display="flex"
    }
    
    else{

    
    const isBioUpdated = await updateBio(newBio)

    if(isBioUpdated){
      bio.innerText = newBio
      bioTextArea.style.display = "none";
      bio.style.display = "flex";
      editBioBtn.innerText = "edit";
      editLoader.style.display="none"
      editBioBtn.style.display="flex"
    }
    else{
      alert("something went wrong while update try again")
      editLoader.style.display="none"
      editBioBtn.style.display="flex"
    }}
  }
});
