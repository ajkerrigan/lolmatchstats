(function () {
  'use strict';

  function StatsCtrl ($scope, $log, $stateParams, $mdDialog, cfService, statsService) {

    function getMatchStats (matchId) {

      function populateCreepScores (creepScore, frame) {
        var champion = this;

        cfService.add([{
          champion: champion.championName,
          lane: champion.lane,
          team: (champion.teamId === 100 ? 'Blue' : 'Red'),
          creepScore: creepScore,
          time: frame
        }]);
      }

      statsService.getMatchStats(matchId).then(
        function (response) {
          cfService.clear();
          for (var champId in response.data.creepStats) {
            if (Array.isArray(response.data.creepStats[champId])) {
              response.data.creepStats[champId].forEach(
                populateCreepScores,
                response.data.champions[champId]
              );
            }
          }
          $scope.statData = cfService.matchTimeDimension;
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

    $scope.showBookmarkletDialog = showBookmarkletDialog;
    $scope.matchId = $stateParams.matchId;
    $scope.showChart = false;
    $scope.statData = undefined;
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
