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

export {currentPageOutline,isUserLoggedIn,getCookie,getQueryParams,navigateToProfile}