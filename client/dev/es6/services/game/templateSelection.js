angular.module('clickApp.services')
  .factory('gameTemplateSelection', [
    'modes',
    'gameTemplates',
    function gameTemplateSelectionServiceFactory(modesService,
                                                 gameTemplatesService) {
      var gameTemplateSelectionService = {
        create: function templateSelectionCreate() {
          return {
            local: [],
            remote: [],
          };
        },
        'in': function templateSelectionIn(where, stamp, selection) {
          var stamps = R.prop(where, selection);
          return R.find(R.equals(stamp), stamps);
        },
        inSingle: function templateSelectionIn(where, stamp, selection) {
          var stamps = R.prop(where, selection);
          return ( R.length(stamps) === 1 &&
                   stamp === stamps[0]
                 );
        },
        get: function templateSelectionGet(where, selection) {
          return R.defaultTo([], R.prop(where, selection));
        },
        checkMode: function templateSelectionCheckMode(scope, selection) {
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
                  return scope.doSwitchToMode(mode);
                }
              )(scope.game.templates);
            }
          )(selection);
        },
        set: function templateSelectionSet(where, stamps, scope, selection) {
          var previous = gameTemplateSelectionService.get(where, selection);
          var ret = R.assoc(where, stamps, selection);

          if('local' === where) {
            scope.doSwitchToMode('Default');
            checkSingleSelection(scope, ret);
          }
          
          R.forEach((stamp) => {
            scope.gameEvent('changeTemplate-'+stamp);
          }, stamps);
          R.forEach((stamp) => {
            scope.gameEvent('changeTemplate-'+stamp);
          }, previous);

          return ret;
        },
        removeFrom: function templateSelectionRemoveFrom(where, stamps, scope, selection) {
          var previous = R.prop(where, selection);
          var new_selection = R.difference(previous, stamps);
          var ret = R.assoc(where, new_selection, selection);
          
          if('local' === where) {
            scope.doSwitchToMode('Default');
            checkSingleSelection(scope, ret);
          }

          R.forEach((stamp) => {
            scope.gameEvent('changeTemplate-'+stamp);
          }, R.uniq(R.concat(previous, stamps)));

          return ret;
        },
        clear: function templateSelectionClear(where, scope, selection) {
          var previous = R.prop(where, selection);
          return gameTemplateSelectionService.removeFrom(where, previous, scope, selection);
        },
      };
      function checkSingleSelection(scope, selection) {
        if(R.length(R.prop('local', selection)) !== 1) {
          scope.gameEvent('disableSingleAoESelection');
        }
      }
      R.curryService(gameTemplateSelectionService);
      return gameTemplateSelectionService;
    }
  ]);
