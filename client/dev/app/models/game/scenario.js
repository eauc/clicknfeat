'use strict';

(function () {
  angular.module('clickApp.services').factory('gameScenario', gameScenarioModelFactory);

  gameScenarioModelFactory.$inject = ['http', 'point', 'line', 'circle'];
  function gameScenarioModelFactory(httpModel, pointModel, lineModel, circleModel) {
    var gameScenarioModel = {
      initP: gameScenarioInitP,
      name: gameScenarioName,
      group: gameScenarioGroup,
      forName: gameScenarioForName,
      groupForName: gameScenarioGroupForName,
      createObjectivesP: gameScenarioCreateObjectivesP,
      isContesting: gameScenarioIsContesting,
      isKillboxing: gameScenarioIsKillboxing
    };
    R.curryService(gameScenarioModel);
    return gameScenarioModel;

    function gameScenarioInitP() {
      return httpModel.getP('/data/scenarios.json').catch(function (reason) {
        console.log('error getting scenarios.json', reason);
        return [];
      });
    }
    function gameScenarioName(scenario) {
      return R.prop('name', scenario);
    }
    function gameScenarioGroup(group_name, groups) {
      return R.find(R.compose(R.equals(group_name), R.head), groups);
    }
    function gameScenarioForName(name, group) {
      return R.find(R.propEq('name', name), group[1]);
    }
    function gameScenarioGroupForName(name, groups) {
      if (R.isNil(name)) return undefined;
      return R.find(R.compose(R.find(R.propEq('name', name)), R.last), groups);
    }
    function gameScenarioCreateObjectivesP(scenario) {
      return new self.Promise(function (resolve, reject) {
        var objectives = R.concat(R.propOr([], 'objectives', scenario), R.propOr([], 'flags', scenario));
        if (R.isEmpty(objectives)) reject('No objectives');

        var base = R.assoc('r', 0, R.head(objectives));
        resolve({
          base: R.pick(['x', 'y', 'r'], base),
          models: R.map(function (objective) {
            return R.thread(objective)(R.assoc('r', 0), R.assoc('info', R.concat(['scenario', 'models'], R.prop('info', objective))), pointModel.differenceFrom$(base));
          }, objectives)
        });
      });
    }
    function gameScenarioIsContesting(circle, scenario) {
      return R.exists(R.find(function (c) {
        return isInCircle(circle, c);
      }, R.propOr([], 'circle', scenario)) || R.find(function (r) {
        return isInRectangle(circle, r);
      }, R.propOr([], 'rect', scenario)) || R.find(function (f) {
        return isWithinFlag(circle, f);
      }, R.propOr([], 'flags', scenario)));
    }
    function gameScenarioIsKillboxing(circle, scenario) {
      return R.exists(scenario.killbox) && isInKillbox(circle, scenario.killbox);
    }
    function isInCircle(circle, c) {
      var line = {
        start: circle,
        end: c
      };
      var length = lineModel.length(line);
      return length <= circle.radius + c.r;
    }
    function isWithinFlag(circle, f) {
      var line = {
        start: circle,
        end: f
      };
      var length = lineModel.length(line);
      return length <= circle.radius + 40 + 7.874;
    }
    function isInRectangle(circle, r) {
      var box = {
        low: { x: r.x - r.width / 2,
               y: r.y - r.height / 2 },
        high: { x: r.x + r.width / 2,
                y: r.y + r.height / 2 }
      };
      return circleModel.isInBox(box, circle);
    }
    function isInKillbox(circle, kb) {
      var box = {
        low: { x: kb,
          y: kb },
        high: { x: 480 - kb,
          y: 480 - kb }
      };
      return !circleModel.isInBox(box, circle);
    }
  }
})();
//# sourceMappingURL=scenario.js.map
