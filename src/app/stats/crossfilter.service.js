(function () {
  'use strict';

  /* jshint globalstrict: true */
  /* global crossfilter,dc */

  function cfService () {
    var exports = {};
    var cf = crossfilter();

    exports.add = function (data) {
      cf.add(data);
    };

    exports.clear = function () {
      cf.remove();
    };

    exports.size = function () {
      return cf.size();
    };

    exports.champTimeDimension = cf.dimension(function (d) {
      return [d.team, d.champion, d.time];
    });

    exports.champTimeGroup = exports.champTimeDimension.group().reduceSum(
      function (d) {
        return d.creepScore;
      }
    );

    exports.chartPostSetup = function (chart) {
      chart.chart(function (c) {
        return dc.lineChart(c).interpolate('basis');
      });
      chart.width(800);
      chart.height(400);
      chart.group(exports.champTimeGroup);
      chart.seriesAccessor(function (d) {
        return '('+ d.key[0] +') '+ d.key[1];
      });
      chart.keyAccessor(function (d) {
        return d.key[2];
      });
      chart.valueAccessor(function (d) {
        return d.value;
      });
      chart.legend(dc.legend().x(50).autoItemWidth(true));
    };

    return exports;
  }

  angular.module('matchstats')
    .factory('cfService', cfService);

})();
