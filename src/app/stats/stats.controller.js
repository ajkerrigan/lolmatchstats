(function (angular, undefined) {
  'use strict';

  function StatsCtrl ($scope, $log, $stateParams, $mdDialog, statsService) {

    function getMatchStats(matchId) {
      $scope.chartConfig.series = [];
      $scope.showChart = true;
      $scope.chartConfig.loading = true;

      statsService.getMatchStats(matchId).then(
        function (response) {
          Object.keys(response.data.champions).forEach(function (id) {
            $scope.chartConfig.series.push({
              name: response.data.champions[id].championName,
              data: response.data.creepStats[id]
            });
          });
          $scope.chartConfig.loading = false;
        },
        function (response) {
          $log.error('Error loading match data.');
          $log.error(response);
          $scope.chartConfig.loading = false;
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

    $scope.chartConfig = {
      options: {
        chart: {
          type: 'line'
        }
      },
      series: [],
      title: {
        text: 'Creep Score'
      },
      loading: false,
      xAxis: {
        currentMin: 0,
        title: {
          text: 'Match Time'
        }
      }
    };

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
    .controller('StatsCtrl', ['$scope', '$log', '$stateParams', '$mdDialog', 'statsService', StatsCtrl])
    .controller('BookmarkletCtrl', ['$scope', '$mdDialog', BookmarkletCtrl]);

})(angular);
