(function() {
  angular.module('clickApp.directives')
    .directive('clickGameCreateTemplate', gameCreateTemplateDirectiveFactory);

  gameCreateTemplateDirectiveFactory.$inject = [
    'gameMap',
  ];
  function gameCreateTemplateDirectiveFactory(gameMapService) {
    const templates = {
      aoe: {
        create: createAoE,
        setPosition: setAoEPosition
      },
      spray: {
        create: createSpray,
        setPosition: setSprayPosition
      },
      wall: {
        create: createWall,
        setPosition: setWallPosition
      }
    };
    const gameCreateTemplateDirective = {
      restrict: 'A',
      link: link
    };
    return gameCreateTemplateDirective;

    function link(scope, parent) {
      const map = document.getElementById('map');
      const svgNS = map.namespaceURI;

      console.log('clickCreateTemplate', scope.index);
      const state = scope.state;
      const template = R.nth(scope.index, state.create.templates);
      const type = template.type;

      const element = templates[type].create(document, svgNS, parent[0]);
      const is_flipped = gameMapService.isFlipped(map);
      templates[type].setPosition(state.create.base,
                                  is_flipped, template, element);

      scope.onStateChangeEvent('Game.create.update', onUpdate, scope);

      function onUpdate() {
        if(R.isNil(R.path(['create','templates'], state))) return;

        const is_flipped = gameMapService.isFlipped(map);
        templates[type].setPosition(state.create.base,
                                    is_flipped, template, element);
      }
    }
    function createAoE(document, svgNS, parent) {
      const aoe = document.createElementNS(svgNS, 'circle');
      aoe.classList.add('create-template-aoe');
      aoe.setAttribute('cx', '240');
      aoe.setAttribute('cy', '240');
      aoe.setAttribute('r', '15');
      parent.appendChild(aoe);
      return aoe;
    }
    function setAoEPosition(base, is_flipped, template, element) {
      const coeff = is_flipped ? -1 : 1;
      element.setAttribute('cx', (base.x + coeff * template.x)+'');
      element.setAttribute('cy', (base.y + coeff * template.y)+'');
    }
    function createSpray(document, svgNS, parent) {
      const sp = document.createElementNS(svgNS, 'polygon');
      sp.classList.add('create-template-spray');
      sp.setAttribute('points', '8.75,0 5.125,-59 10,-60 14.875,-59 11.25,0');
      sp.setAttribute('transform', 'translate(230,240)');
      parent.appendChild(sp);
      return sp;
    }
    function setSprayPosition(base, is_flipped, template, element) {
      const coeff = is_flipped ? -1 : 1;
      element.setAttribute('transform', [
        'translate(',
        (base.x + coeff * template.x)-10,
        ',',
        (base.y + coeff * template.y),
        ')',
      ].join(''));
    }
    function createWall(document, svgNS, parent) {
      const wall = document.createElementNS(svgNS, 'rect');
      wall.classList.add('create-template-wall');
      wall.setAttribute('x', '220');
      wall.setAttribute('y', '236.25');
      wall.setAttribute('width', '40');
      wall.setAttribute('height', '7.5');
      parent.appendChild(wall);
      return wall;
    }
    function setWallPosition(base, is_flipped, template, element) {
      var coeff = is_flipped ? -1 : 1;
      element.setAttribute('x', ((base.x + coeff * template.x)-20)+'');
      element.setAttribute('y', ((base.y + coeff * template.y)-3.75)+'');
    }
  }
})();
