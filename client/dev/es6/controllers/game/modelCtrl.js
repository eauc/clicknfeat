angular.module('clickApp.controllers')
  .controller('gameModelCtrl', [
    '$scope',
    function($scope) {
      console.log('init gameModelCtrl');

      function updateFactions() {
        $scope.factions = R.path(['state','factions','current'], $scope);
        $scope.faction = R.head(R.keys($scope.factions));
        $scope.onFactionChange();
        $scope.$digest();
      }
      $scope.state.data_ready.then(updateFactions);
      
      $scope.onFactionChange = () => {
        $scope.section = R.head(R.keys($scope.factions[$scope.faction].models));
        $scope.onSectionChange();
      };
      $scope.onSectionChange = () => {
        $scope.entry = R.head(R.keys($scope.factions[$scope.faction].models[$scope.section]));
        $scope.onEntryChange();
      };
      $scope.onEntryChange = () => {
        var entries = $scope.getEntries();
        if(R.isNil(entries)) {
          $scope.model = $scope.entry;
          $scope.onModelChange();
          return;
        }
        $scope.type = R.head(R.keys(entries));
        $scope.onTypeChange();
      };
      $scope.onTypeChange = () => {
        var entries = $scope.getEntries();
        $scope.model = R.pipe(
          R.defaultTo({}),
          R.prop($scope.type),
          R.defaultTo({}),
          R.keys(),
          R.head()
        )(entries);
        $scope.onModelChange();
      };
      $scope.onModelChange = () => {
        $scope.repeat = 1;
      };

      $scope.getEntries = () => {
        return R.path([ $scope.faction,
                        'models',
                        $scope.section,
                        $scope.entry,
                        'entries'
                      ], $scope.factions);
      };
      $scope.getModel = () => {
        var entries = $scope.getEntries();
        if(R.isNil(entries)) {
          return R.path([ $scope.faction,
                          'models',
                          $scope.section,
                          $scope.entry
                        ], $scope.factions);
        }
        else {
          return R.path([ $scope.type,
                          $scope.model
                        ], entries);
        }
      };

      function getModelPath() {
        var entries = $scope.getEntries();
        if(R.isNil(entries)) {
          return [ $scope.faction,
                   'models',
                   $scope.section,
                   $scope.entry
                 ];
        }
        else {
          return [ $scope.faction,
                   'models',
                   $scope.section,
                   $scope.entry,
                   'entries',
                   $scope.type,
                   $scope.model
                 ];
        }
      }
      $scope.doCreateModel = () => {
        let model_path = getModelPath();
        $scope.stateEvent('Game.model.create',
                          model_path, $scope.repeat);
      };

      $scope.import = {
        list: null
      };
      $scope.doImportList = () => {
        // TODO : find min unit number for user
        $scope.stateEvent('Game.model.importList', $scope.import.list);
      };

      $scope.doImportModelsFile = (files) => {
        $scope.stateEvent('Game.model.importFile', files[0]);
      };
    }
  ]);
