const electron = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');
const ytdl = require('ytdl-core');
const https = require('https');
const { title } = require('process');
const {
    app,
    BrowserWindow,
    ipcMain,
    webContents
} = electron;


let MainWindow;

app.on("ready", () => {

    MainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        height: 600,
        width: 800,
        resizable: false,
    });
    MainWindow.setMenuBarVisibility(false);

    MainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, 'pages/index.html'),
            protocol: 'file',
            slashes: true
        })
    )

    ipcMain.on('facebook-video:send', (err, data) => {
        if (data.indexOf("https://www.facebook.com") > -1) {
            let videoUrl = data;
            let vinfo = require('fb-video-downloader').getInfo(videoUrl)
            setTimeout(() => {
                vinfo.then((info) => {
                    MainWindow.webContents.send('FBVideo:get', info);
                })
            }, 3000);
        }

    });

    ipcMain.on('youtube-video:send', (err, data) => {

        if (data.indexOf("https://www.youtube.com/watch?v=") > -1) {
            let videoUrl = data;
            let videoData = getYTVideoData(videoUrl)
                .then((data) => {
                    MainWindow.webContents.send('YTVideo:get', data);
                })
        }
    });

    ipcMain.on("youtube-video:download-mp4", (err, data) => {
        if (data) {
            YTdowloandVideo(data.url, data)
                .then((error) => {
                    console.log(error);
                })
        }
    });

    ipcMain.on("youtube-video:download-mp3", (err, data) => {
        if (data) {
            YTdowloandSound(data.url, data)
                .then((error) => {
                    console.log(error);
                })
        }
    });
    ipcMain.on("facebook:download-mp4", (err, data) => {
        if (data) {
            FBdowloandVideo(data)
                .then((error) => {
                    console.log(error);
                })
        }
    });

});



async function getYTVideoData(videourl) {
    if (videourl.indexOf("https://www.youtube.com/watch?v=") > -1) {
        let videoId = videourl.split("https://www.youtube.com/watch?v=");
        let info = await ytdl.getBasicInfo(`https://www.youtube.com/watch?v=${videoId[1]}`);
        let videoData = {
            title: info.videoDetails.title,
            image: info.videoDetails.thumbnails[3],
            author: info.videoDetails.author.name,
            views: info.videoDetails.viewCount,
            likes: info.videoDetails.likes,
            url: videourl,
            videoId: info.videoDetails.videoId
        }
        return videoData;
    } else {
        return false;
    }
}

async function YTdowloandVideo(videourl, videoİnfo) {
    if (videourl.indexOf("https://www.youtube.com/watch?v=") > -1) {
        const iTag = 18;
        let video_title = videoİnfo.title.split(' ').join('');
        let videoId = videourl.split("https://www.youtube.com/watch?v=");
        let info = await ytdl.getBasicInfo(`https://www.youtube.com/watch?v=${videoId[1]}`);
        let dirname = __dirname.split("\\");
        let location = `C:\\Users\\${dirname[2]}\\Videos\\${videoId[1]}.mp4`
        let video = ytdl(`https://www.youtube.com/watch?v=${videoId[1]}`, {
            filter: function (format) {
                return format.itag === iTag;
              },
        });
        let stream = video.pipe(fs.createWriteStream(location));
        stream.on('finish', function () {
            MainWindow.webContents.send('YTdowload:finish', true);
        });
    } else {
        return false;
    }
}


async function YTdowloandSound(videourl, videoİnfo) {
    if (videourl.indexOf("https://www.youtube.com/watch?v=") > -1) {
        let video_title = videoİnfo.title.split(' ').join('');
        let videoId = videourl.split("https://www.youtube.com/watch?v=");
        let info = await ytdl.getBasicInfo(`https://www.youtube.com/watch?v=${videoId[1]}`);
        let dirname = __dirname.split("\\");
        let location = `C:\\Users\\${dirname[2]}\\Music\\${videoId[1]}.mp3`
        let video = ytdl(`https://www.youtube.com/watch?v=${videoId[1]}`, {
            quality: 'highestaudio',
            filter: 'audioonly'
        });
        let stream = video.pipe(fs.createWriteStream(location));
        stream.on('finish', function () {
            MainWindow.webContents.send('YTdowload:finish', true);
        });
    } else {

    }
}


async function FBdowloandVideo(videoİnfo) {
    console.log(videoİnfo)
    let dirname = __dirname.split("\\");
    let location = `C:\\Users\\${dirname[2]}\\Videos\\facebook.mp4`
    const file = fs.createWriteStream(location);
    const request = https.get(videoİnfo.download.sd, function (response) {
        let stream = response.pipe(file);
        stream.on('finish', function () {
            MainWindow.webContents.send('FBdowload:finish', true);
        });
    });
}