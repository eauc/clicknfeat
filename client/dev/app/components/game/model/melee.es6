(function() {
  angular.module('clickApp.directives')
    .factory('clickGameModelMelee', gameModelMeleeModelFactory);

  gameModelMeleeModelFactory.$inject = [
    'model',
  ];
  function gameModelMeleeModelFactory(modelModel) {
    return {
      create: gameModelMeleeCreate,
      update: gameModeMeleeUpdate
    };

    function gameModelMeleeCreate(svgNS, parent) {
      const melee = document.createElementNS(svgNS, 'path');
      melee.classList.add('model-melee');
      melee.setAttribute('d', '');
      parent.appendChild(melee);

      const reach = document.createElementNS(svgNS, 'path');
      reach.classList.add('model-melee');
      reach.setAttribute('d', '');
      parent.appendChild(reach);

      const strike = document.createElementNS(svgNS, 'path');
      strike.classList.add('model-melee');
      strike.setAttribute('d', '');
      parent.appendChild(strike);

      return [ melee, reach, strike ];
    }
    function gameModeMeleeUpdate(info, model, img, element) {
      const [ melee, reach, strike ] = element;
      let path;
      if(modelModel.isMeleeDisplayed('mm', model)) {
        path = computeMeleePath(5, img, info);
        melee.setAttribute('d', path);
        melee.style.visibility = 'visible';
      }
      else {
        melee.style.visibility = 'hidden';
      }
      if(modelModel.isMeleeDisplayed('mr', model)) {
        path = computeMeleePath(20, img, info);
        reach.setAttribute('d', path);
        reach.style.visibility = 'visible';
      }
      else {
        reach.style.visibility = 'hidden';
      }
      if(modelModel.isMeleeDisplayed('ms', model)) {
        path = computeMeleePath(40, img, info);
        strike.setAttribute('d', path);
        strike.style.visibility = 'visible';
      }
      else {
        strike.style.visibility = 'hidden';
      }
    }
    function computeMeleePath(size, img, info) {
      return [
        'M',img.width/2-info.base_radius-size,',',img.height/2,' ',

        'L',img.width/2+info.base_radius+size,',',img.height/2,' ',

        'A',info.base_radius+size,',',info.base_radius+size,' 0 0,0 ',
        img.width/2-info.base_radius-size,',',img.height/2,' ',

        'M',img.width/2,',',img.height/2,' ',

        'L',img.width/2,',',img.height/2-info.base_radius-size,' ',
      ].join('');
    }
  }
})();
