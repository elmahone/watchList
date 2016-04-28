'use strict';

$(function () {
    function displaySearchResults(results) {
        var searchArr = results.Search;
        var container = $('<div></div>');
        var searchTitle = $('<h3></h3>');
        if (results.Response == "True") {
            for (var i = 0; i < searchArr.length; i++) {
                console.log(searchArr[i]);
                $('#error').hide();

                $('#searchResults').append('<div id="' + searchArr[i].imdbID + '" class="result" onclick="displayData()"><h3>' + searchArr[i].Title + ' (' + searchArr[i].Year + ')</h3></div><hr>');


            }
            // displays error message if no results was found
        } else {
            $('#searchResults').hide();
            $('#content').hide();
            $('#error').find('.message').text('No results');
            $('#error').show();
        }
    }


    function displayData(data) {
        if (data.Response == "True") {
            $('#error').hide();
            $('#content').find('.title').text(data.Title);
            $('#content').find('.plot').text(data.Plot);
            $('#content').find('.year').text(data.Year);
            $('#content').find('.imdb').text(data.imdbRating);
            $('#content').find('.rotten').text(data.tomatoRating);
            //show content when data is received
            $('#content').show();

            // displays error message if no show/movie was found
        } else {
            $('#content').hide();
            $('#error').find('.message').text(data.Error);
            $('#error').show();
        }
    }

    //makes an api call with given url    
    function apiCall(url) {
        $.get(url, function (response) {
            displaySearchResults(response);
        });
    }
    function changePage(){
        $('#back').on('click', function(event){
            event.preventDefault();
            
        });
        $('#forward').on('click', function(event){
            event.preventDefault();
            
        });
    }
    function initListeners() {
        $('form').on('submit', function (event) {
            event.preventDefault();
            const title = $('form').find('#title').val();
            const type = $('form').find('select').val();
            const year = $('form').find('#year').val();
            const url = 'http://www.omdbapi.com/?s=' + title + '&y=' + year + '&type=' + type + '&tomatoes=true&plot=full';
            apiCall(url);
        });
    }

    function start() {
        // hide content on load
        $('#content').hide();
        $('#error').hide();
        initListeners();
    }
    start();
});