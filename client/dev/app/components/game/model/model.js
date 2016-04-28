'use strict';

(function () {
  angular.module('clickApp.directives').directive('clickGameModel', gameModelDirectiveFactory).directive('clickGameModelsList', gameModelsListDirectiveFactory).directive('clickGameUnderModel', gameUnderModelDirectiveFactory).directive('clickGameUnderModelsList', gameUnderModelsListDirectiveFactory).directive('clickGameOverModel', gameOverModelDirectiveFactory).directive('clickGameOverModelsList', gameOverModelsListDirectiveFactory);

  gameModelDirectiveFactory.$inject = ['appState', 'gameMap', 'gameFactions', 'model', 'gameModels', 'gameModelSelection'];
  function gameModelDirectiveFactory(appStateService, gameMapService, gameFactionsModel, modelModel, gameModelsModel, gameModelSelectionModel) {
    var clickGameModelDirective = {
      restrict: 'A',
      link: link
    };
    return clickGameModelDirective;

    function link(scope, _parent_) {
      var state = scope.state;
      var model = scope.model;
      var info = R.thread(state.factions)(gameFactionsModel.getModelInfo$(model.state.info), R.defaultTo({ base_radius: 5.905 }));
      console.log('gameModel', scope.model, info);

      scope.onStateChangeEvent('Game.view.flipMap', onUpdate, scope);
      scope.onStateChangeEvent('Game.models.change', onUpdate, scope);
      scope.onStateChangeEvent('Game.model_selection.change', onUpdate, scope);
      scope.onStateChangeEvent('Game.model.change.' + model.state.stamp, _onUpdate, scope);
      updateModel(scope);

      var _model = undefined;
      var _selection = undefined;
      var _is_flipped = undefined;
      function onUpdate() {
        var map = document.getElementById('map');
        var is_flipped = gameMapService.isFlipped(map);
        var state = appStateService.current();
        var selection = R.path(['game', 'model_selection'], state);
        var model = scope.model;
        if (_model === model && _selection === selection && _is_flipped === is_flipped) {
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
      var map = document.getElementById('map');
      var is_flipped = gameMapService.isFlipped(map);
      var model = scope.model;
      var stamp = model.state.stamp;
      var state = appStateService.current();

      var selection = R.path(['game', 'model_selection'], state);
      var local = gameModelSelectionModel.in('local', stamp, selection);
      var remote = gameModelSelectionModel.in('remote', stamp, selection);
      var single_local = gameModelSelectionModel.inSingle('local', stamp, selection);
      var single_remote = gameModelSelectionModel.inSingle('remote', stamp, selection);
      model.selection = {
        local: local,
        remote: remote,
        single_local: single_local,
        single_remote: single_remote
      };

      var charge_target = undefined;
      if (single_local) {
        var target_stamp = R.path(['state', 'cha', 't'], model);
        if (R.exists(target_stamp)) {
          charge_target = gameModelsModel.findStamp(target_stamp, state.game.models);
          charge_target.info = gameFactionsModel.getModelInfo(charge_target.state.info, state.factions);
        }
      }

      model.render = modelModel.render({ is_flipped: is_flipped, charge_target: charge_target }, state.factions, model.state);

      appStateService.emit('Game.model.change.' + stamp + '.render');
      console.warn('RENDER MODEL', model.state.stamp, model.render, scope.selection);
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
    var clickGameUnderModelDirective = {
      restrict: 'A',
      link: link
    };
    return clickGameUnderModelDirective;

    function link(scope, _parent_) {
      var stamp = scope.model.state.stamp;
      console.log('gameUnderModel', stamp);

      scope.digestOnStateChangeEvent('Game.view.flipMap', scope);
      scope.digestOnStateChangeEvent('Game.model.change.' + stamp + '.render', scope);
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
    var clickGameOverModelDirective = {
      restrict: 'A',
      link: link
    };
    return clickGameOverModelDirective;

    function link(scope, _parent_) {
      var stamp = scope.model.state.stamp;
      console.log('gameOverModel', stamp);

      scope.digestOnStateChangeEvent('Game.view.flipMap', scope);
      scope.digestOnStateChangeEvent('Game.model.change.' + stamp + '.render', scope);
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
//# sourceMappingURL=model.js.map
