'use strict';

angular.module('clickApp.services')
  .factory('modelDamage', [
    'gameFactions',
    function modelDamageServiceFactory(gameFactionsService) {
      return function(modelService) {
        var modelDamageService = {
          resetDamage: function modelResetDamage(model) {
            model.state.dmg = R.pipe(
              R.keys,
              R.reduce(function(mem, key) {
                var value = model.state.dmg[key];
                if('Array' === R.type(value)) {
                  value = R.map(R.always(0), value);
                }
                else {
                  value = 0;
                }
                return R.assoc(key, value, mem);
              }, {})
            )(model.state.dmg);
          },
          setWarriorDamage: function modelSetWarriorDamage(factions, i, model) {
            return R.pipeP(
              gameFactionsService.getModelInfo$(model.state.info),
              function(info) {
                var value = R.defaultTo(0, model.state.dmg.n);
                value = (value === i) ? 0 : i;
                value = Math.min(value, info.damage.n);
                model.state.dmg = R.pipe(
                  R.assoc('n', value),
                  R.assoc('t', value)
                )(model.state.dmg);
              }
            )(factions);
          },
          setFieldDamage: function modelSetFieldDamage(factions, i, model) {
            return R.pipeP(
              gameFactionsService.getModelInfo$(model.state.info),
              function(info) {
                var value = R.defaultTo(0, model.state.dmg.f);
                value = (value === i) ? 0 : i;
                value = Math.min(value, info.damage.field);
                model.state.dmg = R.assoc('f', value, model.state.dmg);
              }
            )(factions);
          },
          setGridDamage: function modelSetGridDamage(factions, line, col, model) {
            return R.pipeP(
              gameFactionsService.getModelInfo$(model.state.info),
              function(info) {
                var value = model.state.dmg[col][line];
                value = (value === 0) ? 1 : 0;
                value = R.exists(info.damage[col][line]) ? value : 0;
                model.state.dmg[col][line] = value;
                model.state.dmg.t = computeTotalGridDamage(model.state.dmg);
              }
            )(factions);
          },
          setGridColDamage: function modelSetGridColDamage(factions, col, model) {
            return R.pipeP(
              gameFactionsService.getModelInfo$(model.state.info),
              function(info) {
                var full = R.pipe(
                  R.addIndex(R.filter)(function(val, line) {
                    return R.exists(info.damage[col][line]);
                  }),
                  R.reject(R.equals(1)),
                  R.isEmpty
                )(model.state.dmg[col]);
                var value = full ? 0 : 1;
                model.state.dmg[col] = R.addIndex(R.map)(function(val, line) {
                  return R.exists(info.damage[col][line]) ? value : 0;
                }, model.state.dmg[col]);
                model.state.dmg.t = computeTotalGridDamage(model.state.dmg);
              }
            )(factions);
          },
        };
        function computeTotalGridDamage(damage) {
          return R.pipe(
            R.keys,
            R.reject(R.equals('t')),
            R.reject(R.equals('f')),
            R.reject(R.equals('n')),
            R.reduce(function(mem, col) {
              return mem + R.reduce(R.add, 0, damage[col]);
            }, 0)
          )(damage);
        }
        return modelDamageService;
      };
    }
  ]);
