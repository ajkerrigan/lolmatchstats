(function () {
  'use strict';

  /* jshint globalstrict: true */
  /* global crossfilter,dc,d3 */

  function cfService () {
    var exports = {};
    var cf = crossfilter();
    var charts = {};
    exports.dim = {};
    exports.chartPostSetup = {};

    exports.add = function (data) {
      cf.add(data);
    };

    exports.clear = function () {
      cf.remove();
    };

    exports.size = function () {
      return cf.size();
    };

    exports.dim.time = cf.dimension(function (d) {
      return d.time;
    });

    exports.dim.champTime = cf.dimension(function (d) {
      return ['('+ d.team +') '+ d.champion, d.time];
    });
    exports.champTimeGroup = exports.dim.champTime.group().reduceSum(
      function (d) {
        return d.creepScore;
      }
    );

    exports.timeGroup = exports.dim.time.group().reduce(
      function (p, v) {
        p += (v.team === 'Blue' ? v.creepScore : -v.creepScore);
        return p;
      },
      function (p, v) {
        p -= (v.team === 'Blue' ? v.creepScore : -v.creepScore);
        return p;
      },
      function () {
        return 0;
      }
    );

    exports.dim.lane = cf.dimension(function (d) {
      return d.lane;
    });

    exports.chartPostSetup.championCs = function (chart) {
      chart.chart(function (c) {
        var newChart = dc.lineChart(c);
        newChart.interpolate('basis');
        newChart.renderDataPoints({});
        return newChart;
      });
      chart.width(800);
      chart.height(300);
      chart.group(exports.champTimeGroup);
      chart.seriesAccessor(function (d) {
        return d.key[0];
      });
      chart.keyAccessor(function (d) {
        return d.key[1];
      });
      chart.valueAccessor(function (d) {
        return d.value;
      });
      chart.legend(dc.legend().x(100).y(0).horizontal(true).itemWidth(125));
      chart.elasticY(true);
      chart.x(d3.scale.linear().domain(charts.teamCs.xOriginalDomain()));
      chart.xAxisLabel('Match Time (Minutes)');
      chart.yAxisLabel('Creep Score');
      chart.renderHorizontalGridLines(true);
      chart.renderVerticalGridLines(true);
      chart.title(function (d) {
        return d.key[0] +' @'+ d.key[1] +' mins: '+ d.value +' CS';
      });
      chart.round(Math.round);
      chart.brushOn(false);
      chart.margins({
        left: 50,
        right: 0,
        top: 50,
        bottom: 50
      });
      charts.championCs = chart;
    };

    exports.chartPostSetup.teamCs = function (chart) {
      chart.width(800);
      chart.height(200);
      chart.group(exports.timeGroup);
      chart.keyAccessor(function (d) {
        return d.key;
      });
      chart.valueAccessor(function (d) {
        return d.value;
      });
      chart.yAxis().tickFormat(function (v) {
        return Math.abs(v);
      });
      chart.x(d3.scale.linear().domain([0,exports.dim.time.group().size()-1]));
      chart.yAxisLabel('Creep Advantage');
      chart.xAxisLabel('Match Time (Minutes)');
      chart.elasticY(true);
      chart.renderVerticalGridLines(true);
      chart.round(Math.round);
      chart.renderDataPoints(true);
      chart.interpolate('basis');
      chart.margins({
        left: 50,
        right: 0,
        top: 50,
        bottom: 50
      });
      chart.on('filtered', function (c, filter) {
        if (filter) {
          charts.championCs.focus([filter[0], filter[1]+0.1]);
        }
        else {
          charts.championCs.x(d3.scale.linear().domain([0,exports.dim.time.group().size()-1]));
        }
      });
      charts.teamCs = chart;
    };

    return exports;
  }

  angular.module('matchstats')
    .factory('cfService', cfService);

})();
