'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

angular.module('clickApp.services').factory('gameTemplates', ['template', function gameTemplatesServiceFactory(templateService) {
  var gameTemplatesService = {
    create: function create() {
      return {
        active: [],
        locked: []
      };
    },
    all: function templatesAll(templates) {
      return R.concat(templates.active, templates.locked);
    },
    findStampIn: function templatesFindStampIn(stamp, where, templates) {
      return new self.Promise(function (resolve, reject) {
        var find = R.pipe(R.prop(where), R.find(R.pathEq(['state', 'stamp'], stamp)))(templates);
        return R.exists(find) ? resolve(find) : reject('stamp ' + stamp + ' not found in ' + where);
      });
    },
    findStamp: function templatesFindStamp(stamp, templates) {
      return gameTemplatesService.findStampIn(stamp, 'active', templates).catch(function () {
        return gameTemplatesService.findStampIn(stamp, 'locked', templates);
      });
    },
    findAnyStamps: function templatesFindAnyStamps(stamps, templates) {
      return R.pipePromise(R.map(function (stamp) {
        return gameTemplatesService.findStamp(stamp, templates).catch(R.always(null));
      }), R.promiseAll, function (stamps) {
        if (R.isEmpty(R.reject(R.isNil, stamps))) {
          console.log('DeleteTemplate : no templates found');
          return self.Promise.reject('No template found');
        }
        return stamps;
      })(stamps);
    },
    onStamps: function templatesOnStamps() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var templates = R.last(args);
      var stamps = R.nth(-2, args);

      args = R.slice(0, -2, args);
      return R.pipeP(gameTemplatesService.findAnyStamps$(stamps), R.reject(R.isNil), R.map(function (template) {
        return templateService.call.apply(null, R.append(template, args));
      }), R.promiseAll)(templates);
    },
    add: function templatesAdd(temps, templates) {
      return R.pipe(gameTemplatesService.removeStamps$(R.map(R.path(['state', 'stamp']), temps)), function (templates) {
        return R.assoc('active', R.concat(templates.active, temps), templates);
      })(templates);
    },
    removeStamps: function templatesRemoveStamps(stamps, templates) {
      function inStamps(template) {
        return R.find(R.equals(R.path(['state', 'stamp'], template)), stamps);
      }
      return R.pipe(R.assoc('active', R.reject(inStamps, templates.active)), R.assoc('locked', R.reject(inStamps, templates.locked)))(templates);
    },
    isActive: function templatesIsLocked(stamp, templates) {
      return R.find(R.pathEq(['state', 'stamp'], stamp), templates.active);
    },
    isLocked: function templatesIsLocked(stamp, templates) {
      return R.find(R.pathEq(['state', 'stamp'], stamp), templates.locked);
    },
    lockStamps: function templatesLockStamps(lock, stamps, templates) {
      return R.pipeP(gameTemplatesService.findAnyStamps$(stamps), R.reject(R.isNil), R.forEach(templateService.setLock$(lock)), function () {
        var _R$pipe = R.pipe(gameTemplatesService.all, R.partition(templateService.isLocked))(templates);

        var _R$pipe2 = _slicedToArray(_R$pipe, 2);

        var locked = _R$pipe2[0];
        var active = _R$pipe2[1];

        return {
          active: active,
          locked: locked
        };
      })(templates);
    },
    modeForStamp: function templateSelectionModeForStamp(stamp, templates) {
      return R.pipeP(gameTemplatesService.findStamp$(stamp), R.path(['state', 'type']), R.defaultTo('aoe'), function (type) {
        return type + 'Template';
      })(templates);
    }
  };
  R.curryService(gameTemplatesService);
  return gameTemplatesService;
}]);
//# sourceMappingURL=templates.js.map
