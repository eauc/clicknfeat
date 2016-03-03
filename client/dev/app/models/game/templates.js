'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.services').factory('gameTemplates', gameTemplatesModelFactory);

  gameTemplatesModelFactory.$inject = ['template', 'gameElements'];
  function gameTemplatesModelFactory(templateModel, gameElementsModel) {
    var base = gameElementsModel('template', templateModel);
    var gameTemplatesModel = Object.create(base);
    R.deepExtend(gameTemplatesModel, {
      modeForStampP: gameTemplatesModeForStampP,
      fromStampsP: gameTemplatesFromStampsP,
      onStampsP: gameTemplatesOnStampsP
    });

    var fromStampsP$ = R.curry(fromStampsP);
    var updateTemplates$ = R.curry(updateTemplates);

    R.curryService(gameTemplatesModel);
    return gameTemplatesModel;

    function gameTemplatesModeForStampP(stamp, templates) {
      return R.threadP(templates)(gameTemplatesModel.findStampP$(stamp), R.path(['state', 'type']), R.defaultTo('aoe'), function (type) {
        return type + 'Template';
      });
    }
    function gameTemplatesFromStampsP(method, args, stamps, templates) {
      return fromStampsP$(R.compose(R.always, R.always(null)), method, args, stamps, templates);
    }
    function gameTemplatesOnStampsP(method, args, stamps, templates) {
      return R.threadP(templates)(fromStampsP$(R.always, method, args, stamps), updateTemplates$(templates));
    }
    function fromStampsP(onError, method, args, stamps, templates) {
      return R.threadP(templates)(gameTemplatesModel.findAnyStampsP$(stamps), R.reject(R.isNil), R.map(callMethodOnTemplate), R.promiseAll);

      function callMethodOnTemplate(template) {
        return self.Promise.resolve(templateModel.callP(method, args, template)).catch(onError(template));
      }
    }
    function updateTemplates(templates, news) {
      return R.thread(templates)(gameTemplatesModel.all, R.concat(news), R.uniqBy(R.path(['state', 'stamp'])), R.partition(templateModel.isLocked), function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var locked = _ref2[0];
        var active = _ref2[1];

        return {
          active: active,
          locked: locked
        };
      });
    }
  }
})();
//# sourceMappingURL=templates.js.map
