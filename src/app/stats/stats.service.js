(function () {
  'use strict';

  function statsService ($q, $http, apiEndpoint) {
    var statData = {};

    return {
      getMatchStats: function _getMatchStats (region, matchId) {
        var deferred = $q.defer();
        var urlComponents = [apiEndpoint, 'api', 'match', matchId];
        if (region) {
          urlComponents.splice(3,0,region);
        }

        $http({
          method: 'GET',
          url: urlComponents.join('/')
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
