app.controller('signupCtrl',['$scope','$window','$rootScope','$http','$cookies',
    function($scope,$window,$rootScope,$http,$cookies){
    if(!$cookies.getObject('signedIn')){
        $scope.newU={
            'email':'',
            'fname':'',
            'lname':'',
            'type':'Prof',
            'pass':'',
            'cpass':'',
        };
        $scope.signup = function(){
            if($scope.newU.pass == $scope.newU.cpass){
            let newU = {email:$scope.newU.email,fname:$scope.newU.fname,
            lname:$scope.newU.lname,type:$scope.newU.type,password:$scope.newU.pass};
            $http.post('/newU',newU).then(function(response){
                if(response.status==200){
                    $rootScope.justSignedIn = true;
                    $window.location.href = '#!signin';
                }else{
                    $scope.error = true;
                }
            });
            }
        };
    }else{
        $window.location.href = '#!/';
    }
}]);