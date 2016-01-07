angular.module('clickApp.services')
  .factory('modelDamage', [
    'gameFactions',
    function modelDamageServiceFactory(gameFactionsService) {
      return function(/*modelService*/) {
        var modelDamageService = {
          resetDamage: function modelResetDamage(model) {
            return R.over(R.lensPath(['state','dmg']), R.pipe(
              R.keys,
              R.reduce((mem, key) => {
                var value = model.state.dmg[key];
                if('Array' === R.type(value)) {
                  value = R.map(R.always(0), value);
                }
                else {
                  value = 0;
                }
                return R.assoc(key, value, mem);
              }, {})
            ), model);
          },
          setWarriorDamage: function modelSetWarriorDamage(factions, i, model) {
            return R.pipeP(
              gameFactionsService.getModelInfo$(model.state.info),
              (info) => {
                var value = R.defaultTo(0, model.state.dmg.n);
                value = (value === i) ? 0 : i;
                value = Math.min(value, info.damage.n);
                return R.over(R.lensPath(['state','dmg']), R.pipe(
                  R.assoc('n', value),
                  R.assoc('t', value)
                ), model);
              }
            )(factions);
          },
          setFieldDamage: function modelSetFieldDamage(factions, i, model) {
            return R.pipeP(
              gameFactionsService.getModelInfo$(model.state.info),
              (info) => {
                var value = R.defaultTo(0, model.state.dmg.f);
                value = (value === i) ? 0 : i;
                value = Math.min(value, info.damage.field);
                return R.assocPath(['state','dmg','f'], value, model);
              }
            )(factions);
          },
          setGridDamage: function modelSetGridDamage(factions, line, col, model) {
            return R.pipeP(
              gameFactionsService.getModelInfo$(model.state.info),
              (info) => {
                var value = model.state.dmg[col][line];
                value = (value === 0) ? 1 : 0;
                value = R.exists(info.damage[col][line]) ? value : 0;
                return R.over(R.lensPath(['state','dmg']), R.pipe(
                  R.over(R.lensProp(col), R.update(line, value)),
                  (dmg) => {
                    return R.assoc('t', computeTotalGridDamage(dmg), dmg);
                  }
                ), model);
              }
            )(factions);
          },
          setGridColDamage: function modelSetGridColDamage(factions, col, model) {
            return R.pipeP(
              gameFactionsService.getModelInfo$(model.state.info),
              (info) => {
                var full = R.pipe(
                  R.addIndex(R.filter)((val, line) => {
                    return R.exists(info.damage[col][line]);
                  }),
                  R.reject(R.equals(1)),
                  R.isEmpty
                )(model.state.dmg[col]);
                var value = full ? 0 : 1;
                return R.over(R.lensPath(['state','dmg']), R.pipe(
                  R.over(R.lensProp(col), R.addIndex(R.map)((val, line) => {
                    return R.exists(info.damage[col][line]) ? value : 0;
                  })),
                  (dmg) => {
                    return R.assoc('t', computeTotalGridDamage(dmg), dmg);
                  }
                ), model);
              }
            )(factions);
          }
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
