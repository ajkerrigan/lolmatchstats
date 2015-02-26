(function () {
  'use strict';

  /* jshint globalstrict: true */
  /* global crossfilter,dc,d3 */

  function cfService () {
    var exports = {};
    var cf = crossfilter();
    var charts = {};
    var _chartByStat = 'creepScore';
    var _champTimeGroup = {};
    var _timeGroup = {};
    exports.dim = {};
    exports.chartPostSetup = {};
    exports.champFilters = [];

    function styleSelectedChamps () {
      d3.selectAll('.dc-legend-item text')
      .filter(function (d) {
        return (exports.champFilters.indexOf(d.name) !== -1);
      })
      .style('font-weight', 'bolder')
      .style('fill', 'blue');
    }

    exports.chartBy = function (stat) {
      if (!stat) {
        return _chartByStat;
      }
      else {
        _chartByStat = stat;
        charts.teamCs.group(timeGroup());
        charts.championCs.group(champTimeGroup());
        switch (stat) {
          case 'creepScore':
            charts.championCs.yAxisLabel('Creep Score');
            break;
          case 'totalGold':
            charts.championCs.yAxisLabel('Gold Income');
            break;
        }
        exports.redrawAll();
      }
    };

    exports.filterLane = function filterLane (lane) {
      if (lane) {
        exports.champFilters = exports.dim.champLane.group().all()
        .filter(function (champ) {
          return champ.key[1] === lane;
        })
        .map(function (champ) {
          return champ.key[0];
        });
        exports.dim.champLane.filter(function (d) {
          return (exports.champFilters.indexOf(d[0]) !== -1);
        });
      }
      else {
        exports.champFilters = [];
        exports.dim.champLane.filterAll();
      }
      exports.redrawAll();
    };

    exports.clearFilters = function clearFilters () {
      if (charts.teamCs) {
        charts.teamCs.focus();
      }
      exports.filterLane();
    };

    exports.add = function (data) {
      cf.add(data);
    };

    exports.clearData = function () {
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
    function champTimeGroup () {
      if (_champTimeGroup.hasOwnProperty('dispose')) {
        _champTimeGroup.dispose();
      }
      _champTimeGroup = exports.dim.champTime.group().reduceSum(function (d) {
        var value;
        switch (_chartByStat) {
          case 'creepScore':
            value = d.creepScore;
            break;
          case 'totalGold':
            value = d.totalGold;
            break;
        }
        return value;
      });
      return _champTimeGroup;
    }

    function timeGroup () {
      if (_timeGroup.hasOwnProperty('dispose')) {
        _timeGroup.dispose();
      }
      _timeGroup = exports.dim.time.group().reduce(
        function (p, v) {
          switch (_chartByStat) {
            case 'creepScore':
              p += (v.team === 'Blue' ? v.creepScore : -v.creepScore);
              break;
            case 'totalGold':
              p += (v.team === 'Blue' ? v.totalGold : -v.totalGold);
              break;
          }
          return p;
        },
        function (p, v) {
          switch (_chartByStat) {
            case 'creepScore':
              p -= (v.team === 'Blue' ? v.creepScore : -v.creepScore);
              break;
            case 'totalGold':
              p -= (v.team === 'Blue' ? v.totalGold : -v.totalGold);
              break;

          }
          return p;
        },
        function () {
          return 0;
        }
      );
      return _timeGroup;
    }

    exports.dim.lane = cf.dimension(function (d) {
      return d.lane;
    });

    exports.dim.champLane = cf.dimension(function (d) {
      return ['('+ d.team +') '+ d.champion, d.lane];
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
      chart.group(champTimeGroup());
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
        return d.key[0] +' '+ chart.yAxisLabel() +' at '+ d.key[1] +' mins: '+ d3.format(',.0f')(d.value);
      });
      chart.round(Math.round);
      chart.brushOn(false);
      chart.margins({
        left: 60,
        right: 0,
        top: 50,
        bottom: 50
      });
      chart.on('renderlet', function () {
        d3.selectAll('.dc-legend-item').on('click', function (legendItem) {

          // When clicking on a champion in the legend, toggle inclusion
          // in the champion filter list. Then, filter the dataset appropriately
          // (clearing all filters if the filter list is empty).

          var filterPosition = exports.champFilters.indexOf(legendItem.name);
          if (filterPosition !== -1) {
            exports.champFilters.splice(filterPosition, 1);
          }
          else {
            exports.champFilters.push(legendItem.name);
          }
          if (exports.champFilters.length > 0) {
            exports.dim.champLane.filter(function (d) {
              return (exports.champFilters.indexOf(d[0]) !== -1);
            });
          }
          else {
            exports.dim.champLane.filterAll();
          }
          exports.redrawAll();
        });
      });
      charts.championCs = chart;
    };

    exports.chartPostSetup.teamCs = function (chart) {
      chart.width(800);
      chart.height(200);
      chart.ordinalColors(['red','blue']);
      chart.colorDomain([0,1]);
      chart.colorAccessor(function (d) {
        return (d.value < 0 ? 0 : 1);
      });
      chart.group(timeGroup());
      chart.keyAccessor(function (d) {
        return d.key;
      });
      chart.valueAccessor(function (d) {
        return d.value;
      });
      chart.yAxis().tickFormat(function (v) {
        return d3.format(',.0f')(Math.abs(v));
      });
      chart.x(d3.scale.linear().domain([0,exports.dim.time.group().size()-1]));
      chart.yAxisLabel('Team Advantage');
      chart.xAxisLabel('Match Time (Minutes)');
      chart.elasticY(true);
      chart.renderVerticalGridLines(true);
      chart.round(Math.round);
      chart.margins({
        left: 60,
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

    exports.redrawAll = function () {
      d3.selectAll('.dc-legend').remove();
      dc.redrawAll();
      styleSelectedChamps();
    };

    exports.charts = charts;

    return exports;
  }

  angular.module('matchstats')
    .factory('cfService', cfService);

})();
