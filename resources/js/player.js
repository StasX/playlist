"use strict";
function createPlayer(playlists, pos){
    if($("#player").length === 0){ //dont create player if it already exists
    $("#main-container").append('<div id="player-bg"><div id="player" class="col-sm-6 col-xs-8 col-sm-offset-3 col-xs-offset-2"></div></div>');
    var id = playlists[pos].id;
    var songslist;
        function getSongs(){
            $.when($.get(getPath("playlist/" + id + "/songs"))).then(function(data){ 
                if(data.success){
                    songslist = data.data.songs;
                    for(var i = 0; i < len(songslist); i++){
                        $("ol").append('<li><span class="fa fa-play"></span>'+ songslist[i].name + '</li>');
                    }
                    addPlayerFunctionality(songslist);
                }
            });
        }
        $.when($.get(getPath("player/player.html"))).then(function(data){
            $("#player").html(data);
            $("#player img").attr("src", playlists[pos].image);
            $("title").text(playlists[pos].name);
            getSongs();
        });    
            function addPlayerFunctionality(songs){
                var spos = 0; //curent song position
                if(songslist.length > 0){
                $("audio").on("pause",function(){
                    $("#play-pause i").attr("class","fa fa-play");
                });
                $("audio").on("play",function(){
                    $("li span").click(function(event){
                        event.preventDefault();
                    });
                    $("li")[spos].style.opacity = "1";
                    $("h4").text("Now plaing: " + songslist[spos].name);
                    $("title").text($("title").text() + " [ " +  songslist[spos].name + " ]");
                    $("#play-pause i").attr("class","fa fa-pause");
                        $("li span").click(function(){
                            $("li")[spos].removeAttribute("style");
                            spos = findParentPos(this,$("ol").children(),1);
                            $("audio").attr("src", songslist[spos].url);
                            $.when($("audio").trigger("pause")).then($("audio").trigger("play"));
                        });
                });
                $("audio").attr("src", songslist[spos].url);
                $("audio").on("play", function(){
                    $("#player img").attr("class","rotation");
                });
                $("audio").on("ended", function(){
                    if(songslist.length-1 > spos){
                        $("li")[spos].removeAttribute("style");
                        spos++;
                    }
                    $("audio").attr("src", songslist[spos].url);
                    $("audio").trigger("play");
                });
                $("audio").on("pause", function(){
                    $("#player img").removeClass("rotation");
                });
                $("audio").trigger("play");
                }
                $("#play-pause").click(function(){
                    $("audio")[0].paused ? $("audio").trigger("play") : $("audio").trigger("pause");
                    
                });
                $("#remove-songs").click(id,function(){
                    if($("#modal").length < 1) {
                        createModal("Are you sure?");
                    }
                });
                if($("#modal").length < 1) {
                    $("#edit-songs").click(function(){
                        createModal("Edit songs");
                        $("#modal>div").html('<form id="edit-songs-form" class="container col-sm-12 col-xs-12"></form>');
                        
                        for ( var i = 0; i < len(songslist); i++){
                            // it's bad practice
                        $("#edit-songs-form")[0].innerHTML += '<div class="row" style="margin:5px;"><div class="col-sm-7"><div class="input-group"><label  class = "input-group-addon" for= "song-url'+ i +
                        '">Song URL:</label><input type="text" spellcheck="false" autocomplete="off" placeholder = "Song URL" class="form-control song-url" id="song-url'+ i +
                        '"/></div></div><div class = "col-sm-5"><div class = "input-group name"><label for="name' + i + '" class = "input-group-addon">Name:</label>' +
                        '<input type = "text" class="name" id="name' + i + '" spellcheck="false" autocomplete="off" placeholder = "Name"  class = "form-control" /></div></div></div>';
                        $(".song-url")[i].value = songslist[i].url;
                        $(".name")[i].value = songslist[i].name;
                        }   
                });
            }
        } 

    }

}
