angular.module('clickApp.directives')
  .factory('clickGameModelMelee', [
    'model',
    function(modelService) {
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
      return {
        create: function clickGameModelMeleeCreate(svgNS, parent) {
          let melee = document.createElementNS(svgNS, 'path');
          melee.classList.add('model-melee');
          melee.setAttribute('d', '');
          parent.appendChild(melee);

          let reach = document.createElementNS(svgNS, 'path');
          reach.classList.add('model-melee');
          reach.setAttribute('d', '');
          parent.appendChild(reach);

          let strike = document.createElementNS(svgNS, 'path');
          strike.classList.add('model-melee');
          strike.setAttribute('d', '');
          parent.appendChild(strike);

          return [ melee, reach, strike ];
        },
        update: function clickGameModeMeleeUpdate(info, model, img, element) {
          let [ melee, reach, strike ] = element;
          let path;
          if(modelService.isMeleeDisplayed('mm', model)) {
            path = computeMeleePath(5, img, info);
            melee.setAttribute('d', path);
            melee.style.visibility = 'visible';
          }
          else {
            melee.style.visibility = 'hidden';
          }
          if(modelService.isMeleeDisplayed('mr', model)) {
            path = computeMeleePath(20, img, info);
            reach.setAttribute('d', path);
            reach.style.visibility = 'visible';
          }
          else {
            reach.style.visibility = 'hidden';
          }
          if(modelService.isMeleeDisplayed('ms', model)) {
            path = computeMeleePath(40, img, info);
            strike.setAttribute('d', path);
            strike.style.visibility = 'visible';
          }
          else {
            strike.style.visibility = 'hidden';
          }
        }
      };
    }
  ]);
