app.controller('mainCtrl',['$scope','$rootScope','$cookies','$window',
function($scope,$rootScope,$cookies,$window){
    $scope.year = new Date().getFullYear();
    $rootScope.signedIn = $cookies.getObject('signedIn');
    if($rootScope.signedIn){
        $rootScope.user = $cookies.getObject('user');
        $scope.uFname = $rootScope.user.fname;
    }
    $rootScope.signOut = function(){
        $cookies.putObject('signedIn',false);
        $rootScope.signedIn = $cookies.getObject('signedIn');
        $cookies.putObject('user',null);
        $rootScope.justSignedIn = false;
        $window.location.href = '#!';
    }
}]);