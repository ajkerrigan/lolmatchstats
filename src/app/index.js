'use strict';

angular.module('matchstats', ['ngAnimate', 'ngTouch', 'ngSanitize', 'ui.router', 'ngMaterial', 'angularDc'])
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('default', {
        url: '/default',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      })
      .state('statsWithMatch', {
        url: '/{matchId:int}',
        templateUrl: 'app/stats/stats.html',
        controller: 'StatsCtrl'
      })
      .state('statsWithoutMatch', {
        url: '/',
        templateUrl: 'app/stats/stats.html',
        controller: 'StatsCtrl'
      });

    $urlRouterProvider.otherwise('/');
  })
  .config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryColor('light-blue');
  })
  .config(function ($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|javascript):/);
  })
;
