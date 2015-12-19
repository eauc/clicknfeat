'use strict';

angular.module('clickApp.services')
  .factory('gameScenario', [
    'http',
    'point',
    'line',
    'circle',
    function gameScenarioServiceFactory(httpService,
                                        pointService,
                                        lineService,
                                        circleService) {
      var gameScenarioService = {
        init: function gameScenarioInit() {
          return httpService.get('/data/scenarios.json')
            .catch(function(reason) {
              console.log('error getting scenarios.json', reason);
              return [];
            });
        },
        name: function gameScenarioName(scenario) {
          return R.prop('name', scenario);
        },
        group: function gameScenarioGroup(group_name, groups) {
          return R.find(R.compose(R.equals(group_name), R.head), groups);
        },
        forName: function gameScenarioForName(name, group) {
          return R.find(R.propEq('name', name), group[1]);
        },
        groupForName: function gameScenarioGroupForName(name, groups) {
          if(R.isNil(name)) return undefined;
          return R.find(R.compose(R.find(R.propEq('name', name)), R.last), groups);
        },
        createObjectives: function gameScenarioCreateObjectives(scenario) {
          return new self.Promise((resolve, reject) => {
            let objectives = R.concat(
              R.propOr([], 'objectives', scenario),
              R.propOr([], 'flags', scenario)
            );
            if(R.isEmpty(objectives)) reject('No objectives');

            let base = R.assoc('r', 0, R.head(objectives));
            resolve({
              base: R.pick(['x','y','r'], base),
              models: R.map((objective) => {
                return R.pipe(
                  R.assoc('r', 0),
                  R.assoc('info', R.concat(['scenario','models'], R.prop('info', objective))),
                  pointService.differenceFrom$(base)
                )(objective);
              }, objectives)
            });
          });
        },
        isContesting: function gameScenarioIsContesting(circle, scenario) {
          return R.exists( R.find((c) => { return isInCircle(circle, c);    },
                                  R.propOr([], 'circle', scenario)) ||
                           R.find((r) => { return isInRectangle(circle, r); },
                                  R.propOr([], 'rect', scenario)) ||
                           R.find((f) => { return isWithinFlag(circle, f);  },
                                  R.propOr([], 'flags', scenario))
                         );
        },
        isKillboxing: function gameScenarioIsKillboxing(circle, scenario) {
          return ( R.exists(scenario.killbox) &&
                   isInKillbox(circle, scenario.killbox)
                 );
        },
      };
      function isInCircle(circle, c) {
        let line = {
          start: circle,
          end: c
        };
        let length = lineService.length(line);
        return length <= (circle.radius + c.r);
      }
      function isWithinFlag(circle, f) {
        let line = {
          start: circle,
          end: f
        };
        let length = lineService.length(line);
        return length <= (circle.radius + 40 + 7.874);
      }
      function isInRectangle(circle, r) {
        let box = {
          low: { x: r.x - r.width/2,
                 y: r.y - r.height/2 },
          high: { x: r.x + r.width/2,
                  y: r.y + r.height/2 }
        };
        return circleService.isInBox(box, circle);
      }
      function isInKillbox(circle, kb) {
        let box = {
          low: { x: kb,
                 y: kb },
          high: { x: 480 - kb,
                  y: 480 - kb }
        };
        return !circleService.isInBox(box, circle);
      }

      return gameScenarioService;
    }
  ]);
