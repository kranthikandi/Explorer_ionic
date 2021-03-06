angular.module('controllers', [])

.run(function($rootScope) {
    $rootScope.aToken = "token";
})

.controller('WelcomeCtrl', function($scope,$rootScope, $state, $q, UserService, $ionicLoading) {
facebookConnectPlugin.getLoginStatus(function(success){
  $scope.loginButton = "true";
  if(success.status === 'connected'){
    //alert("conn bef "+$scope.loginButton);
      $scope.loginButton = !$scope.loginButton;
      $state.go('app.home');
  }

  });



  //This is the success callback from the login method
  var fbLoginSuccess = function(response) {
    if (!response.authResponse){
      fbLoginError("Cannot find the authResponse");
      return;
    }

    $scope.authResponse = response.authResponse;
    
    getFacebookProfileInfo(authResponse)
    .then(function(profileInfo) {
      //for the purpose of this example I will store user data on local storage
      UserService.setUser({
        authResponse: authResponse,
				userID: profileInfo.id,
				name: profileInfo.name,
				email: profileInfo.email,
        picture : "http://graph.facebook.com/" + authResponse.userID + "/picture?type=small"
      });

      $ionicLoading.hide();
      $state.go('app.home');
    }, function(fail){
      //fail get profile info
      console.log('profile info fail', fail);
    });
  };


  //This is the fail callback from the login method
  var fbLoginError = function(error){
    console.log('fbLoginError', error);
    $ionicLoading.hide();
  };

  //this method is to get the user profile info from the facebook api
  var getFacebookProfileInfo = function (authResponse) {
    var info = $q.defer();

    facebookConnectPlugin.api('/me?fields=email,name&access_token=' + authResponse.accessToken, null,
      function (response) {
				//console.log(response);
        info.resolve(response);
      },
      function (response) {
				console.log(response);
        info.reject(response);
      }
    );
    return info.promise;
  };

  //This method is executed when the user press the "Login with facebook" button
  $scope.facebookSignIn = function() {

    facebookConnectPlugin.getLoginStatus(function(success){
     if(success.status === 'connected'){
        // the user is logged in and has authenticated your app, and response.authResponse supplies
        // the user's ID, a valid access token, a signed request, and the time the access token
        // and signed request each expire
        //console.log('getLoginStatus', success.status);

				//check if we have our user saved
				var user = UserService.getUser('facebook');

				if(!user.userID)
				{
					getFacebookProfileInfo(success.authResponse)
					.then(function(profileInfo) {

						//for the purpose of this example I will store user data on local storage
						UserService.setUser({
							authResponse: success.authResponse,
							userID: profileInfo.id,
							name: profileInfo.name,
							email: profileInfo.email,
							picture : "http://graph.facebook.com/" + success.authResponse.userID + "/picture?type=large"
						});

						$state.go('app.home');

					}, function(fail){
						//fail get profile info
						console.log('profile info fail', fail);
					});
				}else{
					$state.go('app.home');
				}

     } else {
        //if (success.status === 'not_authorized') the user is logged in to Facebook, but has not authenticated your app
        //else The person is not logged into Facebook, so we're not sure if they are logged into this app or not.
        console.log('getLoginStatus', success.status);

			  $ionicLoading.show({
          template: 'Logging in...'
        });

        //ask the permissions you need. You can learn more about FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.4
        facebookConnectPlugin.login(['email', 'public_profile'], fbLoginSuccess, fbLoginError);
      }
    });
  };
})



.controller('AppCtrl', function($scope){

})

.controller('DemoCtrl', function($scope, $ionicActionSheet, $ionicLoading,$state){
    $scope.showLogOutMenu = function() {
    var hideSheet = $ionicActionSheet.show({
      destructiveText: 'Logout',
      titleText: 'Are you sure you want to logout? This app is awsome so I recommend you to stay.',
      cancelText: 'Cancel',
      cancel: function() {},
      buttonClicked: function(index) {
        return true;
      },
      destructiveButtonClicked: function(){
        $ionicLoading.show({
          template: 'Logging out...'
        });
        //facebook logout
        facebookConnectPlugin.logout(function(){
          $ionicLoading.hide();
          $state.go('welcome');
        },
        function(fail){
          $ionicLoading.hide();
        });
      }
    });
  };

})

