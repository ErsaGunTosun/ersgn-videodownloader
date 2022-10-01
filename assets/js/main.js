const electron = require('electron');
const {
    ipcRenderer
} = electron;

let urlFormDiv      = document.querySelector('#url-form-div')
let urlForm         = document.querySelector('#url-form');
let urlInput        = document.querySelector('#url-input');
let convertBtn      = document.querySelector('#convert-btn');
let errorMsgDiv     = document.querySelector('#error-message-div');
let errorMsg        = document.querySelector('#error-message')

let videoDetailsDiv = document.querySelector('#details-div');
let downloadButton  = document.querySelector('#download-btn');
let deleteButton    = document.querySelector('#delete-btn');

let videoData;
let videoConvert = false;
let urlError = false;


// submit video url 
urlForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    let url = urlInput.value
    if(url.indexOf('www.facebook.com') > -1){
        ipcRenderer.send('facebook-video:send', url)
        urlError = false;
    }else if(url.indexOf('https://www.youtube.com/watch?v=') >-1){
        ipcRenderer.send('youtube-video:send', url)
        urlError = false;
    }else{
        urlError = true;
        urlInput.value = '';
        errorMsgDiv.className = 'w-100 text-center d-block';
        errorMsg.textContent  = 'Lüften Facebook veya Youtube URL Giriniz.'
    }
    try { 
        if(urlError){
            videoDetailsDiv.textContent = '';  
        }else{
            errorMsgDiv.className= 'w-100 text-center d-none';
            if(!videoConvert){
                videoConvert = true;
                urlInput.value = '';
                let loading = document.createElement('div');
                loading.className = 'w-100 h-50 text-center'
                let loadingDiv = document.createElement('div');
                loadingDiv.className = 'spinner-border text-dark';
                loadingDiv.setAttribute('role', 'status');
                let loadingGif = document.createElement('span');
                loadingGif.className = 'visually-hidden';
                loadingDiv.appendChild(loadingGif);
                loading.appendChild(loadingDiv);
                videoDetailsDiv.appendChild(loading);
            }else{
                videoDetailsDiv.textContent = '';
                urlInput.value = '';
                let loading = document.createElement('div');
                loading.className = 'w-100 h-50 text-center'
                let loadingDiv = document.createElement('div');
                loadingDiv.className = 'spinner-border text-dark';
                loadingDiv.setAttribute('role', 'status');
                let loadingGif = document.createElement('span');
                loadingGif.className = 'visually-hidden';
                loadingDiv.appendChild(loadingGif);
                loading.appendChild(loadingDiv);
                videoDetailsDiv.appendChild(loading);
            }
            
        }
    } catch (e) {
        console.log(e);
    }
});


