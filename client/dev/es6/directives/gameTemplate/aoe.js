'use strict';

angular.module('clickApp.directives')
  .factory('aoeTemplateElement', [
    '$window',
    'template',
    'gameTemplateSelection',
    'gameMap',
    'labelElement',
    function($window,
             templateService,
             gameTemplateSelectionService,
             gameMapService,
             labelElementService) {
      var aoeTemplateElementService = {
        create: function aoeTemplateElementServiceCreate(svgNS, parent, aoe) {
          var circle = document.createElementNS(svgNS, 'circle');
          circle.classList.add('template');
          circle.classList.add('aoe');
          circle.setAttribute('data-stamp', aoe.state.stamp);
          parent.appendChild(circle);

          var line = document.createElementNS(svgNS, 'line');
          line.classList.add('template-aoe-direction');
          line.style['marker-end'] = 'url(#aoe-direction-end)';
          parent.appendChild(line);

          var label = labelElementService.create(svgNS, parent);
          
          return { aoe: circle,
                   dir: line,
                   label: label,
                 };
        },
        update: function aoeTemplateElementUpdate(map, scope, template, aoe) {
          var selection = scope.game.template_selection;
          var local =
              gameTemplateSelectionService.in('local', template.state.stamp,
                                              selection);
          var remote =
              gameTemplateSelectionService.in('remote', template.state.stamp,
                                              selection);
          var selected = (local || remote);

          var map_flipped = gameMapService.isFlipped(map);
          var zoom_factor = gameMapService.zoomFactor(map);
          var label_flip_center = template.state;
          var label_text_center = { x: template.state.x,
                                    y: template.state.y + template.state.s + 5
                                  };
          var label_text = templateService.fullLabel(template);
          $window.requestAnimationFrame(function _aoeTemplateElementUpdate() {
            if(selected) aoe.container.classList.add('selection');
            else aoe.container.classList.remove('selection');
            if(local) aoe.container.classList.add('local');
            else aoe.container.classList.remove('local');
            if(remote) aoe.container.classList.add('remote');
            else aoe.container.classList.remove('remote');
            
            updateAoe(template, aoe.aoe);
            updateDir(template, aoe.dir);
            labelElementService.update(map_flipped,
                                       zoom_factor,
                                       label_flip_center,
                                       label_text_center,
                                       label_text,
                                       aoe.label);
            $window.requestAnimationFrame(function _aoeTemplateElementUpdate2() {
              if(gameTemplateSelectionService.inSingle('local', template.state.stamp,
                                                       scope.game.template_selection)) {
                scope.gameEvent('changeSingleAoESelection', template);
              }
            });
          });
        },
      };
      function updateAoe(template, aoe) {
        aoe.setAttribute('cx', template.state.x+'');
        aoe.setAttribute('cy', template.state.y+'');
        aoe.setAttribute('r', template.state.s+'');
      }
      function updateDir(template, dir) {
        dir.setAttribute('x1', template.state.x+'');
        dir.setAttribute('y1', template.state.y+'');
        dir.setAttribute('x2', template.state.x+'');
        dir.setAttribute('y2', (template.state.y-template.state.s)+'');
        dir.setAttribute('transform', ('rotate('+
                                       template.state.r+','+
                                       template.state.x+','+
                                       template.state.y+
                                       ')'
                                      ));
      }
      return aoeTemplateElementService;
    }
  ]);
