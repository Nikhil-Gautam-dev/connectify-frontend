import { POST_URL } from "../config.js";
import {
  getCookie,
  getDateSeparated,
  getKeywordsAsString,
  toggleDisplay,
  setCookieWithExpirationInSeconds,
  clearCookie,
} from "./utils.script.js";

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
const renderResultNotFound = (found) => {
  const resNotFoundTag = document.getElementById("no-res-found-container");

  toggleDisplay(resNotFoundTag, found);
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

export {
  createPostElement,
  renderPosts,
  getSearchQueryParameters,
  fetchPosts,
  renderResultNotFound,
};
