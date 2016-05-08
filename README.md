###Click [here](http://watchlist-miikanode.rhcloud.com/index.html) to see my Watchlist site

##INTRODUCTION
Watchlist is an application using the [OMDB](http://www.omdbapi.com/) & [TMDB](https://www.themoviedb.org/documentation/api) API's.
Watchlist is built on node.js and mongoDB and is running on openshift

##INSTRUCTIONS
####USING THE APP
Watchlist is fairly simple to use. You can search for movies and series (and games but its not meant for that). Responses come from the [OMDB API](http://www.omdbapi.com/) API and the posters are from [TMDB](https://www.themoviedb.org/documentation/api).

You need to sign up and login to the site to use some features.

Top searches are listed on the right side of the page and if user is logged in that users personal recent searches are on the left side.

When you search for something you can limit the results to movies or series and you can search by the release year if you want.

After you find the movie/series you were looking for, click the result and a details view will load. In the details view there is information of the movie/series and the poster. If you are logged in you can add the movie/series to your personal watchlist.

Click the watchlist link from the nav bar and you can see your personal watchlist. In the watchlist view you can look at your movies/series and remove them from the list.


####INSTALL

#####Before cloning make sure you have created a node.js and mongoDB project in openshift


```
$ git clone https://github.com/elmahone/watchList [YOUR APP]
$ cd [YOUR APP]
$ npm install
$ git push (to openshift)

```

####API

Examples

#####Get all searches:
> [/getSearches](http://watchlist-miikanode.rhcloud.com/getSearches)

#####Get users recent searches:
> [/getRecentSearches?username=[username]](http://watchlist-miikanode.rhcloud.com/getRecentSearches?username=test)

#####Get users Watchlist:
> [/getMyList?username=[username]](http://watchlist-miikanode.rhcloud.com/getMyList?username=test)


##Licence
####MIT LICENCE (MIT)

Copyright (c) 2016 Miika Ahonen

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
