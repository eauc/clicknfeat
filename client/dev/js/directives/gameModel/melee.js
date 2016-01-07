'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

angular.module('clickApp.directives').factory('clickGameModelMelee', ['model', function (modelService) {
  function computeMeleePath(size, img, info) {
    return ['M', img.width / 2 - info.base_radius - size, ',', img.height / 2, ' ', 'L', img.width / 2 + info.base_radius + size, ',', img.height / 2, ' ', 'A', info.base_radius + size, ',', info.base_radius + size, ' 0 0,0 ', img.width / 2 - info.base_radius - size, ',', img.height / 2, ' ', 'M', img.width / 2, ',', img.height / 2, ' ', 'L', img.width / 2, ',', img.height / 2 - info.base_radius - size, ' '].join('');
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

      return [melee, reach, strike];
    },
    update: function clickGameModeMeleeUpdate(info, model, img, element) {
      var _element = _slicedToArray(element, 3);

      var melee = _element[0];
      var reach = _element[1];
      var strike = _element[2];

      var path = undefined;
      if (modelService.isMeleeDisplayed('mm', model)) {
        path = computeMeleePath(5, img, info);
        melee.setAttribute('d', path);
        melee.style.visibility = 'visible';
      } else {
        melee.style.visibility = 'hidden';
      }
      if (modelService.isMeleeDisplayed('mr', model)) {
        path = computeMeleePath(20, img, info);
        reach.setAttribute('d', path);
        reach.style.visibility = 'visible';
      } else {
        reach.style.visibility = 'hidden';
      }
      if (modelService.isMeleeDisplayed('ms', model)) {
        path = computeMeleePath(40, img, info);
        strike.setAttribute('d', path);
        strike.style.visibility = 'visible';
      } else {
        strike.style.visibility = 'hidden';
      }
    }
  };
}]);
//# sourceMappingURL=melee.js.map
