'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.directives').directive('clickGameTemplate', gameTemplateDirectiveFactory).directive('clickGameTemplatesList', gameTemplatesListDirectiveFactory);

  gameTemplateDirectiveFactory.$inject = ['appState', 'gameMap', 'template', 'gameTemplateSelection', 'gameModels', 'gameFactions'];
  function gameTemplateDirectiveFactory(appStateService, gameMapService, templateModel, gameTemplateSelectionModel, gameModelsModel, gameFactionsModel) {
    var gameTemplateDirective = {
      restrict: 'A',
      scope: true,
      link: link
    };
    return gameTemplateDirective;

    function link(scope) {
      console.log('gameTemplate', scope.template);

      var template = scope.template;
      scope.onStateChangeEvent('Game.view.flipMap', onUpdate, scope);
      scope.onStateChangeEvent('Game.templates.change', onUpdate, scope);
      scope.onStateChangeEvent('Game.template_selection.change', onUpdate, scope);
      scope.onStateChangeEvent('Game.template.change.' + template.state.stamp, _onUpdate, scope);
      updateTemplate(scope);

      var _template = undefined;
      var _selection = undefined;
      var _is_flipped = undefined;
      function onUpdate() {
        var map = document.getElementById('map');
        var is_flipped = gameMapService.isFlipped(map);
        var state = appStateService.current();
        var selection = R.path(['game', 'template_selection'], state);
        var template = scope.template;
        if (_template === template && _selection === selection && _is_flipped === is_flipped) {
          return;
        }
        _template = template;
        _selection = selection;
        _is_flipped = is_flipped;

        _onUpdate();
      }
      function _onUpdate() {
        updateTemplate(scope);
        scope.$digest();
      }
    }

    function updateTemplate(scope) {
      var map = document.getElementById('map');
      var is_flipped = gameMapService.isFlipped(map);
      var template = scope.template;
      console.warn('RENDER TEMPLATE', template.state.stamp);
      scope.render = templateModel.render(is_flipped, template.state);

      var state = appStateService.current();
      var selection = R.path(['game', 'template_selection'], state);
      var stamp = template.state.stamp;
      var local = gameTemplateSelectionModel.in('local', stamp, selection);
      var remote = gameTemplateSelectionModel.in('remote', stamp, selection);
      var selected = local || remote;
      scope.selection = {
        local: local,
        remote: remote,
        selected: selected
      };

      if (local && R.exists(template.state.o)) {
        R.thread(state.game.models)(gameModelsModel.findStamp$(template.state.o), R.unless(R.isNil, R.pipe(function (origin) {
          return [origin, gameFactionsModel.getModelInfo(origin.state.info, state.factions)];
        }, function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2);

          var origin = _ref2[0];
          var info = _ref2[1];

          scope.render.origin = {
            cx: origin.state.x,
            cy: origin.state.y,
            radius: info.base_radius
          };
        })));
      }
    }
  }

  gameTemplatesListDirectiveFactory.$inject = [];
  function gameTemplatesListDirectiveFactory() {
    var gameTemplatesListDirective = {
      restrict: 'A',
      templateUrl: 'app/components/game/template/templates_list.html',
      scope: true,
      link: link
    };
    return gameTemplatesListDirective;

    function link(scope, element) {
      scope.type = element[0].getAttribute('click-game-templates-list');
      scope.digestOnStateChangeEvent('Game.templates.change', scope);
      console.log('clickGameTemplatesList', scope.type);
    }
  }
})();
//# sourceMappingURL=template.js.map
