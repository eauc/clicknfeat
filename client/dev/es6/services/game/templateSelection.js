angular.module('clickApp.services')
  .factory('gameTemplateSelection', [
    'modes',
    'gameTemplates',
    function gameTemplateSelectionServiceFactory(modesService,
                                                 gameTemplatesService) {
      function checkSelection(where, state) {
        if('local' === where) {
          state.event('Modes.switchTo', 'Default');
          state.changeEvent('Game.template.selection.local.change');
        }
      }
      var gameTemplateSelectionService = {
        create: function templateSelectionCreate() {
          return {
            local: [],
            remote: []
          };
        },
        'in': function templateSelectionIn(where, stamp, selection) {
          var stamps = R.prop(where, selection);
          return R.find(R.equals(stamp), stamps);
        },
        get: function templateSelectionGet(where, selection) {
          return R.propOr([], where, selection);
        },
        checkMode: function templateSelectionCheckMode(state, selection) {
          return R.pipePromise(
            gameTemplateSelectionService.get$('local'),
            R.head,
            (stamp) => {
              if(R.isNil(stamp)) {
                return self.Promise.reject('No template selection');
              }

              return R.pipeP(
                gameTemplatesService.modeForStamp$(stamp),
                (mode) => {
                  return state.event('Modes.switchTo', mode);
                }
              )(state.game.templates);
            }
          )(selection);
        },
        set: function templateSelectionSet(where, stamps, state, selection) {
          var previous = gameTemplateSelectionService.get(where, selection);
          var ret = R.assoc(where, stamps, selection);

          checkSelection(where, state);
          
          R.forEach((stamp) => {
            state.changeEvent(`Game.template.change.${stamp}`);
          }, stamps);
          R.forEach((stamp) => {
            state.changeEvent(`Game.template.change.${stamp}`);
          }, previous);

          return ret;
        },
        removeFrom: function templateSelectionRemoveFrom(where, stamps, state, selection) {
          var previous = R.prop(where, selection);
          var new_selection = R.difference(previous, stamps);
          var ret = R.assoc(where, new_selection, selection);
          
          checkSelection(where, state);

          R.forEach((stamp) => {
            state.changeEvent(`Game.template.change.${stamp}`);
          }, R.uniq(R.concat(previous, stamps)));

          return ret;
        },
        clear: function templateSelectionClear(where, state, selection) {
          var previous = R.prop(where, selection);
          return gameTemplateSelectionService
            .removeFrom(where, previous, state, selection);
        }
      };
      R.curryService(gameTemplateSelectionService);
      return gameTemplateSelectionService;
    }
  ]);
