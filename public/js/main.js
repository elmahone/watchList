$(function () {
    'use strict';
    var currentUser = null;
    // Displays all the results gotten from the api call
    function displaySearchResults(results) {
        var searchArr = [];
        if (results.Response === "True") {
            $('#searchResults').empty();

            $('#searchResults').append('<div id="totalResults"><h4>Total Results: ' + results.totalResults + '</h4></div>');
            searchArr = results.Search;
            for (var i = 0; i < searchArr.length; i++) {
                //hide error from previous search
                $('#error').hide();
                $('#searchResults').append('<div id="' + searchArr[i].imdbID + '" class="result"><h3>' + searchArr[i].Title + ' (' + searchArr[i].Year + ')</h3></div><hr>');
                if (searchArr[i].Type == "movie") {
                    $('#' + searchArr[i].imdbID).append('<h3 class="icon no-mobile"><i class="fa fa-film"></i></h3>');
                } else if (searchArr[i].Type == "series") {
                    $('#' + searchArr[i].imdbID).append('<h3 class="icon no-mobile"><i class="fa fa-television"></i></h3>');
                } else if (searchArr[i].Type == "game") {
                    $('#' + searchArr[i].imdbID).append('<h3 class="icon no-mobile"><i class="fa fa-gamepad"></i></h3>');
                }
            }
            countPages(results.totalResults);
            $('.waiting').hide();
            $('#searchResults').show();
            resultListener();
            $('html, body').animate({
                scrollTop: $("#totalResults").offset().top
            }, 500);
        }
        // displays error message if no results was found
        else {
            $('#searchResults').hide();
            $('#error').find('.message').text('No results');
            $('.waiting').hide();
            $('#error').show();
        }
    }
    // Displays movie/series poster
    function displayPoster(data) {
        if ($('#resultType').attr('value') == "series") {
            $('#poster').append('<img class="poster" src="http://image.tmdb.org/t/p/w300' + data.tv_results[0].poster_path + '">');
        } else if ($('#resultType').attr('value') == "movie") {
            $('#poster').append('<img class="poster" src="http://image.tmdb.org/t/p/w300' + data.movie_results[0].poster_path + '">');
        }
    }
    // displays add or remove button depending if movie is in the list
    function addRemoveButton(idList) {
        var id = getUrlParameter('id');
        if (isLoggedIn()) {
            if ($.inArray(id, idList) !== -1) {
                $('#details').append('<h2><a id="' + id + '"><span class="glyphicon glyphicon-remove-circle removeFromList"></span></a></h2>');
            } else {
                $('#details').append('<h2><a id="addToList"><span class="glyphicon glyphicon-ok-circle"></span></a></h2>');
            }
            addRemoveListener();
        }
    }
    // Displays data of a single result gotten from the api call
    function displayData(data) {
        $('#details').empty();
        if (data.Response == "True") {
            apiGetPoster(data.imdbID);
            $('#details').append('<input type="hidden" id="resultImdbID" value="' + data.imdbID + '">');
            $('#details').append('<input type="hidden" id="resultTitle" value="' + data.Title + '">');
            $('#details').append('<input type="hidden" id="resultType" value="' + data.Type + '">');
            $('#details').append('<h2><span class="title">' + data.Title + '</span>(<span class="year">' + data.Year + '</span>)</h2><h4>Plot</h4><p class="plot">' + data.Plot + '</p><p>IMDb rating: ' + data.imdbRating + ' <span class="imdb"></span></p><p>Rotten tomatoes rating: ' + data.tomatoRating + ' <span class="rotten"></span></p>');
            // add / remove buttons
            myIdList();
            // show content when data is received
            $('.mylist-tabs').hide();
            $('.searchForm').hide();
            $('#details').show();
            $('#goBack').on('click', function () {
                history.back();
            });
        }
    }
    // Displays own list into tabs
    function displayMyList(data) {
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
                    $('#allTab').append('<div class="result" id="' + myList[i].id + '"><h3 class="icon no-mobile"><i class="fa fa-film"></i></h3><h3 class="listResult">' + myList[i].title + '</h3><span class="glyphicon glyphicon-remove-circle removeFromList"></span></div>');
                    $('#moviesTab').append('<div class="result" id="' + myList[i].id + '"><h3 class="icon no-mobile"><i class="fa fa-film"></i></h3><h3 class="listResult">' + myList[i].title + '</h3><span class="glyphicon glyphicon-remove-circle removeFromList"></span></div>');

                } else if (myList[i].type == "series") {
                    $('#allTab').append('<div class="result" id="' + myList[i].id + '"><h3 class="icon no-mobile"><i class="fa fa-television"></i></h3><h3 class="listResult">' + myList[i].title + '</h3><span class="glyphicon glyphicon-remove-circle removeFromList"></span></div>');
                    $('#seriesTab').append('<div class="result" id="' + myList[i].id + '"><h3 class="icon no-mobile"><i class="fa fa-television"></i></h3><h3 class="listResult">' + myList[i].title + '</h3><span class="glyphicon glyphicon-remove-circle removeFromList"></span></div>');

                } else if (myList[i].type == "game") {
                    $('#allTab').append('<div class="result" id="' + myList[i].id + '"><h3 class="icon no-mobile"><i class="fa fa-gamepad"></i></h3><h3 class="listResult">' + myList[i].title + '</h3><span class="glyphicon glyphicon-remove-circle removeFromList"></span></div>');

                } else {
                    $('#allTab').append('<div class="result" id="' + myList[i].id + '"><h3 class="listResult">' + myList[i].title + '</h3><span class="glyphicon glyphicon-remove-circle removeFromList"></span></div>');
                }
            }
            addRemoveListener();
            resultListener();
        }
    }
    // Displays personal recent seaches
    function displayRecentSearches(data) {
        var recentSearches = recentSearchesList(data);
        $('#recentSearches').empty();
        $('#recentSearches').append('<h3>My Recent Searches</h3>');
        for (var i = 0; i < recentSearches.length; i++) {
            $('#recentSearches').append('<a id="' + recentSearches[i] + '" class="searchTitle">"' + recentSearches[i] + '"</a><hr>');
        }
        searchesListener();
    }
    // Displays top searches
    function displayTopSearches(data) {
        var topSearches = topSearchesList(data);
        $('#topSearches').empty();
        $('#topSearches').append('<h3>Top Searches</h3>');
        for (var i = 0; i < topSearches.length; i++) {
            $('#topSearches').append('<a id="' + topSearches[i].title + '" class="searchTitle">"' + topSearches[i].title + '"</a><span class="badge pull-right">' + topSearches[i].count + '</span><hr>');
        }
        searchesListener();
    }
    // creates a list of id's of items in watchlist
    function myIdList() {
        var url = 'http://watchlist-miikanode.rhcloud.com/getMyList?username=' + currentUser;
        var idList = [];
        $.get(url, function (response) {
            for (var i = 0; i < response.length; i++) {
                idList.push(response[i].id);
            }
            addRemoveButton(idList);

        });
    }
    // Counts and displays pagenumbers
    function countPages(totalResults) {
        var totalPages = Math.ceil(totalResults / 10);
        $('#searchResults').append('<div id="pages" class="text-center"></div>');
        if (totalPages > 1) {
            if (totalPages <= 100) {
                for (var i = 1; i <= totalPages; i++) {
                    $('#pages').append('<a id="' + i + '" class="pageNum"> ' + i + ' </a>');
                }
            } else {
                for (var o = 1; o <= 100; o++) {
                    $('#pages').append('<a id="' + o + '" class="pageNum"> ' + o + ' </a>');
                }
                $('#pages').append('<p>Only 100 pages can be shown try searching something more specific</p>');
            }
            changePageListener();
        }
    }
    // Creates a top 10 list of recent searches
    function recentSearchesList(data) {
        var allSearches = [];
        for (var i = 0; i < data.length; i++) {
            allSearches.push(data[i].title.toLowerCase());
        }
        var uniqueSearches = [];
        $.each(allSearches, function (o, title) {
            if ($.inArray(title, uniqueSearches) === -1) {

                uniqueSearches.push(title);
                if (uniqueSearches.length > 10) {
                    uniqueSearches.splice(-1, 1);
                }
            }
        });
        return uniqueSearches;
    }
    // defines the top searches and returns a top 10 list of searches
    function topSearchesList(data) {
        var allSearches = [];
        for (var i = 0; i < data.length; i++) {
            allSearches.push(data[i].title.toLowerCase());
        }
        allSearches.sort();
        var current = null;
        var count = 0;
        var topSearches = [];
        for (var o = 0; o <= allSearches.length; o++) {
            if (allSearches[o] != current) {
                if (count > 0) {
                    topSearches.push({
                        "title": current,
                        "count": count
                    });
                }
                current = allSearches[o];
                count = 1;
            } else {
                count++;
            }
        }
        topSearches.sort(function (a, b) {
            return parseFloat(b.count) - parseFloat(a.count);
        });
        // Turns top searches into a top 10 list
        if (topSearches.length > 10) {
            for (var n = topSearches.length; n > 10; n--) {
                topSearches.splice(-1, 1);
            }
        }
        return topSearches;
    }
    // logs user in
    function logIn(username) {
        if (!isLoggedIn()) {
            sessionStorage.username = username;
            currentUser = sessionStorage.username;
        }
    }
    // logs user out
    function logOut() {
        if (isLoggedIn()) {
            sessionStorage.removeItem('username');
            currentUser = null;
            location.reload();
        }
    }
    // checks if user is already logged in
    function isLoggedIn() {
        if (sessionStorage.getItem('username') === null) {
            return false;
        } else {
            return true;
        }

    }
    // function that gets parameter from url
    function getUrlParameter(sParam) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    }
    // Gets users recent searches from the database
    function getRecentSearches(username) {
        var url = 'http://watchlist-miikanode.rhcloud.com/getRecentSearches?username=' + username;
        $.get(url, function (response) {
            displayRecentSearches(response);
        });
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
        $.get(url, function (res) {
            if (res.response == "OK") {
                logIn(username);
                window.location = '../index.html';
            }
        });
    }
    // gets all searches from database
    function getAllSearches() {
        var url = 'http://watchlist-miikanode.rhcloud.com/getSearches';
        $.get(url, function (response) {
            displayTopSearches(response);
        });
    }
    // adds an item to users personal list
    function addToList(username, id, title, type) {
        var url = 'http://watchlist-miikanode.rhcloud.com/addToList?username=' + username + '&id=' + id + '&title=' + title + '&type=' + type;
        $.get(url);
    }
    // Sends username and password to the database
    function addUser(username, password) {
        var url = 'http://watchlist-miikanode.rhcloud.com/addUser?username=' + username + '&password=' + password;
        $.get(url);
        logIn(username);
        window.location = '../index.html';
    }
    // Sends the title user searched to database
    function saveSearchTitle(title) {
        var url = 'http://watchlist-miikanode.rhcloud.com/saveSearchTitle?title=' + title;
        $.get(url);
    }
    // Saves users recent searches to database
    function saveRecentSearch(username, title) {
        var url = 'http://watchlist-miikanode.rhcloud.com/saveRecentSearch?username=' + username + '&title=' + title;
        $.get(url);
    }
    // removes item from personal list with given id
    function removeFromList(username, id) {
        var url = 'http://watchlist-miikanode.rhcloud.com/removeFromList?username=' + username + '&id=' + id;
        $.get(url);
    }

    // API CALLS

    // makes a search api call with title, type, year and page parameters
    // and if successful search title is saved to database
    function apiCallSearch(title, type, year) {
        var url = 'http://www.omdbapi.com/?s=' + title + '&y=' + year + '&type=' + type + '&tomatoes=true&plot=full';
        $.get(url, function (response) {
            displaySearchResults(response);
            if (response.Response != "False") {
                saveSearchTitle(title);
                saveRecentSearch(currentUser, title);
            }
        });
    }
    // Makes a search call with only title as a parameter
    function apiCallSearchTitle(title) {
        var url = 'http://www.omdbapi.com/?s=' + title;
        $.get(url, function (response) {
            displaySearchResults(response);

        });
    }
    // makes an api call with given pagen umber
    function apiCallSearchPage(title, type, year, page) {
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
    // api call for posters with id
    function apiGetPoster(id) {
        var token = [YOUR TMDB API KEY]
        var url = 'https://api.themoviedb.org/3/find/' + id + '?api_key=' + token + '&external_source=imdb_id';
        $.get(url, function (response) {
            displayPoster(response);
        });
    }

    // LISTENER FUNCTIONS

    // Listener for form submits
    function formListeners() {
        $('.searchForm').on('submit', function (event) {
            event.preventDefault();
            var title = $('form').find('#title').val();
            var type = $('form').find('select').val();
            var year = $('form').find('#year').val();
            $('#error').hide();
            $('.waiting').show();
            apiCallSearch(title, type, year);
        });
        $('.signupForm').on('submit', function (event) {
            event.preventDefault();
            var username = $('form').find('#username').val();
            var password = $('form').find('#password').val();
            var cryptPwd = Aes.Ctr.encrypt('HelloWorld!', password, 256);
            addUser(username, cryptPwd);
        });
        $('.loginForm').on('submit', function (event) {
            event.preventDefault();
            var username = $('form').find('#username').val();
            var password = $('form').find('#password').val();
            var cryptPwd = Aes.Ctr.encrypt('HelloWorld!', password, 256);
            getUser(username, cryptPwd);
        });
    }
    // Listener for popular and recent searches
    function searchesListener() {
        $('.searchTitle').on('click', function (event) {
            event.preventDefault();
            var title = $(this).attr('id');
            $('form').find('#title').val(title);
            apiCallSearchTitle(title);
        });
    }
    // Listener for result clicks
    function resultListener() {
        $('.result').on('click', function () {
            var id = $(this).attr("id");
            window.location = '/details?id=' + id;
        });
    }
    // Listener for log out button
    function logoutListener() {
        $('#logout').on('click', function (event) {
            logOut();

        });
    }
    // Listener for page number clicks
    function changePageListener() {
        $('.pageNum').on('click', function () {
            var page = $(this).attr("id");
            var title = $('form').find('#title').val();
            var type = $('form').find('select').val();
            var year = $('form').find('#year').val();
            apiCallSearchPage(title, type, year, page);
        });
    }
    // Listener for add or remove item clicks
    function addRemoveListener() {
        $('#addToList').on('click', function () {
            var id = $('#resultImdbID').attr('value');
            var title = $('#resultTitle').attr('value');
            var type = $('#resultType').attr('value');
            addToList(currentUser, id, title, type);
            location.reload();
            $('#addToList').hide();
        });
        $('.removeFromList').on('click', function () {
            var id = $(this).parent().attr('id');
            removeFromList(currentUser, id);
            $('#allTab').find('#' + id).remove();
            $('#moviesTab').find('#' + id).remove();
            $('#seriesTab').find('#' + id).remove();

            if ($('#details').length > 0) {
                location.reload();
            }
        });
    }
    // Starts the app
    function start() {
        // hide content on load
        $('.waiting').hide();
        $('#content').hide();
        $('#error').hide();

        if ($('#topSearches').length > 0) {
            getAllSearches();
        }

        if ($('#details').length > 0) {
            var id = getUrlParameter('id');
            apiCallDetails(id);
        }

        // Features for logged in users
        if (isLoggedIn()) {
            currentUser = sessionStorage.username;
            $('#login').hide();
            $('#signup').hide();
            $('.navbar-right').append('<a type="submit" id="logout" class="btn btn-default" name="logout">Log out ' + currentUser + '</a>');
            logoutListener();
            // if a page has a class .mylist-tabs this calls a function 
            // to fill the tabs with own list
            if ($('.mylist-tabs').length > 0) {
                getMyList(currentUser);
            }

            if ($('#recentSearches').length > 0) {
                getRecentSearches(currentUser);
            }
        }
        if (isLoggedIn() === false) {
            $('#recentSearches').hide();
            $('#login').show();
            $('#signup').show();
            $('#logout').hide();

            $('#topSearches').removeClass('col-xs-6');
            $('#topSearches').addClass('col-xs-12');
            $('#searchResults').addClass('col-sm-offset-2');
            $('.searchForm').addClass('col-sm-offset-2');
        }
        formListeners();
    }
    start();
});
