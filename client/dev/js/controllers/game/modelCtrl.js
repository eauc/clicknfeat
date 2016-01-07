'use strict';

angular.module('clickApp.controllers').controller('gameModelCtrl', ['$scope', function ($scope) {
  console.log('init gameModelCtrl');

  function updateFactions() {
    $scope.factions = R.path(['state', 'factions', 'current'], $scope);
    $scope.faction = R.head(R.keys($scope.factions));
    $scope.onFactionChange();
    $scope.$digest();
  }
  $scope.state.data_ready.then(updateFactions);

  $scope.onFactionChange = function () {
    $scope.section = R.head(R.keys($scope.factions[$scope.faction].models));
    $scope.onSectionChange();
  };
  $scope.onSectionChange = function () {
    $scope.entry = R.head(R.keys($scope.factions[$scope.faction].models[$scope.section]));
    $scope.onEntryChange();
  };
  $scope.onEntryChange = function () {
    var entries = $scope.getEntries();
    if (R.isNil(entries)) {
      $scope.model = $scope.entry;
      $scope.onModelChange();
      return;
    }
    $scope.type = R.head(R.keys(entries));
    $scope.onTypeChange();
  };
  $scope.onTypeChange = function () {
    var entries = $scope.getEntries();
    $scope.model = R.pipe(R.defaultTo({}), R.prop($scope.type), R.defaultTo({}), R.keys(), R.head())(entries);
    $scope.onModelChange();
  };
  $scope.onModelChange = function () {
    $scope.repeat = 1;
  };

  $scope.getEntries = function () {
    return R.path([$scope.faction, 'models', $scope.section, $scope.entry, 'entries'], $scope.factions);
  };
  $scope.getModel = function () {
    var entries = $scope.getEntries();
    if (R.isNil(entries)) {
      return R.path([$scope.faction, 'models', $scope.section, $scope.entry], $scope.factions);
    } else {
      return R.path([$scope.type, $scope.model], entries);
    }
  };

  function getModelPath() {
    var entries = $scope.getEntries();
    if (R.isNil(entries)) {
      return [$scope.faction, 'models', $scope.section, $scope.entry];
    } else {
      return [$scope.faction, 'models', $scope.section, $scope.entry, 'entries', $scope.type, $scope.model];
    }
  }
  $scope.doCreateModel = function () {
    var model_path = getModelPath();
    $scope.stateEvent('Game.model.create', model_path, $scope.repeat);
  };

  $scope.import = {
    list: null
  };
  $scope.doImportList = function () {
    // TODO : find min unit number for user
    $scope.stateEvent('Game.model.importList', $scope.import.list);
  };

  $scope.doImportModelsFile = function (files) {
    $scope.stateEvent('Game.model.importFile', files[0]);
  };
}]);
//# sourceMappingURL=modelCtrl.js.map
