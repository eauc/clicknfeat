'use strict';

angular.module('clickApp.directives')
  .directive('clickGameModel', [
    'gameFactions',
    'gameMap',
    'labelElement',
    'gameRuler',
    'model',
    'gameModels',
    'gameModelSelection',
    'point',
    function(gameFactionsService,
             gameMapService,
             labelElementService,
             gameRulerService,
             modelService,
             gameModelsService,
             gameModelSelectionService,
             pointService) {
      var EFFECTS = [
        [ 'b', '/data/icons/Blind.png' ],
        [ 'c', '/data/icons/Corrosion.png' ],
        [ 'd', '/data/icons/BoltBlue.png' ],
        [ 'f', '/data/icons/Fire.png' ],
        [ 'r', '/data/icons/BoltYellow.png' ],
        [ 'k', '/data/icons/KD.png' ],
        [ 's', '/data/icons/Stationary.png' ],
      ];
      return {
        restrict: 'A',
        link: function(scope, el, attrs) {
          var map = document.getElementById('map');
          var under_models_container = document.getElementById('game-under-models');
          var over_models_container = document.getElementById('game-over-models');
          var svgNS = map.namespaceURI;

          var info = gameFactionsService.getModelInfo(scope.model.state.info,
                                                      scope.factions);
          console.log('gameModel', scope.model, info);
          if(R.isNil(scope.model) ||
             R.isNil(info)) return;
          var container = el[0];
          var element = createModelElement(info, scope.model, svgNS,
                                           over_models_container,
                                           under_models_container,
                                           container);
          scope.$on('$destroy', function gameModelOnDestroy() {
            console.log('gameModelOnDestroy');
            over_models_container.removeChild(element.label.label);
            over_models_container.removeChild(element.counter.label);
            over_models_container.removeChild(element.charge.label.label);
            over_models_container.removeChild(element.charge.target);
            under_models_container.removeChild(element.charge.path);
          });
          function updateModel(event, selection) {
            self.requestAnimationFrame(function _updateModel() {
              var is_wreck = modelService.isWreckDisplayed(scope.model);
              var img = is_wreck ?
                  modelService.getWreckImage(scope.factions, scope.model) :
                  modelService.getImage(scope.factions, scope.model);
              var map_flipped = gameMapService.isFlipped(map);
              var zoom_factor = gameMapService.zoomFactor(map);
              var label_text = modelService.fullLabel(scope.model);
              var label_center = computeLabelCenter(info, scope.model);
              var counter_text = modelService.isCounterDisplayed('c', scope.model) ?
                  scope.model.state.c : '';
              var counter_center = computeCounterCenter(scope.model);

              updateModelPosition(img, scope.model, element);
              updateModelAura(img, info, scope.model, element);
              updateModelImage(img, scope.model, element);
              updateModelSelection(scope.game.model_selection, scope.game.ruler,
                                   scope.model, element);
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
                                         is_wreck ? '' : counter_text,
                                         element.counter);
              updateSoulsCounter(map_flipped, zoom_factor,
                                 img, info, scope.model, element);
              updateUnit(map_flipped, zoom_factor,
                         img, info, scope.model, element);
              updateLeaderImage(img, info, scope.model, element);
              updateEffectImages(img, info, scope.model, element);
              updateModelCtrlArea(scope.factions, img, info, scope.model, element);
              updateModelArea(img, info, scope.model, element);
              updateModelMelee(img, info, scope.model, element);
              updateModelChargePlace(map_flipped, zoom_factor, scope,
                                     info, scope.model, element.charge);

              self.requestAnimationFrame(function _updateModel2() {
                if(gameModelSelectionService.inSingle('local',
                                                      scope.model.state.stamp,
                                                      scope.game.model_selection)) {
                  scope.gameEvent('changeSingleModelSelection', scope.model);
                }
              });
            });
          }
          updateModel();
          scope.onGameEvent('mapFlipped', function onMapFlipped() {
            var label_center = computeLabelCenter(info, scope.model);
            labelElementService.updateOnFlipMap(map,
                                                label_center.flip,
                                                element.label);
            labelElementService.updateOnFlipMap(map,
                                                scope.model.state,
                                                element.counter);
            if(modelService.isCharging(scope.model) ||
               modelService.isPlacing(scope.model)) {
              labelElementService.updateOnFlipMap(map,
                                                  scope.model.state.cha.s,
                                                  element.charge.label);
            }
          }, scope);
          scope.onGameEvent('changeModel-'+scope.model.state.stamp,
                            updateModel, scope);
          function onchangeSingleModelSelection(event, selected_model) {
            // console.log('changeSingleModelSelection',
            //             selected_model.state.stamp,
            //             scope.model.state.stamp);
            if(selected_model.state.stamp !== scope.model.state.stamp) {
              var dist = modelService.distanceTo(scope.factions,
                                                 selected_model,
                                                 scope.model);
              if(dist < -0.1) {
                element.container.classList.add('overlap');
                element.container.classList.remove('b2b');
                return;
              }
              else if(dist < 0.1) {
                element.container.classList.remove('overlap');
                element.container.classList.add('b2b');
                return;
              }
            }
            element.container.classList.remove('overlap');
            element.container.classList.remove('b2b');
          }
          function onDisableSingleModelSelection(event) {
            // console.log('disableSingleModelSelection',
            //             scope.model.state.stamp);
            element.container.classList.remove('overlap');
            element.container.classList.remove('b2b');
          }
          scope.onGameEvent('changeSingleModelSelection',
                            onchangeSingleModelSelection, scope);
          scope.onGameEvent('disableSingleModelSelection',
                            onDisableSingleModelSelection, scope);

          function onchangeSingleAoESelection(event, selected_aoe) {
            // console.log('changeSingleAoESelection',
            //             selected_aoe.state.stamp,
            //             scope.model.state.stamp);
            if(R.exists(selected_aoe)) {
              var dist = modelService.distanceToAoE(scope.factions,
                                                    selected_aoe,
                                                    scope.model);
              if(dist <= 0) {
                element.container.classList.add('under-aoe');
                return;
              }
            }
            element.container.classList.remove('under-aoe');
          }
          function onDisableSingleAoESelection(event) {
            // console.log('disableSingleAoESelection',
            //             scope.model.state.stamp);
            element.container.classList.remove('under-aoe');
            element.container.classList.remove('b2b');
          }
          scope.onGameEvent('changeSingleAoESelection',
                            onchangeSingleAoESelection, scope);
          scope.onGameEvent('disableSingleAoESelection',
                            onDisableSingleAoESelection, scope);
        }
      };
      function createModelElement(info, model, svgNS,
                                  over_models_container,
                                  under_models_container,
                                  parent) {
        var aura = document.createElementNS(svgNS, 'circle');
        aura.classList.add('color-aura');
        aura.style.filter = 'url(#aura-filter)';
        aura.style.visibility = 'hidden';
        parent.appendChild(aura);

        var state_aura = document.createElementNS(svgNS, 'circle');
        state_aura.classList.add('state-aura');
        state_aura.style.filter = 'url(#aura-filter)';
        parent.appendChild(state_aura);

        var melee = document.createElementNS(svgNS, 'path');
        melee.classList.add('model-melee');
        melee.setAttribute('d', '');
        parent.appendChild(melee);
        var reach = document.createElementNS(svgNS, 'path');
        reach.classList.add('model-melee');
        reach.setAttribute('d', '');
        parent.appendChild(reach);
        var strike = document.createElementNS(svgNS, 'path');
        strike.classList.add('model-melee');
        strike.setAttribute('d', '');
        parent.appendChild(strike);
        
        var base = document.createElementNS(svgNS, 'circle');
        base.classList.add('model-base');
        base.setAttribute('cx', (info.img[0].width/2)+'');
        base.setAttribute('cy', (info.img[0].height/2)+'');
        base.setAttribute('r', info.base_radius);
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
        direction.setAttribute('y2', (info.img[0].height/2-info.base_radius)+'');
        parent.appendChild(direction);

        var front_arc = document.createElementNS(svgNS, 'line');
        front_arc.classList.add('model-los');
        front_arc.setAttribute('x1', (info.img[0].width/2-info.base_radius)+'');
        front_arc.setAttribute('y1', (info.img[0].height/2)+'');
        front_arc.setAttribute('x2', (info.img[0].width/2+info.base_radius)+'');
        front_arc.setAttribute('y2', (info.img[0].height/2)+'');
        parent.appendChild(front_arc);

        var image = document.createElementNS(svgNS, 'image');
        image.classList.add('model-image');
        image.setAttribute('x', '0');
        image.setAttribute('y', '0');
        parent.appendChild(image);

        var edge = document.createElementNS(svgNS, 'circle');
        edge.classList.add('model-edge');
        edge.setAttribute('cx', (info.img[0].width/2)+'');
        edge.setAttribute('cy', (info.img[0].height/2)+'');
        edge.setAttribute('r', info.base_radius);
        parent.appendChild(edge);

        var damage_bar_red;
        var damage_bar_green;
        if(!(info.damage.type === 'warrior' &&
             info.damage.n === 1)) {
          damage_bar_red = document.createElementNS(svgNS, 'line');
          damage_bar_red.classList.add('model-damage-bar');
          damage_bar_red.setAttribute('x1', (info.img[0].width/2-info.base_radius)+'');
          damage_bar_red.setAttribute('y1', (info.img[0].height/2+info.base_radius+2)+'');
          damage_bar_red.setAttribute('x2', (info.img[0].width/2+info.base_radius)+'');
          damage_bar_red.setAttribute('y2', (info.img[0].height/2+info.base_radius+2)+'');
          damage_bar_red.style.stroke = '#F00';
          parent.appendChild(damage_bar_red);
          
          damage_bar_green = document.createElementNS(svgNS, 'line');
          damage_bar_green.classList.add('model-damage-bar');
          damage_bar_green.setAttribute('x1', (info.img[0].width/2-info.base_radius)+'');
          damage_bar_green.setAttribute('y1', (info.img[0].height/2+info.base_radius+2)+'');
          damage_bar_green.setAttribute('x2', (info.img[0].width/2+info.base_radius)+'');
          damage_bar_green.setAttribute('y2', (info.img[0].height/2+info.base_radius+2)+'');
          damage_bar_green.style.stroke = '#0F0';
          parent.appendChild(damage_bar_green);
        }

        var field_bar_red;
        var field_bar_green;
        if(R.exists(info.damage.field)) {
          field_bar_red = document.createElementNS(svgNS, 'line');
          field_bar_red.classList.add('model-damage-bar');
          field_bar_red.setAttribute('x1', (info.img[0].width/2-info.base_radius)+'');
          field_bar_red.setAttribute('y1', (info.img[0].height/2+info.base_radius+2)+'');
          field_bar_red.setAttribute('x2', (info.img[0].width/2+info.base_radius)+'');
          field_bar_red.setAttribute('y2', (info.img[0].height/2+info.base_radius+2)+'');
          field_bar_red.style.stroke = '#066';
          parent.appendChild(field_bar_red);
          
          field_bar_green = document.createElementNS(svgNS, 'line');
          field_bar_green.classList.add('model-damage-bar');
          field_bar_green.setAttribute('x1', (info.img[0].width/2-info.base_radius)+'');
          field_bar_green.setAttribute('y1', (info.img[0].height/2+info.base_radius+2)+'');
          field_bar_green.setAttribute('x2', (info.img[0].width/2+info.base_radius)+'');
          field_bar_green.setAttribute('y2', (info.img[0].height/2+info.base_radius+2)+'');
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

        var label = labelElementService.create(svgNS, over_models_container);
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
        var souls = labelElementService.create(svgNS, parent);

        var unit = labelElementService.create(svgNS, parent);

        var leader_image = document.createElementNS(svgNS, 'image');
        leader_image.classList.add('model-image');
        leader_image.setAttribute('x', '0');
        leader_image.setAttribute('y', '0');
        leader_image.setAttribute('width', '10');
        leader_image.setAttribute('height', '10');
        leader_image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '/data/icons/Leader.png');
        parent.appendChild(leader_image);

        var effects = R.reduce(function(mem, effect) {
          var image = document.createElementNS(svgNS, 'image');
          image.classList.add('model-image');
          image.setAttribute('x', '0');
          image.setAttribute('y', '0');
          image.setAttribute('width', '10');
          image.setAttribute('height', '10');
          image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', effect[1]);
          image.style.visibility = 'hidden';
          parent.appendChild(image);
          return R.assoc(effect[0], image, mem);
        }, {}, EFFECTS);

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

        var charge_path = document.createElementNS(svgNS, 'rect');
        charge_path.style.visibility = 'hidden';
        charge_path.classList.add('model-charge-path');
        under_models_container.appendChild(charge_path);
        var charge_target = document.createElementNS(svgNS, 'circle');
        charge_target.style.visibility = 'hidden';
        charge_target.classList.add('model-charge-target');
        over_models_container.appendChild(charge_target);
        var charge_label = labelElementService.create(svgNS, over_models_container);

        return { container: parent,
                 aura: aura,
                 state_aura: state_aura,
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
                 unit: unit,
                 leader: leader_image,
                 effects: effects,
                 ctrl_area: ctrl_area,
                 area: area,
                 melee: melee,
                 reach: reach,
                 strike: strike,
                 charge: { path: charge_path,
                           label: charge_label,
                           target: charge_target,
                         },
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
      function updateModelAura(img, info, model, element) {
        element.state_aura.setAttribute('cx', (img.width/2)+'');
        element.state_aura.setAttribute('cy', (img.height/2)+'');
        element.state_aura.setAttribute('r', (info.base_radius*1.2)+'');

        element.aura.setAttribute('cx', (img.width/2)+'');
        element.aura.setAttribute('cy', (img.height/2)+'');
        element.aura.setAttribute('r', (info.base_radius*1.2)+'');
        if(modelService.isAuraDisplayed(model)) {
          element.aura.style.fill = model.state.aur;
          element.aura.style.visibility = 'visible';
        }
        else {
          element.aura.style.visibility = 'hidden';
        }
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
      function updateModelSelection(selection, ruler, model, element) {
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
        if(gameModelSelectionService.inSingle('local', model.state.stamp, selection)) {
          element.container.classList.add('single-local');
          element.container.classList.remove('single-remote');
        }
        else if(gameModelSelectionService.inSingle('remote', model.state.stamp, selection)) {
          element.container.classList.remove('single-local');
          element.container.classList.add('single-remote');
        }
        else {
          element.container.classList.remove('single-local');
          element.container.classList.remove('single-remote');
        }
      }
      function updateModelDamage(img, info, model, element) {
        if(R.isNil(element.damage_bar_red)) return;

        if(modelService.isWreckDisplayed(model)) {
          element.damage_bar_red.style.visibility = 'hidden';
          element.damage_bar_green.style.visibility = 'hidden';
          if(R.isNil(element.field_bar_red)) return;

          element.field_bar_red.style.visibility = 'hidden';
          element.field_bar_green.style.visibility = 'hidden';
          return;
        }
        
        var min_x = img.width / 2 + info.base_radius;
        var max_x = img.width / 2 - info.base_radius;
        var y = img.height / 2 + info.base_radius + 1;

        var percent_damage = model.state.dmg.t / info.damage.total;
        var damage_x = (max_x-min_x) * (1-percent_damage) + min_x;

        element.damage_bar_red.setAttribute('x1', max_x + '');
        element.damage_bar_red.setAttribute('y1', y + '');
        element.damage_bar_red.setAttribute('x2', min_x + '');
        element.damage_bar_red.setAttribute('y2', y + '');
        element.damage_bar_red.style.visibility = 'visible';

        element.damage_bar_green.setAttribute('x1', damage_x + '');
        element.damage_bar_green.setAttribute('y1', y + '');
        element.damage_bar_green.setAttribute('x2', min_x + '');
        element.damage_bar_green.setAttribute('y2', y + '');
        element.damage_bar_green.style.visibility = 'visible';

        if(R.isNil(element.field_bar_red)) return;

        var percent_field = model.state.dmg.f / info.damage.field;
        var field_x = (max_x-min_x) * (1-percent_field) + min_x;

        element.field_bar_red.setAttribute('x1', max_x + '');
        element.field_bar_red.setAttribute('y1', (y+1) + '');
        element.field_bar_red.setAttribute('x2', min_x + '');
        element.field_bar_red.setAttribute('y2', (y+1) + '');
        element.field_bar_red.style.visibility = 'visible';

        element.field_bar_green.setAttribute('x1', field_x + '');
        element.field_bar_green.setAttribute('y1', (y+1) + '');
        element.field_bar_green.setAttribute('x2', min_x + '');
        element.field_bar_green.setAttribute('y2', (y+1) + '');
        element.field_bar_green.style.visibility = 'visible';
      }
      function updateModelMelee(img, info, model, element) {
        var path;
        if(modelService.isMeleeDisplayed('mm', model)) {
          path = computeMeleePath(5, img, info);
          element.melee.setAttribute('d', path);
          element.melee.style.visibility = 'visible';
        }
        else {
          element.melee.style.visibility = 'hidden';
        }
        if(modelService.isMeleeDisplayed('mr', model)) {
          path = computeMeleePath(20, img, info);
          element.reach.setAttribute('d', path);
          element.reach.style.visibility = 'visible';
        }
        else {
          element.reach.style.visibility = 'hidden';
        }
        if(modelService.isMeleeDisplayed('ms', model)) {
          path = computeMeleePath(40, img, info);
          element.strike.setAttribute('d', path);
          element.strike.style.visibility = 'visible';
        }
        else {
          element.strike.style.visibility = 'hidden';
        }
      }
      function updateSoulsCounter(map_flipped, zoom_factor, img, info, model, element) {
        var souls_text = ( !modelService.isWreckDisplayed(model) &&
                           modelService.isCounterDisplayed('s', model)  ?
                           model.state.s+'' : ''
                         );
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
      function updateUnit(map_flipped, zoom_factor, img, info, model, element) {
        var unit = modelService.unit(model);
        unit = R.exists(unit) ? unit : '';
        var unit_text = modelService.isUnitDisplayed(model) ? unit+'' : '';
        unit_text = R.length(unit_text) > 0 ? 'U'+unit_text : unit_text;
        var unit_center = computeUnitCenter(img, info, model);

        labelElementService.update(map_flipped,
                                   zoom_factor,
                                   unit_center.flip,
                                   unit_center.text,
                                   unit_text,
                                   element.unit);
      }
      function updateLeaderImage(img, info, model, element) {
        element.leader.setAttribute('x', (img.width / 2 - 0.7 * info.base_radius - 5)+'');
        element.leader.setAttribute('y', (img.height / 2 - 0.7 * info.base_radius - 5)+'');
        if(modelService.isLeaderDisplayed(model)) {
          element.leader.style.visibility = 'visible';
        }
        else {
          element.leader.style.visibility = 'hidden';
        }
      }
      function updateEffectImages(img, info, model, element) {        
        R.pipe(
          R.keys,
          R.filter(function(effect) {
            return modelService.isEffectDisplayed(effect, model);
          }),
          function(effects) {
            var base_x = img.width / 2 - (R.length(effects) * 10 / 2);
            var base_y = img.height / 2 + info.base_radius + 1;
            R.forEachIndexed(function(effect, i) {
              element.effects[effect].setAttribute('x', (base_x + i * 10)+'');
              element.effects[effect].setAttribute('y', (base_y)+'');
              element.effects[effect].style.visibility = 'visible';
            }, effects);
          }
        )(element.effects);
        R.pipe(
          R.keys,
          R.reject(function(effect) {
            return modelService.isEffectDisplayed(effect, model);
          }),
          R.forEach(function(effect) {
            element.effects[effect].style.visibility = 'hidden';
          })
        )(element.effects);
      }
      function updateModelCtrlArea(factions, img, info, model, element) {
        element.ctrl_area.setAttribute('cx', (img.width/2)+'');
        element.ctrl_area.setAttribute('cy', (img.height/2)+'');
        if(modelService.isCtrlAreaDisplayed(factions, model)) {
          var radius = ((info.focus || info.fury)*20 + info.base_radius);
          element.ctrl_area.setAttribute('r', radius+'');
          element.ctrl_area.style.visibility = 'visible';
        }
        else {
          element.ctrl_area.style.visibility = 'hidden';
        }
      }
      function updateModelArea(img, info, model, element) {
        element.area.setAttribute('cx', (img.width/2)+'');
        element.area.setAttribute('cy', (img.height/2)+'');
        if(modelService.isAreaDisplayed(model)) {
          console.log('AREA', model.state.are);
          element.area.setAttribute('r', (model.state.are * 10 + info.base_radius)+'');
          element.area.style.visibility = 'visible';
        }
        else {
          element.area.style.visibility = 'hidden';
        }
      }
      function updateModelChargePlace(map_flipped, zoom_factor, scope,
                                      info, model, charge) {
        if(!modelService.isCharging(model) &&
           !modelService.isPlacing(model)) {
          charge.path.style.visibility = 'hidden';
          charge.target.style.visibility = 'hidden';
          labelElementService.update(map_flipped,
                                     zoom_factor,
                                     model.state,
                                     model.state,
                                     '',
                                     charge.label);
          return;
        }
        var max_dist;
        if(modelService.isCharging(model)) {
          var charge_length = pointService.distanceTo(model.state, model.state.cha.s);
          var charge_dir = model.state.cha.s.r;
          var charge_middle = pointService.translateInDirection(400,
                                                                charge_dir,
                                                                model.state.cha.s);
          charge.path.setAttribute('width', (info.base_radius*2)+'');
          charge.path.setAttribute('height', '800');
          charge.path.setAttribute('x', (charge_middle.x-info.base_radius)+'');
          charge.path.setAttribute('y', (charge_middle.y-400)+'');
          charge.path.setAttribute('transform', [
            'rotate(',
            charge_dir,
            ',',
            charge_middle.x,
            ',',
            charge_middle.y,
            ')'
          ].join(''));
          charge.path.style.visibility = 'visible';

          var charge_label = (Math.round(charge_length*10)/100)+'"';
          max_dist = modelService.chargeMaxLength(model);
          if(R.exists(max_dist)) {
            charge_label += '/'+max_dist+'"';
          }
          labelElementService.update(map_flipped,
                                     zoom_factor,
                                     model.state.cha.s,
                                     model.state.cha.s,
                                     charge_label,
                                     charge.label);

          var charge_target_visibility = 'hidden';
          if(gameModelSelectionService.in('local', model.state.stamp, scope.game.model_selection) &&
             R.exists(model.state.cha.t)) {
            var target = gameModelsService.findStamp(model.state.cha.t, scope.game.models);
            if(R.exists(target)) {
              var target_info = gameFactionsService.getModelInfo(target.state.info, scope.factions);
              charge.target.setAttribute('cx', (target.state.x)+'');
              charge.target.setAttribute('cy', (target.state.y)+'');
              charge.target.setAttribute('r', (target_info.base_radius)+'');

              var melee_range = 0;
              if(modelService.isMeleeDisplayed('mm', model)) {
                melee_range = 5;
              }
              if(modelService.isMeleeDisplayed('mr', model)) {
                melee_range = 20;
              }
              if(modelService.isMeleeDisplayed('ms', model)) {
                melee_range = 40;
              }
              var distance_to_target = pointService.distanceTo(target.state, model.state);
              if(distance_to_target <= melee_range + info.base_radius + target_info.base_radius) {
                charge.target.classList.add('reached');
              }
              else {
                charge.target.classList.remove('reached');
              }
              charge_target_visibility = 'visible';
            }
          }
          charge.target.style.visibility = charge_target_visibility;
        }
        if(modelService.isPlacing(model)) {
          var place_length = pointService.distanceTo(model.state, model.state.pla.s);
          var place_dir = model.state.pla.s.r;
          var place_middle = pointService.translateInDirection(400,
                                                               place_dir,
                                                               model.state.pla.s);
          charge.path.setAttribute('width', (info.base_radius*2)+'');
          charge.path.setAttribute('height', '800');
          charge.path.setAttribute('x', (place_middle.x-info.base_radius)+'');
          charge.path.setAttribute('y', (place_middle.y-400)+'');
          charge.path.setAttribute('transform', [
            'rotate(',
            place_dir,
            ',',
            place_middle.x,
            ',',
            place_middle.y,
            ')'
          ].join(''));
          charge.path.style.visibility = 'visible';

          var place_label = (Math.round(place_length*10)/100)+'"';
          var within = modelService.placeWithin(model);
          max_dist = modelService.placeMaxLength(model);
          if(R.exists(max_dist)) {
            place_label += '/'+(within ? 'w.' : '')+max_dist+'"';
          }
          labelElementService.update(map_flipped,
                                     zoom_factor,
                                     model.state.pla.s,
                                     model.state.pla.s,
                                     place_label,
                                     charge.label);

          charge.target.style.visibility = 'hidden';
        }
      }
      function computeLabelCenter(info, model) {
        var label_text_center_y_down = model.state.y + info.base_radius + 6;
        var label_text_center_y_up = model.state.y - info.base_radius - 2;
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
      function computeUnitCenter(img, info, model) {
        var counter_flip_center = { x: img.width/2, y: img.height/2 };
        var counter_text_center = { x: counter_flip_center.x - info.base_radius*0.7 - 5,
                                    y: counter_flip_center.y - info.base_radius*0.7 - 5 };
        return { text: counter_text_center,
                 flip: counter_flip_center,
               };
      }
      function computeMeleePath(size, img, info) {
        return [
          'M',img.width/2-info.base_radius-size,',',img.height/2,' ',

          'L',img.width/2+info.base_radius+size,',',img.height/2,' ',

          'A',info.base_radius+size,',',info.base_radius+size,' 0 0,0 ',
          img.width/2-info.base_radius-size,',',img.height/2,' ',

          'M',img.width/2,',',img.height/2,' ',

          'L',img.width/2,',',img.height/2-info.base_radius-size,' ',
        ].join('');
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
