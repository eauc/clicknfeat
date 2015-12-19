'use strict';

angular.module('clickApp.services').factory('gameScenario', ['http', 'point', function gameScenarioServiceFactory(httpService, pointService) {
  var gameScenarioService = {
    init: function gameScenarioInit() {
      return httpService.get('/data/scenarios.json').catch(function (reason) {
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
      if (R.isNil(name)) return undefined;
      return R.find(R.compose(R.find(R.propEq('name', name)), R.last), groups);
    },
    createObjectives: function gameScenarioCreateObjectives(scenario) {
      return new self.Promise(function (resolve, reject) {
        var objectives = R.concat(R.propOr([], 'objectives', scenario), R.propOr([], 'flags', scenario));
        if (R.isEmpty(objectives)) reject('No objectives');

        var base = R.assoc('r', 0, R.head(objectives));
        resolve({
          base: R.pick(['x', 'y', 'r'], base),
          models: R.map(function (objective) {
            return R.pipe(R.assoc('r', 0), R.assoc('info', R.concat(['scenario', 'models'], R.prop('info', objective))), pointService.differenceFrom$(base))(objective);
          }, objectives)
        });
      });
    }
  };
  return gameScenarioService;
}]);
//# sourceMappingURL=scenario.js.map
