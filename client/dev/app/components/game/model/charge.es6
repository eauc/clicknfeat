(function() {
  angular.module('clickApp.directives')
    .factory('clickGameModelCharge', gameModelChargeModelFactory);

  gameModelChargeModelFactory.$inject = [
    'labelElement',
    'model',
    'point',
    'gameFactions',
    'gameModels',
    'gameModelSelection',
  ];
  function gameModelChargeModelFactory(labelElementModel,
                                       modelModel,
                                       pointModel,
                                       gameFactionsModel,
                                       gameModelsModel,
                                       gameModelSelectionModel) {
    return {
      create: gameModelChargeCreate,
      cleanup: gameModelCharge,
      update: gameModelChargeUpdate
    };

    function gameModelChargeCreate(svgNS,
                                   under_models_container,
                                   over_models_container) {
      const charge_path = document.createElementNS(svgNS, 'rect');
      charge_path.style.visibility = 'hidden';
      charge_path.classList.add('model-charge-path');
      under_models_container.appendChild(charge_path);

      const charge_target = document.createElementNS(svgNS, 'circle');
      charge_target.style.visibility = 'hidden';
      charge_target.classList.add('model-charge-target');
      over_models_container.appendChild(charge_target);

      const charge_label = labelElementModel.create(svgNS, over_models_container);

      return [ charge_path, charge_target, charge_label ];
    }
    function gameModelCharge(under_models_container,
                             over_models_container,
                             element) {
      const [ charge_path, charge_target, charge_label ] = element;

      over_models_container.removeChild(charge_label.label);
      over_models_container.removeChild(charge_target);
      under_models_container.removeChild(charge_path);
    }
    function gameModelChargeUpdate(map_flipped, zoom_factor,
                                   state, info, model, _img_, element) {
      const [ charge_path, charge_target, charge_label ] = element;

      if(!modelModel.isCharging(model)  &&
         !modelModel.isPlacing(model)) {
        charge_path.style.visibility = 'hidden';
        charge_target.style.visibility = 'hidden';
        labelElementModel.update(map_flipped,
                                 zoom_factor,
                                 model.state,
                                 model.state,
                                 '',
                                 charge_label);
        return;
      }
      let max_dist;
      if(modelModel.isCharging(model)) {
        const charge_length = pointModel.distanceTo(model.state, model.state.cha.s);
        const charge_dir = model.state.cha.s.r;
        const charge_middle = pointModel.translateInDirection(400,
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

        let label = (Math.round(charge_length*10)/100)+'"';
        max_dist = modelModel.chargeMaxLength(model);
        if(R.exists(max_dist)) {
          label += '/'+max_dist+'"';
        }
        labelElementModel.update(map_flipped,
                                 zoom_factor,
                                 model.state.cha.s,
                                 model.state.cha.s,
                                 label,
                                 charge_label);

        if(gameModelSelectionModel
           .in('local', model.state.stamp, state.game.model_selection) &&
           R.exists(model.state.cha.t)) {
          R.threadP(state.game.models)(
            gameModelsModel.findStampP$(model.state.cha.t),
            (target) => {
              charge_target.setAttribute('cx', (target.state.x)+'');
              charge_target.setAttribute('cy', (target.state.y)+'');

              let melee_range = 0;
              if(modelModel.isMeleeDisplayed('mm', model)) {
                melee_range = 5;
              }
              if(modelModel.isMeleeDisplayed('mr', model)) {
                melee_range = 20;
              }
              if(modelModel.isMeleeDisplayed('ms', model)) {
                melee_range = 40;
              }
              const distance_to_target = pointModel.distanceTo(target.state, model.state);
              return R.threadP(state.factions)(
                gameFactionsModel.getModelInfoP$(target.state.info),
                (target_info) => {
                  charge_target.setAttribute('r', (target_info.base_radius)+'');

                  if(distance_to_target <= melee_range + info.base_radius + target_info.base_radius) {
                    charge_target.classList.add('reached');
                  }
                  else {
                    charge_target.classList.remove('reached');
                  }
                  charge_target.style.visibility = 'visible';
                }
              );
            }
          );
        }
      }
      if(modelModel.isPlacing(model)) {
        const place_length = pointModel.distanceTo(model.state, model.state.pla.s);
        const place_dir = model.state.pla.s.r;
        const place_middle = pointModel.translateInDirection(400,
                                                             place_dir,
                                                             model.state.pla.s);
        charge_path.setAttribute('width', (info.base_radius*2)+'');
        charge_path.setAttribute('height', '800');
        charge_path.setAttribute('x', (place_middle.x-info.base_radius)+'');
        charge_path.setAttribute('y', (place_middle.y-400)+'');
        charge_path.setAttribute('transform', [
          'rotate(',
          place_dir,
          ',',
          place_middle.x,
          ',',
          place_middle.y,
          ')'
        ].join(''));
        charge_path.style.visibility = 'visible';

        let place_label = (Math.round(place_length*10)/100)+'"';
        const within = modelModel.placeWithin(model);
        max_dist = modelModel.placeMaxLength(model);
        if(R.exists(max_dist)) {
          place_label += '/'+(within ? 'w.' : '')+max_dist+'"';
        }
        labelElementModel.update(map_flipped,
                                 zoom_factor,
                                 model.state.pla.s,
                                 model.state.pla.s,
                                 place_label,
                                 charge_label);

      }
      charge_target.style.visibility = 'hidden';
    }
  }
})();
