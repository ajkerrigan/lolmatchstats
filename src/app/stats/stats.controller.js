(function () {
  'use strict';

  function StatsCtrl ($scope, $log, $stateParams, $mdDialog, cfService, statsService) {

    function getMatchStats (matchId) {

      cfService.clearFilters();
      cfService.clearData();

      statsService.getMatchStats(matchId).then(
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

    $scope.filterLane = cfService.filterLane;
    $scope.setChartBy = cfService.chartBy;
    $scope.showBookmarkletDialog = showBookmarkletDialog;
    $scope.matchId = $stateParams.matchId;
    $scope.showChart = false;
    $scope.dim = cfService.dim;
    $scope.chartPostSetup = cfService.chartPostSetup;
        
    if (typeof($stateParams.matchId) === 'number') {
      getMatchStats($stateParams.matchId);
    }
  }

  function BookmarkletCtrl ($scope, $mdDialog) {
    $scope.closeDialog = function () {
      $mdDialog.hide();
    };
  }

  angular.module('matchstats')
    .controller('StatsCtrl', ['$scope', '$log', '$stateParams', '$mdDialog', 'cfService', 'statsService', StatsCtrl])
    .controller('BookmarkletCtrl', ['$scope', '$mdDialog', BookmarkletCtrl]);

})();
