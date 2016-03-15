'use strict';

(function () {
  angular.module('clickApp.services').factory('modelDamage', modelDamageModelFactory);

  modelDamageModelFactory.$inject = ['gameFactions'];
  function modelDamageModelFactory(gameFactionsModel) {
    return function () {
      var modelDamageModel = {
        resetDamage: modelResetDamage,
        setWarriorDamageP: modelSetWarriorDamageP,
        setFieldDamageP: modelSetFieldDamageP,
        setGridDamageP: modelSetGridDamageP,
        setGridColDamageP: modelSetGridColDamageP
      };
      return modelDamageModel;

      function modelResetDamage(model) {
        return R.over(R.lensPath(['state', 'dmg']), R.pipe(R.keys, R.reduce(resetDamageEntry, {})), model);

        function resetDamageEntry(mem, key) {
          var value = model.state.dmg[key];
          if ('Array' === R.type(value)) {
            value = R.map(R.always(0), value);
          } else {
            value = 0;
          }
          return R.assoc(key, value, mem);
        }
      }
      function modelSetWarriorDamageP(factions, i, model) {
        return R.threadP(factions)(gameFactionsModel.getModelInfoP$(model.state.info), function (info) {
          var value = R.defaultTo(0, model.state.dmg.n);
          value = value === i ? 0 : i;
          value = Math.min(value, info.damage.n);
          return R.over(R.lensPath(['state', 'dmg']), R.pipe(R.assoc('n', value), R.assoc('t', value)), model);
        });
      }
      function modelSetFieldDamageP(factions, i, model) {
        return R.threadP(factions)(gameFactionsModel.getModelInfoP$(model.state.info), function (info) {
          var value = R.defaultTo(0, model.state.dmg.f);
          value = value === i ? 0 : i;
          value = Math.min(value, info.damage.field);
          return R.assocPath(['state', 'dmg', 'f'], value, model);
        });
      }
      function modelSetGridDamageP(factions, line, col, model) {
        return R.threadP(factions)(gameFactionsModel.getModelInfoP$(model.state.info), function (info) {
          var value = model.state.dmg[col][line];
          value = value === 0 ? 1 : 0;
          value = R.exists(info.damage[col][line]) ? value : 0;
          return R.over(R.lensPath(['state', 'dmg']), R.pipe(R.over(R.lensProp(col), R.update(line, value)), function (dmg) {
            return R.assoc('t', computeTotalGridDamage(dmg), dmg);
          }), model);
        });
      }
      function modelSetGridColDamageP(factions, col, model) {
        return R.threadP(factions)(gameFactionsModel.getModelInfoP$(model.state.info), function (info) {
          var full = R.thread(model.state.dmg[col])(R.addIndex(R.filter)(function (val, line) {
            return R.exists(info.damage[col][line]);
          }), R.reject(R.equals(1)), R.isEmpty);
          var value = full ? 0 : 1;
          return R.over(R.lensPath(['state', 'dmg']), R.pipe(R.over(R.lensProp(col), R.addIndex(R.map)(function (val, line) {
            return R.exists(info.damage[col][line]) ? value : 0;
          })), function (dmg) {
            return R.assoc('t', computeTotalGridDamage(dmg), dmg);
          }), model);
        });
      }
      function computeTotalGridDamage(damage) {
        return R.thread(damage)(R.keys, R.reject(R.equals('t')), R.reject(R.equals('f')), R.reject(R.equals('n')), R.reduce(function (mem, col) {
          return mem + R.reduce(R.add, 0, damage[col]);
        }, 0));
      }
    };
  }
})();
//# sourceMappingURL=damage.js.map
