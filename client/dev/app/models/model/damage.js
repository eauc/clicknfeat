'use strict';

(function () {
  angular.module('clickApp.services').factory('modelDamage', modelDamageModelFactory);

  modelDamageModelFactory.$inject = ['gameFactions'];
  function modelDamageModelFactory(gameFactionsModel) {
    var DMG_LENS = R.lensPath(['state', 'dmg']);
    var DMG_FIELD_LENS = R.lensPath(['state', 'dmg', 'f']);
    return function () {
      var modelDamageModel = {
        resetDamage: modelResetDamage,
        setWarriorDamage: modelSetWarriorDamage,
        setFieldDamage: modelSetFieldDamage,
        setGridDamage: modelSetGridDamage,
        setGridColDamage: modelSetGridColDamage
      };
      return modelDamageModel;

      function modelResetDamage(model) {
        return R.over(DMG_LENS, R.pipe(R.keys, R.reduce(resetDamageEntry, {})), model);

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
      function modelSetWarriorDamage(factions, i, model) {
        return R.thread(factions)(gameFactionsModel.getModelInfo$(model.state.info), R.ifElse(R.isNil, function () {
          return model;
        }, function (info) {
          var value = R.defaultTo(0, model.state.dmg.n);
          value = value === i ? 0 : i;
          value = Math.min(value, info.damage.n);
          return R.over(DMG_LENS, R.pipe(R.assoc('n', value), R.assoc('t', value)), model);
        }));
      }
      function modelSetFieldDamage(factions, i, model) {
        return R.thread(factions)(gameFactionsModel.getModelInfo$(model.state.info), R.ifElse(R.isNil, function () {
          return model;
        }, function (info) {
          var value = R.defaultTo(0, model.state.dmg.f);
          value = value === i ? 0 : i;
          value = Math.min(value, info.damage.field);
          return R.set(DMG_FIELD_LENS, value, model);
        }));
      }
      function modelSetGridDamage(factions, line, col, model) {
        return R.thread(factions)(gameFactionsModel.getModelInfo$(model.state.info), R.ifElse(R.isNil, function () {
          return model;
        }, function (info) {
          var value = model.state.dmg[col][line];
          value = value === 0 ? 1 : 0;
          value = R.exists(info.damage[col][line]) ? value : 0;
          return R.over(DMG_LENS, R.pipe(R.over(R.lensProp(col), R.update(line, value)), function (dmg) {
            return R.assoc('t', computeTotalGridDamage(dmg), dmg);
          }), model);
        }));
      }
      function modelSetGridColDamage(factions, col, model) {
        return R.thread(factions)(gameFactionsModel.getModelInfo$(model.state.info), R.ifElse(R.isNil, function () {
          return model;
        }, function (info) {
          var full = R.thread(model.state.dmg[col])(R.addIndex(R.filter)(function (_val_, line) {
            return R.exists(info.damage[col][line]);
          }), R.reject(R.equals(1)), R.isEmpty);
          var value = full ? 0 : 1;
          return R.over(DMG_LENS, R.pipe(R.over(R.lensProp(col), R.addIndex(R.map)(function (_val_, line) {
            return R.exists(info.damage[col][line]) ? value : 0;
          })), function (dmg) {
            return R.assoc('t', computeTotalGridDamage(dmg), dmg);
          }), model);
        }));
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
