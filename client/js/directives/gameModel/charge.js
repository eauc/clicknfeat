'use strict';

angular.module('clickApp.directives')
  .factory('clickGameModelCharge', [
    'labelElement',
    'model',
    'point',
    'gameFactions',
    'gameModels',
    'gameModelSelection',
    function(labelElementService,
             modelService,
             pointService,
             gameFactionsService,
             gameModelsService,
             gameModelSelectionService) {
      return {
        create: function clickGameModelChargeCreate(svgNS,
                                                    under_models_container,
                                                    over_models_container,
                                                    parent) {
          var charge_path = document.createElementNS(svgNS, 'rect');
          charge_path.style.visibility = 'hidden';
          charge_path.classList.add('model-charge-path');
          under_models_container.appendChild(charge_path);
          
          var charge_target = document.createElementNS(svgNS, 'circle');
          charge_target.style.visibility = 'hidden';
          charge_target.classList.add('model-charge-target');
          over_models_container.appendChild(charge_target);
          
          var charge_label = labelElementService.create(svgNS, over_models_container);

          return [ charge_path, charge_target, charge_label ];
        },
        cleanup: function clickGameModelCharge(under_models_container,
                                               over_models_container,
                                               el) {
          over_models_container.removeChild(el[2].label);
          over_models_container.removeChild(el[1]);
          under_models_container.removeChild(el[0]);
        },
        update: function clickGameModelChargeUpdate(map_flipped, zoom_factor, game,
                                                    factions, info, model, img, el) {
          var charge_path = el[0];
          var charge_target = el[1];
          var charge_label = el[2];
          if(!modelService.isCharging(model)) {// &&
             // !modelService.isPlacing(model)) {
            charge_path.style.visibility = 'hidden';
            charge_target.style.visibility = 'hidden';
            labelElementService.update(map_flipped,
                                       zoom_factor,
                                       model.state,
                                       model.state,
                                       '',
                                       charge_label);
            return;
          }
          var max_dist;
          if(modelService.isCharging(model)) {
            var charge_length = pointService.distanceTo(model.state, model.state.cha.s);
            var charge_dir = model.state.cha.s.r;
            var charge_middle = pointService.translateInDirection(400,
                                                                  charge_dir,
                                                                  model.state.cha.s);
            charge_path.setAttribute('width', (info.base_radius*2)+'');
            charge_path.setAttribute('height', '800');
            charge_path.setAttribute('x', (charge_middle.x-info.base_radius)+'');
            charge_path.setAttribute('y', (charge_middle.y-400)+'');
            charge_path.setAttribute('transform', [
              'rotate(',
              charge_dir,
              ',',
              charge_middle.x,
              ',',
              charge_middle.y,
              ')'
            ].join(''));
            charge_path.style.visibility = 'visible';

            var label = (Math.round(charge_length*10)/100)+'"';
            max_dist = modelService.chargeMaxLength(model);
            if(R.exists(max_dist)) {
              label += '/'+max_dist+'"';
            }
            labelElementService.update(map_flipped,
                                       zoom_factor,
                                       model.state.cha.s,
                                       model.state.cha.s,
                                       label,
                                       charge_label);

            if(gameModelSelectionService.in('local', model.state.stamp,
                                            game.model_selection) &&
               R.exists(model.state.cha.t)) {
              R.pipeP(
                gameModelsService.findStamp$(model.state.cha.t),
                function(target) {
                  charge_target.setAttribute('cx', (target.state.x)+'');
                  charge_target.setAttribute('cy', (target.state.y)+'');

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
                  return R.pipeP(
                    gameFactionsService.getModelInfo$(target.state.info),
                    function(target_info) {
                      charge_target.setAttribute('r', (target_info.base_radius)+'');
                      
                      if(distance_to_target <= melee_range + info.base_radius + target_info.base_radius) {
                        charge_target.classList.add('reached');
                      }
                      else {
                        charge_target.classList.remove('reached');
                      }
                      charge_target.style.visibility = 'visible';
                    }
                  )(factions);
                }
              )(game.models);
            }
          }
          // if(modelService.isPlacing(model)) {
          //   var place_length = pointService.distanceTo(model.state, model.state.pla.s);
          //   var place_dir = model.state.pla.s.r;
          //   var place_middle = pointService.translateInDirection(400,
          //                                                        place_dir,
          //                                                        model.state.pla.s);
          //   charge_path.setAttribute('width', (info.base_radius*2)+'');
          //   charge_path.setAttribute('height', '800');
          //   charge_path.setAttribute('x', (place_middle.x-info.base_radius)+'');
          //   charge_path.setAttribute('y', (place_middle.y-400)+'');
          //   charge_path.setAttribute('transform', [
          //     'rotate(',
          //     place_dir,
          //     ',',
          //     place_middle.x,
          //     ',',
          //     place_middle.y,
          //     ')'
          //   ].join(''));
          //   charge_path.style.visibility = 'visible';

          //   var place_label = (Math.round(place_length*10)/100)+'"';
          //   var within = modelService.placeWithin(model);
          //   max_dist = modelService.placeMaxLength(model);
          //   if(R.exists(max_dist)) {
          //     place_label += '/'+(within ? 'w.' : '')+max_dist+'"';
          //   }
          //   labelElementService.update(map_flipped,
          //                              zoom_factor,
          //                              model.state.pla.s,
          //                              model.state.pla.s,
          //                              place_label,
          //                              charge_label);

          //   charge_target.style.visibility = 'hidden';
          // }
          charge_target.style.visibility = 'hidden';
        },
      };
    }
  ]);
