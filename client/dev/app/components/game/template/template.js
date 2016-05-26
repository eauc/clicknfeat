'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.directives').directive('clickGameTemplate', gameTemplateDirectiveFactory).directive('clickGameTemplatesList', gameTemplatesListDirectiveFactory);

  gameTemplateDirectiveFactory.$inject = ['appGame', 'gameMap', 'template', 'gameTemplates', 'gameTemplateSelection',
  // 'gameModels',
  'gameFactions'];
  function gameTemplateDirectiveFactory(appGameService, gameMapService, templateModel, gameTemplatesModel, gameTemplateSelectionModel // ,
  // gameModelsModel,
  // gameFactionsModel
  ) {
    var gameTemplateDirective = {
      restrict: 'A',
      scope: true,
      link: link
    };
    return gameTemplateDirective;

    function link(scope) {
      console.log('gameTemplate', scope.template);

      var stamp = scope.template.state.stamp;
      scope.listenSignal(refreshRender, appGameService.templates.flip_map, scope);
      scope.listenSignal(refreshSelection, appGameService.templates.selection_changes, scope);
      scope.listenSignal(onTemplatesChanges, appGameService.templates.changes, scope);
      mount();

      function onTemplatesChanges(_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var templates = _ref2[0];
        var stamps = _ref2[1];

        if (!R.find(R.equals(stamp), stamps)) return;

        refreshRender(templates);
      }

      function mount() {
        var templates = appGameService.templates.templates.sample();
        refreshRender(templates);

        var selection = appGameService.templates.selection.sample();
        refreshSelection(selection);

        //   if(local &&
        //      R.exists(template.state.o)) {
        //     R.thread(state.game.models)(
        //       gameModelsModel.findStamp$(template.state.o),
        //       R.unless(
        //         R.isNil,
        //         R.pipe(
        //         (origin) => [
        //           origin,
        //           gameFactionsModel.getModelInfo(origin.state.info, state.factions)
        //         ],
        //         ([origin, info]) => {
        //           scope.render.origin = {
        //             cx: origin.state.x,
        //             cy: origin.state.y,
        //             radius: info.base_radius
        //           };
        //         }
        //       )
        //     )
        //   );
        // }
      }

      function refreshRender(templates) {
        var template = gameTemplatesModel.findStamp(stamp, templates);
        if (R.isNil(template)) return;
        scope.template = template;

        var map = document.getElementById('map');
        var is_flipped = gameMapService.isFlipped(map);
        template.render = templateModel.render(is_flipped, template.state);

        console.warn('RENDER TEMPLATE', stamp, template.state, template.render);
      }
      function refreshSelection(selection) {
        var local = gameTemplateSelectionModel.in('local', stamp, selection);
        var remote = gameTemplateSelectionModel.in('remote', stamp, selection);
        var selected = local || remote;
        scope.selection = {
          local: local,
          remote: remote,
          selected: selected
        };
        console.warn('SELECTION TEMPLATE', stamp, selection, scope.selection);
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
      console.log('clickGameTemplatesList', scope.type);
    }
  }
})();
//# sourceMappingURL=template.js.map
