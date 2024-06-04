import { POST_URL } from "../config.js";
import { getCookie, getQueryParams } from "./utils.script.js";

const form = document.getElementById("form");
const loaderDiv = document.getElementById("loader");
const textAreaLoaderDiv = document.getElementById("textarea-loader");
const notLoginSection = document.getElementById("not-login-section");
const writeSection = document.getElementById("write-section");
const userAvatar = document.getElementById("avatar");
const loginbtns = document.getElementsByClassName("login-btn");
const contentArea = document.getElementById("content-area")
const token = getCookie("accessToken");

const currUrl = document.location.href;

const createOrUpdatePost = async (postId,method) => {
  const content = tinymce.activeEditor.getContent();
  const title = document.getElementById("title").value;
  const tags = document.getElementById("tags").value.split(",");

  const data = {
    title,
    content,
    tags,
  };

  const URL = POST_URL + postId;
  // "https://connectify-backend-api.onrender.com/api/v1/posts/" + postId;

  console.log(POST_URL)
  let createdPost = "";

  await fetch(URL, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((res) => {
      console.log(res.data._id);
      createdPost = res.data;
    })
    .catch((err) => {
      console.log(err);
    });

  return createdPost;
};

const uploadImage = async (postId,file) => {
  const newFormData = new FormData();
  newFormData.append("postImg", file);

  const URL = POST_URL + postId 
  // `https://connectify-backend-api.onrender.com/api/v1/posts/${postId}`;

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
      console.log("post created");
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
  `https://connectify-backend-api.onrender.com/api/v1/posts/${postId}`;

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

const updateSection = async (post) => {
  const writeHeadingElement = document.getElementById("write-heading")
  const title = document.getElementById("title")
  const tags = document.getElementById("tags")
  
  const createBtn = document.getElementById("create-btn")

  writeHeadingElement.innerText = "#Edit Your Post"
  createBtn.value = "update"

  title.value = post.title

  let temp = ""
  for (let i = 0; i < post.tags.length; i++) {
    temp += post.tags[i]+","
  }

  tags.value = temp
  contentArea.innerText = post.content
}

const RTEPlugin = () => {
  tinymce.init({
    selector: 'textarea',
    menubar:"",
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


form.addEventListener("submit", async (e) => {
  e.preventDefault();

  console.log("inside");
  const createBtn = document.getElementById("create-btn")

  loaderDiv.style.display = "flex";

  let post;

  console.log(createBtn)

  let toUpdate = (createBtn.value == "update")

  if (toUpdate) {
    console.log("update")
    post = await createOrUpdatePost(getQueryParams(currUrl).postId,"PUT")
  }

  else {
    console.log("new")
    post = await createOrUpdatePost("","POST")
  }
  console.log(post)

  if(post){
    const file = document.getElementById("postImg")?.files[0];
    if(file){
      const fileUploaded = await uploadImage(post._id,file)
      if(!fileUploaded){
        alert("something went wrong while uploading the file")
      }
    }

    window.location.href = `../pages/posts.html?id=${post._id}`

  }

  else{
    alert("something went wrong while"+(toUpdate?" updating":" creating")+" the post please retry")
  }

  // if (post) {
  //   console.log(post._id);
  //   const check = await uploadImage(newPost._id);

  //   if (check) {
  //     console.log(document.location.href);

  //     window.location.href = `../pages/posts.html?id=${newPost._id}`;
  //   } else {
  //     console.log("no check");
  //   }
  // } else {
  //   console.log("no post id");
  // }
});

window.onload = async () => {
  if (!token) {
    notLoginSection.style.display = "flex";
    loaderDiv.style.display = "none";
    userAvatar.style.display = "none";
    writeSection.style.display = "none";
    loginbtns[0].style.display = "flex";
    loginbtns[1].style.display = "flex";
  } else {
    contentArea.style.display = "none"
    textAreaLoaderDiv.style.display = "flex"
    if (currUrl.includes("edit")) {

      console.log(currUrl)

      const postId = getQueryParams(currUrl).postId
      const post = await getPost(postId)

      await updateSection(post)

    }
      notLoginSection.style.display = "none";
      loginbtns[0].style.display = "none";
      loginbtns[1].style.display = "none";
      userAvatar.style.display = "flex";
      writeSection.style.display = "flex";
      userAvatar.setAttribute(
        "src",
        getCookie("avatar") || "../assests/avatar.jpg"
      );
    RTEPlugin()
    contentArea.style.display = "flex"
    textAreaLoaderDiv.style.display = "none"

  }
};

Array.from(loginbtns).forEach((btn) => {
  btn.addEventListener("click", () => {
    document.location.href = "../pages/login.html";
  });
});


userAvatar.addEventListener("click",()=>{
  
  document.location.href = `../pages/profile.html`
})