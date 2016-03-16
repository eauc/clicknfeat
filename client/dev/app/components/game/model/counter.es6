(function() {
  angular.module('clickApp.directives')
    .factory('clickGameModelCounter', gameModelCounterModelFactory);

  gameModelCounterModelFactory.$inject = [
    'labelElement',
    'model',
  ];
  function gameModelCounterModelFactory(labelElementModel,
                                        modelModel) {
    return {
      create: gameModelCounterCreate,
      cleanup: gameModelCounterCleanup,
      update: gameModelCounterUpdate
    };

    function gameModelCounterCreate(svgNS, over_models_container, parent) {
      const counter = labelElementModel.create(svgNS, over_models_container);
      counter.label.classList.add('counter');
      counter.bckgnd.setAttribute('height', '9');

      const souls_image = document.createElementNS(svgNS, 'image');
      souls_image.classList.add('model-image');
      souls_image.setAttribute('x', '0');
      souls_image.setAttribute('y', '0');
      souls_image.setAttribute('width', '20');
      souls_image.setAttribute('height', '20');
      souls_image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '/data/icons/Soul.png');
      parent.appendChild(souls_image);

      const souls_label = labelElementModel.create(svgNS, parent);

      return [ counter, souls_image, souls_label ];
    }
    function gameModelCounterCleanup(_under_models_container_,
                                     over_models_container,
                                     element) {
      const [ counter, _souls_image_, _souls_label_ ] = element;

      over_models_container.removeChild(counter.label);
    }
    function gameModelCounterUpdate(map_flipped, zoom_factor,
                                         info, model, img, element) {
      const [ counter, souls_image, souls_label ] = element;
      const counter_text = ( modelModel.isCounterDisplayed('c', model)
                             ? model.state.c
                             : ''
                           );
      const counter_center = computeCounterCenter(model);
      labelElementModel.update(map_flipped,
                               zoom_factor,
                               counter_center.flip,
                               counter_center.text,
                               counter_text,
                               counter);

      const souls_text = ( modelModel.isCounterDisplayed('s', model)
                           ? model.state.s + ''
                           : ''
                         );
      const visibility = R.length(souls_text) > 0 ? 'visible' : 'hidden';
      const souls_center = computeSoulsCenter(img, info, model);

      souls_image.setAttribute('x', (souls_center.text.x-10)+'');
      souls_image.setAttribute('y', (souls_center.text.y-10)+'');
      souls_image.style.visibility = visibility;

      labelElementModel.update(map_flipped,
                               zoom_factor,
                               souls_center.flip,
                               souls_center.text,
                               souls_text,
                               souls_label);
    }
    function computeCounterCenter(model) {
      const counter_flip_center = { x: model.state.x, y: model.state.y };
      const counter_text_center = { x: counter_flip_center.x, y: counter_flip_center.y+4 };
      return { text: counter_text_center,
               flip: counter_flip_center
             };
    }
    function computeSoulsCenter(img, info) {
      const counter_flip_center = { x: img.width/2, y: img.height/2 };
      const counter_text_center = { x: counter_flip_center.x + info.base_radius * 0.8 + 5,
                                    y: counter_flip_center.y - info.base_radius - 5
                                  };
      return { text: counter_text_center,
               flip: counter_flip_center
             };
    }
  }
})();
