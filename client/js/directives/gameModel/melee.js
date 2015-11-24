'use strict';

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
          var melee = document.createElementNS(svgNS, 'path');
          melee.classList.add('model-melee');
          melee.setAttribute('d', '');
          parent.appendChild(melee);

          var reach = document.createElementNS(svgNS, 'path');
          reach.classList.add('model-melee');
          reach.setAttribute('d', '');
          parent.appendChild(reach);

          var strike = document.createElementNS(svgNS, 'path');
          strike.classList.add('model-melee');
          strike.setAttribute('d', '');
          parent.appendChild(strike);

          return [ melee, reach, strike ];
        },
        update: function clickGameModeMeleeUpdate(info, model, img, el) {
          var path;
          var melee = el[0];
          if(modelService.isMeleeDisplayed('mm', model)) {
            path = computeMeleePath(5, img, info);
            melee.setAttribute('d', path);
            melee.style.visibility = 'visible';
          }
          else {
            melee.style.visibility = 'hidden';
          }
          var reach = el[1];
          if(modelService.isMeleeDisplayed('mr', model)) {
            path = computeMeleePath(20, img, info);
            reach.setAttribute('d', path);
            reach.style.visibility = 'visible';
          }
          else {
            reach.style.visibility = 'hidden';
          }
          var strike = el[2];
          if(modelService.isMeleeDisplayed('ms', model)) {
            path = computeMeleePath(40, img, info);
            strike.setAttribute('d', path);
            strike.style.visibility = 'visible';
          }
          else {
            strike.style.visibility = 'hidden';
          }
        },
      };
    }
  ]);
