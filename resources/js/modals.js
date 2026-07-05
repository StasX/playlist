"use strict";
const $ = require("jquery");
const createModal = function(title){ 
$('body').append('<div id="modal">'); 
    $('#modal').append('<div class="col-sm-4 col-sm-offset-4"></div>'); 
    $('#modal>div').append('<h3></h3>'); 
    $('#modal h3').text(title); 
    $('#modal>div').append('<div class="container col-sm-12"></div>'); 
    $('#modal').click(function (event) {
        $('#modal').remove(); 
    }); 
    $('#modal div').click(function (event) {
        event.stopPropagation(); 
        event.preventDefault(); 
    }); 
}
exports.createModal = createModal;
const modal = function(type, title, playlists, pos) {
    //create modal
    createModal(title);
    /*$('body').append('<div id="modal">'); 
    $('#modal').append('<div class="col-sm-4 col-sm-offset-4"></div>'); 
    $('#modal>div').append('<h3></h3>'); 
    $('#modal h3').text(title); 
    $('#modal>div').append('<div class="container col-sm-12"></div>'); 
    $('#modal').click(function (event) {
        $('#modal').remove(); 
    }); 
    $('#modal div').click(function (event) {
        event.stopPropagation(); 
        event.preventDefault(); 
    });*/ 
    //define  variables
    var aPlaylist;
    // define input validation handlers
    var handler = function () {
        if (validateAndDisplayCover() && validateName($('#name').val())) {
            //if ($('#next')) {
                $('#next').removeAttr('disabled'); 
                $('#next').click(type, function () {
                    //var vars =  {}; //container for variables
                    aPlaylist =  {name:$("#name").val(), image:$("#cover-url").val()};  
                    $('#modal h3').text('Add playlist songs'); 
                    getModalContent(type, (getPath('/modals/playlist.songs.html'))); 
                });
        }else {
            $("#next").attr( {disabled:"disabled"}); 
        }
    }
    var updatePlaylistHandler = function() {
        if (validateAndDisplayCover() && validateName($('#name').val())) {
            $('#update').removeAttr('disabled'); 
            $('#update').click(type, function () {
                $.when($.post(getPath("playlist/" + playlists[pos].id),  {name:$("#name").val(), image:$("#cover-url").val()})).then(function (data) { 
                        //find playlist and update all playlist list
                            var i = 0;
                            for(var i=0; i < allPlaylists.length; i++)  {
                                if(allPlaylists[i].id === playlists[pos].id) {
                                    allPlaylists[i].name = $("#name").val();
                                    allPlaylists[i].image = $("#cover-url").val();
                                    break;
                                }
                            }
                        $("#modal").remove(); 
                        $("#search-form").trigger("submit"); 
                });
            }); 
        }else {
            $('#update').attr("disabled", "disabled"); 
        }
    }
    var songsHandler = function () {
        var btn = $("#update") ? $("#update") : $("#finish");
        if (validateSongs()) {
            
            len($("#update")) > 0 ? $("#update").removeAttr("disabled") : $("#finish").removeAttr("disabled") ;
        }else {
            len($("#update")) ? $("#update").attr("disabled", "disabled") : $("#finish").attr("disabled", "disabled");
        }
    }
    
    // initialize functionality:

    //get content of modal
        var url; 
        switch (type) {
            case 0: {
                url = getModalContent(type, getPath('/modals/playlist.html')); 
                break; 
            }case 1: {
                url = getModalContent(type, getPath('/modals/playlist.html')); 
                break; 
            }case 2: {
                url = getModalContent(type, getPath('/modals/question.html')); 
                break; 
            }case 3: {
                url = getModalContent(type, getPath('/modals/playlist.html')); 
                break; 
            }
        }
        function getModalContent(type, url) {
        $.when($.get(url)).then(function (data) {
            $('#modal .container').html(data); 
            addPlayListModalFunctionality(type); 
        }); 
    }
    // add modal's functionality
    function addPlayListModalFunctionality(x){
        switch(x){
            case 0 : {
                $('#playlist-form').submit(function (event) {
                event.preventDefault(); 
                });
                $('#playlist-form input[type=reset]').click(function () {
                    $('#playlist-form')[0].reset();
                    $('#next').attr('disabled', 'disabled');
                }); 
                $('input[type = text]').on('input', handler); 
            }   case 1 : {
                $("a").click(function (event) {
                    event.preventDefault();
                }); 
                $('#add-songs-row').click(function () {
                    $.when($.get(getPath('modals/new.song.html'))).then(function(data) {
                        $('#songs-form .container-fluid:first-child').append(data); 
                        var rowCount = len($('#songs-form .container-fluid:first-child .row'));
                        var songUrl = 'song-url' + rowCount; 
                        var name = 'name' + rowCount; 
                        $('#songs-form .container-fluid:first-child .row:last-child .col-sm-7 label').attr( 'for',songUrl); 
                        $('#songs-form .container-fluid:first-child .row:last-child .col-sm-7 input').attr( 'id',songUrl); 
                        $('#songs-form .container-fluid:first-child .row:last-child .col-sm-5 label').attr( 'for',name); 
                        $('#songs-form .container-fluid:first-child .row:last-child .col-sm-5 input').attr( 'id',name);
                        $('#songs-form .songs').on('input', songsHandler);
                        $('#songs-form .names').on('input', songsHandler);
                    }); 
                }); 
                $("form").submit(function (event) {
                    event.preventDefault(); 
                }); 
                $('#songs-form .songs').on('input', songsHandler);
                $('#songs-form .names').on('input', songsHandler);
                $("#finish").click(playlist, function() {
                    validateSongsAndSand(aPlaylist);
                });
                $('#songs-form .songs').on('input', songsHandler);
                $('#songs-form .names').on('input', songsHandler);
                break;
            }   case 2 : {
                var playlist = playlists[pos];
                var curentPlaylist = {playlist:playlist,pos:pos};
                $("#yes").click(curentPlaylist, function() {
                    var url = getPath("playlist/" + curentPlaylist.id); 
                    $.ajax({url:url, type:'DELETE'}).done(function(data){
                        if(data.success===true){
                            $("#modal").remove();
                            $("#main-container .column:nth-child(" + (pos + 1) + ")").remove();   
                        }
                    });
                });
                $("#no").click(function() {
                    $("#modal").remove();
                }); 
        }   case 3 : {
            $("#next").text("Update");
            $("#next").attr("id","update");
                var curentPlaylist = playlists[pos];
                $("#name").val(curentPlaylist.name);
                $("#cover-url").val(curentPlaylist.image);
                $(".borderer img").attr("src", curentPlaylist.image);
                $(".borderer img").attr("alt", curentPlaylist.name);
                $(".borderer img").css("display","block");
                $("#playlist-form input[type=reset]").click(function(){
                    $("#playlist-form")[0].reset();
                    $("update").attr("disabled","disabled");
                });
            $("#playlist-form input[type=text]").on("input", updatePlaylistHandler);
            break;
        }
    }    
    }
}
exports.modal = modal;
