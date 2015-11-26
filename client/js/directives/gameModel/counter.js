'use strict';

angular.module('clickApp.directives')
  .factory('clickGameModelCounter', [
    'labelElement',
    'model',
    function(labelElementService,
             modelService) {
      function computeCounterCenter(model) {
        var counter_flip_center = { x: model.state.x, y: model.state.y };
        var counter_text_center = { x: counter_flip_center.x, y: counter_flip_center.y+4 };
        return { text: counter_text_center,
                 flip: counter_flip_center,
               };
      }
      function computeSoulsCenter(img, info, model) {
        var counter_flip_center = { x: img.width/2, y: img.height/2 };
        var counter_text_center = { x: counter_flip_center.x + info.base_radius * 0.8 + 5,
                                    y: counter_flip_center.y - info.base_radius - 5 };
        return { text: counter_text_center,
                 flip: counter_flip_center,
               };
      }
      return {
        create: function clickGameModelCounterCreate(svgNS, over_models_container, parent) {
          var counter = labelElementService.create(svgNS, over_models_container);
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
          
          var souls_label = labelElementService.create(svgNS, parent);

          return [ counter, souls_image, souls_label ];
        },
        cleanup: function(under_models_container,
                          over_models_container,
                          element) {
          over_models_container.removeChild(element[0].label);
        },
        update: function clickGameModelCounterUpdate(map_flipped, zoom_factor,
                                                     info, model, img, el) {
          var counter = el[0];
          var counter_text = modelService.isCounterDisplayed('c', model) ?
              model.state.c : '';
          var counter_center = computeCounterCenter(model);
          labelElementService.update(map_flipped,
                                     zoom_factor,
                                     counter_center.flip,
                                     counter_center.text,
                                     modelService.isWreckDisplayed(model) ? '' : counter_text,
                                     counter);

          var souls_text = ( !modelService.isWreckDisplayed(model) &&
                             modelService.isCounterDisplayed('s', model)  ?
                             model.state.s+'' : ''
                           );
          var visibility = R.length(souls_text) > 0 ? 'visible' : 'hidden';
          var souls_center = computeSoulsCenter(img, info, model);

          var souls_image = el[1];
          souls_image.setAttribute('x', (souls_center.text.x-10)+'');
          souls_image.setAttribute('y', (souls_center.text.y-10)+'');
          souls_image.style.visibility = visibility;

          var souls_label = el[2];
          labelElementService.update(map_flipped,
                                     zoom_factor,
                                     souls_center.flip,
                                     souls_center.text,
                                     souls_text,
                                     souls_label);
        },
      };
    }
  ]);
