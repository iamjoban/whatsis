var app = angular.module('myapp',[ 'ui.router', 'ngSanitize']);
window.onload= function(){
  //localStorage.removeItem('chatBox');
//location.hash="#/login";
}


app.config(['$stateProvider', '$httpProvider', '$urlRouterProvider', function($stateProvider, $httpProvider, $urlRouterProvider){

$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'; 
  $stateProvider
  .state('login',{
    url:'/login',
	templateUrl:'login.html',
	controller:'loginCntrl'
  })
  .state('home',{
    url:'/home',
	templateUrl:'home.html',
	controller:'homeCntrl'
  })
  .state('dummy',{
    url:'/dummy',
	templateUrl:'dummy.html',
	controller:''
  })
  $urlRouterProvider.otherwise('login');
}]);