// get youtube video data
ipcRenderer.on('YTVideo:get', (err, data) => {
    videoData = data;
    videoDetailsDiv.textContent = "";
    let row = document.createElement("div");
    row.className = "row d-flex justify-content-center align-items-start w-100 h-75";

    //image div
    let imgDiv = document.createElement("div");
    imgDiv.className = "m-2";
    imgDiv.style.width = "336px";
    imgDiv.style.height = "188px";
    let img = document.createElement("img");
    img.className = "border border-dark w-100 h-100 rounded-2 shadow";
    img.src = data.image.url;
    imgDiv.appendChild(img);

    //text div
    let textDiv = document.createElement("div");
    textDiv.className = "w-50";
    let header = document.createElement("p");
    header.className = "h3 text-dark";
    header.textContent = data.title;
    let author = document.createElement("p");
    author.className = "h4 text-dark";
    author.textContent = data.author;
    let detailsDiv = document.createElement("div");
    detailsDiv.className = "row";
    let detailsText = document.createElement("p");
    detailsText.className = "text-dark h5";

    // like
    let likes = document.createElement("span");
    likes.className = "m-1";
    let likesIcon = document.createElement("i");
    likesIcon.className = "far fa-thumbs-up";
    let likesText = document.createElement("span");
    likesText.className = "text-dark";
    likesText.textContent = " " + data.likes;
    likes.appendChild(likesIcon);
    likes.appendChild(likesText);

    // views 
    let views = document.createElement("span");
    views.className = "m-1";
    let viewsIcon = document.createElement("i");
    viewsIcon.className = "far fa-eye";
    let viewsText = document.createElement("span");
    viewsText.className = "text-dark";
    viewsText.textContent = " " + data.views;
    views.appendChild(viewsIcon);
    views.appendChild(viewsText);
    detailsDiv.appendChild(detailsText);
    detailsText.appendChild(likes);
    detailsText.appendChild(views);

    // btn
    let deletedBtn = document.createElement("button");
    deletedBtn.className = "btn btn-dark fw-bold m-1 shadow";
    deletedBtn.id = "delete-btn";
    deletedBtn.onclick = dlt;
    let deletedIcon = document.createElement("i");
    deletedIcon.className = "far fa-trash-alt";
    let deletedText = document.createElement("span");
    deletedText.textContent = " Deleted";
    deletedBtn.appendChild(deletedIcon);
    deletedBtn.appendChild(deletedText);

    let dowloadBtn1 = document.createElement("button");
    dowloadBtn1.className = "btn btn-dark fw-bold m-1 shadow";
    dowloadBtn1.id = "download-mp3-btn";
    dowloadBtn1.onclick = YTdlMp3;
    let dowloadIcon1 = document.createElement("i");
    dowloadIcon1.className = "fas fa-download";
    let dowlaodText1 = document.createElement("span");
    dowlaodText1.textContent = " Mp3";
    dowloadBtn1.appendChild(dowloadIcon1);
    dowloadBtn1.appendChild(dowlaodText1);

    let dowloadBtn2 = document.createElement("button");
    dowloadBtn2.className = "btn btn-dark fw-bold m-1 shadow";
    dowloadBtn2.id = "download-mp4-btn";
    dowloadBtn2.onclick = YTdlMp4;
    let dowloadIcon2 = document.createElement("i");
    dowloadIcon2.className = "fas fa-download";
    let dowlaodText2 = document.createElement("span");
    dowlaodText2.textContent = " Mp4";
    dowloadBtn2.appendChild(dowloadIcon2);
    dowloadBtn2.appendChild(dowlaodText2);

    textDiv.appendChild(header);
    textDiv.appendChild(author);
    textDiv.appendChild(detailsDiv);
    textDiv.appendChild(deletedBtn);
    textDiv.appendChild(dowloadBtn1);
    textDiv.appendChild(dowloadBtn2);
    row.appendChild(imgDiv);
    row.appendChild(textDiv);
    videoDetailsDiv.appendChild(row);
});


// get facebook video data
ipcRenderer.on('FBVideo:get', (err, data) => {
    videoData = data;
    if(videoData.download.sd == undefined || videoData.download.hd == undefined){
        videoDetailsDiv.textContent = "";
        errorMsgDiv.className = 'w-100 text-center d-block';
        errorMsg.textContent  = 'Video Bulunamadı.'
    }else{
        console.log(videoData)
    videoDetailsDiv.textContent = "";
    let row = document.createElement("div");
    row.className = "row d-flex justify-content-center align-items-start w-100 h-75";

    let title = document.createElement('p');
    title.textContent = data.title;
    title.className = 'text-dark text-break fw-bold fst-italic'
    
    let buttonsDiv = document.createElement("div");
    buttonsDiv.className = "w-100 h-100 text-center"

    let deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-dark fw-bold m-1 shadow";
    deleteBtn.id = "delete-btn";
    deleteBtn.onclick = dlt;
    let deletedIcon = document.createElement("i");
    deletedIcon.className = "far fa-trash-alt";
    let deletedText = document.createElement("span");
    deletedText.textContent = " Delete";
    deleteBtn.appendChild(deletedIcon);
    deleteBtn.appendChild(deletedText);

    let downloandBtn = document.createElement("button");
    downloandBtn.className = "btn btn-dark fw-bold m-1 shadow";
    downloandBtn.id = "download-btn";
    downloandBtn.onclick = FBdlMp4;
    let dowloadIcon = document.createElement("i");
    dowloadIcon.className = "fas fa-download";
    let dowlaodText = document.createElement("span");
    dowlaodText.textContent = " Download";
    downloandBtn.appendChild(dowloadIcon);
    downloandBtn.appendChild(dowlaodText);

    buttonsDiv.appendChild(deleteBtn);
    buttonsDiv.appendChild(downloandBtn);
    row.appendChild(title);
    row.appendChild(buttonsDiv);
    videoDetailsDiv.appendChild(row);
    } 
});

