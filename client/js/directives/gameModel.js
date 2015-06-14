'use strict';

angular.module('clickApp.directives')
  .directive('clickGameModel', [
    'gameFactions',
    'gameMap',
    'labelElement',
    'model',
    'gameModelSelection',
    function(gameFactionsService,
             gameMapService,
             labelElementService,
             modelService,
             gameModelSelectionService) {
      var BASE_RADIUS = {
        huge: 24.605,
        large: 9.842,
        medium: 7.874,
        small: 5.905
      };
      return {
        restrict: 'A',
        link: function(scope, el, attrs) {
          var map = document.getElementById('map');
          var svgNS = map.namespaceURI;

          var info = gameFactionsService.getModelInfo(scope.model.state.info,
                                                      scope.factions);
          console.log('gameModel', scope.model, info);
          if(R.isNil(scope.model) ||
             R.isNil(info)) return;
          var container = el[0];
          var element = createModelElement(info, scope.model, svgNS, container);

          // scope.onGameEvent('mapFlipped', function onMapFlipped() {
          //   labelElementService.updateOnFlipMap(map, model.state, element.label);
          // }, scope);
          function updateModel(event, selection) {
            self.requestAnimationFrame(function _updateModel() {
              var img = modelService.getImage(scope.factions, scope.model);
              var map_flipped = gameMapService.isFlipped(map);
              var zoom_factor = gameMapService.zoomFactor(map);
              var label_text = modelService.fullLabel(scope.model);
              var label_center = computeLabelCenter(info, scope.model);
              var counter_text = modelService.isCounterDisplayed('c', scope.model) ?
                  scope.model.state.c : '';
              var counter_center = computeCounterCenter(scope.model);

              updateModelPosition(img, scope.model, element);
              updateModelImage(img, scope.model, element);
              updateModelSelection(scope.game.model_selection, scope.model, element);
              updateModelDamage(img, info, scope.model, element);
              labelElementService.update(map_flipped,
                                         zoom_factor,
                                         label_center.flip,
                                         label_center.text,
                                         label_text,
                                         element.label);
              labelElementService.update(map_flipped,
                                         zoom_factor,
                                         counter_center.flip,
                                         counter_center.text,
                                         counter_text,
                                         element.counter);
              updateSoulsCounter(map_flipped, zoom_factor,
                                 img, info, scope.model, element);
            });
          }
          updateModel();
          scope.onGameEvent('mapFlipped', function onMapFlipped() {
            var label_center = computeLabelCenter(info, scope.model);
            labelElementService.updateOnFlipMap(map, label_center.flip, element.label);
          }, scope);
          scope.onGameEvent('changeModel-'+scope.model.state.stamp,
                            updateModel, scope);
        }
      };
      function createModelElement(info, model, svgNS, parent) {
        var base = document.createElementNS(svgNS, 'circle');
        base.classList.add('model-base');
        base.setAttribute('cx', (info.img[0].width/2)+'');
        base.setAttribute('cy', (info.img[0].height/2)+'');
        base.setAttribute('r', BASE_RADIUS[info.base]);
        base.setAttribute('style', [
          'fill:', info.base_color, ';',
        ].join(''));
        base.setAttribute('data-stamp', model.state.stamp);
        parent.appendChild(base);

        var direction = document.createElementNS(svgNS, 'line');
        direction.classList.add('model-los');
        direction.setAttribute('x1', (info.img[0].width/2)+'');
        direction.setAttribute('y1', (info.img[0].height/2)+'');
        direction.setAttribute('x2', (info.img[0].width/2)+'');
        direction.setAttribute('y2', (info.img[0].height/2-BASE_RADIUS[info.base])+'');
        parent.appendChild(direction);

        var front_arc = document.createElementNS(svgNS, 'line');
        front_arc.classList.add('model-los');
        front_arc.setAttribute('x1', (info.img[0].width/2-BASE_RADIUS[info.base])+'');
        front_arc.setAttribute('y1', (info.img[0].height/2)+'');
        front_arc.setAttribute('x2', (info.img[0].width/2+BASE_RADIUS[info.base])+'');
        front_arc.setAttribute('y2', (info.img[0].height/2)+'');
        parent.appendChild(front_arc);

        var image = document.createElementNS(svgNS, 'image');
        image.classList.add('model-image');
        image.setAttribute('x', '0');
        image.setAttribute('y', '0');
        // image.setAttribute('width', info.img[0].width+'');
        // image.setAttribute('height', info.img[0].height+'');
        // image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', info.img[0].link);
        parent.appendChild(image);

        var edge = document.createElementNS(svgNS, 'circle');
        edge.classList.add('model-edge');
        edge.setAttribute('cx', (info.img[0].width/2)+'');
        edge.setAttribute('cy', (info.img[0].height/2)+'');
        edge.setAttribute('r', BASE_RADIUS[info.base]);
        parent.appendChild(edge);

        var damage_bar_red;
        var damage_bar_green;
        if(!(info.damage.type === 'warrior' &&
             info.damage.n === 1)) {
          damage_bar_red = document.createElementNS(svgNS, 'line');
          damage_bar_red.classList.add('model-damage-bar');
          damage_bar_red.setAttribute('x1', (info.img[0].width/2-BASE_RADIUS[info.base])+'');
          damage_bar_red.setAttribute('y1', (info.img[0].height/2+BASE_RADIUS[info.base]+2)+'');
          damage_bar_red.setAttribute('x2', (info.img[0].width/2+BASE_RADIUS[info.base])+'');
          damage_bar_red.setAttribute('y2', (info.img[0].height/2+BASE_RADIUS[info.base]+2)+'');
          damage_bar_red.style.stroke = '#F00';
          parent.appendChild(damage_bar_red);
          
          damage_bar_green = document.createElementNS(svgNS, 'line');
          damage_bar_green.classList.add('model-damage-bar');
          damage_bar_green.setAttribute('x1', (info.img[0].width/2-BASE_RADIUS[info.base])+'');
          damage_bar_green.setAttribute('y1', (info.img[0].height/2+BASE_RADIUS[info.base]+2)+'');
          damage_bar_green.setAttribute('x2', (info.img[0].width/2+BASE_RADIUS[info.base])+'');
          damage_bar_green.setAttribute('y2', (info.img[0].height/2+BASE_RADIUS[info.base]+2)+'');
          damage_bar_green.style.stroke = '#0F0';
          parent.appendChild(damage_bar_green);
        }

        var field_bar_red;
        var field_bar_green;
        if(R.exists(info.damage.field)) {
          field_bar_red = document.createElementNS(svgNS, 'line');
          field_bar_red.classList.add('model-damage-bar');
          field_bar_red.setAttribute('x1', (info.img[0].width/2-BASE_RADIUS[info.base])+'');
          field_bar_red.setAttribute('y1', (info.img[0].height/2+BASE_RADIUS[info.base]+2)+'');
          field_bar_red.setAttribute('x2', (info.img[0].width/2+BASE_RADIUS[info.base])+'');
          field_bar_red.setAttribute('y2', (info.img[0].height/2+BASE_RADIUS[info.base]+2)+'');
          field_bar_red.style.stroke = '#066';
          parent.appendChild(field_bar_red);
          
          field_bar_green = document.createElementNS(svgNS, 'line');
          field_bar_green.classList.add('model-damage-bar');
          field_bar_green.setAttribute('x1', (info.img[0].width/2-BASE_RADIUS[info.base])+'');
          field_bar_green.setAttribute('y1', (info.img[0].height/2+BASE_RADIUS[info.base]+2)+'');
          field_bar_green.setAttribute('x2', (info.img[0].width/2+BASE_RADIUS[info.base])+'');
          field_bar_green.setAttribute('y2', (info.img[0].height/2+BASE_RADIUS[info.base]+2)+'');
          field_bar_green.style.stroke = '#0FF';
          parent.appendChild(field_bar_green);
        }

        var direction_los = document.createElementNS(svgNS, 'line');
        direction_los.classList.add('model-los-selection');
        direction_los.setAttribute('x1', (info.img[0].width/2)+'');
        direction_los.setAttribute('y1', (info.img[0].height/2)+'');
        direction_los.setAttribute('x2', (info.img[0].width/2)+'');
        direction_los.setAttribute('y2', (info.img[0].height/2-700)+'');
        parent.appendChild(direction_los);

        var front_arc_los = document.createElementNS(svgNS, 'line');
        front_arc_los.classList.add('model-los-selection');
        front_arc_los.setAttribute('x1', (info.img[0].width/2-700)+'');
        front_arc_los.setAttribute('y1', (info.img[0].height/2)+'');
        front_arc_los.setAttribute('x2', (info.img[0].width/2+700)+'');
        front_arc_los.setAttribute('y2', (info.img[0].height/2)+'');
        parent.appendChild(front_arc_los);

        var label = labelElementService.create(svgNS, parent.parentNode);
        var counter = labelElementService.create(svgNS, parent.parentNode);
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
        var souls = labelElementService.create(svgNS, parent);

        return { container: parent,
                 base: base,
                 direction: direction,
                 front_arc: front_arc,
                 direction_los: direction_los,
                 front_arc_los: front_arc_los,
                 image: image,
                 edge: edge,
                 damage_bar_red: damage_bar_red,
                 damage_bar_green: damage_bar_green,
                 field_bar_red: field_bar_red,
                 field_bar_green: field_bar_green,
                 label: label,
                 counter: counter,
                 souls: { label: souls, image: souls_image },
               };
      }
      function updateModelPosition(img, model, element) {
        element.container.setAttribute('transform', [
          'translate(',
          model.state.x-img.width/2,
          ',',
          model.state.y-img.height/2,
          ') rotate(',
          model.state.r,
          ',',
          img.width/2,
          ',',
          img.height/2,
          ')'
        ].join(''));
      }
      function updateModelImage(img, model, element) {
        element.image.setAttribute('width', img.width+'');
        element.image.setAttribute('height', img.height+'');
        if(R.exists(img.link)) {
          element.image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', img.link);
          element.image.style.visibility = 'visible';
        }
        else {
          element.image.style.visibility = 'hidden';
        }
      }
      function updateModelSelection(selection, model, element) {
        if(gameModelSelectionService.in('local', model.state.stamp, selection)) {
          element.container.classList.add('local-selection');
        }
        else {
          element.container.classList.remove('local-selection');
        }
        if(gameModelSelectionService.in('remote', model.state.stamp, selection)) {
          element.container.classList.add('remote-selection');
        }
        else {
          element.container.classList.remove('remote-selection');
        }
      }
      function updateModelDamage(img, info, model, element) {
        if(R.isNil(element.damage_bar_red)) return;

        var min_x = img.width / 2 + BASE_RADIUS[info.base];
        var max_x = img.width / 2 - BASE_RADIUS[info.base];
        var y = img.height / 2 + BASE_RADIUS[info.base] + 2;

        var percent_damage = model.state.dmg.t / info.damage.total;
        var damage_x = (max_x-min_x) * (1-percent_damage) + min_x;

        element.damage_bar_red.setAttribute('x1', max_x + '');
        element.damage_bar_red.setAttribute('y1', y + '');
        element.damage_bar_red.setAttribute('x2', min_x + '');
        element.damage_bar_red.setAttribute('y2', y + '');

        element.damage_bar_green.setAttribute('x1', damage_x + '');
        element.damage_bar_green.setAttribute('y1', y + '');
        element.damage_bar_green.setAttribute('x2', min_x + '');
        element.damage_bar_green.setAttribute('y2', y + '');

        if(R.isNil(element.field_bar_red)) return;

        var percent_field = model.state.dmg.f / info.damage.field;
        var field_x = (max_x-min_x) * (1-percent_field) + min_x;

        element.field_bar_red.setAttribute('x1', max_x + '');
        element.field_bar_red.setAttribute('y1', (y+1) + '');
        element.field_bar_red.setAttribute('x2', min_x + '');
        element.field_bar_red.setAttribute('y2', (y+1) + '');

        element.field_bar_green.setAttribute('x1', field_x + '');
        element.field_bar_green.setAttribute('y1', (y+1) + '');
        element.field_bar_green.setAttribute('x2', min_x + '');
        element.field_bar_green.setAttribute('y2', (y+1) + '');
      }
      function computeLabelCenter(info, model) {
        var label_text_center_y_down = model.state.y + BASE_RADIUS[info.base] + 6;
        var label_text_center_y_up = model.state.y - BASE_RADIUS[info.base] - 2;
        var orientation = ((model.state.r % 360) + 360) % 360;
        var model_looking_down =  orientation > 90 && orientation < 270;
        var label_text_center = { x: model.state.x,
                                  y: model_looking_down ?
                                  label_text_center_y_down : label_text_center_y_up
                                };
        var label_flip_center = { x: label_text_center.x,
                                  y: label_text_center.y - 2
                                };
        return { text: label_text_center,
                 flip: label_flip_center
               };
      }
      function updateSoulsCounter(map_flipped, zoom_factor, img, info, model, element) {
        var souls_text = modelService.isCounterDisplayed('s', model) ?
            model.state.s+'' : '';
        var visibility = R.length(souls_text) > 0 ? 'visible' : 'hidden';
        var souls_center = computeSoulsCenter(img, info, model);

        element.souls.image.setAttribute('x', (souls_center.text.x-10)+'');
        element.souls.image.setAttribute('y', (souls_center.text.y-10)+'');
        element.souls.image.style.visibility = visibility;
        labelElementService.update(map_flipped,
                                   zoom_factor,
                                   souls_center.flip,
                                   souls_center.text,
                                   souls_text,
                                   element.souls.label);
      }
      function computeCounterCenter(model) {
        var counter_flip_center = { x: model.state.x, y: model.state.y };
        var counter_text_center = { x: counter_flip_center.x, y: counter_flip_center.y+4 };
        return { text: counter_text_center,
                 flip: counter_flip_center,
               };
      }
      function computeSoulsCenter(img, info, model) {
        var counter_flip_center = { x: img.width/2, y: img.height/2 };
        var counter_text_center = { x: counter_flip_center.x + BASE_RADIUS[info.base] + 5,
                                    y: counter_flip_center.y - BASE_RADIUS[info.base] - 5 };
        return { text: counter_text_center,
                 flip: counter_flip_center,
               };
      }
    }
  ])
  .directive('clickGameModelsList', [
    '$window',
    function($window) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          scope.digestOnGameEvent('createModel', scope);
        }
      };
    }
  ]);
