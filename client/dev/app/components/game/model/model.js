'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.directives').directive('clickGameModel', gameModelDirectiveFactory).directive('clickGameModelsList', gameModelsListDirectiveFactory).directive('clickGameUnderModelsList', gameUnderModelsListDirectiveFactory).directive('clickGameOverModelsList', gameOverModelsListDirectiveFactory);

  gameModelDirectiveFactory.$inject = ['appGame', 'gameMap', 'model', 'gameModels', 'gameModelSelection'];
  function gameModelDirectiveFactory(appGameService, gameMapService, modelModel, gameModelsModel, gameModelSelectionModel) {
    var clickGameModelDirective = {
      restrict: 'A',
      link: link
    };
    return clickGameModelDirective;

    function link(scope, _parent_) {
      console.log('gameModel', scope.model);

      var stamp = scope.model.state.stamp;
      scope.listenSignal(refreshRender, appGameService.models.flip_map, scope);
      scope.listenSignal(onModelSelectionChanges, appGameService.models.selection_changes, scope);
      scope.listenSignal(onModelsChanges, appGameService.models.changes, scope);
      mount();

      function onModelsChanges(_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var models = _ref2[0];
        var stamps = _ref2[1];

        if (!R.find(R.equals(stamp), stamps)) return;

        refreshRender(models);
      }
      function onModelSelectionChanges(_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2);

        var selection = _ref4[0];
        var stamps = _ref4[1];

        if (!R.find(R.equals(stamp), stamps)) return;

        refreshSelection(selection);
      }

      function mount() {
        var models = appGameService.models.models.sample();
        refreshRender(models);

        var selection = appGameService.models.selection.sample();
        refreshSelection(selection);
      }

      function refreshRender(models) {
        var model = gameModelsModel.findStamp(stamp, models);
        if (R.isNil(model)) return;
        scope.model = model;

        var map = document.getElementById('map');
        var is_flipped = gameMapService.isFlipped(map);

        var charge_target = undefined;
        var target_stamp = R.path(['state', 'cha', 't'], model);
        if (R.exists(target_stamp)) {
          charge_target = gameModelsModel.findStamp(target_stamp, models);
        }
        model.render = modelModel.render({ is_flipped: is_flipped, charge_target: charge_target }, model.info, model.state);
        console.warn('RENDER MODEL', stamp, model.state, model.render);
      }
      function refreshSelection(selection) {
        var local = gameModelSelectionModel.in('local', stamp, selection);
        var remote = gameModelSelectionModel.in('remote', stamp, selection);
        var single_local = gameModelSelectionModel.inSingle('local', stamp, selection);
        var single_remote = gameModelSelectionModel.inSingle('remote', stamp, selection);
        scope.model.selection = {
          local: local,
          remote: remote,
          single_local: single_local,
          single_remote: single_remote
        };
        console.warn('SELECTION MODEL', stamp, selection, scope.selection);
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
//# sourceMappingURL=model.js.map
