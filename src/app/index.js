'use strict';

angular.module('matchstats', ['matchstats.config', 'ngAnimate', 'ngTouch', 'ngSanitize', 'ui.router', 'ngMaterial', 'angularDc'])
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('default', {
        url: '/default',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      })
      .state('statsWithRegionAndMatch', {
        url: '/{region}/{matchId:int}',
        templateUrl: 'app/stats/stats.html',
        controller: 'StatsCtrl'
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
      .primaryPalette('light-blue');
  })
  .config(function ($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|javascript):/);
  })
;
