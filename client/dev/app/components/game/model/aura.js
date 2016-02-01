'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

angular.module('clickApp.directives').factory('clickGameModelAura', ['model', function (modelService) {
  return {
    create: function clickGameModelAuraCreate(svgNS, parent) {
      var aura = document.createElementNS(svgNS, 'circle');
      aura.classList.add('color-aura');
      aura.style.filter = 'url(#aura-filter)';
      aura.style.visibility = 'hidden';
      parent.appendChild(aura);

      var state_aura = document.createElementNS(svgNS, 'circle');
      state_aura.classList.add('state-aura');
      state_aura.style.filter = 'url(#state-aura-filter)';
      parent.appendChild(state_aura);

      return [aura, state_aura];
    },
    update: function clickGameModeAuraUpdate(info, model, img, element) {
      var _element = _slicedToArray(element, 2);

      var aura = _element[0];
      var state_aura = _element[1];

      state_aura.setAttribute('cx', img.width / 2 + '');
      state_aura.setAttribute('cy', img.height / 2 + '');
      state_aura.setAttribute('r', info.base_radius * 1.2 + '');

      aura.setAttribute('cx', img.width / 2 + '');
      aura.setAttribute('cy', img.height / 2 + '');
      aura.setAttribute('r', info.base_radius * 1.2 + '');
      if (modelService.isAuraDisplayed(model)) {
        aura.style.fill = model.state.aur;
        aura.style.visibility = 'visible';
      } else {
        aura.style.visibility = 'hidden';
      }
    }
  };
}]);
//# sourceMappingURL=aura.js.map
