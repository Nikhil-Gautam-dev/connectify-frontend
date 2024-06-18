import {
  getCookie,
  getQueryParams,
  isUserLoggedIn,
  toggleDisplay,
} from "./utils.script.js";
import { POST_URL, USER_URL } from "../config.js";
import { customHeader } from "./footerAndHeader.script.js";
import {
  setCookieWithExpirationInSeconds,
  clearCookie,
} from "./utils.script.js";
import {
  renderPosts,
  handleSearchResults,
  getSearchQueryParameters,
  handleSearch,
  handleLoadMore,
} from "./home.script.js";

const token = getCookie("accessToken");
const postListContainerElement = document.getElementById("post-list-container");

const editBioBtn = document.getElementById("edit-bio-btn");
const cancelBioBtn = document.getElementById("cancel-bio-btn");

const searchBarFormTag = document.getElementById("search-bar-form");
const searchBarTag = document.getElementById("search-bar");
const searchIconTag = document.getElementById("search-icon");
let isFollowed;

const followBtnTag = document.getElementById("follow-btn");

const getUserPosts = async (username) => {
  const URL = POST_URL + `query/search/?page=1&limit=8&creator=${username}`;
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

const fetchUserInfo = async (username) => {
  if (!username) return [];

  const URL = USER_URL + `query/find?username=${username}`;

  let user;

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

const renderUserInfo = (user, isUser) => {
  const usernameElement = document.getElementById("username");
  const profileAvatarElement = document.getElementById("profile-img");
  const followersCountElement = document.getElementById("follower-count");
  const bio = document.getElementById("bio");
  const editBioBtn = document.getElementById("edit-bio-btn");
  const cancelBioBtn = document.getElementById("cancel-bio-btn");

  usernameElement.innerText = user.username;
  profileAvatarElement.setAttribute(
    "src",
    user.avatar || "../assests/avatar.jpg"
  );
  followersCountElement.innerText = user.followers.length;
  bio.innerText = user?.bio || "This is your bio section you can edit it !";
  toggleDisplay(cancelBioBtn, false);
  toggleDisplay(editBioBtn, isUser);
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
  const URL = POST_URL + postId;

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

const updateBio = async (newBio) => {
  const URL = USER_URL + "bio";
  // "https://connectify-backend-api.onrender.com/api/v1/users/bio";
  let check = false;
  const data = {
    bio: newBio,
  };
  await fetch(URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
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
    .catch((err) => {
      console.log(err);
    });

  return check;
};

const setPageCookie = (page, totalPages) => {
  if (getCookie("profile_page")) {
    clearCookie("profile_page");
  }

  if (totalPages) {
    if (getCookie("profile_totalPages")) {
      clearCookie("profile_totalPages");
    }
    setCookieWithExpirationInSeconds("profile_totalPages", totalPages, 86400);
  }

  setCookieWithExpirationInSeconds("profile_page", page, 86400);
};

const renderRefreshErrElements = async (refresh) => {
  const refreshErrTag = document.getElementById("refresh-err-info");
  const heroTag = document.getElementById("hero");
  const postSectionTag = document.getElementById("posts-section");

  toggleDisplay(refreshErrTag, refresh);
  toggleDisplay(heroTag, !refresh);
  toggleDisplay(postSectionTag, !refresh);
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

const handlePostRedirect = (event) => {
  let currentElement = event.target;
  while (currentElement) {
    if (currentElement.classList.contains("post-card")) {
      break;
    }
    if (currentElement.dataset.postid) {
      break;
    }
    currentElement = currentElement.parentElement;
  }

  window.location.href =
    "../pages/posts.html?postId=" + currentElement.dataset?.postid || "";
};

const handleDeletePost = async (event) => {
  const loaderContainer = document.getElementById("loader");
  toggleDisplay(loaderContainer, true);
  toggleDisplay(postListContainerElement, false);
  const postId = event.target.dataset?.postid;

  if (!postId) {
    alert("something went wrong please try again !");
    return;
  }

  const postDeleted = await deletePost(postId);

  if (!postDeleted) {
    alert("something went wrong please try again !");
    return;
  }

  handleUsersAndPost();

  toggleDisplay(postListContainerElement, true, "grid");
};

const handleUsersAndPost = async () => {
  const username =
    getQueryParams(document.location.href)?.username || getCookie("username");

  const loaderContainer = document.getElementById("loader");
  toggleDisplay(loaderContainer, true);

  if (!username) {
    document.location.href = "../pages/login.html";
  } else {
    const users = await fetchUserInfo(username);

    if (users.length != 1) {
      renderRefreshErrElements(true);
    } else {
      const user = users[0];

      const searchQuery = getSearchQueryParameters(
        getCookie("profileSearchParameters") || "",
        "profileSearchParameters"
      );

      if (searchQuery) {
        searchBarTag.value = searchQuery?.title || searchQuery?.tags;
      }

      const posts = await handleSearchResults(
        searchQuery || true,
        false,
        setPageCookie,
        true,
        "profile_page",
        "profile_totalPages"
      );

      toggleDisplay(loaderContainer, false);

      if (posts && posts?.length === 0) {
        renderRefreshErrElements(true);
      } else {
        renderUserInfo(user, user.username === getCookie("username"));
        renderPosts(posts, false, user.username === getCookie("username"));
        isFollowed = (await renderFollowBtn(user)) || false;
      }
    }
  }
};

window.onload = async () => {
  customHeader();

  if (!isUserLoggedIn()) {
    document.location.href = "../pages/login.html";
  } else {
    handleUsersAndPost(false);
  }
};

searchIconTag.addEventListener("click", (e) => {
  handleSearch(e, "profileSearchParameters",true);
});
searchBarFormTag.addEventListener("submit", (e) => {
  handleSearch(e, "profileSearchParameters",true);
});

const loadMoreBtn = document.getElementById("load-more");

loadMoreBtn?.addEventListener("click", handleLoadMore);

postListContainerElement.addEventListener("click", async (e) => {
  if (e.target.classList.contains("del")) {
    handleDeletePost(e);
  } else if (e.target.classList.contains("edit")) {
    document.location.href = `../pages/write.html?edit=true&postId=${e.target.dataset?.postid}`;
  } else if (e.target.classList.contains("p-card")) {
    handlePostRedirect(e);
  }
});

editBioBtn.addEventListener("click", async (e) => {
  const bioTextArea = document.getElementById("edit-bio-textarea");
  const bio = document.getElementById("bio");
  const editLoader = document.getElementById("edit-loader");


  if (e.target.classList.contains("edit")) {
    toggleDisplay(cancelBioBtn, true);
    e.target.classList.remove("edit");
    e.target.classList.remove("fa-pen-to-square");
    e.target.classList.add("fa-check");
    e.target.classList.add("save");

    toggleDisplay(bioTextArea, true);
    bioTextArea.innerText = bio.innerText;
    setCookieWithExpirationInSeconds("oldBio", bio.innerText, 86400);
    toggleDisplay(bio, false);
  } else {
    toggleDisplay(cancelBioBtn, false);
    toggleDisplay(editBioBtn, false);
    toggleDisplay(editLoader, true);

    const newBio = bioTextArea.value;

    if (newBio == "") {
      alert("No bio to update");
      toggleDisplay(editLoader, false);
      toggleDisplay(editBioBtn, true);
    } else {
      const isBioUpdated = await updateBio(newBio);

      if (isBioUpdated) {
        clearCookie("oldBio");
        bio.innerText = newBio;
        toggleDisplay(bioTextArea, false);
        toggleDisplay(bio, true);
        e.target.classList.remove("save");
        e.target.classList.remove("fa-check");
        e.target.classList.add("fa-pen-to-square");
        e.target.classList.add("edit");
        toggleDisplay(editLoader, false);
        toggleDisplay(editBioBtn, true);
      } else {
        alert("something went wrong while update try again");
        toggleDisplay(editLoader, false);
        toggleDisplay(editBioBtn, true);
      }
    }
  }
});

cancelBioBtn.addEventListener("click", () => {
  const bioTextArea = document.getElementById("edit-bio-textarea");
  const bio = document.getElementById("bio");

  editBioBtn.classList.remove("save");
  editBioBtn.classList.remove("fa-check");
  editBioBtn.classList.add("fa-pen-to-square");
  editBioBtn.classList.add("edit");
  bioTextArea.style.display = "none";
  cancelBioBtn.style.display = "none";
  bio.style.display = "flex";
  bio.innerText = getCookie("oldBio");
});

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

const updateFollowerCount = async (username) => {
  const users = await fetchUserInfo(username);

  if (users.length != 1) {
    return;
  }

  const user = users[0];
  const followersCountElement = document.getElementById("follower-count");

  followersCountElement.innerText = user.followers.length;
};

const handleFollowBtn = async (e) => {
  let followBtn = e.target;
  const loader = document.getElementById("follow-loader");
  loader.style.display = "flex";
  followBtn.style.display = "none";
  const following = await followUser(
    followBtn.dataset.username,
    isFollowed ? "DELETE" : "POST"
  );

  if (following) {
    await updateFollowerCount(followBtn.dataset.username);
    followBtn.style.display = "flex";
    loader.style.display = "none";
    followBtn.innerText = isFollowed ? "follow" : "unfollow";
    isFollowed = !isFollowed;
  } else {
    followBtn.style.display = "flex";
    loader.style.display = "none";
    alert("something went wrong while following try again");
  }
};

followBtnTag.addEventListener("click", handleFollowBtn);

