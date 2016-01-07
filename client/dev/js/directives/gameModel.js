'use strict';

angular.module('clickApp.directives').directive('clickGameModel', ['gameMap', 'gameFactions', 'gameModels', 'gameModelSelection', 'gameScenario', 'model', 'labelElement', 'clickGameModelArea', 'clickGameModelAura', 'clickGameModelBase', 'clickGameModelCharge', 'clickGameModelCounter', 'clickGameModelDamage', 'clickGameModelIcon', 'clickGameModelLoS', 'clickGameModelMelee', function (gameMapService, gameFactionsService, gameModelsService, gameModelSelectionService, gameScenarioService, modelService, labelElementService, clickGameModelAreaService, clickGameModelAuraService, clickGameModelBaseService, clickGameModelChargeService, clickGameModelCounterService, clickGameModelDamageService, clickGameModelIconService, clickGameModelLoSService, clickGameModelMeleeService) {
  var clickGameModeDirective = {
    restrict: 'A',
    link: function link(scope, parent) {
      var state = scope.state;
      gameFactionsService.getModelInfo(scope.model.state.info, state.factions).catch(function (reason) {
        console.error('clickGameModel', reason);
        return self.Promise.reject(reason);
      }).then(function (info) {
        console.log('gameModel', scope.model, info);

        return buildModelElement(state, info, scope.model, parent[0], scope);
      });
    }
  };
  function buildModelElement(state, info, model, container, scope) {
    var element = createModelElement(info, model, container);

    scope.$on('$destroy', gameModelOnDestroy(element));
    scope.onStateChangeEvent('Game.map.flipped', gameModelOnMapFlipped(info, scope, element), scope);
    var updateModel = gameModelOnUpdate(state, info, scope, element);
    scope.onStateChangeEvent('Game.model.change.' + model.state.stamp, updateModel, scope);
    updateModel();

    scope.onStateChangeEvent('Game.model.selection.local.updateSingle', onUpdateSingleModelSelection(state.factions, model, element), scope);

    scope.onStateChangeEvent('Game.template.selection.local.updateSingle', onUpdateSingleTemplateSelection(state.factions, model, element), scope);

    var onUpdateScenarioAura = withModel(scope, function (model) {
      updateScenarioAura(state, info, model, scope, element);
    });
    scope.onStateChangeEvent('Game.scenario.refresh', onUpdateScenarioAura, scope);
    scope.onStateChangeEvent('Game.scenario.change', onUpdateScenarioAura, scope);
  }
  function createModelElement(info, model, parent) {
    var map = document.getElementById('map');
    var under_models_container = document.getElementById('game-under-models');
    var over_models_container = document.getElementById('game-over-models');
    var svgNS = map.namespaceURI;

    var aura = clickGameModelAuraService.create(svgNS, parent);
    var melee = clickGameModelMeleeService.create(svgNS, parent);
    var base = clickGameModelBaseService.create(svgNS, info, model, parent);
    var damage = clickGameModelDamageService.create(svgNS, info, parent);
    var los = clickGameModelLoSService.create(svgNS, info, parent);
    var label = labelElementService.create(svgNS, over_models_container);
    var counter = clickGameModelCounterService.create(svgNS, over_models_container, parent);
    var unit = labelElementService.create(svgNS, parent);
    var icon = clickGameModelIconService.create(svgNS, parent);
    var area = clickGameModelAreaService.create(svgNS, parent);
    var charge = clickGameModelChargeService.create(svgNS, under_models_container, over_models_container, parent);

    return { container: parent,
      aura: aura,
      base: base,
      damage: damage,
      los: los,
      label: label,
      counter: counter,
      unit: unit,
      icon: icon,
      area: area,
      melee: melee,
      charge: charge
    };
  }
  function gameModelOnDestroy(element) {
    return function () {
      console.log('gameModelOnDestroy');

      var under_models_container = document.getElementById('game-under-models');
      var over_models_container = document.getElementById('game-over-models');
      over_models_container.removeChild(element.label.label);
      clickGameModelCounterService.cleanup(under_models_container, over_models_container, element.counter);
      clickGameModelChargeService.cleanup(under_models_container, over_models_container, element.charge);
    };
  }
  function withModel(scope, fn) {
    return function () {
      R.pipeP(function () {
        return gameModelsService.findStamp(scope.model.state.stamp, scope.state.game.models);
      }, fn)();
    };
  }
  function gameModelOnMapFlipped(info, scope, element) {
    return withModel(scope, function (model) {
      var map = document.getElementById('map');

      var label_center = computeLabelCenter(info, model);
      labelElementService.updateOnFlipMap(map, label_center.flip, element.label);
      labelElementService.updateOnFlipMap(map, model.state, element.counter[0]);
      if (modelService.isCharging(model) || modelService.isPlacing(model)) {
        labelElementService.updateOnFlipMap(map, model.state.cha.s, element.charge[2]);
      }
    });
  }
  function onUpdateSingleModelSelection(factions, model, element) {
    return function (event, sel_stamp, sel_model) {
      // console.log('onUpdateSingleModelSelection',
      //             sel_stamp, model.state.stamp);
      if (R.isNil(sel_model) || sel_stamp === model.state.stamp) {
        element.container.classList.remove('overlap');
        element.container.classList.remove('b2b');
        return;
      }
      R.pipeP(modelService.distanceTo$(factions, sel_model), function (dist) {
        if (dist < -0.1) {
          element.container.classList.add('overlap');
          element.container.classList.remove('b2b');
          return;
        } else if (dist < 0.1) {
          element.container.classList.remove('overlap');
          element.container.classList.add('b2b');
          return;
        } else {
          element.container.classList.remove('overlap');
          element.container.classList.remove('b2b');
        }
      })(model);
    };
  }
  function onUpdateSingleTemplateSelection(factions, model, element) {
    return function (event, sel_stamp, sel_temp) {
      // console.log('onUpdateSingleAoTemplateSelection',
      //             sel_stamp, model.state.stamp);
      if (R.isNil(sel_temp)) {
        element.container.classList.remove('under-aoe');
        return;
      }
      R.pipeP(modelService.distanceToAoE$(factions, sel_temp), function (dist) {
        if (dist <= 0) {
          element.container.classList.add('under-aoe');
        } else {
          element.container.classList.remove('under-aoe');
        }
      })(model);
    };
  }
  function gameModelOnUpdate(state, info, scope, element) {
    return withModel(scope, function (model) {
      var map = document.getElementById('map');
      var map_flipped = gameMapService.isFlipped(map);
      var zoom_factor = gameMapService.zoomFactor(map);

      var is_wreck = modelService.isWreckDisplayed(model);
      (is_wreck ? modelService.getWreckImage(state.factions, model) : modelService.getImage(state.factions, model)).then(function (img) {
        var label_text = modelService.fullLabel(model);
        var label_center = computeLabelCenter(info, model);

        updateModelPosition(img, model, element);
        updateModelSelection(state.game.model_selection, model, element);
        updateScenarioAura(state, info, model, scope, element);
        clickGameModelAuraService.update(info, model, img, element.aura);
        clickGameModelBaseService.update(info, model, img, element.base);
        clickGameModelDamageService.update(info, model, img, element.damage);
        labelElementService.update(map_flipped, zoom_factor, label_center.flip, label_center.text, label_text, element.label);
        clickGameModelCounterService.update(map_flipped, zoom_factor, info, model, img, element.counter);
        updateUnit(map_flipped, zoom_factor, img, info, model, element);
        clickGameModelIconService.update(info, model, img, element.icon);
        clickGameModelAreaService.update(state.factions, info, model, img, element.area);
        clickGameModelMeleeService.update(info, model, img, element.melee);
        clickGameModelChargeService.update(map_flipped, zoom_factor, state, info, model, img, element.charge);
      });
    });
  }
  function updateModelPosition(img, model, element) {
    element.container.setAttribute('transform', ['translate(', model.state.x - img.width / 2, ',', model.state.y - img.height / 2, ') rotate(', model.state.r, ',', img.width / 2, ',', img.height / 2, ')'].join(''));
  }
  function updateModelSelection(selection, model, element) {
    var container = element.container;
    var stamp = model.state.stamp;
    if (gameModelSelectionService.in('local', stamp, selection)) {
      container.classList.add('local-selection');
    } else {
      container.classList.remove('local-selection');
    }
    if (gameModelSelectionService.in('remote', stamp, selection)) {
      container.classList.add('remote-selection');
    } else {
      container.classList.remove('remote-selection');
    }
    if (gameModelSelectionService.inSingle('local', stamp, selection)) {
      container.classList.add('single-local');
      container.classList.remove('single-remote');
    } else if (gameModelSelectionService.inSingle('remote', stamp, selection)) {
      container.classList.remove('single-local');
      container.classList.add('single-remote');
    } else {
      container.classList.remove('single-local');
      container.classList.remove('single-remote');
    }
  }
  function updateScenarioAura(state, info, model, scope, element) {
    var circle = R.pipe(R.pick(['x', 'y']), R.assoc('radius', info.base_radius))(model.state);

    if (scope.stateIs('game.setup') && R.exists(state.game.scenario) && gameScenarioService.isContesting(circle, state.game.scenario)) {
      element.container.classList.add('contesting');
    } else {
      element.container.classList.remove('contesting');
    }
    if (scope.stateIs('game.setup') && R.exists(state.game.scenario) && 'wardude' === info.type && gameScenarioService.isKillboxing(circle, state.game.scenario)) {
      element.container.classList.add('killboxing');
    } else {
      element.container.classList.remove('killboxing');
    }
  }
  function updateUnit(map_flipped, zoom_factor, img, info, model, element) {
    var unit = modelService.unit(model);
    unit = R.exists(unit) ? unit : '';

    var unit_text = modelService.isUnitDisplayed(model) ? unit + '' : '';
    unit_text = R.length(unit_text) > 0 ? 'U' + unit_text : unit_text;

    var unit_center = computeUnitCenter(img, info, model);
    labelElementService.update(map_flipped, zoom_factor, unit_center.flip, unit_center.text, unit_text, element.unit);
  }
  function computeLabelCenter(info, model) {
    var label_text_center_y_down = model.state.y + info.base_radius + 6;
    var label_text_center_y_up = model.state.y - info.base_radius - 2;
    var orientation = (model.state.r % 360 + 360) % 360;
    var model_looking_down = orientation > 90 && orientation < 270;
    var label_text_center = { x: model.state.x,
      y: model_looking_down ? label_text_center_y_down : label_text_center_y_up
    };
    var label_flip_center = { x: label_text_center.x,
      y: label_text_center.y - 2
    };
    return { text: label_text_center,
      flip: label_flip_center
    };
  }
  function computeUnitCenter(img, info) {
    var counter_flip_center = { x: img.width / 2, y: img.height / 2 };
    var counter_text_center = { x: counter_flip_center.x - info.base_radius * 0.7 - 5,
      y: counter_flip_center.y - info.base_radius * 0.7 - 5 };
    return { text: counter_text_center,
      flip: counter_flip_center
    };
  }
  return clickGameModeDirective;
}]).directive('clickGameModelsList', [function () {
  return {
    restrict: 'A',
    templateUrl: 'partials/game/models_list.html',
    scope: true,
    link: function link(scope, element) {
      scope.type = element[0].getAttribute('click-game-models-list');
      scope.digestOnStateChangeEvent('Game.model.create', scope);
      console.log('clickGameModelsList', scope.type);
    }
  };
}]);
//# sourceMappingURL=gameModel.js.map
