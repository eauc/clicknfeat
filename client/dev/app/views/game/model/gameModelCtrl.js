'use strict';

(function () {
  angular.module('clickApp.controllers').controller('gameModelCtrl', gameModelCtrl);

  gameModelCtrl.$inject = ['$scope', 'appData'];
  function gameModelCtrl($scope, appDataService) {
    var vm = this;
    console.log('init gameModelCtrl');

    vm.onFactionChange = onFactionChange;
    vm.onSectionChange = onSectionChange;
    vm.onEntryChange = onEntryChange;
    vm.onTypeChange = onTypeChange;
    vm.onModelChange = onModelChange;

    vm.getEntries = getEntries;
    vm.getModel = getModel;

    vm.doCreateModel = doCreateModel;
    vm.doImportList = doImportList;
    vm.doImportModelsFile = doImportModelsFile;

    activate();

    function activate() {
      vm.import_list = null;
      $scope.bindCell(function (factions) {
        if (R.isNil(factions)) return;
        vm.faction = R.head(R.keys(factions.current));
        if (R.isNil(vm.faction)) return;
        vm.onFactionChange();
      }, appDataService.factions, $scope);
    }

    function onFactionChange() {
      vm.section = R.head(R.keys($scope.state.factions.current[vm.faction].models));
      vm.onSectionChange();
    }
    function onSectionChange() {
      vm.entry = R.head(R.keys($scope.state.factions.current[vm.faction].models[vm.section]));
      vm.onEntryChange();
    }
    function onEntryChange() {
      var entries = vm.getEntries();
      if (R.isNil(entries)) {
        vm.model = $scope.entry;
        vm.onModelChange();
        return;
      }
      vm.type = R.head(R.keys(entries));
      vm.onTypeChange();
    }
    function onTypeChange() {
      var entries = vm.getEntries();
      vm.model = R.thread(entries)(R.defaultTo({}), R.prop(vm.type), R.defaultTo({}), R.keys(), R.head());
      vm.onModelChange();
    }
    function onModelChange() {
      vm.repeat = 1;
    }
    function getEntries() {
      return R.path([vm.faction, 'models', vm.section, vm.entry, 'entries'], R.pathOr({}, ['state', 'factions', 'current'], $scope));
    }
    function getModel() {
      var entries = vm.getEntries();
      if (R.isNil(entries)) {
        return R.path([vm.faction, 'models', vm.section, vm.entry], R.pathOr({}, ['state', 'factions', 'current'], $scope));
      } else {
        return R.path([vm.type, vm.model], entries);
      }
    }
    function getModelPath() {
      var entries = vm.getEntries();
      if (R.isNil(entries)) {
        return [vm.faction, 'models', vm.section, vm.entry];
      } else {
        return [vm.faction, 'models', vm.section, vm.entry, 'entries', vm.type, vm.model];
      }
    }
    function doCreateModel() {
      var model_path = getModelPath();
      $scope.sendAction('Game.model.create', model_path, vm.repeat);
    }
    function doImportList() {
      // TODO : find min unit number for user
      $scope.sendAction('Game.model.importList', vm.import_list);
    }
    function doImportModelsFile(files) {
      $scope.sendAction('Game.model.importFile', files[0]);
    }
  }
})();
//# sourceMappingURL=gameModelCtrl.js.map
