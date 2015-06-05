'use strict';

angular.module('clickApp.directives')
  .factory('labelElement', [
    '$window',
    function($window) {
      var labelElementService = {
        create: function labelElementServiceCreate(svgNS, parent) {
          var gLabel = document.createElementNS(svgNS, 'g');
          gLabel.classList.add('label');
          parent.appendChild(gLabel);
          var rectLabel = document.createElementNS(svgNS, 'rect');
          rectLabel.setAttribute('height', '6');
          gLabel.appendChild(rectLabel);
          var textLabel = document.createElementNS(svgNS, 'text');
          gLabel.appendChild(textLabel);

          return { label: gLabel,
                   bckgnd: rectLabel,
                   text: textLabel
                 };
        },
        updateOnFlipMap: function labelElementUpdateOnFlipMap(map, center, label) {
          var map_flipped = map.hasAttribute('flipped');
          $window.requestAnimationFrame(function _labelElementUpdateOnFlipMap() {
            label.label.setAttribute('transform',
                                     map_flipped ? 'rotate(180,'+
                                     center.x+','+
                                     center.y+')' : '');
          });
        },
        update: function labelElementUpdate(map_flipped,
                                            zoom_factor,
                                            flip_center,
                                            text_center,
                                            text,
                                            label) {
          text = R.defaultTo('', text) + '';
          var visibility = R.length(text) > 0 ? 'visible' : 'hidden';

          updateLabel(map_flipped, flip_center, visibility, label.label);
          if('visible' === visibility) {
            updateText(text_center, text, label.text);

            $window.requestAnimationFrame(function _labelElementUpdate() {
              updateBackground(zoom_factor, text_center,
                               label.text, label.bckgnd);
            });
          }
        },  
      };
      function updateLabel(map_flipped, flip_center, visibility, label) {
        label.style.visibility = visibility;
        label.setAttribute('transform',
                           ( map_flipped ?
                             'rotate(180,'+flip_center.x+','+flip_center.y+')' :
                             ''
                           ));
      }
      function updateText(center, content, text) {
        text.innerHTML = content;
        text.setAttribute('x', center.x+'');
        text.setAttribute('y', center.y+'');
      }
      function updateBackground(zoom_factor, text_center,
                                label, bckgnd) {
        var label_rect = label.getBoundingClientRect();
        var width = label_rect.width / zoom_factor;

        bckgnd.setAttribute('x', (text_center.x - width / 2 - 1)+'');
        bckgnd.setAttribute('y', (text_center.y - 5)+'');
        bckgnd.setAttribute('width', (width + 2)+'');
      }
      return labelElementService;
    }
  ]);
