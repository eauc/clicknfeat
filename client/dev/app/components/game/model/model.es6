(function() {
  angular.module('clickApp.directives')
    .directive('clickGameModel', gameModelDirectiveFactory)
    .directive('clickGameModelsList', gameModelsListDirectiveFactory)
    .directive('clickGameUnderModel', gameUnderModelDirectiveFactory)
    .directive('clickGameUnderModelsList', gameUnderModelsListDirectiveFactory)
    .directive('clickGameOverModel', gameOverModelDirectiveFactory)
    .directive('clickGameOverModelsList', gameOverModelsListDirectiveFactory);

  gameModelDirectiveFactory.$inject = [
    'appState',
    'gameMap',
    'gameFactions',
    'model',
    'gameModels',
    'gameModelSelection',
  ];
  function gameModelDirectiveFactory(
    appStateService,
    gameMapService,
    gameFactionsModel,
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
      const state = scope.state;
      const model = scope.model;
      const info = R.thread(state.factions)(
        gameFactionsModel.getModelInfo$(model.state.info),
        R.defaultTo({ base_radius: 5.905 })
      );
      console.log('gameModel', scope.model, info);

      scope.onStateChangeEvent('Game.view.flipMap', onUpdate, scope);
      scope.onStateChangeEvent('Game.models.change', onUpdate, scope);
      scope.onStateChangeEvent('Game.model_selection.change', onUpdate, scope);
      scope.onStateChangeEvent(`Game.model.change.${model.state.stamp}`,
                               _onUpdate, scope);
      updateModel(scope);

      let _model;
      let _selection;
      let _is_flipped;
      function onUpdate() {
        const map = document.getElementById('map');
        const is_flipped = gameMapService.isFlipped(map);
        const state = appStateService.current();
        const selection = R.path(['game','model_selection'], state);
        const model = scope.model;
        if(_model === model &&
           _selection === selection &&
           _is_flipped === is_flipped) {
          return;
        }
        _model = model;
        _selection = selection;
        _is_flipped = is_flipped;

        _onUpdate();
      }
      function _onUpdate() {
        updateModel(scope);
        scope.$digest();
      }
    }
    function updateModel(scope) {
      const map = document.getElementById('map');
      const is_flipped = gameMapService.isFlipped(map);
      const model = scope.model;
      const stamp = model.state.stamp;
      const state = appStateService.current();

      const selection = R.path(['game','model_selection'], state);
      const local = gameModelSelectionModel
              .in('local', stamp, selection);
      const remote = gameModelSelectionModel
              .in('remote', stamp, selection);
      const single_local = gameModelSelectionModel
              .inSingle('local', stamp, selection);
      const single_remote = gameModelSelectionModel
              .inSingle('remote', stamp, selection);
      model.selection = {
        local,
        remote,
        single_local,
        single_remote
      };

      let charge_target;
      if(single_local) {
        const target_stamp = R.path(['state','cha','t'], model);
        if(R.exists(target_stamp)) {
          charge_target = gameModelsModel
            .findStamp(target_stamp, state.game.models);
          charge_target.info = gameFactionsModel
            .getModelInfo(charge_target.state.info, state.factions);
        }
      }

      model.render = modelModel
        .render({is_flipped, charge_target},
                state.factions, model.state);

      appStateService.emit(`Game.model.change.${stamp}.render`);
      console.warn('RENDER MODEL',
                   model.state.stamp,
                   model.render,
                   scope.selection);
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
      scope.digestOnStateChangeEvent('Game.models.change', scope);
      console.log('clickGameModelsList', scope.type);
    }
  }

  gameUnderModelDirectiveFactory.$inject = [];
  function gameUnderModelDirectiveFactory() {
    const clickGameUnderModelDirective = {
      restrict: 'A',
      link: link
    };
    return clickGameUnderModelDirective;

    function link(scope, _parent_) {
      const stamp = scope.model.state.stamp;
      console.log('gameUnderModel', stamp);

      scope.digestOnStateChangeEvent('Game.view.flipMap', scope);
      scope.digestOnStateChangeEvent(`Game.model.change.${stamp}.render`, scope);
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

    function link(scope) {
      scope.digestOnStateChangeEvent('Game.models.change', scope);
      console.log('clickGameModelsList', scope.type);
    }
  }

  gameOverModelDirectiveFactory.$inject = [];
  function gameOverModelDirectiveFactory() {
    const clickGameOverModelDirective = {
      restrict: 'A',
      link: link
    };
    return clickGameOverModelDirective;

    function link(scope, _parent_) {
      const stamp = scope.model.state.stamp;
      console.log('gameOverModel', stamp);

      scope.digestOnStateChangeEvent('Game.view.flipMap', scope);
      scope.digestOnStateChangeEvent(`Game.model.change.${stamp}.render`, scope);
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

    function link(scope) {
      scope.digestOnStateChangeEvent('Game.models.change', scope);
      console.log('clickGameModelsList', scope.type);
    }
  }
})();
