const currentPageOutline = () => {
    let currURL = document.location.href 


    if(currURL.includes("home.html")){
        const homeLiElement = document.getElementById("home") 

        homeLiElement.style.borderBottom = "2px solid white"
    }
    if(currURL.includes("write.html")){
        const writeLiElement = document.getElementById("write") 

        writeLiElement.style.borderBottom = "2px solid white"
    }
}

const isUserLoggedIn = ()=>{
    console.log(document.cookie)
    return (document.cookie?.includes("accessToken"))
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function getQueryParams(url) {
    const queryParams = {};
    const queryString = url.split('?')[1];
    if (!queryString) {
        return queryParams;
    }

    const pairs = queryString.split('&');
    pairs.forEach(pair => {
        const [key, value] = pair.split('=');
        queryParams[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });

    return queryParams;
}

const navigateToProfile = ()=>{
    document.location.href = "../pages/profile.html"
}

function setCookieWithExpirationInSeconds(name, value, seconds) {
    let date = new Date();
    date.setTime(date.getTime() + (seconds * 1000)); // Convert seconds to milliseconds
    let expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + "; " + expires + "; path=/";
}

function clearCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
  

export {currentPageOutline,isUserLoggedIn,getCookie,getQueryParams,navigateToProfile,setCookieWithExpirationInSeconds, clearCookie}