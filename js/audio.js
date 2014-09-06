function AudioObj() {
    var that = this;
    if(AudioObj.unique !== undefined) {
        return AudioObj.unique;
    }
    AudioObj.unique = this;
    this.audioList = [];
    this.currentIndex = 0;
    this.lastIndex = 0;
    this.init = function() {
        this.getPlayList();
        $("#play-pause").click(function(){
            that.start();    
        });
    };
    this.getPlayList = function() {
        //生成歌曲列表，并存放每首歌曲的信息
        $.getJSON("audio.json",function(data) {
            $(".playlist-box").append("<ol id='audio-playlist'></ol>");
            $.each(data, function(key, val){
                var $audioItem = $("<li>");
                var $title = $("<span>").addClass("title").attr("data-id",val.id).html(val.title);
                var $musician = $("<span>").addClass("audio-time").html(val.time);
                $audioItem.append($title);
                $audioItem.append($musician);
                $("#audio-playlist").append($audioItem);
                $audioItem.click(function(){
                    that.switchAudio(this);
                });
                that.audioList.push(val);
            });
            $("#audio-playlist li").first().addClass("hovered");
            $("#audio-title").html(that.audioList[0]["title"]);
            $("#audio-musician").html(that.audioList[0]["musician"]);
        });
    };
    this.switchAudio = function(target) {
         //切换歌曲
        var $audio = $(target),
            index = $audio.find(".title").attr("data-id")-1,
            title = that.audioList[index]["title"],
            musician = that.audioList[index]["musician"];
        $("#audio-title").html(title);
        $("#audio-musician").html(musician);
        that.lastIndex = that.currentIndex;
        that.currentIndex = index;
        $("#audio-playlist li").item(that.lastIndex).removeClass("hovered");
        $("#audio-playlist li").item(that.currentIndex).addClass("hovered");
    };
    this.start = function() {
        //播放当前歌曲
        $("#play-pause").css("background-position","48px 0");
        var $audio = $("<source>").attr("src", that.audioList[that.currentIndex]["src"]);
        $("#audio").append($audio);
        $("#audio").get(0).play();
    };
    this.next = function() {
        //播放下一首歌曲
    };
    this.prev = function() {
        //播放上一首歌曲
    };
    this.upVolume = function() {
        //增加音量
    };
    this.downVolume = function() {
        //减少音量
    };
    this.mute = function() {
        //静音
    };
}
$(document).ready(function() {
    var audio = new AudioObj();
    audio.init();
});