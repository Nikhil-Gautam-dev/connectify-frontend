import { POST_URL } from "../config.js";
import {
  getCookie,
  getQueryParams,
  isUserLoggedIn,
  toggleDisplay,
} from "./utils.script.js";
import { customHeader } from "./footerAndHeader.script.js";

const form = document.getElementById("form");

const createOrUpdatePost = async (postId, method, data) => {
  const token = getCookie("accessToken");

  const URL = POST_URL + postId;

  let createdPost = await fetch(URL, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      }
      return null;
    })
    .catch((err) => {
      console.log(err);
    });

  return createdPost;
};

const uploadImage = async (postId, file) => {
  const token = getCookie("accessToken");

  const newFormData = new FormData();
  newFormData.append("postImg", file);

  const URL = POST_URL + postId;

  let check = false;

  await fetch(URL, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: newFormData,
  })
    .then((res) => res.json())
    .then((res) => {
      check = true;
      return;
    })
    .catch((err) => {
      console.log(err);
    });

  return check;
};

const getData = () => {
  const content = tinymce.activeEditor.getContent();
  const title = document.getElementById("title").value;
  const tagsElement = document.getElementById("tags").value.split(",");

  if (!content.trim() || !title.trim()) {
    return null;
  }

  const tags = tagsElement.map((tags) => {
    return tags.trim();
  });

  return { content, title, tags };
};

const getPost = async (postId) => {
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

const tinyMcePlugin = (content) => {
  tinymce.init({
    selector: "textarea",
    setup: function (editor) {
      editor.on("init", function () {
        editor.setContent(content || "Write your content here !");
      });
    },
    min_height: 100,
    resize: "vertical",
    menubar: "",
    plugins: [
      "advlist",
      "autolink",
      "link",
      "image",
      "lists",
      "charmap",
      "preview",
      "anchor",
      "pagebreak",
      "searchreplace",
      "wordcount",
      "visualblocks",
      "code",
      "fullscreen",
      "insertdatetime",
      "media",
      "table",
      "emoticons",
      "help",
      "autoresize",
    ],
    toolbar:
      "undo redo | styles | bold italic | alignleft aligncenter alignright alignjustify | " +
      "bullist numlist outdent indent | link image | print preview media fullscreen | " +
      "forecolor backcolor emoticons | help",
    content_style:
      "body { font-family:Helvetica,Arial,sans-serif; font-size:16px }",
    autoresize_bottom_margin: 10,
    tinycomments_mode: "embedded",
    tinycomments_author: "Author name",
    mergetags_list: [
      { value: "First.Name", title: "First Name" },
      { value: "Email", title: "Email" },
    ],
  });
};

const renderLoginPage = (loginFlag) => {
  const loaderDiv = document.getElementById("loader");
  const writeSection = document.getElementById("write-section");
  const userAvatar = document.getElementById("avatar");

  toggleDisplay(userAvatar, !loginFlag);
  toggleDisplay(writeSection, !loginFlag);
  toggleDisplay(loaderDiv, false);
};

const renderTextEditor = (content) => {
  const textAreaLoaderDiv = document.getElementById("textarea-loader");

  tinyMcePlugin(content);
  toggleDisplay(textAreaLoaderDiv, false);
};

const renderPostUpdate = (post) => {
  const title = document.getElementById("title");
  const tags = document.getElementById("tags");
  const createBtn = document.getElementById("create-btn");

  createBtn.value = "update";
  title.value = post.title;

  let temp = "";
  for (let i = 0; i < post.tags.length; i++) {
    temp += post.tags[i] + ",";
  }

  tags.value = temp;
};

const handleForm = async (event) => {
  event.preventDefault();
  const createBtn = document.getElementById("create-btn");
  const loaderDiv = document.getElementById("loader");
  const currUrl = document.location.href;

  let toUpdate = createBtn.value == "update";

  toggleDisplay(loaderDiv, true);

  const data = getData();

  if (!data) {
    alert("All fields are required and can't be empty !");
    toggleDisplay(loaderDiv, false);
    return;
  }

  const createPost = await createOrUpdatePost(
    toUpdate ? getQueryParams(currUrl)?.postId : "",
    toUpdate ? "PUT" : "POST",
    data
  );

  if (!createPost) {
    alert(
      "something went wrong while" +
        (toUpdate ? " updating" : " creating") +
        " the post please retry"
    );
    toggleDisplay(loaderDiv, false);

    return;
  }

  const file = document.getElementById("postImg")?.files[0];
  if (file) {
    const fileUploaded = await uploadImage(createPost.data._id, file);
    if (!fileUploaded) {
      alert("something went wrong while uploading the file");
    }
  }

  window.location.href = `../pages/posts.html?postId=${createPost.data._id}`;
};

form.addEventListener("submit", handleForm);

window.onload = async () => {
  customHeader();
  if (!isUserLoggedIn()) {
    renderLoginPage(true);
  } else {
    const textAreaLoaderDiv = document.getElementById("textarea-loader");
    toggleDisplay(textAreaLoaderDiv, true);
    renderLoginPage(false);
    const { edit, postId } = getQueryParams(document.location.href);
    let content;
    if (edit === "true" && postId) {
      const post = await getPost(postId);
      renderPostUpdate(post);
      content = post.content;
    }

    renderTextEditor(content || "");
  }
};
