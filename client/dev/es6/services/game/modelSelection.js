'use strict';

angular.module('clickApp.services')
  .factory('gameModelSelection', [
    'modes',
    'gameModels',
    function gameModelSelectionServiceFactory(modesService,
                                              gameModelsService) {
      function checkSelection(where, state) {
        if('local' === where) {
          state.event('Modes.switchTo', 'Default');
          state.changeEvent('Game.model.selection.local.change');
        }
      }
      var gameModelSelectionService = {
        create: function modelSelectionCreate() {
          return {
            local: [],
            remote: []
          };
        },
        'in': function modelSelectionIn(where, stamp, selection) {
          var stamps = R.prop(where, selection);
          return R.find(R.equals(stamp), stamps);
        },
        inSingle: function modelSelectionInSingle(where, stamp, selection) {
          var stamps = R.prop(where, selection);
          return ( R.length(stamps) === 1 &&
                   stamps[0] === stamp );
        },
        get: function modelSelectionGet(where, selection) {
          return R.pipe(
            R.defaultTo({}),
            R.propOr([], where)
          )(selection);
        },
        modeFor: function(models, selection) {
          var local = gameModelSelectionService.get('local', selection);
          if(R.isEmpty(local)) {
            return self.Promise.reject('No model selection');
          }
          if(R.length(local) === 1) {
            return gameModelsService.modeForStamp(local[0], models);
          }
          return 'Models';
        },
        checkMode: function modelSelectionCheckMode(state, selection) {
          return R.pipePromise(
            gameModelSelectionService.modeFor$(state.game.models),
            (mode) => {
              state.event('Modes.switchTo', mode);
            }
          )(selection);
        },
        set: function modelSelectionSet(where, stamps, state, selection) {
          var previous = gameModelSelectionService.get(where, selection);
          var ret = R.assoc(where, stamps, selection);

          checkSelection(where, state);
          
          R.forEach((stamp) => {
            state.changeEvent(`Game.model.change.${stamp}`);
          }, stamps);
          R.forEach((stamp) => {
            state.changeEvent(`Game.model.change.${stamp}`);
          }, previous);

          return ret;
        },
        addTo: function modelSelectionSet(where, stamps, state, selection) {
          var previous = gameModelSelectionService.get(where, selection);
          var new_selection = R.uniq(R.concat(previous, stamps));
          var ret = R.assoc(where, new_selection, selection);

          checkSelection(where, state);
          
          R.forEach((stamp) => {
            state.changeEvent(`Game.model.change.${stamp}`);
          }, new_selection);

          return ret;
        },
        removeFrom: function modelSelectionRemoveFrom(where, stamps, state, selection) {
          var previous = R.prop(where, selection);
          var new_selection = R.difference(previous, stamps);
          var ret = R.assoc(where, new_selection, selection);
          
          checkSelection(where, state);

          R.forEach((stamp) => {
            state.changeEvent(`Game.model.change.${stamp}`);
          }, R.uniq(R.concat(previous, stamps)));

          return ret;
        },
        clear: function modelSelectionClear(where, stamps, state, selection) {
          var previous = R.prop(where, selection);
          return gameModelSelectionService
            .removeFrom(where, previous, state, selection);
        }
      };
      R.curryService(gameModelSelectionService);
      return gameModelSelectionService;
    }
  ]);
