'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {

  angular.module('clickApp.directives').factory('clickGameModelBase', gameModelBaseModelFactory);

  gameModelBaseModelFactory.$inject = ['model'];
  function gameModelBaseModelFactory(modelService) {
    return {
      create: gameModelBaseCreate,
      update: gameModelBaseUpdate
    };

    function gameModelBaseCreate(svgNS, info, model, parent) {
      var base = document.createElementNS(svgNS, 'circle');
      base.classList.add('model-base');
      base.setAttribute('cx', info.img[0].width / 2 + '');
      base.setAttribute('cy', info.img[0].height / 2 + '');
      base.setAttribute('r', info.base_radius);
      base.setAttribute('style', ['fill:', info.base_color, ';'].join(''));
      base.setAttribute('data-stamp', model.state.stamp);
      parent.appendChild(base);

      var title = document.createElementNS(svgNS, 'title');
      base.appendChild(title);
      title.innerHTML = modelService.descriptionFromInfo(info, model);

      var direction = document.createElementNS(svgNS, 'line');
      direction.classList.add('model-los');
      direction.setAttribute('x1', info.img[0].width / 2 + '');
      direction.setAttribute('y1', info.img[0].height / 2 + '');
      direction.setAttribute('x2', info.img[0].width / 2 + '');
      direction.setAttribute('y2', info.img[0].height / 2 - info.base_radius + '');
      parent.appendChild(direction);

      var front_arc = document.createElementNS(svgNS, 'line');
      front_arc.classList.add('model-los');
      front_arc.setAttribute('x1', info.img[0].width / 2 - info.base_radius + '');
      front_arc.setAttribute('y1', info.img[0].height / 2 + '');
      front_arc.setAttribute('x2', info.img[0].width / 2 + info.base_radius + '');
      front_arc.setAttribute('y2', info.img[0].height / 2 + '');
      parent.appendChild(front_arc);

      var image = document.createElementNS(svgNS, 'image');
      image.classList.add('model-image');
      image.setAttribute('x', '0');
      image.setAttribute('y', '0');
      parent.appendChild(image);

      var edge = document.createElementNS(svgNS, 'circle');
      edge.classList.add('model-edge');
      edge.setAttribute('cx', info.img[0].width / 2 + '');
      edge.setAttribute('cy', info.img[0].height / 2 + '');
      edge.setAttribute('r', info.base_radius);
      parent.appendChild(edge);

      return [base, direction, front_arc, image, edge];
    }
    function gameModelBaseUpdate(_info_, _model_, img, element) {
      var _element = _slicedToArray(element, 5);

      var _base_ = _element[0];
      var _direction_ = _element[1];
      var _front_arc_ = _element[2];
      var image = _element[3];
      var _edge_ = _element[4];

      image.setAttribute('width', img.width + '');
      image.setAttribute('height', img.height + '');
      if (R.exists(img.link)) {
        image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', img.link);
        image.style.visibility = 'visible';
      } else {
        image.style.visibility = 'hidden';
      }
    }
  }
})();
//# sourceMappingURL=base.js.map
