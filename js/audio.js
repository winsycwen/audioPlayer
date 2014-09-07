/**
*   @author: winsycwen
*   @create time: 2014/09/06
*   @音乐播放器，支持上一曲、下一曲、暂停、播放、静音、调音量
*/
function AudioObj() {
    //返回单例
    "use strict";
    var that = this;
    if (AudioObj.unique !== undefined) {
        return AudioObj.unique;
    }
    AudioObj.unique = this;
    this.audio = $("#audio").get(0);
    this.audioList = [];
    this.currentIndex = 0;
    this.lastIndex = 0;
    this.curretnTime = "";
    this.status = false;  //暂停："paused";未开始："unstart";已开始: "started"

    function getPlayList() {
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
                $audioItem.click(function (e) {
                        that.lastIndex = that.currentIndex;
                        that.currentIndex = $(e.target).find(".title").attr("data-id")-1;
                        that.switchAudio(this);
                });
                //把每个歌曲对象存进audioList数组
                that.audioList.push(val);
            });
            var $audio = $("<source>").attr("src", that.audioList[that.currentIndex]["src"]);
            $("#audio").append($audio);
            $("#audio-playlist li").first().addClass("hovered");
            $("#audio-title").html(that.audioList[that.currentIndex]["title"]);
            $("#audio-musician").html(that.audioList[that.currentIndex]["musician"]);
        });
    }
    
    this.init = function() {
        getPlayList();
        $("#play-pause").click(function(){
            if(that.status) {
                that.pause();
            } else {
                that.play();
            }    
        });
        $("#prev").click(function() {
            that.prev();
        });
        $("#next").click(function() {
            that.next();
        });
    };
    this.switchAudio = function(target) {
         //改变歌曲列表的样式
        var index = $(target).find(".title").attr("data-id")-1,
            title = that.audioList[index]["title"],
            musician = that.audioList[index]["musician"];
        $("#audio-title").html(title);
        $("#audio-musician").html(musician);
        console.log(that.lastIndex, that.currentIndex);
        $("#audio-playlist li").eq(that.lastIndex).removeClass("hovered");
        $("#audio-playlist li").eq(that.currentIndex).addClass("hovered");
        
        //更换歌曲的目录以及歌曲信息部分的样式
        $("#audio").empty();
        var $audio = $("<source>").attr("src", that.audioList[that.currentIndex]["src"]);
        $("#audio").append($audio);
        if(that.status) {
            //如果歌曲正在播放，则换歌
            that.play();
        }
    };
    this.play = function() {
        $("#play-pause").css("background-position","48px 0");
        $("#play-pause").attr("title","暂停");
        this.audio.play();
        this.status= true;
    };
    this.pause = function() {
        that.status = false;
        this.audio.pause();
        $("#play-pause").css("background-position","0 0");
        $("#play-pause").attr("title","播放");
    };
    this.next = function() {
        //播放下一首歌曲
        var len = that.audioList.length;
        that.lastIndex = that.currentIndex;
        that.currentIndex = that.currentIndex + 1;
        if(that.currentIndex === len) {
            that.currentIndex = 0;
        }
        that.switchAudio($("#audio-playlist li").eq(that.currentIndex).get(0));
    };
    this.prev = function() {
        //播放上一首歌曲
        var len = that.audioList.length;
        that.lastIndex = that.currentIndex;
        that.currentIndex = that.currentIndex - 1;
        if(that.currentIndex < 0) {
            that.currentIndex = len-1;
        }
        that.switchAudio($("#audio-playlist li").eq(that.currentIndex).get(0));
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