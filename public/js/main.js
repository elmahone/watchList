$(function () {
    'use strict';

    // because authentication does not work currently everything goes to user in currentUser
    var currentUser = "miika";

    // Displays all the results gotten from the api call
    function displaySearchResults(results) {
        var searchArr = [];
        if (results.Response == "True") {
            $('#searchResults').empty();
            countPages(results.totalResults);
            $('#searchResults').append('<div id="totalResults"><h4>Total Results: ' + results.totalResults + '</h4></div>');
            searchArr = results.Search;
            for (var i = 0; i < searchArr.length; i++) {
                console.log(searchArr[i]);
                //hide error from previous search
                $('#error').hide();
                $('#searchResults').append('<div id="' + searchArr[i].imdbID + '" class="result"><h3>' + searchArr[i].Title + ' (' + searchArr[i].Year + ')</h3></div><hr>');
                if (searchArr[i].Type == "movie") {
                    $('#' + searchArr[i].imdbID).append('<h3 class="icon"><i class="fa fa-film"></i></h3>');
                } else if (searchArr[i].Type == "series") {
                    $('#' + searchArr[i].imdbID).append('<h3 class="icon"><i class="fa fa-television"></i></h3>');
                } else if (searchArr[i].Type == "game") {
                    $('#' + searchArr[i].imdbID).append('<h3 class="icon"><i class="fa fa-gamepad"></i></h3>');
                }
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
        if (totalPages > 1) {
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
        }
        initListeners();
    }

    // Displays data of a single result gotten from the api call
    function displayData(data) {
        console.log(data);

        if (data.Response == "True") {
            $('#error').hide();
            $('#searchResults').hide();
            $('#details').empty();
            $('#details').append('<input type="hidden" id="resultImdbID" value="' + data.imdbID + '">');
            $('#details').append('<input type="hidden" id="resultTitle" value="' + data.Title + '">');
            $('#details').append('<input type="hidden" id="resultType" value="' + data.Type + '">');
            $('#details').append('<a id="goBack">Go Back</a><h2><span class="title">' + data.Title + '</span>(<span class="year">' + data.Year + '</span>)</h2><h4>Plot</h4><p class="plot">' + data.Plot + '</p><p>IMDb rating: ' + data.imdbRating + ' <span class="imdb"></span></p><p>Rotten tomatoes rating: ' + data.tomatoRating + ' <span class="rotten"></span></p><h2><a id="addToList"><span class="glyphicon glyphicon-ok-circle"></span></a></h2>');

            // show content when data is received
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

    // Displays own list into tabs
    function displayMyList(data) {
        console.log(data);
        var myList = [];
        myList = data;
        if (myList.length > 0) {
            $('#allTab').empty();
            //this for loop empties the "nothing here" text from tabs
            for (var o = 0; o < myList.length; o++) {
                if (myList[o].type == "movie") {
                    $('#moviesTab').empty();
                } else if (myList[o].type == "series") {
                    $('#seriesTab').empty();
                }
            }
            // this loop fills tabs with movies from personal list
            for (var i = 0; i < myList.length; i++) {
                if (myList[i].type == "movie") {
                    $('#allTab').append('<div id="' + myList[i].id + '"><h3 class="icon"><i class="fa fa-film"></i></h3><h3 class="listResult">' + myList[i].title + '</h3><span class="glyphicon glyphicon-remove-circle removeFromList"></span></div>');
                    $('#moviesTab').append('<div id="' + myList[i].id + '"><h3 class="icon"><i class="fa fa-film"></i></h3><h3 class="listResult">' + myList[i].title + '</h3><span class="glyphicon glyphicon-remove-circle removeFromList"></span></div>');

                } else if (myList[i].type == "series") {
                    $('#allTab').append('<div id="' + myList[i].id + '"><h3 class="icon"><i class="fa fa-television"></i></h3><h3 class="listResult">' + myList[i].title + '</h3><span class="glyphicon glyphicon-remove-circle removeFromList"></span></div>');
                    $('#seriesTab').append('<div id="' + myList[i].id + '"><h3 class="icon"><i class="fa fa-television"></i></h3><h3 class="listResult">' + myList[i].title + '</h3><span class="glyphicon glyphicon-remove-circle removeFromList"></span></div>');

                } else if (myList[i].type == "game") {
                    $('#allTab').append('<div id="' + myList[i].id + '"><h3 class="icon"><i class="fa fa-gamepad"></i></h3><h3 class="listResult">' + myList[i].title + '</h3><span class="glyphicon glyphicon-remove-circle removeFromList"></span></div>');

                } else {
                    $('#allTab').append('<div id="' + myList[i].id + '"><h3 class="listResult">' + myList[i].title + '</h3><span class="glyphicon glyphicon-remove-circle removeFromList"></span></div>');
                }
            }
        }
        initListeners();
    }

    // api call for my list with username as a parameter
    function getMyList(username) {
        var url = 'http://watchlist-miikanode.rhcloud.com/getMyList?username=' + username;
        $.get(url, function (response) {
            displayMyList(response);
        });
    }

    // gets user info with username and password as parameters
    function getUser(username, password) {
        var url = 'http://watchlist-miikanode.rhcloud.com/getUser?username=' + username + '&password=' + password;
        $.get(url, function (response) {
            console.log(response.username);
            console.log(response);
            if (response.username == username) {
                window.location = '../index.html';
            }
        });
    }

    // adds an item to users personal list
    function addToList(username, id, title, type) {
        var url = 'http://watchlist-miikanode.rhcloud.com/addToList?username=' + username + '&id=' + id + '&title=' + title + '&type=' + type;
        $.get(url);
    }

    // Sends username and password to the database (NOT HASHED)
    function addUser(username, password) {
        var url = 'http://watchlist-miikanode.rhcloud.com/addUser?username=' + username + '&password=' + password;
        $.get(url);
        window.location = '../index.html';
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
        $('.searchForm').on('submit', function (event) {
            event.preventDefault();
            var page = 1;
            var title = $('form').find('#title').val();
            var type = $('form').find('select').val();
            var year = $('form').find('#year').val();
            apiCallSearch(title, type, year, page);
        });
        $('.signupForm').on('submit', function (event) {
            event.preventDefault();
            var username = $('form').find('#username').val();
            var password = $('form').find('#password').val();
            addUser(username, password);
        });
        $('.loginForm').on('submit', function (event) {
            event.preventDefault();
            var username = $('form').find('#username').val();
            var password = $('form').find('#password').val();
            getUser(username, password);
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
        $('#addToList').on('click', function () {
            var id = $('#resultImdbID').attr("value");
            var title = $('#resultTitle').attr("value");
            var type = $('#resultType').attr("value");
            console.log(id, title, type);
            addToList(currentUser, id, title, type);
        });
        $('.removeFromList').on('click', function() {
            console.log("HALLOOOO");
            var id = $(this).parent().attr('id');
            console.log($(this).parent());
            console.log(id);
        });
    }

    // if a page has a class .mylist-tabs this calls a function 
    // to fill the tabs with own list
    if ($('.mylist-tabs').length > 0) {
        getMyList(currentUser);
    }

    // Starts the app
    function start() {
        // hide content on load
        $('#content').hide();
        $('#error').hide();
        initListeners();
    }
    start();
});