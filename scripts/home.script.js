
import { currentPageOutline, getCookie, isUserLoggedIn} from "./utils.script.js";
import { POST_URL,USER_URL } from "../config.js";


const avatarContainer = document.getElementById("avatar-li") 
const loginbtns = document.getElementsByClassName("login-btn") 
const postSection = document.getElementById("posts") 
const notLoginSection = document.getElementById("not-login-section") 
const token = getCookie("accessToken")
const userAvatarElement = document.getElementById("avatar");




Array.from(loginbtns).forEach(btn=>{
    btn.addEventListener("click",()=>{
        window.location.href = "./login.html"
    })
})

const getAllPost = async ()=>{
    const URL = POST_URL+"query/search/?page=1&limit=8";  

    

    let posts; 
    await fetch(URL,
        {
            method: 'GET', 
            headers: {
              'Content-Type': 'application/json',
              "Authorization": `Bearer ${token}`
            }
          }
    ).then(res=>res.json()).then(res=>{
        return res.posts 
    })
    .then((res)=>{
        posts = res; 
    })
    .catch(err=>{
    })

    return posts
}

const getAndSetUserInfo = async () => {
    const URL = USER_URL

    let userInfo; 
    await fetch(URL,
        {
            method: 'GET', 
            headers: {
              'Content-Type': 'application/json',
              "Authorization": `Bearer ${token}`
            }
          }
    ).then(res=>res.json()).then(res=>{
        return res.data
    })
    .then((res)=>{
        userInfo = res; 
    })
    .catch(err=>{
    })

    const avatarContainer = document.getElementById("avatar") 

    avatarContainer.setAttribute("src",userInfo.avatar || "../assests/avatar.jpg")
    avatarContainer.setAttribute("alt",userInfo.user)
}

const setLoginErrorPage = ()=>{
    

    avatarContainer.classList.add("display-none")
    loginbtns[0].classList.add("display-flex") 
    loginbtns[1].classList.add("display-flex")    
    postSection.classList.add("display-none") 
    notLoginSection.classList.add("display-flex")
}

const setPostPage = () =>{
    avatarContainer.classList.add("display-flex")
    loginbtns[0].classList.add("display-none") 
    loginbtns[1].classList.add("display-none")    
    postSection.classList.add("display-flex") 
    notLoginSection.classList.add("display-none")
}
const createPostElement = (postId,author,title,content,postImgUrl)=>{
    const liElement = document.createElement("li") 
    const imgContainer = document.createElement("div") 
    const imgElement = document.createElement("img") 
    const authorSpan = document.createElement("span") 
    const h2Element = document.createElement("h2") 
    const paraElement = document.createElement("p") 

    if(content.includes("<")){
        content = content.replace(/<\/?[^>]+(>|$)/g, "");
    }


    imgContainer.classList.add("img-container")    
    authorSpan.classList.add("author")
    h2Element.classList.add("post-title")   
    paraElement.classList.add("post-content")
    liElement.classList.add("post-card") 

    authorSpan.innerText= author
    h2Element.innerText = title.length> 20 ? title.substring(0,20)+"..." : title
    paraElement.innerText = content.length>30 ? content.substring(0,30)+"..." : content

    imgElement.setAttribute("src",postImgUrl)
    imgElement.setAttribute("alt","postImg") 

    imgContainer.appendChild(imgElement)
    imgContainer.appendChild(authorSpan)

    liElement.appendChild(imgContainer)
    liElement.appendChild(h2Element)
    liElement.appendChild(paraElement)

    liElement.setAttribute("data-postId",postId)
    return liElement
}

window.onload = async function(){
    currentPageOutline()
    if(!isUserLoggedIn()){
        setLoginErrorPage()
        return
    }
    else{

    
    setPostPage()    
    const loaderContainer = document.getElementById("loader") 
    loaderContainer.classList.add("loader-visible")
    getAndSetUserInfo()
    const posts = await getAllPost()

    
    const postListContainerElement = document.getElementById("post-list-container")
    
    loaderContainer.classList.remove("loader-visible")
    posts.forEach(post => {
        let liElement = createPostElement(post._id,post.createdBy,post.title,post.content,post.postImgUrl) 

        liElement.addEventListener("click",()=>{
            
            window.location.href=`../pages/posts.html?id=${liElement.dataset.postid}`
        })

        postListContainerElement.appendChild(liElement)
    });

    }
    
}


userAvatarElement.addEventListener("click",()=>{
    document.location.href = `../pages/profile.html`
  })


  