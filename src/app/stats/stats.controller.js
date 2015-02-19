(function () {
  'use strict';

  function StatsCtrl ($scope, $log, $stateParams, $mdDialog, cfService, statsService) {

    $scope.filterLane = function filterLane (lane) {
      if (lane) {
        cfService.champFilters = cfService.dim.champLane.group().all()
        .filter(function (champ) {
          return champ.key[1] === lane;
        })
        .map(function (champ) {
          return champ.key[0];
        });
        cfService.dim.champLane.filter(function (d) {
          return (cfService.champFilters.indexOf(d[0]) !== -1);
        });
      }
      else {
        cfService.champFilters = [];
        cfService.dim.champLane.filterAll();
      }
      cfService.redrawAll();
    };

    $scope.setChartBy = function setChartBy (stat) {
      cfService.chartBy(stat);
    };

    function getMatchStats (matchId) {

      if (cfService.charts.teamCs) {
        cfService.charts.teamCs.focus();
      }
      $scope.filterLane();
      cfService.clear();

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
