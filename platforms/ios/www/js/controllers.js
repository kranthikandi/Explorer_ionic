angular.module('controllers', [])

.run(function($rootScope) {
    $rootScope.aToken = "token";
})

.controller('WelcomeCtrl', function($scope,$rootScope, $state, $q, UserService, $ionicLoading) {

  //This is the success callback from the login method
  var fbLoginSuccess = function(response) {
    if (!response.authResponse){
      fbLoginError("Cannot find the authResponse");
      return;
    }

    $Scope.authResponse = response.authResponse;
    
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

.controller('ImgCtrl', function($scope,$rootScope, $ionicActionSheet, $state, $ionicLoading,$http){

  $scope.images = $rootScope.photoDatas;
 
  console.log($rootScope.photoDatas); 
  console.log($scope.images);
  
  $scope.slideVisible = function(index){
    if(  index < $ionicSlideBoxDelegate.currentIndex() -1 
       || index > $ionicSlideBoxDelegate.currentIndex() + 1){
      return false;
    }
    
    return true;
  }


})



.controller('DemoCtrl',function($scope, $ionicLoading, $compile) {
   function initialize() {
        var myLatlng = new google.maps.LatLng(14.28347,-325.492841);
        
        var mapOptions = {
          center: myLatlng,
          zoom: 50,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map"),
            mapOptions);
        
        //Marker + infowindow + angularjs compiled ng-click
        var contentString = "<div><a ng-click='clickTest()'>Click me!</a></div>";
        var compiled = $compile(contentString)($scope);

        var infowindow = new google.maps.InfoWindow({
          content: compiled[0]
        });

        var marker = new google.maps.Marker({
          position: myLatlng,
          map: map,
          title: 'Uluru (Ayers Rock)'
        });

        google.maps.event.addListener(marker, 'click', function() {
          infowindow.open(map,marker);
        });

        $scope.map = map;
      }
            google.maps.event.addDomListener(window, 'load', initialize);
      
      $scope.centerOnMe = function() {
alert("test");
        if(!$scope.map) {
          return;
        }

        $ionicLoading.show({
          content: 'Getting current location...',
        });

        navigator.geolocation.getCurrentPosition(function(pos) {
          console.log(pos);
          $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
          alert("lat-- "+pos.coords.latitude+" , lng -- "+pos.coords.longitude)
          $ionicLoading.hide();
        }, function(error) {
          alert('Unable to get location: ' + error.message);
        });
      };
      
})



.controller('HomeCtrl', function($scope,$rootScope, UserService, $ionicActionSheet, $state, $ionicLoading,$http){
	$scope.user = UserService.getUser();
  $scope.loginn = function(text) {
    //alert(text.city);
    $scope.city = text.city;
 getLatLng();
  }



      $scope.centerOnMe = function() {
        $ionicLoading.show({
          content: 'Getting current location...',
        });
alert("test");
        navigator.geolocation.getCurrentPosition(function(pos) {
          console.log(pos);
          //$scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
          alert("lat-- "+pos.coords.latitude+" , lng -- "+pos.coords.longitude);
var cityurl="http://maps.googleapis.com/maps/api/geocode/json?latlng="+pos.coords.latitude+","+pos.coords.longitude+"&sensor=true";
        console.log(cityurl);
$http.get(cityurl).success(function(citydata){
  console.log(citydata);
  if(citydata.status == "OK"){
        $scope.lat = citydata.results[0].geometry.location.lat;
        $scope.lng = citydata.results[0].geometry.location.lng;
        $scope.city = citydata.results[0].address_components[3].long_name;
        console.log($scope.lat+", "+$scope.lng+", "+$scope.city);
        if(citydata.results[0].address_components.length == 8){
        $scope.sState = citydata.results[0].address_components[5].short_name;
        $scope.lState = citydata.results[0].address_components[5].long_name;
        console.log("short_name -- "+$scope.sState+" long_name ---"+$scope.lState);
        }else if(citydata.results[0].address_components.length == 7){
        $scope.sState = citydata.results[0].address_components[4].short_name;
        $scope.lState = citydata.results[0].address_components[4].long_name;
        console.log("short_name -- "+$scope.sState+" long_name ---"+$scope.lState);
        }
        refresh();
  }else{

  }
});
          $ionicLoading.hide();
        }, function(error) {
          alert('Unable to get location: ' + error.message);
        });
        

      };



    function getLatLng(){
   $http.get("http://maps.google.com/maps/api/geocode/json?address="+$scope.city+"&sensor=false").success(function(mapData) {
        angular.extend($scope, mapData);
        if(mapData.status == "OK"){
         // console.log(mapData);
        $scope.lat = mapData.results[0].geometry.location.lat;
        $scope.lng = mapData.results[0].geometry.location.lng;
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
    var thislocation="";
    var valuess="";
    var table="";
    var city = $scope.city;
    var lat=$scope.lat;
    var lng=$scope.lng;
    $rootScope.pageDatas = [];    
facebookConnectPlugin.getLoginStatus(function(success){
     if(success.status === 'connected'){ 
      //console.log("new sucess-- "+success.authResponse.accessToken); 
      $rootScope.aToken = success.authResponse.accessToken;
      var url = "https://graph.facebook.com/v2.5/search?fields=id%2Cname%2Ccategory%2Clocation%2Ctalking_about_count%2Cwere_here_count%2Clikes%2Clink%2Cpicture%2Cphotos&limit=500&offset=0&type=place&q="+$scope.city+"&center="+$scope.lat+","+$scope.lng+"&distance=10000";
      $http.get(url, { params: { access_token: $rootScope.aToken,  format: "json" }}).then(function(result) {
     // console.log(result);
        result.data.data.sort(function(a,b){
         var aa=a.were_here_count;
         var bb=b.were_here_count;
         return bb-aa;
       });   
        var data = result.data.data;
       var listdata = [];
       for (var i=0; i<data.length;i++){
        if(($scope.city == data[i].location.city || data[i].location.city=="" || $scope.sState == data[i].location.state || $scope.lState == data[i].location.state)  && (data[i].category != "City")){
        listdata.push({
          wereAbt: data[i].were_here_count,
          id: data[i].id,
          name: data[i].name,
          picture: data[i].picture.data.url,
          category: data[i].category,
          address: data[i].location.street+","+data[i].location.city+","+data[i].location.state+","+data[i].location.zip,
          city:data[i].location.city,
          lat:data[i].location.latitude,
          lng:data[i].location.longitude,
          talkAbt: data[i].talking_about_count,
          likes:data[i].likes,
          link:data[i].link
          });
      }else{ 
       }
      }
      $rootScope.pageDatas=listdata; 
            //console.log($scope.pageDatas);
            }, function(error) {
                alert("There was a problem getting your profile. ");
                console.log(error);
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

  $scope.getPhotos = function(id) {


//console.log($rootScope.aToken);
var getPhotosUrl = "https://graph.facebook.com/v2.5/"+id+"/photos?fields=picture&type=uploaded&limit=100";
//alert($scope.pageDatas[i].id);
$http.get(getPhotosUrl, { params: { access_token: $rootScope.aToken,  format: "json" }}).then(function(photos) {

var photo = photos.data.data;
console.log(photo);
$rootScope.photoDatas = [];
var data = [];
    for (var i = 0; i < photo.length; i++) {
      data.push({
          src: photo[i].picture
          });
    }
    $rootScope.photoDatas = data;
       console.log($rootScope.photoDatas);
           $state.go('app.images');

   }, function(error) {
                alert("There was a problem getting your profile. ");
                console.log(error);
            });




  }

   
});