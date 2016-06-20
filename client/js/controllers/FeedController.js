angular.module('ff.controllers').controller('FeedController', function($scope, Feed, Twitter, Instagram, $timeout, $q) {
  $scope.loading = true;

  // $scope.getTwitterData = function() {
  //   Twitter.getData().then(function(results) {
  //     $scope.twitterData = results.data;
  //   }, function(error) {
  //     console.error(error);
  //   })
  // };

  // $scope.getInstagramData = function() {
  //   Instagram.getData().then(function(results) {
  //     $scope.instagramData = results.data;
  //   }, function(error) {
  //     console.error(error);
  //   })
  // };

  // $scope.getTwitterData(); // Initial call
  // $scope.getInstagramData(); // Initial call
  // $scope.query = Feed.query;

  // console.log($scope.query);
  
  // Word.GET()
  //       .then( function( res ){
  //         $scope.allWords = res;
  //       })
  //       .catch(function( err ) {
  //         console.error(err);
  //       });

  $scope.$watch(function() {
    return Feed.getQuery();
  }, function(newQuery, oldQuery) {
    if (newQuery !== null) {
      $scope.query = newQuery;                                    // Grabs query
      Twitter.getData($scope.query)                               // Call Twitter API with query
        .then(function(results) {
          $scope.twitterData = results.data;                      // Stores the Twitter results array
        }, function(error) {
          console.error(error);
        })
        .then(function(){
          Instagram.getData($scope.query).then(function(results) {  // Call Instagram API with query
            $scope.instagramData = results.data.data;               // Stores the Instagram results array
          }, function(error) {
            console.error(error);
          })
          .then(function(){
            $scope.sort($scope.twitterData, $scope.instagramData);  // Invoke sort function with twitterData and instagramData
          })
        })
        .catch(function( err ) {
          console.error(err);
        });

      
    }
  }, true);
  
  // Sort function organizes the API responses from Twitter and Instagram into one final sorted array
  $scope.sort = function( twitter, instagram ) {
    
    var epochConverter = function(str){   // Designed to convert twitters original user.created_at string into epoch time
      var fullDate = str,
          day = str.substring(8,10),
          mon = str.substring(4,7),
          year = str.substring(26),
          hour = str.substring(11,13),
          min = str.substring(14,16),
          sec = str.substring(17,19);
      var mnths = { 
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
        console.log('epoch time: ', year, mnths[mon], day, hour, min, sec);
      return Date.UTC(year, mnths[mon], day, hour, min, sec);
    };
    
    instagram.forEach(function(val){    // Converts Instagram created_time to uniform dat with Twitter
      var time = val.created_time;
      val.source_network = 'instagram';
      val.created_at = parseInt(time) * 1000;
    });

    twitter.forEach(function(val){      // Converts Twitter created_at to epoch time to match Instagram
      var time = val.created_at;
      val.time_string = time;
      var offset = val.user.utc_offset;
      var epochTime = epochConverter(time);                  // Converts created_at string to an epoch time integer
      var correctedTime = epochTime;
      // console.log('correctedTime: ', correctedTime);
      var time2 = correctedTime.toString().substring(0,11);  // Makes the epoch time 10 digits like Instagram
      // console.log('time2: ', time2);
      val.source_network = 'twitter';                         // Adds a source_network property
      val.created_at = parseInt(correctedTime);                       // Turns epoch time to a string again after last line
      // console.log('-----------------------: ');
    });
    
    $scope.unsorted = [];             // Creates unsorted array
    
    instagram.forEach(function(val){
      $scope.unsorted.push(val);      // Pushes each post into the unsorted array
    });
    
    twitter.forEach(function(val){
      $scope.unsorted.push(val);      // Pushes each tweet into the unsorted array
    });
    
    $scope.reverseSort = _.sortBy($scope.unsorted, function(val){    // Creates a sorted array out of unsorted array
      return val.created_at;                                    // This new array is sorted by created_at property
    });
    
    $scope.sorted = $scope.reverseSort.reverse();
    
    console.log('after sort: ', $scope.sorted);
    
    $scope.sorted.forEach(function(val){
      console.log('TIME: ', val.created_at);
    });
  };

  $scope.refreshWidgets = function() {
    twttr.widgets.load();
    instgrm.Embeds.process();
  };

  var twitterWidget = Feed.getTwitterWidget();
  var instagramWidget = Feed.getInstagramWidget();

  $q.all([twitterWidget, instagramWidget]).then(function(results) {
    $timeout(function() {
      $scope.refreshWidgets();
      $scope.loading = false;
    }, 2500);
  });

  // $timeout(function() {
  //   console.log('calling widget: ');
  //   $.ajax({ url: 'http://platform.twitter.com/widgets.js', dataType: 'script', cache:true});
    
  //   $.ajax({ url: 'http://platform.instagram.com/en_US/embeds.js', dataType: 'script', cache:true});
  //   $scope.refreshWidgets();
  //   $scope.loading = false;
  // }, 2500);

  
});




