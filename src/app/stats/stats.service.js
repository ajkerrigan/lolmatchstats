(function () {
  'use strict';

  function statsService ($q, $http, apiEndpoint) {
    var statData = {};

    return {
      getMatchStats: function _getMatchStats (matchId) {
        var deferred = $q.defer();

        $http({
          method: 'GET',
          url: [apiEndpoint, 'api', 'match', matchId].join('/')
        })
          .then(
            function (response) {
              statData = response.data;
              deferred.resolve(response);
            },
            function (response) {
              statData = {};
              deferred.reject(response);
            }
          );

        return deferred.promise;
      },
      getStatData: function _getStatData () {
        return statData;
      }
    };
  }

  angular.module('matchstats')
    .factory('statsService', ['$q', '$http', 'apiEndpoint', statsService]);

})();
