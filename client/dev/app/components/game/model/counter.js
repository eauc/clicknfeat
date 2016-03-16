'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.directives').factory('clickGameModelCounter', gameModelCounterModelFactory);

  gameModelCounterModelFactory.$inject = ['labelElement', 'model'];
  function gameModelCounterModelFactory(labelElementModel, modelModel) {
    return {
      create: gameModelCounterCreate,
      cleanup: gameModelCounterCleanup,
      update: gameModelCounterUpdate
    };

    function gameModelCounterCreate(svgNS, over_models_container, parent) {
      var counter = labelElementModel.create(svgNS, over_models_container);
      counter.label.classList.add('counter');
      counter.bckgnd.setAttribute('height', '9');

      var souls_image = document.createElementNS(svgNS, 'image');
      souls_image.classList.add('model-image');
      souls_image.setAttribute('x', '0');
      souls_image.setAttribute('y', '0');
      souls_image.setAttribute('width', '20');
      souls_image.setAttribute('height', '20');
      souls_image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '/data/icons/Soul.png');
      parent.appendChild(souls_image);

      var souls_label = labelElementModel.create(svgNS, parent);

      return [counter, souls_image, souls_label];
    }
    function gameModelCounterCleanup(_under_models_container_, over_models_container, element) {
      var _element = _slicedToArray(element, 3);

      var counter = _element[0];
      var _souls_image_ = _element[1];
      var _souls_label_ = _element[2];

      over_models_container.removeChild(counter.label);
    }
    function gameModelCounterUpdate(map_flipped, zoom_factor, info, model, img, element) {
      var _element2 = _slicedToArray(element, 3);

      var counter = _element2[0];
      var souls_image = _element2[1];
      var souls_label = _element2[2];

      var counter_text = modelModel.isCounterDisplayed('c', model) ? model.state.c : '';
      var counter_center = computeCounterCenter(model);
      labelElementModel.update(map_flipped, zoom_factor, counter_center.flip, counter_center.text, counter_text, counter);

      var souls_text = modelModel.isCounterDisplayed('s', model) ? model.state.s + '' : '';
      var visibility = R.length(souls_text) > 0 ? 'visible' : 'hidden';
      var souls_center = computeSoulsCenter(img, info, model);

      souls_image.setAttribute('x', souls_center.text.x - 10 + '');
      souls_image.setAttribute('y', souls_center.text.y - 10 + '');
      souls_image.style.visibility = visibility;

      labelElementModel.update(map_flipped, zoom_factor, souls_center.flip, souls_center.text, souls_text, souls_label);
    }
    function computeCounterCenter(model) {
      var counter_flip_center = { x: model.state.x, y: model.state.y };
      var counter_text_center = { x: counter_flip_center.x, y: counter_flip_center.y + 4 };
      return { text: counter_text_center,
        flip: counter_flip_center
      };
    }
    function computeSoulsCenter(img, info) {
      var counter_flip_center = { x: img.width / 2, y: img.height / 2 };
      var counter_text_center = { x: counter_flip_center.x + info.base_radius * 0.8 + 5,
        y: counter_flip_center.y - info.base_radius - 5
      };
      return { text: counter_text_center,
        flip: counter_flip_center
      };
    }
  }
})();
//# sourceMappingURL=counter.js.map
