(function() {
  angular.module('clickApp.directives')
    .factory('clickGameModelIcon', gameModelIconModelFactory);

  gameModelIconModelFactory.$inject = [
    'model',
  ];
  function gameModelIconModelFactory(modelService) {
    const EFFECTS = [
      [ 'b' , '/data/icons/Blind.png'      ],
      [ 'c' , '/data/icons/Corrosion.png'  ],
      [ 'd' , '/data/icons/BoltBlue.png'   ],
      [ 'f' , '/data/icons/Fire.png'       ],
      [ 'e' , '/data/icons/BoltYellow.png' ],
      [ 'k' , '/data/icons/KD.png'         ],
      [ 't' , '/data/icons/Stationary.png' ],
    ];

    return {
      create: gameModelIconsCreate,
      update: gameModelIconsUpdate
    };

    function gameModelIconsCreate(svgNS, parent) {
      const effects = R.reduce((mem, effect) => {
        const image = document.createElementNS(svgNS, 'image');
        image.classList.add('model-image');
        image.setAttribute('x', '0');
        image.setAttribute('y', '0');
        image.setAttribute('width', '10');
        image.setAttribute('height', '10');
        image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', effect[1]);
        image.style.visibility = 'hidden';
        parent.appendChild(image);
        return R.assoc(effect[0], image, mem);
      }, {}, EFFECTS);

      const leader = document.createElementNS(svgNS, 'image');
      leader.classList.add('model-image');
      leader.setAttribute('x', '0');
      leader.setAttribute('y', '0');
      leader.setAttribute('width', '10');
      leader.setAttribute('height', '10');
      leader.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '/data/icons/Leader.png');
      parent.appendChild(leader);

      const lock = document.createElementNS(svgNS, 'image');
      lock.classList.add('model-image');
      lock.setAttribute('x', '0');
      lock.setAttribute('y', '0');
      lock.setAttribute('width', '10');
      lock.setAttribute('height', '10');
      lock.setAttributeNS('http://www.w3.org/1999/xlink',
                          'href', '/data/icons/Lock.png');
      lock.style.visibility = 'visible';
      parent.appendChild(lock);

      return [ effects, leader, lock ];
    }
    function gameModelIconsUpdate(info, model, img, element) {
      const [ effects, leader, lock ] = element;

      R.thread(effects)(
        R.keys,
        R.filter((effect) => modelService.isEffectDisplayed(effect, model)),
        (actives) => {
          const base_x = img.width / 2 - (R.length(actives) * 10 / 2);
          const base_y = img.height / 2 + info.base_radius + 1;
          R.addIndex(R.forEach)((effect, i) => {
            effects[effect].setAttribute('x', (base_x + i * 10)+'');
            effects[effect].setAttribute('y', (base_y)+'');
            effects[effect].style.visibility = 'visible';
          }, actives);
        }
      );
      R.thread(effects)(
        R.keys,
        R.reject((effect) => modelService.isEffectDisplayed(effect, model)),
        R.forEach((effect) => {
          effects[effect].style.visibility = 'hidden';
        })
      );

      leader.setAttribute('x', (img.width / 2 - 0.7 * info.base_radius - 5)+'');
      leader.setAttribute('y', (img.height / 2 - 0.7 * info.base_radius - 5)+'');
      if(modelService.isLeaderDisplayed(model)) {
        leader.style.visibility = 'visible';
      }
      else {
        leader.style.visibility = 'hidden';
      }

      if(!modelService.isLocked(model)) {
        lock.style.visibility = 'hidden';
        return;
      }
      lock.setAttribute('x', (img.width/2+info.base_radius-5)+'');
      lock.setAttribute('y', (img.height/2-5)+'');
      lock.style.visibility = 'visible';
    }
  }
})();
