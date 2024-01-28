var app = angular.module('vbotApp',['ngRoute','ngCookies']);

app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
      templateUrl : "/views/home.html",
      controller:"mainCtrl"
    })
    .when("/chat", {
      templateUrl : "/views/chat.html",
      controller: "chatCtrl"
    })
    .when("/about", {
      templateUrl : "/views/about.html",
      //controller: "aboutCnt"
    })
    .when("/signin", {
      templateUrl : "/views/signin.html",
      controller: "signinCtrl"
    })
    .when("/signup", {
      templateUrl : "/views/signup.html",
      controller: "signupCtrl"
    })
    .when("/signout", {
      templateUrl : "/views/home.html",
      controller: "mainCtrl"
    }).otherwise('/');
  });