// video data delete function
function dlt() {
    videoDetailsDiv.textContent = "";
    urlInput.readOnly = false;
    convertBtn.disabled = false;
}

// youtube video download 
function YTdlMp4() {
    let btnMp4 = document.querySelector("#download-mp4-btn");
    let btnMp3 = document.querySelector("#download-mp3-btn");
    let dltBtn = document.querySelector("#delete-btn");
    btnMp4.textContent = " ";
    let loading = document.createElement("span");
    loading.className = "spinner-border spinner-border-sm";
    loading.setAttribute("role", "status");
    loading.setAttribute("aria-hidden", "true");
    btnMp4.appendChild(loading);
    btnMp4.disabled = true;
    btnMp3.disabled = true;
    dltBtn.disabled = true;
    urlInput.readOnly = true;
    convertBtn.disabled = true;

    ipcRenderer.send("youtube-video:download-mp4", videoData);
}

// facebook viode download
function FBdlMp4() {
    let btnMp4 = document.querySelector("#download-btn");
    let dltBtn = document.querySelector("#delete-btn");
    btnMp4.textContent = " ";
    let loading = document.createElement("span");
    loading.className = "spinner-border spinner-border-sm";
    loading.setAttribute("role", "status");
    loading.setAttribute("aria-hidden", "true");
    btnMp4.appendChild(loading);
    btnMp4.disabled = true;
    dltBtn.disabled = true;
    urlInput.readOnly = true;
    convertBtn.disabled = true;

    ipcRenderer.send("facebook:download-mp4", videoData);
} 

// youtube sound download
function YTdlMp3() {
    let btnMp4 = document.querySelector("#download-mp4-btn");
    let btnMp3 = document.querySelector("#download-mp3-btn");
    let dltBtn = document.querySelector("#delete-btn");

    btnMp3.textContent = "";
    let loading = document.createElement("span");
    loading.className = "spinner-border spinner-border-sm";
    loading.setAttribute("role", "status");
    loading.setAttribute("aria-hidden", "true");
    btnMp3.appendChild(loading);
    btnMp3.disabled = true;
    btnMp4.disabled = true;
    dltBtn.disabled = true;
    urlInput.readOnly = true;
    convertBtn.disabled = true;

    ipcRenderer.send("youtube-video:download-mp3", videoData);
}


// youtube download finish
ipcRenderer.on("YTdowload:finish", (err, data) => {
    if (data) {
        let btnMp4 = document.querySelector("#download-mp4-btn");
        let btnMp3 = document.querySelector("#download-mp3-btn");
        let dltBtn = document.querySelector("#delete-btn");
        btnMp4.disabled = false;
        btnMp3.disabled = false;
        dltBtn.disabled = false;

        urlInput.readOnly = false;
        convertBtn.disabled = false;

        btnMp4.textContent = " ";
        btnMp3.textContent = " ";
        let dowloadIcon1 = document.createElement("i");
        dowloadIcon1.className = "fas fa-download";
        let dowlaodText1 = document.createElement("span");
        dowlaodText1.textContent = " Mp3";
        btnMp3.appendChild(dowloadIcon1)
        btnMp3.appendChild(dowlaodText1)

        let dowloadIcon2 = document.createElement("i");
        dowloadIcon2.className = "fas fa-download";
        let dowlaodText2 = document.createElement("span");
        dowlaodText2.textContent = " Mp4";
        btnMp4.appendChild(dowloadIcon2)
        btnMp4.appendChild(dowlaodText2)



    } else {

    }
})

// facebook download finish 
ipcRenderer.on("FBdowload:finish", (err, data) => {
    if (data) {
        let btnMp4 = document.querySelector("#download-btn");
        let dltBtn = document.querySelector("#delete-btn");
        btnMp4.disabled = false;
        dltBtn.disabled = false;

        urlInput.readOnly = false;
        convertBtn.disabled = false;

        btnMp4.textContent = " ";
        
        let dowloadIcon2 = document.createElement("i");
        dowloadIcon2.className = "fas fa-download";
        let dowlaodText2 = document.createElement("span");
        dowlaodText2.textContent = " Download";
        btnMp4.appendChild(dowloadIcon2)
        btnMp4.appendChild(dowlaodText2)

    } else {

    }
})