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
  ])
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
          var selected = gameTemplateSelectionService.inLocal(template.state.stamp,
                                                              scope.game.template_selection);
          var stroke_color = ( selected ? '#0F0' : '#C60' );
          var dir_visibility = ( selected ? 'visible' : 'hidden' );

          var map_flipped = gameMapService.isFlipped(map);
          var zoom_factor = gameMapService.zoomFactor(map);
          var label_flip_center = template.state;
          var label_text_center = { x: template.state.x,
                                    y: template.state.y + template.state.s + 5
                                  };
          var label_text = templateService.fullLabel(template);
          $window.requestAnimationFrame(function _aoeTemplateElementUpdate() {
            updateAoe(stroke_color, template, aoe.aoe);
            updateDir(dir_visibility, template, aoe.dir);
            labelElementService.update(map_flipped,
                                       zoom_factor,
                                       label_flip_center,
                                       label_text_center,
                                       label_text,
                                       aoe.label);
          });
        },
      };
      function updateAoe(stroke_color, template, aoe) {
        aoe.setAttribute('cx', template.state.x+'');
        aoe.setAttribute('cy', template.state.y+'');
        aoe.setAttribute('r', template.state.s+'');
        aoe.style.stroke = stroke_color;
      }
      function updateDir(visibility, template, dir) {
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
        dir.style.visibility = visibility;
      }
      return aoeTemplateElementService;
    }
  ])
  .factory('wallTemplateElement', [
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
      var wallTemplateElementService = {
        create: function wallTemplateElementServiceCreate(svgNS, parent, template) {
          var group = document.createElementNS(svgNS, 'g');
          parent.appendChild(group);

          var rect = document.createElementNS(svgNS, 'rect');
          rect.classList.add('template');
          rect.classList.add('wall');
          rect.setAttribute('width', '40');
          rect.setAttribute('height', '7.5');
          rect.setAttribute('data-stamp', template.state.stamp);
          group.appendChild(rect);

          var label = labelElementService.create(svgNS, group);

          return { container: group,
                   wall: rect,
                   label: label,
                 };
        },
        update: function wallTemplateElementUpdate(map, scope, template, wall) {
          var selected = gameTemplateSelectionService.inLocal(template.state.stamp,
                                                              scope.game.template_selection);
          var stroke_color = ( selected ? '#0F0' : '#C60' );

          var map_flipped = gameMapService.isFlipped(map);
          var zoom_factor = gameMapService.zoomFactor(map);
          var label_flip_center = template.state;
          var label_text_center = { x: template.state.x,
                                    y: template.state.y+2
                                  };
          var label_text = templateService.fullLabel(template);
          $window.requestAnimationFrame(function _wallTemplateElementUpdate() {
            updateWall(stroke_color, template, wall.wall);
            updateContainer(template, wall.container);
            labelElementService.update(map_flipped,
                                       zoom_factor,
                                       label_flip_center,
                                       label_text_center,
                                       label_text,
                                       wall.label);
          });
        },
      };
      function updateWall(stroke_color, template, wall) {
        wall.setAttribute('x', (template.state.x-20)+'');
        wall.setAttribute('y', (template.state.y-3.75)+'');
        wall.style.stroke = stroke_color;
      }
      function updateContainer(template, container) {
        container.setAttribute('transform', ('rotate('+
                                             template.state.r+','+
                                             template.state.x+','+
                                             template.state.y+
                                             ')'
                                            ));
      }
      return wallTemplateElementService;
    }
  ])
  .directive('clickGameTemplate', [
    'gameTemplates',
    'labelElement',
    'aoeTemplateElement',
    'wallTemplateElement',
    function(gameTemplatesService,
             labelElementService,
             aoeTemplateElementService,
             wallTemplateElementService) {
      var templates = {
        aoe: aoeTemplateElementService,
        wall: wallTemplateElementService
      };
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          var map = document.getElementById('map');
          var svgNS = map.namespaceURI;

          var template = gameTemplatesService.findStamp(attrs.clickGameTemplate,
                                                        scope.game.templates);
          console.log('gameTemplate', attrs.clickGameTemplate, template);
          if(R.isNil(template)) return;

          var element = templates[template.state.type].create(svgNS, element[0], template);

          scope.$on('flipMap', function onFlipMap() {
            labelElementService.updateOnFlipMap(map, template.state, element.label);
          });
          function updateTemplate() {
            templates[template.state.type].update(map, scope, template, element);
          }
          updateTemplate();
          scope.$on('changeTemplate-'+template.state.stamp, updateTemplate);
        }
      };
    }
  ]);

angular.module('clickApp.directives')
  .directive('clickGameTemplatesList', [
    '$window',
    function($window) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          scope.digestOnGameEvent(scope, 'createTemplate');
        }
      };
    }
  ]);
