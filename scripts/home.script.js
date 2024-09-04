import {
  clearCookie,
  getCookie,
  isUserLoggedIn,
  setCookieWithExpirationInSeconds,
  getKeywordsAsString,
  getDateSeparated,
  toggleDisplay,
  getQueryParams,
} from "./utils.script.js";

import { customHeader } from "./footerAndHeader.script.js";

import { POST_URL } from "../config.js";

const searchBarFormTag = document.getElementById("search-bar-form");
const searchBarTag = document.getElementById("search-bar");
const searchIconTag = document.getElementById("search-icon");
const postListContainerElement = document.getElementById("post-list-container");

const fetchPosts = async (page, limit, title, tags, author) => {
  let queries = "";
  if (title) {
    queries += "&title=" + title;
  }
  if (tags) {
    queries += "&tags=" + tags;
  }
  if (author) {
    queries += "&author=" + author;
  }
  const URL =
    POST_URL + `query/search/?page=${page || 1}&limit=${limit || 8}${queries}`;

  const token = getCookie("accessToken");

  let posts;
  let totalPages;
  await fetch(URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((res) => {
      totalPages = res.totalPages;
      return res.posts;
    })
    .then((res) => {
      posts = res;
    })
    .catch((err) => {
      console.log(err);
    });

  return { posts, totalPages };
};

const renderLoginErrInfo = () => {
  const avatarContainer = document.getElementById("avatar-li");
  const postSection = document.querySelector("section#posts");

  toggleDisplay(avatarContainer, false);
  // toggleDisplay(postSection, false);
};

const renderPostSection = () => {
  const avatarContainer = document.getElementById("avatar-li");
  const loginbtns = document.getElementsByClassName("login-btn");
  const postSection = document.getElementById("posts");
  const notLoginSection = document.getElementById("not-login-section");

  toggleDisplay(avatarContainer, true);
  toggleDisplay(postSection, true);
  toggleDisplay(loginbtns[0], false);
  toggleDisplay(loginbtns[1], false);
  toggleDisplay(notLoginSection, false);
};

const createDelEdit = (postId) => {
  const delEditContainerTag = document.createElement("div");
  delEditContainerTag.classList.add("edit-del-container");

  const delBtn = document.createElement("span");
  const editBtn = document.createElement("span");

  delBtn.classList.add("fa-regular", "fa-trash-can", "del");
  delBtn.setAttribute("data-postid", postId);
  editBtn.classList.add("fa-solid", "fa-pen-to-square", "edit");
  editBtn.setAttribute("data-postid", postId);

  delEditContainerTag.appendChild(delBtn);
  delEditContainerTag.appendChild(editBtn);

  return delEditContainerTag;
};

const createPostElement = (
  postId,
  author,
  title,
  tags,
  postImgUrl,
  dateString,
  isDelEdit
) => {
  const keywords = getKeywordsAsString(tags);
  const { month, date, year } = getDateSeparated(dateString);

  const liElement = document.createElement("li");
  const postLeft = document.createElement("div");
  const postRight = document.createElement("div");
  const authorDateContainer = document.createElement("div");
  const postTitle = document.createElement("div");
  const keywordsTag = document.createElement("div");

  const authorTag = document.createElement("span");
  const publishedDate = document.createElement("span");
  const monthTag = document.createElement("span");
  const dateTag = document.createElement("span");
  const yearTag = document.createElement("span");

  const imgElement = document.createElement("img");

  postLeft.classList.add("post-left", "p-card");
  liElement.classList.add("post-card", "p-card");
  postRight.classList.add("post-right", "p-card");

  authorDateContainer.classList.add("author-date-container", "p-card");
  postTitle.classList.add("post-title", "p-card");
  keywordsTag.classList.add("keywords", "p-card");

  authorTag.classList.add("author", "p-card");
  publishedDate.classList.add("published-date", "p-card");
  monthTag.classList.add("month", "p-card");
  dateTag.classList.add("date", "p-card");
  yearTag.classList.add("year", "p-card");
  imgElement.classList.add("year", "p-card");

  authorTag.innerText = author + " |";
  monthTag.innerText = month;
  dateTag.innerText = date + ",";
  yearTag.innerText = year;
  keywordsTag.innerText = keywords;
  postTitle.innerText = title;
  imgElement.setAttribute("src", postImgUrl || "../assests/no-img.png");
  imgElement.setAttribute("alt", "post image");

  publishedDate.appendChild(monthTag);
  publishedDate.appendChild(dateTag);
  publishedDate.appendChild(yearTag);

  authorDateContainer.appendChild(authorTag);
  authorDateContainer.appendChild(publishedDate);

  postLeft.appendChild(authorDateContainer);
  postLeft.appendChild(postTitle);
  postLeft.appendChild(keywordsTag);

  if (isDelEdit) {
    const delEditBtnContainer = createDelEdit(postId);
    postLeft.appendChild(delEditBtnContainer);
  }
  postRight.appendChild(imgElement);

  liElement.appendChild(postLeft);
  liElement.appendChild(postRight);

  liElement.setAttribute("data-postId", postId);
  return liElement;
};

const renderPosts = (posts, reRender, isDelEdit) => {
  isDelEdit = isDelEdit || false;

  const postListContainerElement = document.getElementById(
    "post-list-container"
  );

  if (reRender) {
    postListContainerElement.innerHTML = "";
  }

  posts.forEach((post) => {
    let liElement = createPostElement(
      post._id,
      post.createdby,
      post.title,
      post.tags,
      post.postImgUrl,
      post.createdAt,
      isDelEdit
    );
    postListContainerElement.appendChild(liElement);
  });
};

const renderResultNotFound = (found) => {
  const resNotFoundTag = document.getElementById("no-res-found-container");

  toggleDisplay(resNotFoundTag, found);
};

const renderEmptySearch = (emptyFlag) => {
  const postListContainerElement = document.getElementById(
    "post-list-container"
  );

  if (getCookie("writeSearchParameters") || emptyFlag) {
    clearCookie("writeSearchParameters");
  }
  toggleDisplay(postListContainerElement, !emptyFlag);
  renderResultNotFound(emptyFlag);
};

const getSearchQueryParameters = (search, cookieName) => {
  if (!search) {
    return null;
  }
  if (getCookie(cookieName || "writeSearchParameters")) {
    clearCookie(cookieName || "writeSearchParameters");
  }

  setCookieWithExpirationInSeconds(
    cookieName || "writeSearchParameters",
    search,
    86400
  );

  const searchParameters = {};

  if (search.length != 0 && search[0] === "#") {
    searchParameters.tags = search.split("#")[1];
  } else {
    searchParameters.title = search;
  }

  return searchParameters;
};

const setPageCookie = (page, totalPages) => {
  if (getCookie("page")) {
    clearCookie("page");
  }

  if (totalPages) {
    if (getCookie("totalPages")) {
      clearCookie("totalPages");
    }
    setCookieWithExpirationInSeconds("totalPages", totalPages, 86400);
  }

  setCookieWithExpirationInSeconds("page", page, 86400);
};

const handleSearchResults = async (
  searchParameters,
  searchFlag,
  setPageCookie,
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
    searchQuery?.tags
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

const handleEmptySearch = async () => {
  const loaderContainer = document.getElementById("loader");
  toggleDisplay(loaderContainer, true);

  if (getCookie("page")) clearCookie("page");
  if (getCookie("totalPages")) clearCookie("totalPages");
  if (getCookie("writeSearchParameters")) clearCookie("writeSearchParameters");

  const posts = await handleSearchResults("", true, setPageCookie, false);

  toggleDisplay(loaderContainer, false);
  if (posts && posts?.length === 0) {
    renderResultNotFound(true);
  } else {
    renderPosts(posts, true);
  }
};

const handleSearch = async (event, cookieName, isAuthor) => {
  if (event) {
    event.preventDefault();
  }
  const loaderContainer = document.getElementById("loader");
  renderResultNotFound(false);
  toggleDisplay(loaderContainer, true);

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
      setPageCookie,
      isAuthor
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

window.onload = async function () {
  customHeader();
  renderResultNotFound(false);
  if (!isUserLoggedIn()) {
    renderLoginErrInfo();
  } else {
    renderPostSection();
    const loaderContainer = document.getElementById("loader");
    toggleDisplay(loaderContainer, true);

    const searchQuery = getSearchQueryParameters(
      getCookie("writeSearchParameters") || ""
    );

    if (searchQuery) {
      searchBarTag.value = searchQuery?.title || searchQuery?.tags;
    }

    const posts = await handleSearchResults(
      searchQuery,
      false,
      setPageCookie,
      false
    );

    toggleDisplay(loaderContainer, false);
    if (posts && posts?.length === 0) {
      renderResultNotFound(true);
    } else {
      renderPosts(posts, true);
    }
  }
};

const loadMoreBtn = document.getElementById("load-more");

loadMoreBtn?.addEventListener("click", handleLoadMore);

searchIconTag.addEventListener("click", (e) => {
  handleSearch(e, "", false);
});

searchBarFormTag?.addEventListener("submit", (e) => {
  handleSearch(e, "", false);
});

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

postListContainerElement.addEventListener("click", async (e) => {
  if (e.target.classList.contains("p-card")) {
    handlePostRedirect(e);
  }
});

export {
  fetchPosts,
  handleSearchResults,
  getSearchQueryParameters,
  renderPosts,
  handleSearch,
  handleLoadMore,
};
