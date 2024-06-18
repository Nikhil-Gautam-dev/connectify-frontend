import { POST_URL } from "../config.js";
import { getCookie, getQueryParams, isUserLoggedIn, toggleDisplay } from "./utils.script.js";
import { customHeader } from "./footerAndHeader.script.js";

const form = document.getElementById("form");
const loginbtns = document.getElementsByClassName("login-btn");

const currUrl = document.location.href;

const createOrUpdatePost = async (postId, method) => {
  const content = tinymce.activeEditor.getContent();
  const title = document.getElementById("title").value;
  const tags = document.getElementById("tags").value.split(",");

  const token = getCookie("accessToken");


  const data = {
    title,
    content,
    tags,
  };

  const URL = POST_URL + postId;

  let createdPost = "";

  await fetch(URL, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((res) => {
      createdPost = res.data;
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

  const URL = POST_URL + postId

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

const getPost = async (postId) => {
  const URL = POST_URL + postId
  const token = getCookie("accessToken");


  let post = "";
  await fetch(URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
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

const tinyMcePlugin = () => {
  tinymce.init({
    selector: 'textarea',
    menubar: "",
    plugins: '',
    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
    tinycomments_mode: 'embedded',
    tinycomments_author: 'Author name',
    mergetags_list: [
      { value: 'First.Name', title: 'First Name' },
      { value: 'Email', title: 'Email' },
    ],
  });
}

const renderLoginPage = (loginFlag) => {
  const notLoginSection = document.getElementById("not-login-section");
  const loaderDiv = document.getElementById("loader");
  const writeSection = document.getElementById("write-section");
  const userAvatar = document.getElementById("avatar");
  const loginbtns = document.getElementsByClassName("login-btn");

  toggleDisplay(notLoginSection, loginFlag)
  toggleDisplay(loginbtns[0], loginFlag)
  toggleDisplay(loginbtns[1], loginFlag)
  toggleDisplay(userAvatar, !loginFlag)
  toggleDisplay(writeSection, !loginFlag)
  toggleDisplay(loaderDiv, false)
}

const renderTextEditor = () => {
  const contentArea = document.getElementById("content-area")
  const textAreaLoaderDiv = document.getElementById("textarea-loader");

  toggleDisplay(contentArea,false)
  toggleDisplay(textAreaLoaderDiv,true)
  tinyMcePlugin()
  toggleDisplay(contentArea,true)
  toggleDisplay(textAreaLoaderDiv,false)
  
}

const renderPostUpdate = (post) => {
  const title = document.getElementById("title")
  const tags = document.getElementById("tags")
  const contentArea = document.getElementById("content-area")
  const createBtn = document.getElementById("create-btn")

  createBtn.value = "update"
  title.value = post.title

  let temp = ""
  for (let i = 0; i < post.tags.length; i++) {
    temp += post.tags[i] + ","
  }

  tags.value = temp
  contentArea.innerText = post.content
}

const handleForm = async (event)=>{
  {
    event.preventDefault();
    const createBtn = document.getElementById("create-btn")
    const loaderDiv = document.getElementById("loader");
  
    let post;
    let toUpdate = (createBtn.value == "update")
  
    toggleDisplay(loaderDiv,true)
  
    if (toUpdate) {
      post = await createOrUpdatePost(getQueryParams(currUrl).postId, "PUT")
    }
  
    else {
      post = await createOrUpdatePost("", "POST")
    }
  
    if (post) {
      const file = document.getElementById("postImg")?.files[0];
      if (file) {
        const fileUploaded = await uploadImage(post._id, file)
        if (!fileUploaded) {
          alert("something went wrong while uploading the file")
        }
      }
  
      window.location.href = `../pages/posts.html?id=${post._id}`
  
    }
  
    else {
      alert("something went wrong while" + (toUpdate ? " updating" : " creating") + " the post please retry")
    }
  
  }
}

function validateHTMLTags(htmlString) {
  // Regular expression to match HTML tags
  const tagPattern = /<\/?([a-zA-Z0-9]+)[^>]*>/g;
  const selfClosingTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
  const stack = [];
  let match;

  while ((match = tagPattern.exec(htmlString)) !== null) {
      const tag = match[0];
      const tagName = match[1];

      if (tag.startsWith('</')) {
          // Closing tag
          if (stack.length === 0 || stack.pop() !== tagName) {
              return false;
          }
      } else if (!selfClosingTags.includes(tagName)) {
          // Opening tag (exclude self-closing tags)
          stack.push(tagName);
      }
  }

  return stack.length === 0;
}


form.addEventListener("submit", handleForm);

window.onload = async () => {
  customHeader()
  if (!isUserLoggedIn()) {
    renderLoginPage(true)
  } else {
    renderLoginPage(false)
    const { edit, postId } = getQueryParams(document.location.href)
    renderTextEditor()
    if (edit === "true" && postId) {
      const post = await getPost(postId)
      renderPostUpdate(post)
    }
  }
};


Array.from(loginbtns).forEach((btn) => {
  btn.addEventListener("click", () => {
    document.location.href = "../pages/login.html";
  });
});