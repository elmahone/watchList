$(function () {
    'use strict';
    
    //Displays all the results gotten from the api call
    function displaySearchResults(results) {
        console.log(results);
        var searchArr = [];
        if (results.Response == "True") {
            $('#searchResults').empty();
            countPages(results.totalResults);
            $('#searchResults').append('<div id="totalResults"><h4>Total Results: ' + results.totalResults + '</h4></div>');
            searchArr = results.Search;
            for (var i = 0; i < searchArr.length; i++) {

                //hide error from previous search
                $('#error').hide();
                $('#searchResults').append('<div id="' + searchArr[i].imdbID + '" class="result"><h3>' + searchArr[i].Title + ' (' + searchArr[i].Year + ')</h3></div><hr>');
            }
            initListeners();
            $('#searchResults').show();
        }
        // displays error message if no results was found
        else {
            $('#searchResults').hide();
            $('#content').hide();
            $('#error').find('.message').text('No results');
            $('#error').show();
        }
    }
    
    // Counts and displays pagenumbers
    function countPages(totalResults) {
        var totalPages = Math.ceil(totalResults / 10);
        $('#searchResults').append('<div id="pages"></div>');
        if (totalPages <= 100) {
            for (var i = 1; i <= totalPages; i++) {
                $('#pages').append('<a id="' + i + '" class="pageNum"> ' + i + ' </a>');
            }
        } else {
            for (var o = 1; o <= 100; o++) {
                $('#pages').append('<a id="' + o + '" class="pageNum"> ' + o + ' </a>');
            }
            $('#pages').append('<p>Only 100 pages can be shown</p>');
        }
        initListeners();
    }

    //Displays data of a single result gotten from the api call
    function displayData(data) {
        if (data.Response == "True") {
            $('#error').hide();
            $('#searchResults').hide();
            $('#details').empty();
            $('#details').append('<a id="goBack">Go Back</a><h2><span class="title">' + data.Title + '</span>(<span class="year">' + data.Year + '</span>)</h2><h4>Plot</h4><p class="plot">' + data.Plot + '</p><p>IMDb rating: ' + data.imdbRating + ' <span class="imdb"></span></p><p>Rotten tomatoes rating: ' + data.tomatoRating + ' <span class="rotten"></span></p><h2><span class="glyphicon glyphicon-ok-circle" id="add"></span></h2>');

            //show content when data is received
            initListeners();
            $('.searchForm').hide();
            $('#details').show();

            // displays error message if no show/movie was found
        } else {
            $('#details').hide();
            $('#error').find('.message').text(data.Error);
            $('#error').show();
        }
    }

    // makes a search api call with title, type, year and page parameters
    function apiCallSearch(title, type, year, page) {
        var url = 'http://www.omdbapi.com/?s=' + title + '&y=' + year + '&type=' + type + '&tomatoes=true&plot=full&page=' + page;
        $.get(url, function (response) {
            displaySearchResults(response);
        });
    }
    // makes a search api call with id
    function apiCallDetails(id) {
        var url = 'http://www.omdbapi.com/?i=' + id + '&tomatoes=true&plot=full';
        $.get(url, function (response) {
            displayData(response);
        });
    }

    // initiates listeners when called
    function initListeners() {
        $('form').on('submit', function (event) {
            event.preventDefault();
            var page = 1;
            var title = $('form').find('#title').val();
            var type = $('form').find('select').val();
            var year = $('form').find('#year').val();
            apiCallSearch(title, type, year, page);
        });

        $('.result').on('click', function () {
            var id = $(this).attr("id");
            apiCallDetails(id);
        });

        $('.pageNum').on('click', function () {
            var page = $(this).attr("id");
            var title = $('form').find('#title').val();
            var type = $('form').find('select').val();
            var year = $('form').find('#year').val();
            apiCallSearch(title, type, year, page);
        });
        
        $('#goBack').on('click', function () {
            $('.searchForm').show();
            $('#details').hide();
            $('#searchResults').show();
        });
    }
    
    //Starts the app
    function start() {
        // hide content on load
        $('#content').hide();
        $('#error').hide();
        initListeners();
    }
    start();
});