'use strict';

(function () {
  angular.module('clickApp.directives').directive('clickGameCreateModel', gameCreateModelDirectiveFactory);

  gameCreateModelDirectiveFactory.$inject = ['gameFactions', 'gameMap'];
  function gameCreateModelDirectiveFactory(gameFactionsService, gameMapService) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, parent) {
      var map = document.getElementById('map');
      var svgNS = map.namespaceURI;

      console.log('clickCreateModel', scope.index);
      var state = scope.state;
      var model = R.nth(scope.index, state.create.models);
      var element = undefined;

      R.threadP(state.factions)(gameFactionsService.getModelInfoP$(model.info), function (info) {
        element = createModelElement(info, document, svgNS, parent[0]);
        updateCreateModel();

        scope.onStateChangeEvent('Game.create.update', updateCreateModel, scope);
      })(state.factions);

      function updateCreateModel() {
        if (R.isNil(R.path(['create', 'models'], state))) return;

        var is_flipped = gameMapService.isFlipped(map);
        setModelPosition(state.create.base, is_flipped, model, element);
      }
    }
    function createModelElement(info, document, svgNS, parent) {
      var element = document.createElementNS(svgNS, 'circle');
      element.classList.add('create-model');
      element.setAttribute('cx', '240');
      element.setAttribute('cy', '240');
      element.setAttribute('r', info.base_radius);
      parent.appendChild(element);
      return element;
    }
    function setModelPosition(base, is_flipped, model, element) {
      var coeff = is_flipped ? -1 : 1;
      element.setAttribute('cx', base.x + coeff * model.x + '');
      element.setAttribute('cy', base.y + coeff * model.y + '');
    }
  }
})();
//# sourceMappingURL=createModel.js.map
