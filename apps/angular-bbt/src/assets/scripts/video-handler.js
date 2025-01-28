var qml;
new QWebChannel(qt.webChannelTransport, function(channel) {
    qml = channel.objects.qml;
});

function playVideo(obj, path = "") {
    var videoSrc = $(obj).attr('id');
    if (videoSrc != "missing") {
        $.cookie('currentvideo', videoSrc);
        if (path === undefined)
            path = "category[1]";

        if (window.location.host == "127.0.0.1") {
            qml.qmlLog("src="+videoSrc+",content_id=0");
            qml.qmlPlay(videoSrc, "video", "description", 0);
        } else {
            window.open("PlayVideo.html?path=" + path);
        }
    }
}