.controller('ImgCtrl', function($scope,$rootScope, $ionicActionSheet, $state, $ionicLoading,$http){
  $scope.images = $rootScope.photoDatas;
  $ionicLoading.hide();
 $scope.imagesName = $rootScope.PageName;
  //console.log($rootScope.photoDatas); 
  //console.log($scope.images);
  $scope.slideVisible = function(index){
    if(  index < $ionicSlideBoxDelegate.currentIndex() -1 
       || index > $ionicSlideBoxDelegate.currentIndex() + 1){
      return false;
    }
    
    return true;
  }

})



.controller('FeedCtrl',function($scope,$rootScope,$ionicLoading) {
$scope.feeds = $rootScope.feedDatas;
$ionicLoading.hide();
$scope.pageName = $rootScope.PageName;
//console.log($scope.feeds);
})



.controller('HomeCtrl', function($scope,$rootScope, UserService, $ionicActionSheet, $state, $ionicLoading,$http){

navigator.geolocation.getCurrentPosition(function(pos) {
         // console.log(pos);
          //$scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
         // alert("lat-- "+pos.coords.latitude+" , lng -- "+pos.coords.longitude);
var cityurl="http://maps.googleapis.com/maps/api/geocode/json?latlng="+pos.coords.latitude+","+pos.coords.longitude+"&sensor=true";
     //   console.log(cityurl);
$http.get(cityurl).success(function(citydata){
 // console.log(citydata);
  if(citydata.status == "OK"){
        $rootScope.lat = citydata.results[0].geometry.location.lat;
        $rootScope.lng = citydata.results[0].geometry.location.lng;
        $scope.city = citydata.results[0].address_components[3].long_name;
      //  console.log($scope.lat+", "+$scope.lng+", "+$scope.city);
        if(citydata.results[0].address_components.length == 8){
        $scope.sState = citydata.results[0].address_components[5].short_name;
        $scope.lState = citydata.results[0].address_components[5].long_name;
       // console.log("short_name -- "+$scope.sState+" long_name ---"+$scope.lState);
        }else if(citydata.results[0].address_components.length == 7){
        $scope.sState = citydata.results[0].address_components[4].short_name;
        $scope.lState = citydata.results[0].address_components[4].long_name;
       // console.log("short_name -- "+$scope.sState+" long_name ---"+$scope.lState);
        }
        refresh();
  }else{

  }

});
//alert(" lat "+$rootScope.lat+" lng "+$rootScope.lng);
          
        }, function(error) {
          console.log('line 226 -- Unable to get location: ' + error.message);
          $ionicLoading.hide();
        });

	$scope.user = UserService.getUser();
  $scope.loginn = function(text) {
    $ionicLoading.show({
          //content: 'Getting current location...',
          template: '<div style= "background-color:none; font-size: 30px"><ion-spinner icon="ripple" class="spinner-assertive"></ion-spinner></div>'
        });
    $scope.city = text.city;
 getLatLng();
  }



      $scope.centerOnMe = function() {
        $ionicLoading.show({
          template: '<div style= "background-color:none; font-size: 30px"><ion-spinner icon="ripple" class="spinner-assertive"></ion-spinner></div>'
        });
        navigator.geolocation.getCurrentPosition(function(pos) {
         // console.log(pos);
          //$scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
         // alert("lat-- "+pos.coords.latitude+" , lng -- "+pos.coords.longitude);
var cityurl="http://maps.googleapis.com/maps/api/geocode/json?latlng="+pos.coords.latitude+","+pos.coords.longitude+"&sensor=true";
     //   console.log(cityurl);
$http.get(cityurl).success(function(citydata){
 // console.log(citydata);
  if(citydata.status == "OK"){
        $rootScope.lat = citydata.results[0].geometry.location.lat;
        $rootScope.lng = citydata.results[0].geometry.location.lng;
        $scope.city = citydata.results[0].address_components[3].long_name;
      //  console.log($scope.lat+", "+$scope.lng+", "+$scope.city);
        if(citydata.results[0].address_components.length == 8){
        $scope.sState = citydata.results[0].address_components[5].short_name;
        $scope.lState = citydata.results[0].address_components[5].long_name;
       // console.log("short_name -- "+$scope.sState+" long_name ---"+$scope.lState);
        }else if(citydata.results[0].address_components.length == 7){
        $scope.sState = citydata.results[0].address_components[4].short_name;
        $scope.lState = citydata.results[0].address_components[4].long_name;
       // console.log("short_name -- "+$scope.sState+" long_name ---"+$scope.lState);
        }
        refresh();
  }else{

  }
});
          
        }, function(error) {
          console.log(' line 275 -- Unable to get location: ' + error.message);
          $ionicLoading.hide();
        });
        
 
      };



    function getLatLng(){
   $http.get("http://maps.google.com/maps/api/geocode/json?address="+$scope.city+"&sensor=false").success(function(mapData) {
        angular.extend($scope, mapData);
        if(mapData.status == "OK"){
         // console.log(mapData);
        $rootScope.lat = mapData.results[0].geometry.location.lat;
        $rootScope.lng = mapData.results[0].geometry.location.lng;
        //console.log(lat+", "+lng);
        if(mapData.results[0].address_components.length == 4){
        $scope.sState = mapData.results[0].address_components[2].short_name;
        $scope.lState = mapData.results[0].address_components[2].long_name;
        //alert("short_name -- "+$scope.sState+" long_name ---"+$scope.lState);
        }else if(mapData.results[0].address_components.length == 3){
        $scope.sState = mapData.results[0].address_components[1].short_name;
        $scope.lState = mapData.results[0].address_components[1].long_name;
        //alert("short_name -- "+$scope.sState+" long_name ---"+$scope.lState);
        }
        refresh();
    }else{
    }
});
  }
function refresh() {
  $state.go('app.home');
    var thislocation="";
    var valuess="";
    var table="";
    var city = $scope.city;
    var lat=$rootScope.lat;
    var lng=$rootScope.lng;
    $rootScope.pageDatas = [];   
    $rootScope.filer = "wereAbt"; 
facebookConnectPlugin.getLoginStatus(function(success){
     if(success.status === 'connected'){ 
      //console.log("new sucess-- "+success.authResponse.accessToken); 
      $rootScope.aToken = success.authResponse.accessToken;
      var url = "https://graph.facebook.com/v2.5/search?fields=id%2Cname%2Ccategory%2Clocation%2Ctalking_about_count%2Cwere_here_count%2Clikes%2Clink%2Cpicture%2Cabout%2Cphotos&limit=500&offset=0&type=place&q="+$scope.city+"&center="+$rootScope.lat+","+$rootScope.lng+"&distance=10000";
      $http.get(url, { params: { access_token: $rootScope.aToken,  format: "json" }}).then(function(result) {  
        var data = result.data.data;
        console.log(result);
       var listdata = [];
       for (var i=0; i<data.length;i++){
        if(($scope.city == data[i].location.city || data[i].location.city=="" || $scope.sState == data[i].location.state || $scope.lState == data[i].location.state)  && (data[i].category != "City")){
        listdata.push({
          wereAbt: data[i].were_here_count,
          likes:data[i].likes,
          talkAbt: data[i].talking_about_count,
          id: data[i].id,
          name: data[i].name,
          picture: data[i].picture.data.url,
          category: data[i].category,
          address: data[i].location.street+","+data[i].location.city+","+data[i].location.state+","+data[i].location.zip,
          city:data[i].location.city,
          lat:data[i].location.latitude,
          lng:data[i].location.longitude,
          link:data[i].link,
          about:data[i].about
          });
      }else{ 
       }
      }
      $rootScope.pageDatas=listdata; 
      

sorter();

      google.maps.event.addDomListener(document.getElementById("map"), 'load', $scope.initialize());
       
      //console.log($rootScope.pageDatas);
         //   
            }, function(error) {
                alert("There was a problem getting your profile. ");
                console.log("line 355 -- "+error.message);
            });
     }
   });

  }
	$scope.showLogOutMenu = function() {
		var hideSheet = $ionicActionSheet.show({
			destructiveText: 'Logout',
			titleText: 'Are you sure you want to logout? This app is awsome so I recommend you to stay.',
			cancelText: 'Cancel',
			cancel: function() {},
			buttonClicked: function(index) {
				return true;
			},
			destructiveButtonClicked: function(){
				$ionicLoading.show({
					template: 'Logging out...'
				});
        //facebook logout
        facebookConnectPlugin.logout(function(){
          $ionicLoading.hide();
          $state.go('welcome');
        },
        function(fail){
          $ionicLoading.hide();
        });
			}
		});
	};

  $scope.getPhotos = function(id,name,message) {

$ionicLoading.show({
          template: '<div style= "background-color:none; font-size: 30px"><ion-spinner icon="ripple" class="spinner-assertive"></ion-spinner></div>'
        });
//console.log($rootScope.aToken);
var getPhotosUrl = "https://graph.facebook.com/v2.5/"+id+"/feed?fields=picture,message&limit=50";
//alert($scope.pageDatas[i].id);
$http.get(getPhotosUrl, { params: { access_token: $rootScope.aToken,  format: "json" }}).then(function(photos) {

var photo = photos.data.data;
$rootScope.PageName = name;

$rootScope.photoDatas = [];
$rootScope.feedDatas = [];
var data = [];
var data1 = [];
    for (var i = 0; i < photo.length; i++) {
      data.push({
          src: photo[i].picture,
          });
       data1.push({
        src: photo[i].picture,
          msg: photo[i].message
          });
    }
    $rootScope.photoDatas = data;
    $rootScope.feedDatas = data1;
       console.log(photo);
       console.log($rootScope.feedDatas);
      if (message == "photo" && $rootScope.photoDatas.length != 0) {       
        $state.go('app.images');
      }
      else if(message == "feed" && $rootScope.feedDatas.length != 0){
        $state.go('app.feeds');
      }else if($rootScope.feedDatas.length == 0){
        $ionicLoading.hide();
        alert("There are no feeds on this page");
      }else if($rootScope.photoDatas.length == 0){
        $ionicLoading.hide();
        alert("There are no photos uploaded to this page");
      }
   }, function(error) {
                alert("There was a problem getting photos ");
                console.log("line 421  -- "+error.message);
            });
  }

var infos = [];
$scope.toggle = true;
  $scope.div1Hide = true;
    $scope.showADiv = function(divToShow){
    $scope.div1Hide = !$scope.div1Hide;
     $scope.toggle = !$scope.toggle;
  }
 $scope.list = function() {
    $scope.toggle = !$scope.toggle;
    $scope.div1Hide = !$scope.div1Hide;
      }

  $scope.initialize = function() {
var locations = $rootScope.pageDatas;
    var myOptions = {
      center: new google.maps.LatLng(33.890542, 151.274856),
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP

    };

    var map = new google.maps.Map(document.getElementById("map"), myOptions);
//console.log(map);
for (var i = 0; i < locations.length; i++)
 {  
 var name = locations[i].name;
 var lat = locations[i].lat;
 var long = locations[i].lng;
 var likes =  locations[i].likes;

 latlngset = new google.maps.LatLng(lat, long);

  var marker = new google.maps.Marker({  
          map: map, title: name , position: latlngset  
        });
        map.setCenter(marker.getPosition())


        var content = "name Number: " + name + "Address: " + likes     

  var infowindow = new google.maps.InfoWindow()

google.maps.event.addListener(marker,'click', (function(marker,content,infowindow){ 
        return function() {

                 closeInfos();
           infowindow.setContent(content);
           infowindow.open(map,marker);
           infos[0]=infowindow;
        };
    })(marker,content,infowindow)); 

  }
    $scope.map = map;
  }
//google.maps.event.addDomListener(document.getElementById("map"), "load", initialize());

function closeInfos(){
 
   if(infos.length > 0){
 
      /* detach the info-window from the marker ... undocumented in the API docs */
      infos[0].set("marker", null);
 
      /* and close it */
      infos[0].close();
 
      /* blank the array */
      infos.length = 0;
   }
}

$scope.sLikes = function(){

  $rootScope.filer = "likes";
  sorter();
}

$scope.sTalkAbt = function(){
  $rootScope.filer = "talkAbt";
  sorter();
}

$scope.sWerAbt = function(){
  $rootScope.filer = "wereAbt";
  sorter();
}
function sorter(){
  if($rootScope.filer == "wereAbt"){
  $rootScope.pageDatas.sort(function(a,b){
         var aa=a.wereAbt;
         var bb=b.wereAbt;
         return bb-aa;
       }); 
  console.log($rootScope.pageDatas);
}else if ($rootScope.filer == "likes") {
  $rootScope.pageDatas.sort(function(a,b){
         var aa=a.likes;
         var bb=b.likes;
         return bb-aa;
       }); 
  console.log($rootScope.pageDatas);
}else if ($rootScope.filer == "talkAbt") {
    $rootScope.pageDatas.sort(function(a,b){
         var aa=a.talkAbt;
         var bb=b.talkAbt;
         return bb-aa;
       }); 
      console.log($rootScope.pageDatas);
}

$ionicLoading.hide();

}

   
});