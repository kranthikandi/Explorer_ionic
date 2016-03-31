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
				console.log(response);
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
        console.log('getLoginStatus', success.status);

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
        facebookConnectPlugin.login(['email', 'public_profile, public_actions'], fbLoginSuccess, fbLoginError);
      }
    });
  };
})



.controller('AppCtrl', function($scope){

})

.controller('HomeCtrl', function($scope,$rootScope, UserService, $ionicActionSheet, $state, $ionicLoading,$http){
	$scope.user = UserService.getUser();
  $scope.loginn = function(text) {
    //alert(text.city);
    $scope.city = text.city;
      $scope.pageDatas = [];
    $scope.pageData = []; 
 getLatLng();
  }
    function getLatLng(){
   $http.get("http://maps.google.com/maps/api/geocode/json?address="+$scope.city+"&sensor=false").success(function(mapData) {
        angular.extend($scope, mapData);
        if(mapData.status == "OK"){
          console.log(mapData);
        $scope.lat = mapData.results[0].geometry.location.lat;
        $scope.lng = mapData.results[0].geometry.location.lng;
        //console.log(lat+", "+lng);
        if(mapData.results[0].address_components.length == 4){
        $scope.sState = mapData.results[0].address_components[2].short_name;
        $scope.lState = mapData.results[0].address_components[2].long_name;
        alert("short_name -- "+$scope.sState+" long_name ---"+$scope.lState);
        }else if(mapData.results[0].address_components.length == 3){
        $scope.sState = mapData.results[0].address_components[1].short_name;
        $scope.lState = mapData.results[0].address_components[1].long_name;
        alert("short_name -- "+$scope.sState+" long_name ---"+$scope.lState);
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
    $scope.pageDatas = [];
    $scope.pageData = [];
    //alert($rootScope.aToken);
    //var aToken= "CAACEdEose0cBAP6wwB07EQdPqZArqfK3xSoyDVeLQFzy2WkyIxGAuFxLN7f96P3fJGiIAIqvcV4w0Y1KZBjcZA2MhM1owtH25c2lUeGIqow0ZB3XBgbj347wxWZBtyPzfG2NtHV1T9KM3JX9mBBAZBnA99rTr7hWhyFOvUGd9UTYU2v2ZCIueqzsvgyLAajBxXxfrknV4CB4laYtgeCPywn";
            
facebookConnectPlugin.getLoginStatus(function(success){
     if(success.status === 'connected'){ 
      console.log("new sucess-- "+success.authResponse.accessToken); 
      $scope.aToken = success.authResponse.accessToken;
      var url = "https://graph.facebook.com/v2.5/search?fields=id%2Cname%2Ccategory%2Clocation%2Ctalking_about_count%2Cwere_here_count%2Clikes%2Clink&limit=500&offset=0&type=place&q="+$scope.city+"&center="+$scope.lat+","+$scope.lng+"&distance=10000";
      $http.get(url, { params: { access_token: $scope.aToken,  format: "json" }}).then(function(result) {
      console.log(result);
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
      $scope.pageDatas=listdata; 
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
});
