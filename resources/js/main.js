"use strict";
//global variable for contain playlists
let allPlaylists;
$(document).ready(function(){
   var visiblePlaylists;
    $.when( $.get(getPath("api/playlist")).then( function(data) {
        var data = ( data || {} );
        if(data.success === true && len(data.data) > 0){
            allPlaylists = data.data;
            $("#search-form").trigger("submit");
        }
    }));
    let search = function(){
        $('#main-container').html("");
        visiblePlaylists = [];
        for(var i = 0; i < len(allPlaylists); i++){
            if(allPlaylists[i].name.search($("#find-input").val()) > -1){
                visiblePlaylists.push(allPlaylists[i]);
                $('#main-container').append('<div class="column col-sm-3 col-xs-4"></div>');
                var x = len($('.column')) -1;
                $('.column')[x].innerHTML = '<figure><figcaption><div class="caption"></div></figcaption></figure>';
                $('.column figure')[x].innerHTML += '<div class="img-container"><img width="200" height="200"></div>';
                $('.column .img-container')[x].innerHTML += ('<button class="edit"><i class="fa fa-pencil"></i></button>');
                $('.column .img-container')[x].innerHTML += ('<button class="remove"><i class="fa fa-times"></i></button>');
                $('.column .img-container')[x].innerHTML += ('<button class="play"><i class="fa fa-play"></i></button>');
                $('.column .remove')[x].onclick = function(){
                    var playListPos = findParentPos(this, $("#main-container").children(), 3);
                    modal(2, "Are you sure?", visiblePlaylists, playListPos);
                }
                $('.column .edit')[x].onclick = function(){
                    var playListPos = findParentPos(this, $("#main-container").children(), 3);
                    modal(3, "Edit Playlist", visiblePlaylists, playListPos);
                }
                $('.column .play')[x].onclick = function(){
                    var playListPos = findParentPos(this, $("#main-container").children(), 3);
                    createPlayer(visiblePlaylists, playListPos);
                }
                $('#main-container figure .caption')[x].innerText = allPlaylists[i].name;
                var ln  = len(allPlaylists[i].name);
                
                var deg = ln * Math.PI + 1;
                $('#main-container figure .caption')[x].style.transform = "rotate(-" + deg + "deg)";
                $('figcaption')[x].className = "len" + ln;
                $('#main-container figure:last-child .caption').lettering();
                $('#main-container figure img')[x].alt = allPlaylists[i].name;
                $('#main-container figure img')[x].src = allPlaylists[i].image;
            }
        }
    }
    $("#search-form").submit(search, function(event){
        event.preventDefault();
        search.call();
    });
    $("#search-form input").on("input", search);
    $(".glyphicon-search").click(function(){
        $("#search-form").trigger("submit");
    });
    $(" nav a").click(function(event){
        event.preventDefault();
        modal(0, "Add new playlist", visiblePlaylists);
    });
});
