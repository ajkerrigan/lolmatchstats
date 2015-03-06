(function () {
  'use strict';

  function StatsCtrl ($scope, $log, $stateParams, $mdDialog, cfService, statsService, regions) {

    function getMatchStats (region, matchId) {

      cfService.clearFilters();
      cfService.clearData();

      statsService.getMatchStats(region, matchId).then(
        function (response) {
          for (var champId in response.data.timeStats.creepScore) {
            var champInfo = response.data.champions[champId];
            if (response.data.timeStats.creepScore[champId] instanceof Array) {
              cfService.add(response.data.timeStats.creepScore[champId].map(
                function (creepScore, frame) {
                  var record = {
                    champion: champInfo.championName,
                    lane: champInfo.lane,
                    team: (champInfo.teamId === 100 ? 'Blue' : 'Red'),
                    creepScore: creepScore,
                    totalGold: response.data.timeStats.totalGold[champId][frame],
                    time: frame
                  };
                  return record;
                }
              ));
            }
          }
          $scope.showChart = true;
        },
        function (response) {
          $log.error('Error loading match data.');
          $log.error(response);
        }
      );
    }

    function showBookmarkletDialog() {
      $mdDialog.show({
        templateUrl: '/bookmarklet-dialog.html',
        controller: 'BookmarkletCtrl',
      });
    }

    $scope.activeLaneFilter = 'ALL';
    $scope.activeStat = 'Creep Score';
    $scope.stats = [ 'Creep Score', 'Gold Income' ];
    $scope.laneFilters = [ 'ALL', 'TOP', 'MIDDLE', 'BOTTOM', 'JUNGLE' ];
    $scope.filterLane = function (lane) {
      $scope.activeLaneFilter = lane;
      return cfService.filterLane(lane);
    };
    $scope.setChartBy = function (stat) {
      $scope.activeStat = stat;
      return cfService.chartBy(stat);
    };
    $scope.showBookmarkletDialog = showBookmarkletDialog;
    $scope.match = { 'id': $stateParams.matchId };
    $scope.showChart = false;
    $scope.dim = cfService.dim;
    $scope.chartPostSetup = cfService.chartPostSetup;
    $scope.regions = regions;

    if (typeof($stateParams.region) === 'string' &&
        regions.indexOf($stateParams.region.toUpperCase()) !== -1) {
      $scope.match.region = $stateParams.region.toUpperCase();
    }
        
    if (typeof($stateParams.matchId) === 'number') {
      getMatchStats($stateParams.region, $stateParams.matchId);
    }
  }

  function BookmarkletCtrl ($scope, $mdDialog) {
    $scope.closeDialog = function () {
      $mdDialog.hide();
    };
  }

  angular.module('matchstats')
    .controller('StatsCtrl', ['$scope', '$log', '$stateParams', '$mdDialog', 'cfService', 'statsService', 'regions', StatsCtrl])
    .controller('BookmarkletCtrl', ['$scope', '$mdDialog', BookmarkletCtrl]);

})();
