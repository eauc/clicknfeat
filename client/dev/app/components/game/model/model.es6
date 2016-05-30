(function() {
  angular.module('clickApp.directives')
    .directive('clickGameModel', gameModelDirectiveFactory)
    .directive('clickGameModelsList', gameModelsListDirectiveFactory)
    .directive('clickGameUnderModelsList', gameUnderModelsListDirectiveFactory)
    .directive('clickGameOverModelsList', gameOverModelsListDirectiveFactory);

  gameModelDirectiveFactory.$inject = [
    'appGame',
    'gameMap',
    'model',
    'gameModels',
    'gameModelSelection',
  ];
  function gameModelDirectiveFactory(
    appGameService,
    gameMapService,
    modelModel,
    gameModelsModel,
    gameModelSelectionModel
  ) {
    const clickGameModelDirective = {
      restrict: 'A',
      link: link
    };
    return clickGameModelDirective;

    function link(scope, _parent_) {
      console.log('gameModel', scope.model);

      const stamp = scope.model.state.stamp;
      scope.listenSignal(refreshRender,
                         appGameService.models.flip_map,
                         scope);
      scope.listenSignal(onModelSelectionChanges,
                         appGameService.models.selection_changes,
                         scope);
      scope.listenSignal(onModelsChanges,
                         appGameService.models.changes,
                         scope);
      mount();

      function onModelsChanges([models, stamps]) {
        if(!R.find(R.equals(stamp), stamps)) return;

        refreshRender(models);
      }
      function onModelSelectionChanges([selection, stamps]) {
        if(!R.find(R.equals(stamp), stamps)) return;

        refreshSelection(selection);
      }

      function mount() {
        const models = appGameService.models.models.sample();
        refreshRender(models);

        const selection = appGameService.models.selection.sample();
        refreshSelection(selection);
      }

      function refreshRender(models) {
        const model = gameModelsModel.findStamp(stamp, models);
        if(R.isNil(model)) return;
        scope.model = model;

        const map = document.getElementById('map');
        const is_flipped = gameMapService.isFlipped(map);

        let charge_target;
        const target_stamp = R.path(['state','cha','t'], model);
        if(R.exists(target_stamp)) {
          charge_target = gameModelsModel
            .findStamp(target_stamp, models);
        }
        model.render = modelModel
          .render({is_flipped, charge_target},
                  model.info, model.state);
        console.warn('RENDER MODEL',
                     stamp, model.state, model.render);
      }
      function refreshSelection(selection) {
        const local = gameModelSelectionModel
                .in('local', stamp, selection);
        const remote = gameModelSelectionModel
                .in('remote', stamp, selection);
        const single_local = gameModelSelectionModel
                .inSingle('local', stamp, selection);
        const single_remote = gameModelSelectionModel
                .inSingle('remote', stamp, selection);
        scope.model.selection = {
          local,
          remote,
          single_local,
          single_remote
        };
        console.warn('SELECTION MODEL',
                     stamp, selection, scope.selection);
      }
    }
  }

  gameModelsListDirectiveFactory.$inject = [];
  function gameModelsListDirectiveFactory() {
    return {
      restrict: 'A',
      templateUrl: 'app/components/game/model/models_list.html',
      scope: true,
      link: link
    };

    function link(scope, element) {
      scope.type = element[0].getAttribute('click-game-models-list');
      console.log('clickGameModelsList', scope.type);
    }
  }

  gameUnderModelsListDirectiveFactory.$inject = [];
  function gameUnderModelsListDirectiveFactory() {
    return {
      restrict: 'A',
      templateUrl: 'app/components/game/model/under_models_list.html',
      scope: true,
      link: link
    };

    function link(scope, element) {
      scope.type = element[0].getAttribute('click-game-under-models-list');
      console.log('clickGameUnderModelsList', scope.type);
    }
  }

  gameOverModelsListDirectiveFactory.$inject = [];
  function gameOverModelsListDirectiveFactory() {
    return {
      restrict: 'A',
      templateUrl: 'app/components/game/model/over_models_list.html',
      scope: true,
      link: link
    };

    function link(scope, element) {
      scope.type = element[0].getAttribute('click-game-over-models-list');
      console.log('clickGameOverModelsList', scope.type);
    }
  }
})();
