'use strict';

self.gameScenarioServiceFactory = function gameScenarioServiceFactory(httpService) {
  var gameScenarioService = {
    init: function gameScenarioInit() {
      return httpService.get('/data/scenarios.json')
        .catch(function(reason) {
          console.log('error getting scenarios.json', reason);
        });
    },
    name: function gameScenarioName(scenario) {
      return R.prop('name', scenario);
    },
    group: function gameScenarioGroup(group_name, groups) {
      return R.find(R.compose(R.eq(group_name), R.head), groups);
    },
    forName: function gameScenarioForName(name, group) {
      return R.find(R.propEq('name', name), group[1]);
    },
    groupForName: function gameScenarioForName(name, groups) {
      if(R.isNil(name)) return undefined;
      return R.find(R.compose(R.find(R.propEq('name', name)), R.last), groups);
    },
  };
  return gameScenarioService;
};
