'use strict';

angular.module('clickApp.directives').directive('clickGameCreateModel', ['gameFactions', 'gameMap', function (gameFactionsService, gameMapService) {
  return {
    restrict: 'A',
    link: function link(scope, parent) {
      var map = document.getElementById('map');
      var svgNS = map.namespaceURI;

      console.log('clickCreateModel', scope.index);
      var state = scope.state;
      var model = R.nth(scope.index, state.create.model.models);

      R.pipeP(gameFactionsService.getModelInfo$(model.info), function (info) {
        var element = createModelElement(info, document, svgNS, parent[0]);
        var is_flipped = gameMapService.isFlipped(map);
        setModelPosition(state.create.model.base, is_flipped, model, element);

        scope.onStateChangeEvent('Game.create.update', function () {
          if (R.isNil(R.path(['create', 'model'], state))) return;

          is_flipped = gameMapService.isFlipped(map);
          setModelPosition(state.create.model.base, is_flipped, model, element);
        }, scope);
      })(state.factions);
    }
  };
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
}]);
//# sourceMappingURL=gameCreateModel.js.map
