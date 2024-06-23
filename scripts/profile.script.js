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
  getSearchQueryParameters,
  renderPosts,
  fetchPosts,
  renderResultNotFound,
} from "./homeProfile.utils.js";

const token = getCookie("accessToken");
const postListContainerElement = document.getElementById("post-list-container");

const editBioBtn = document.getElementById("edit-bio-btn");
const cancelBioBtn = document.getElementById("cancel-bio-btn");

const searchBarFormTag = document.getElementById("search-bar-form");
const searchBarTag = document.getElementById("search-bar");
const searchIconTag = document.getElementById("search-icon");
let isFollowed;

const followBtnTag = document.getElementById("follow-btn");

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

const handleSearchResults = async (
  searchParameters,
  searchFlag,
  isAuthor,
  pageCookieName,
  totalPageCookieName
) => {
  let page = searchFlag ? 1 : getCookie(pageCookieName || "page") || 1;

  const limit = page * 8;

  const postsData = await fetchPosts(
    1,
    limit,
    searchParameters?.title || "",
    searchParameters?.tags || "",
    isAuthor
      ? getQueryParams(document.location.href)?.username ||
          getCookie("username")
      : ""
  );

  if (limit == 8) {
    setPageCookie(
      page,
      searchFlag || searchParameters
        ? Math.ceil(postsData.posts.length / 8)
        : postsData.totalPages
    );
  }

  const loadMoreBtn = document.getElementById("load-more");
  loadMoreBtn.style.display =
    getCookie(totalPageCookieName || "totalPages") != page.toString()
      ? "flex"
      : "none";

  return postsData.posts;
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
        true,
        "profile_page",
        "profile_totalPages"
      );

      toggleDisplay(loaderContainer, false);

      if (posts && posts?.length === 0) {
        renderRefreshErrElements(true);
      } else {
        renderUserInfo(user, user.username === getCookie("username"));
        renderPosts(posts, true, user.username === getCookie("username"));
        isFollowed = (await renderFollowBtn(user)) || false;
      }
    }
  }
};

const handleEmptySearch = async () => {
  const loaderContainer = document.getElementById("loader");
  toggleDisplay(loaderContainer, true);

  if (getCookie("profile_page")) clearCookie("profile_page");
  if (getCookie("profile_totalPages")) clearCookie("profile_totalPages");
  if (getCookie("profileSearchParameters"))
    clearCookie("profileSearchParameters");

  const posts = await handleSearchResults(
    "",
    true,
    true,
    "profile_page",
    "profile_totalPages"
  );

  toggleDisplay(loaderContainer, false);

  if (posts && posts?.length === 0) {
    renderResultNotFound(true);
  } else {
    renderPosts(posts, true);
  }
};

const renderEmptySearch = (emptyFlag) => {
  const postListContainerElement = document.getElementById(
    "post-list-container"
  );
  // const loadMoreBtn = document.getElementById("load-more");

  if (getCookie("writeSearchParameters") || emptyFlag) {
    clearCookie("writeSearchParameters");
  }
  toggleDisplay(postListContainerElement, !emptyFlag, !emptyFlag ? "grid" : "");
  // toggleDisplay(loadMoreBtn, !emptyFlag);
  renderResultNotFound(emptyFlag);
};

const handleSearch = async (event, cookieName) => {
  if (event) {
    event.preventDefault();
  }
  const loaderContainer = document.getElementById("loader");
  toggleDisplay(loaderContainer, true);
  renderResultNotFound(false);

  if (!searchBarTag?.value?.trim()) {
    await handleEmptySearch();
    renderEmptySearch(false);
    return;
  } else {
    renderEmptySearch(false);
    const searchQuery = getSearchQueryParameters(
      searchBarTag.value,
      cookieName
    );

    const posts = await handleSearchResults(
      searchQuery,
      true,
      true,
      "profile_page",
      "profile_totalPages"
    );

    toggleDisplay(loaderContainer, false);

    if (posts && posts?.length === 0) {
      renderEmptySearch(true);
      renderResultNotFound(true);
    } else {
      renderPosts(posts, true);
    }
  }
};

const handleLoadMore = async () => {
  const loadMoreLoader = document.getElementById("load-more-loader");

  toggleDisplay(loadMoreBtn, false);
  toggleDisplay(loadMoreLoader, true);

  const page = parseInt(getCookie("page")) + 1;
  const totalPages = getCookie("totalPages");

  const searchQuery = getSearchQueryParameters(
    getCookie("writeSearchParameters") || ""
  );

  const { posts } = await fetchPosts(
    page,
    8,
    searchQuery?.title,
    searchQuery?.tags,
    getQueryParams(location.href)?.username || getCookie("username")
  );

  setPageCookie(page);

  if (posts?.length === 0) {
    toggleDisplay(loadMoreBtn, false);
    toggleDisplay(loadMoreLoader, false);
  } else if (posts) {
    toggleDisplay(
      loadMoreBtn,
      !(getCookie("page") === getCookie("totalPages"))
    );
    toggleDisplay(loadMoreLoader, false);
    renderPosts(posts);
  } else {
    toggleDisplay(loadMoreBtn, true);
    toggleDisplay(loadMoreLoader, false);
    alert("something went wrong please try again");
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

// search-bar sections

searchIconTag.addEventListener("click", (e) => {
  handleSearch(e, "profileSearchParameters");
});

searchBarFormTag.addEventListener("submit", (e) => {
  handleSearch(e, "profileSearchParameters");
});

// loadmore-scetions

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
