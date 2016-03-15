(function() {
  angular.module('clickApp.directives')
    .directive('clickGameCreateModel', gameCreateModelDirectiveFactory);

  gameCreateModelDirectiveFactory.$inject = [
    'gameFactions',
    'gameMap',
  ];
  function gameCreateModelDirectiveFactory(gameFactionsService,
                                           gameMapService) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, parent) {
      const map = document.getElementById('map');
      const svgNS = map.namespaceURI;

      console.log('clickCreateModel', scope.index);
      const state = scope.state;
      const model = R.nth(scope.index, state.create.models);
      let element;

      R.threadP(state.factions)(
        gameFactionsService.getModelInfoP$(model.info),
        (info) => {
          element = createModelElement(info, document, svgNS, parent[0]);
          updateCreateModel();

          scope.onStateChangeEvent('Game.create.update', updateCreateModel, scope);
        }
      )(state.factions);

      function updateCreateModel() {
        if(R.isNil(R.path(['create','models'], state))) return;

        const is_flipped = gameMapService.isFlipped(map);
        setModelPosition(state.create.base, is_flipped, model, element);
      }
    }
    function createModelElement(info, document, svgNS, parent) {
      const element = document.createElementNS(svgNS, 'circle');
      element.classList.add('create-model');
      element.setAttribute('cx', '240');
      element.setAttribute('cy', '240');
      element.setAttribute('r', info.base_radius);
      parent.appendChild(element);
      return element;
    }
    function setModelPosition(base, is_flipped, model, element) {
      const coeff = is_flipped ? -1 : 1;
      element.setAttribute('cx', (base.x + coeff * model.x)+'');
      element.setAttribute('cy', (base.y + coeff * model.y)+'');
    }
  }
})();
