app.controller('signinCtrl',['$scope','$window','$rootScope','$http','$cookies'
,function($scope,$window,$rootScope,$http,$cookies){
    if(!$rootScope.signedIn){
        $scope.wrongPass=false;
        $scope.wrongEmail=false;
        $scope.signin = function(){
        $http.post('./getU/',$scope.u).then(
            function(response){
                if(response.status==200){
                        $scope.wrongEmail=false;
                        $scope.wrongPass=false;
                        $cookies.putObject('user',response.data);
                        $cookies.putObject('signedIn',true); 
                        $rootScope.signedIn = $cookies.getObject('signedIn');
                        $rootScope.justSignedIn = false;
                        $window.location.href = '#!chat';
                    }
            }, function(response) {
                if(response.status==500){
                    $scope.wrongEmail=false;
                    $scope.wrongPass = true;
                }
                else{
                    $scope.wrongPass=false;
                    $scope.wrongEmail = true;
                }
            });
        }
    }else{
        $window.location.href = '#!/';
    }
}]);