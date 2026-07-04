"use strict";
function validateName(name) { 
    return ((name.length <= 60) && (name.length >0) && /^([\w\s_:?%'"&@,.-]|\(|\)|\[|\])+$/.test(name)); 
}

function validateImgUrl(url) {
    if(url){
        return ((url.length <= 1000)  && (url.length > 0) && /^(http(s?)\:\/\/)(([0-9a-z])*([.-]?([0-9a-z])*)*(\.)([a-z]){2}([a-z])*(\/))([/.%:@&\w_,'"-]|\(|\)|\[|\])*(\.(jpg|gif|png))$/.test(url)); 
    }   else{
        return false;
    }
}

function validateSongUrl(url) {
    return ((url.length <= 1000)  && (url.length > 0) && /^(http(s?)\:\/\/)(([0-9a-z])*([.-]?([0-9a-z])*)*(\.)([a-z]){2}([a-z])*)([/.%:@&\w_,'"-]|\(|\)|\[|\])*([%@&\w_,'"-]|\(|\)|\[|\])(\.mp3)$/.test(url)); 
}

function validateSongs() {
    var songs = $('#modal .songs');
    var names = $('#modal .names');
    var results = []; 

    for (var i = 0; i < names.length; i++ ) {
        var songNameValid = validateName(names[i].value);
        var songUrlValid = validateSongUrl(songs[i].value);
        if(!songUrlValid){
            $( ("label[for=song-url" + (i + 1) + "]") ).css({"background-color":"#9c0101", "border-color":"#9c0101"});
            $("#song-url" + (i + 1) ).css({"color":"red", "border-color":"#9c0101"});
        }  else{
            $( ("label[for=song-url" + (i + 1) + "]") ).removeAttr("style");
            $("#song-url" + (i + 1) ).removeAttr("style");
        }
        if(!songNameValid){
            $( ("label[for=name" + (i + 1) +"]") ).css({"background-color":"#9c0101", "border-color":"#9c0101"});
            $("#name" + (i+1) ).css({"color":"red", "border-color":"#9c0101"});
        }   else{
            $( ("label[for=name" + (i + 1) +"]") ).removeAttr("style");
            $("#name" + (i+1) ).removeAttr("style");
        }
        results.push(songUrlValid && songNameValid); 
    }
    return ! results.includes(false); 
}
function validateSongsAndSand(playlist) {
    function getPlaylistById(id){ 
        var url = getPath("api/playlist/" + id); 
        $.get(url, function(data) {
            if(data.success === true && data.data.length > 0){
                var data = data.data;
                $('#main-container').append('<div class="col-sm-3 col-xs-4"><figure><figcaption><div class="caption"></div></figcaption><img width="200" height="200"></figure></div>');
                var pos = data.id--;
                $('#main-container figure .caption')[pos].innerText = data.name;
                $('#main-container figure:last-child .caption').lettering();
                $('#main-container figure img')[pos].alt = data.name;
                $('#main-container figure img')[pos].src = data.image;
                
            }
        });
    }
    playlist.songs = []; 
    var results = []; 
    var songs = $('#modal .songs'); 
    var names = $('#modal .names')
    for (var i = 0; i < len(songs); i++ ) {
    results.push(validateSongUrl(songs[i].value) && validateName(names[i].value)); 
    playlist.songs.push( {"name":names[i].value, "url":songs[i].value}); 
    }
    if ( ! results.includes(false)) {
        var url = getPath("api/playlist"); 
        $.post(url, playlist).done(function(data){
            if(data.success){
                $('#modal').remove(); 
                getPlaylistById(data.id);
            }
        });
    }
}
function validateAndDisplayCover(){
    if(validateImgUrl($('#cover-url').val())){
        if($('#cover-url')){
            $('#cover-url').removeAttr("style");
        }
        $('#modal .borderer>img').css('display','block');
        $('#modal .borderer>img').attr("src", $('#cover-url').val());
        return true;
    }else{
        $('#modal .borderer>img').css('display','none');
        $('#modal .borderer>img').attr("src","");
        if($('#cover-url')){
            $('#cover-url').css({"color":"red","border":"red"});
        }
        return false;
    }
}