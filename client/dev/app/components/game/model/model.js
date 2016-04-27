'use strict';

(function () {
  angular.module('clickApp.directives').directive('clickGameModel', gameModelDirectiveFactory).directive('clickGameModelsList', gameModelsListDirectiveFactory);

  gameModelDirectiveFactory.$inject = ['appState', 'gameMap', 'gameFactions', 'model',
  // 'gameModels',
  'gameModelSelection'];

  // 'gameScenario',
  // 'labelElement',
  // 'clickGameModelArea',
  // 'clickGameModelAura',
  // 'clickGameModelBase',
  // 'clickGameModelCharge',
  // 'clickGameModelCounter',
  // 'clickGameModelDamage',
  // 'clickGameModelIcon',
  // 'clickGameModelLoS',
  // 'clickGameModelMelee',
  function gameModelDirectiveFactory(appStateService, gameMapService, gameFactionsModel, modelModel,
  // gameModelsModel,
  gameModelSelectionModel
  // gameScenarioModel,
  // labelElementModel,
  // clickGameModelAreaModel,
  // clickGameModelAuraModel,
  // clickGameModelBaseModel,
  // clickGameModelChargeModel,
  // clickGameModelCounterModel,
  // clickGameModelDamageModel,
  // clickGameModelIconModel,
  // clickGameModelLoSModel,
  // clickGameModelMeleeModel
  ) {
    var clickGameModelDirective = {
      restrict: 'A',
      link: link
    };
    return clickGameModelDirective;

    function link(scope, _parent_) {
      var state = scope.state;
      var model = scope.model;
      var info = R.thread(state.factions)(gameFactionsModel.getModelInfo$(model.state.info), R.defaultTo({ base_radius: 5.905 }));
      console.log('gameModel', scope.model, info);

      scope.onStateChangeEvent('Game.view.flipMap', onUpdate, scope);
      scope.onStateChangeEvent('Game.models.change', onUpdate, scope);
      scope.onStateChangeEvent('Game.model_selection.change', onUpdate, scope);
      scope.onStateChangeEvent('Game.model.change.' + model.state.stamp, _onUpdate, scope);
      updateModel(scope);

      var _model = undefined;
      var _selection = undefined;
      var _is_flipped = undefined;
      function onUpdate() {
        var map = document.getElementById('map');
        var is_flipped = gameMapService.isFlipped(map);
        var state = appStateService.current();
        var selection = R.path(['game', 'model_selection'], state);
        var model = scope.model;
        if (_model === model && _selection === selection && _is_flipped === is_flipped) {
          return;
        }
        _model = model;
        _selection = selection;
        _is_flipped = is_flipped;

        _onUpdate();
      }
      function _onUpdate() {
        updateModel(scope);
        scope.$digest();
      }
    }
    function updateModel(scope) {
      var map = document.getElementById('map');
      var is_flipped = gameMapService.isFlipped(map);
      var model = scope.model;

      var state = appStateService.current();
      scope.render = modelModel.render(is_flipped, state.factions, model.state);

      var selection = R.path(['game', 'model_selection'], state);
      var stamp = model.state.stamp;
      var local = gameModelSelectionModel.in('local', stamp, selection);
      var remote = gameModelSelectionModel.in('remote', stamp, selection);
      var single_local = gameModelSelectionModel.inSingle('local', stamp, selection);
      var single_remote = gameModelSelectionModel.inSingle('remote', stamp, selection);
      scope.selection = {
        local: local,
        remote: remote,
        single_local: single_local,
        single_remote: single_remote
      };
      console.warn('RENDER MODEL', model.state.stamp, scope.render, scope.selection);
    }
    // function buildModelElement(state, info, model, container, scope) {
    //   const element = createModelElement(info, model, container);

    // scope.$on('$destroy', gameModelOnDestroy(element));
    // scope.onStateChangeEvent('Game.map.flipped',
    //                          gameModelOnMapFlipped(info, scope, element),
    //                          scope);
    // const updateModel = gameModelOnUpdate(state, info, scope, element);
    // scope.onStateChangeEvent(`Game.model.change.${model.state.stamp}`,
    //                          updateModel, scope);
    // updateModel();

    // scope.onStateChangeEvent('Game.model.selection.local.updateSingle',
    //                          onUpdateSingleModelSelection(scope, element),
    //                          scope);

    // scope.onStateChangeEvent('Game.template.selection.local.updateSingle',
    //                          onUpdateSingleTemplateSelection(scope, element),
    //                          scope);

    // const onUpdateScenarioAura = withModel(scope, (model) => {
    //   updateScenarioAura(state, info, model, scope, element);
    // });
    // scope.onStateChangeEvent('Game.scenario.refresh',
    //                          onUpdateScenarioAura, scope);
    // scope.onStateChangeEvent('Game.scenario.change',
    //                          onUpdateScenarioAura, scope);
    // }
    // function createModelElement(info, model, parent) {
    //   const map = document.getElementById('map');
    //   const under_models_container = document.getElementById('game-under-models');
    //   const over_models_container = document.getElementById('game-over-models');
    //   const svgNS = map.namespaceURI;

    //   const aura = clickGameModelAuraModel.create(svgNS, parent);
    //   const melee = clickGameModelMeleeModel.create(svgNS, parent);
    //   const base = clickGameModelBaseModel.create(svgNS, info, model, parent);
    //   const damage = clickGameModelDamageModel.create(svgNS, info, parent);
    //   const los = clickGameModelLoSModel.create(svgNS, info, parent);
    //   const label = labelElementModel.create(svgNS, over_models_container);
    //   const counter = clickGameModelCounterModel.create(svgNS, over_models_container, parent);
    //   const unit = labelElementModel.create(svgNS, parent);
    //   const icon = clickGameModelIconModel.create(svgNS, parent);
    //   const area = clickGameModelAreaModel.create(svgNS, parent);
    //   const charge = clickGameModelChargeModel.create(svgNS,
    //                                                   under_models_container,
    //                                                   over_models_container,
    //                                                   parent);

    //   return { container: parent,
    //            aura: aura,
    //            base: base,
    //            damage: damage,
    //            los: los,
    //            label: label,
    //            counter: counter,
    //            unit: unit,
    //            icon: icon,
    //            area: area,
    //            melee: melee,
    //            charge: charge
    //          };
    // }
    // function gameModelOnDestroy(element) {
    //   return () => {
    //     console.log('gameModelOnDestroy');

    //     const under_models_container = document.getElementById('game-under-models');
    //     const over_models_container = document.getElementById('game-over-models');
    //     over_models_container.removeChild(element.label.label);
    //     clickGameModelCounterModel.cleanup(under_models_container,
    //                                        over_models_container,
    //                                        element.counter);
    //     clickGameModelChargeModel.cleanup(under_models_container,
    //                                       over_models_container,
    //                                       element.charge);
    //   };
    // }
    // function withModel(scope, fn) {
    //   return (...args) => {
    //     R.threadP(scope.state.game.models)(
    //       gameModelsModel.findStampP$(scope.model.state.stamp),
    //       (model) => fn.apply(null, [model, ...args])
    //     );
    //   };
    // }
    // function gameModelOnMapFlipped(info, scope, element) {
    //   return withModel(scope, (model) => {
    //     const map = document.getElementById('map');

    //     const label_center = computeLabelCenter(info, model);
    //     labelElementModel.updateOnFlipMap(map,
    //                                       label_center.flip,
    //                                       element.label);
    //     labelElementModel.updateOnFlipMap(map,
    //                                       model.state,
    //                                       element.counter[0]);
    //     if(modelModel.isCharging(model) ||
    //        modelModel.isPlacing(model)) {
    //       labelElementModel.updateOnFlipMap(map,
    //                                         model.state.cha.s,
    //                                         element.charge[2]);
    //     }
    //   });
    // }
    // function onUpdateSingleModelSelection(scope, element) {
    //   return withModel(scope, (model, _event_, sel_stamp, sel_model) => {
    //     if(R.isNil(sel_model) ||
    //        sel_stamp === model.state.stamp) {
    //       element.container.classList.remove('overlap');
    //       element.container.classList.remove('b2b');
    //       return;
    //     }
    //     R.threadP(model)(
    //       modelModel.distanceToP$(scope.state.factions, sel_model),
    //       (dist) => {
    //         if(dist < -0.1) {
    //           element.container.classList.add('overlap');
    //           element.container.classList.remove('b2b');
    //           return;
    //         }
    //         else if(dist < 0.1) {
    //           element.container.classList.remove('overlap');
    //           element.container.classList.add('b2b');
    //           return;
    //         }
    //         else {
    //           element.container.classList.remove('overlap');
    //           element.container.classList.remove('b2b');
    //         }
    //       }
    //     );
    //   });
    // }
    // function onUpdateSingleTemplateSelection(scope, element) {
    //   return withModel(scope, (model, _event_, _sel_stamp_, sel_temp) => {
    //     // console.log('onUpdateSingleAoTemplateSelection',
    //     //             sel_stamp, model.state.stamp);
    //     if(R.isNil(sel_temp) ||
    //        'aoe' !== sel_temp.state.type) {
    //       element.container.classList.remove('under-aoe');
    //       return;
    //     }
    //     R.threadP(model)(
    //       modelModel.distanceToAoEP$(scope.state.factions, sel_temp),
    //       (dist) => {
    //         if(dist <= 0) {
    //           element.container.classList.add('under-aoe');
    //         }
    //         else {
    //           element.container.classList.remove('under-aoe');
    //         }
    //       }
    //     );
    //   });
    // }
    // function gameModelOnUpdate(state, info,
    //                            scope, element) {
    //   return withModel(scope, (model) => {
    //     const map = document.getElementById('map');
    //     const map_flipped = gameMapService.isFlipped(map);
    //     const zoom_factor = gameMapService.zoomFactor(map);

    //     const is_wreck = modelModel.isWreckDisplayed(model);
    //     (is_wreck
    //      ? modelModel.getWreckImageP(state.factions, model)
    //      : modelModel.getImageP(state.factions, model)
    //     ).then((img) => {
    //       const label_text = modelModel.fullLabel(model);
    //       const label_center = computeLabelCenter(info, model);

    //       updateModelPosition(img, model, element);
    //       updateModelSelection(state.game.model_selection,
    //                            model, element);
    //       updateScenarioAura(state, info, model, scope, element);
    //       clickGameModelAuraModel.update(info, model, img, element.aura);
    //       clickGameModelBaseModel.update(info, model, img, element.base);
    //       clickGameModelDamageModel.update(info, model, img, element.damage);
    //       labelElementModel.update(map_flipped,
    //                                zoom_factor,
    //                                label_center.flip,
    //                                label_center.text,
    //                                label_text,
    //                                element.label);
    //       clickGameModelCounterModel.update(map_flipped, zoom_factor,
    //                                         info, model, img, element.counter);
    //       updateUnit(map_flipped, zoom_factor,
    //                  img, info, model, element);
    //       clickGameModelIconModel.update(info, model, img, element.icon);
    //       clickGameModelAreaModel.update(state.factions, info, model, img, element.area);
    //       clickGameModelMeleeModel.update(info, model, img, element.melee);
    //       clickGameModelChargeModel.update(map_flipped, zoom_factor,
    //                                        state, info, model, img, element.charge);
    //     });
    //   });
    // }
    // function updateModelPosition(img, model, element) {
    //   element.container.setAttribute('transform', [
    //     'translate(',
    //     model.state.x-img.width/2,
    //     ',',
    //     model.state.y-img.height/2,
    //     ') rotate(',
    //     model.state.r,
    //     ',',
    //     img.width/2,
    //     ',',
    //     img.height/2,
    //     ')'
    //   ].join(''));
    // }
    // function updateModelSelection(selection, model, element) {
    //   const container = element.container;
    //   const stamp = model.state.stamp;
    //   if(gameModelSelectionModel.in('local', stamp, selection)) {
    //     container.classList.add('local-selection');
    //   }
    //   else {
    //     container.classList.remove('local-selection');
    //   }
    //   if(gameModelSelectionModel.in('remote', stamp, selection)) {
    //     container.classList.add('remote-selection');
    //   }
    //   else {
    //     container.classList.remove('remote-selection');
    //   }
    //   if(gameModelSelectionModel.inSingle('local', stamp, selection)) {
    //     container.classList.add('single-local');
    //     container.classList.remove('single-remote');
    //   }
    //   else if(gameModelSelectionModel.inSingle('remote', stamp, selection)) {
    //     container.classList.remove('single-local');
    //     container.classList.add('single-remote');
    //   }
    //   else {
    //     container.classList.remove('single-local');
    //     container.classList.remove('single-remote');
    //   }
    // }
    // function updateScenarioAura(state, info, model, scope, element) {
    //   const circle = R.thread(model.state)(
    //     R.pick(['x','y']),
    //     R.assoc('radius', info.base_radius)
    //   );

    //   if(scope.app.stateIs('game.setup') &&
    //      R.exists(state.game.scenario) &&
    //      gameScenarioModel.isContesting(circle, state.game.scenario)) {
    //     element.container.classList.add('contesting');
    //   }
    //   else {
    //     element.container.classList.remove('contesting');
    //   }
    //   if(scope.app.stateIs('game.setup') &&
    //      R.exists(state.game.scenario) &&
    //      'wardude' === info.type &&
    //      gameScenarioModel.isKillboxing(circle, state.game.scenario)) {
    //     element.container.classList.add('killboxing');
    //   }
    //   else {
    //     element.container.classList.remove('killboxing');
    //   }
    // }
    // function updateUnit(map_flipped, zoom_factor, img, info, model, element) {
    //   let unit = modelModel.unit(model);
    //   unit = R.exists(unit) ? unit : '';

    //   let unit_text = modelModel.isUnitDisplayed(model) ? unit+'' : '';
    //   unit_text = R.length(unit_text) > 0 ? 'U'+unit_text : unit_text;

    //   const unit_center = computeUnitCenter(img, info, model);
    //   labelElementModel.update(map_flipped,
    //                            zoom_factor,
    //                            unit_center.flip,
    //                            unit_center.text,
    //                            unit_text,
    //                            element.unit);
    // }
    // function computeLabelCenter(info, model) {
    //   const label_text_center_y_down = model.state.y + info.base_radius + 6;
    //   const label_text_center_y_up = model.state.y - info.base_radius - 2;
    //   const orientation = ((model.state.r % 360) + 360) % 360;
    //   const model_looking_down =  orientation > 90 && orientation < 270;
    //   const label_text_center = { x: model.state.x,
    //                               y: ( model_looking_down
    //                                    ? label_text_center_y_down
    //                                    : label_text_center_y_up
    //                                  )
    //                             };
    //   const label_flip_center = { x: label_text_center.x,
    //                               y: label_text_center.y - 2
    //                             };
    //   return { text: label_text_center,
    //            flip: label_flip_center
    //          };
    // }
    // function computeUnitCenter(img, info) {
    //   const counter_flip_center = { x: img.width/2, y: img.height/2 };
    //   const counter_text_center = { x: counter_flip_center.x - info.base_radius*0.7 - 5,
    //                                 y: counter_flip_center.y - info.base_radius*0.7 - 5
    //                               };
    //   return { text: counter_text_center,
    //            flip: counter_flip_center
    //          };
    // }
  }

  gameModelsListDirectiveFactory.$inject = [];
  function gameModelsListDirectiveFactory() {
    return {
      restrict: 'A',
      templateUrl: 'app/components/game/model/models_list.html',
      scope: true,
      link: link
    };

    function link(scope, element) {
      scope.type = element[0].getAttribute('click-game-models-list');
      scope.digestOnStateChangeEvent('Game.models.change', scope);
      console.log('clickGameModelsList', scope.type);
    }
  }
})();
//# sourceMappingURL=model.js.map
