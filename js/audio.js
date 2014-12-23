/**
*   @author: winsycwen
*   @create time: 2014/09/06
*   @音乐播放器，支持播放，暂停，切换下一曲、上一曲，可以单曲循环、列表循环、顺序播放
*/
function AudioObj() {
    "use strict";
    var that = this;
    if (AudioObj.unique !== undefined) {
        return AudioObj.unique;
    }
    AudioObj.unique = this;
    var mode = [{id: 1, title: "顺序播放"}, {id: 2, title: "列表循环"}, {id: 3, title: "单曲循环"}],
        time = null;
    this.audio = $("#audio").get(0);
    this.audioList = [];
    this.currentIndex = 0;
    this.currentMode = 1;
    this.currentVolume = 1;
    this.lastIndex = 0;
    this.status = false;  //暂停："paused";未开始："unstart";已开始: "started"

    function getPlayList(callback) {
        //读取JSON文件，生成歌曲列表，并存放每首歌曲的信息进audioList数组
        $.getJSON("audio.json", function (data) {
            $(".playlist-box").append("<ol id='audio-playlist'></ol>");
            $.each(data, function (key, val) {
                //生成歌曲列表
                var $audioItem = $("<li>");
                var $title = $("<span>").addClass("title").attr("data-id", val.id).html(val.title);
                var $musician = $("<span>").addClass("audio-time").html(val.time);
                $audioItem.append($title);
                $audioItem.append($musician);
                $("#audio-playlist").append($audioItem);
                //把每个歌曲对象存进audioList数组
                that.audioList.push(val);
            });
            //修改source标签的src属性，加载音乐
//            var $audio = $("<source>").attr("src", that.audioList[that.currentIndex]["src"]);
//            $("#audio").append($audio);
            $("#audio").attr("src", that.audioList[that.currentIndex]["src"]);
            $("#audio-playlist li").first().addClass("hovered");
            $("#audio-title").html(that.audioList[that.currentIndex]["title"]);
            $("#audio-musician").html(that.audioList[that.currentIndex]["musician"]);
            if(callback && typeof(callback) === "function") {
                callback();
            }
        });
    }
    
    this.init = function() {
        getPlayList(playSystem);
    };
    function playSystem() {
        //绑定监听事件
        var $playlist = $("#audio-playlist");
        $playlist.click(function (e) {
            that.lastIndex = that.currentIndex;
            if($(e.target).is("li")) {
                that.currentIndex = $(e.target).find(".title").attr("data-id")-1;
            }
            if($(e.target).is("span.title")) {
                that.currentIndex = $(e.target).attr("data-id")-1;
            }
            if($(e.target).is("span.audio-time")) {
                that.currentIndex = $(e.target).parent().find(".title").attr("data-id")-1;
            }
            switchAudio(this);
        });
        //播放/暂停事件，如果status为true，则表示当前歌曲正在播放，那么暂停当前歌曲；否则，播放当前歌曲。
        $("#play-pause").click(function(){
            if(that.status) {
                that.pause();
            } else {
                that.play();
            }    
        });
        //切换到歌曲列表中的上一首
        $("#prev").click(function() {
            that.prev();
        });
        //切换到歌曲列表中的下一首
        $("#audio").bind("ended","audio",function(){
            switch(that.currentMode) {
                //1代表顺序播放，2代表列表循环，3代表单曲循环
                case 1: 
                    //歌曲已播放到列表最后一首，则修改status状态，停止播放歌曲；否则继续顺序播放列表中剩余的歌曲
                    if(that.currentIndex === that.audioList.length-1) {
                        that.status = false;
                        changeCssStyle("stop");
                    } else {
                        that.next();
                    }
                    break;
                case 2: 
                    //歌曲已经播放到列表中最后一首，则修改歌曲下标，准备播放列表中的第一首；否则继续播放列表中的歌曲
                    if(that.currentIndex === that.audioList.length-1) {
                        that.currentIndex = -1;
                    } 
                    that.next();
                    break;
                case 3: 
                    //循环播放当前歌曲
                    that.play();
                    break;
                default: alert("出错啦~");
            }
        },false);
        $("#next").click(function() {
            that.next();
        });
        //播放模式切换
        $("#loop-control").click(function(e) {
            changeCssStyle("mode", e.target);
        });
        //音量控制
        $(".volume-control").click(function(e){
            if($(e.target).is("div")) {
                that.audio.muted = !that.audio.muted;
                changeCssStyle("mute");
                drawBar($("#volume-bar").get(0), "mute");
            }
        });
        $(".volume-control").mouseover(function(e){
            if($("#bar").css("display") === "none") {
                $("#bar").fadeIn().css("display","block");
                clearTimeout(time);
            }
        });
        $(".volume-control").mouseleave(function(e){       
            time = setTimeout(function(){
                $("#bar").fadeOut();
            },800);
        });
        $("#volume-bar").mousedown(function(e){
            if(e.button === 0) {
                //按下左键鼠标
                drawBar(e.target, "count", e.clientY);
                $(this).bind("mousemove",function(e){
                    if(e.button === 0) {
                        drawBar(e.target, "count", e.clientY);
                    }
                });
                $(this).mouseup(function(){
                    $(this).unbind("mousemove");
                });
            }
        });
        $("#volume-bar").mouseleave(function(){
            $(this).unbind("mousemove");
        });
    }
    function drawBar(obj, flag, currentY) {
        var canvas = obj,
            context = canvas.getContext("2d"),
            height = obj.height,
            width = obj.width,
            volumeReduced = 0;
        if(flag === "mute") {
            if(that.audio.muted) {
                //已静音
                volumeReduced = height;
            } else {
                volumeReduced = (1-that.currentVolume) * height;
            }
        } else if(typeof currentY === "number") {
            if(that.audio.muted) {
                that.audio.muted = !that.audio.muted;
                changeCssStyle("mute");
            }
            volumeReduced = currentY - $("#volume-bar").offset().top;
            that.currentVolume = (1-volumeReduced/height).toFixed(2);
            that.audio.volume = that.currentVolume;
            if(volumeReduced === height - 1) {
                volumeReduced = height;
                that.audio.muted = !that.audio.muted;
                changeCssStyle("mute");
            }
        } else {
            console.log("Volume Error!");
        }
        context.save();
        context.fillStyle = "#222";
        context.fillRect(0, 0, width, volumeReduced);
        context.restore();
        context.save();
        context.fillStyle = "rgb(250, 183, 41);";//橙色
        context.fillRect(0, volumeReduced, width, height - volumeReduced);
        context.restore();
    }
    function changeCssStyle(flag, obj) {
        switch(flag) {
            case "stop": 
                $("#play-pause").css("background-position","0 0");
                $("#play-pause").attr("title","播放");
                break;
            case "play":
                $("#play-pause").css("background-position","100% 0");
                $("#play-pause").attr("title","暂停");
                break;
            case "pause":
                $("#play-pause").css("background-position","0 0");
                $("#play-pause").attr("title","播放");
                break;
            case "next":
            case "prev":
                switchAudio(obj);
                break;
            case "mode":
                changeMode(obj);
                break;
            case "mute":
                if(that.audio.muted) {
                    $(".volume-control").css("background-position", "100% 0");
                } else {
                    $(".volume-control").css("background-position", "0 0");
                }
                break;
            default: console.log("Fail to change css style!");
        }
    }
    function changeMode(obj) {
        var index = $(obj).attr("data-loop-id");
        index ++;
        if(index === mode.length+1) {
            index = 1;
        } 
        that.currentMode = index;
        $(obj).attr({
            "data-loop-id": index,
            "title": mode[index-1]["title"]
        });
        switch(index){
            case 1: 
                $(obj).css("background-position", "0 0");
                break;
            case 2: 
                $(obj).css("background-position", "50% 0");
                break;
            case 3: 
                $(obj).css("background-position", "100% 0");
                break;
            default:
                console.log("error");
                break;
        }
    }
    function switchAudio(target) {
         //改变歌曲列表的样式
        var index = $(target).find(".title").attr("data-id")-1,
            title = that.audioList[index]["title"],
            musician = that.audioList[index]["musician"];
        $("#audio-title").html(title);
        $("#audio-musician").html(musician);
        $("#audio-playlist li").eq(that.lastIndex).removeClass("hovered");
        $("#audio-playlist li").eq(that.currentIndex).addClass("hovered");
        
        //更换歌曲的目录以及歌曲信息部分的样式
//        $("#audio").empty();
//        var $audio = $("<source>").attr("src", that.audioList[that.currentIndex]["src"]);
//        $("#audio").append($audio);

        $("#audio").attr("src", that.audioList[that.currentIndex]["src"]);
    }
    this.play = function() {
        that.status= true;
        that.audio.play();
        changeCssStyle("play");
    };
    this.pause = function() {
        that.status = false;
        that.audio.pause();
        changeCssStyle("pause");
    };
    this.next = function() {
        //播放下一首歌曲
        var len = that.audioList.length;
        that.lastIndex = that.currentIndex;
        that.currentIndex = that.currentIndex + 1;
        if(that.currentIndex === len) {
            that.currentIndex = 0;
        }
        changeCssStyle("next", $("#audio-playlist li").eq(that.currentIndex).get(0));
        if(that.status) {
            //如果歌曲正在播放，则换歌
            that.play();
        }
    };
    this.prev = function() {
        //播放上一首歌曲
        var len = that.audioList.length;
        that.lastIndex = that.currentIndex;
        that.currentIndex = that.currentIndex - 1;
        if(that.currentIndex < 0) {
            that.currentIndex = len-1;
        }
        changeCssStyle("prev", $("#audio-playlist li").eq(that.currentIndex).get(0));
        if(that.status) {
            //如果歌曲正在播放，则换歌
            that.play();
        }
    };
    this.controlVolume = function(flag, current, total) {
        //控制音量
        that.audio.volume = current/total;
        if(flag === "draw" && that.audio.volume !==0) {
            that.currentVolume = that.audio.volume;
        }
        that.audio.muted = that.audio.volume === 0 ? true : false;
        changeCssStyle("mute");
    };
}
$(document).ready(function() {
    var audio = new AudioObj();
    audio.init();
});
