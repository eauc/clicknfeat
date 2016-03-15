'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.directives').factory('clickGameModelArea', gameModelAreaModelFactory);

  gameModelAreaModelFactory.$inject = ['model'];
  function gameModelAreaModelFactory(modelService) {
    return {
      create: gameModelAreaCreate,
      update: gameModelAreaUpdate
    };

    function gameModelAreaCreate(svgNS, parent) {
      var ctrl_area = document.createElementNS(svgNS, 'circle');
      ctrl_area.classList.add('model-ctrl-area');
      ctrl_area.setAttribute('cx', '0');
      ctrl_area.setAttribute('cy', '0');
      ctrl_area.setAttribute('r', '0');
      ctrl_area.style.visibility = 'hidden';
      parent.appendChild(ctrl_area);

      var area = document.createElementNS(svgNS, 'circle');
      area.classList.add('model-area');
      area.setAttribute('cx', '0');
      area.setAttribute('cy', '0');
      area.setAttribute('r', '0');
      area.style.visibility = 'hidden';
      parent.appendChild(area);

      return [area, ctrl_area];
    }
    function gameModelAreaUpdate(factions, info, model, img, element) {
      var _element = _slicedToArray(element, 2);

      var area = _element[0];
      var ctrl_area = _element[1];

      ctrl_area.setAttribute('cx', img.width / 2 + '');
      ctrl_area.setAttribute('cy', img.height / 2 + '');
      modelService.isCtrlAreaDisplayedP(factions, model).then(function (is_displayed) {
        if (is_displayed) {
          var radius = (info.focus || info.fury) * 20 + info.base_radius;
          ctrl_area.setAttribute('r', radius + '');
          ctrl_area.style.visibility = 'visible';
        } else {
          ctrl_area.style.visibility = 'hidden';
        }
      });

      area.setAttribute('cx', img.width / 2 + '');
      area.setAttribute('cy', img.height / 2 + '');
      if (modelService.isAreaDisplayed(model)) {
        area.setAttribute('r', model.state.are * 10 + info.base_radius + '');
        area.style.visibility = 'visible';
      } else {
        area.style.visibility = 'hidden';
      }
    }
  }
})();
//# sourceMappingURL=area.js.map
