angular.module('clickApp.controllers')
  .controller('gameModelCtrl', [
    '$scope',
    'modes',
    'fileImport',
    'gameFactions',
    function($scope,
             modesService,
             fileImportService,
             gameFactionsService) {
      console.log('init gameModelCtrl');

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
      $scope.data_ready.then(() => {
        $scope.faction = R.head(R.keys($scope.factions));
        $scope.onFactionChange();
      });

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
        var model_path = getModelPath();
        $scope.create.model = {
          base: { x: 240, y: 240, r: 0 },
          models: R.times((i) => {
            return {
              info: model_path,
              user: R.pathOr('Unknown', ['user','state','name'], $scope),
              x: 20*i, y: 0, r: 0
            };
          }, R.defaultTo(1, $scope.repeat))
        };
        $scope.doSwitchToMode('CreateModel');
      };

      $scope.import = {
        list: null
      };
      $scope.doImportList = () => {
        // TODO : find min unit number for user
        let user = R.pathOr('Unknown', ['user','state','name'], $scope);
        $scope.create.model = gameFactionsService
          .buildModelsList($scope.import.list, user,
                           $scope.factions_references);
        console.log('doImportList',
                    $scope.import.list,
                    $scope.create.model);
        $scope.doSwitchToMode('CreateModel');
      };
      
      $scope.doImportModelsFile = (files) => {
        console.log('doImportModelsFile', files);
        R.pipeP(
          fileImportService.read$('json'),
          (create) => {
            $scope.create.model = create;
            $scope.doSwitchToMode('CreateModel');
          }
        )(files[0])
          .catch((reason) => {
            $scope.gameEvent('modeActionError', reason);
            return self.Promise.reject(reason);
          });
      };
    }
  ]);
