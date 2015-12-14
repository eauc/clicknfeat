angular.module('clickApp.services')
  .factory('gameFactions', [
    'localStorage',
    'http',
    function gameFactionsServiceFactory(localStorageService,
                                        httpService) {
      var BASE_RADIUS = {
        huge: 24.605,
        large: 9.842,
        medium: 7.874,
        small: 5.905
      };
      var STORAGE_KEY = 'clickApp.factions_desc';
      var gameFactionsService = {
        init: function gameFactionsInit() {
          return R.pipeP(
            httpService.get,
            (data) => {
              return R.map((faction) => {
                return httpService.get(data[faction])
                  .then((fdata) => {
                    if(R.isNil(fdata)) {
                      console.log('factions: Error getting '+faction+' info', data[faction]);
                    }
                    return [ faction, fdata ];
                  });
              }, R.keys(data));
            },
            R.promiseAll,
            R.sortBy(R.compose(R.prop('name'), R.nth(1))),
            R.reduce(function(mem, [name, faction]) {
              return R.assoc(name, updateFaction(faction), mem);
            }, {}),
            (factions) => {
              return gameFactionsService.loadDesc()
                .then(gameFactionsService.applyDesc$(factions));
            }
          )('/data/model/factions.json')
            .catch(R.spyError('factions: error getting description'));
        },
        loadDesc: function gameFactionsLoadDesc() {
          return localStorageService.load(STORAGE_KEY)
            .catch(() => {
              console.log('factions: no stored desc');
            })
            .then(R.defaultTo({}));
        },
        applyDesc: function gameFactionsApplyDesc(factions, desc) {
          return R.deepExtend(factions, desc);
        },
        storeDesc: function gameFactionsStoreDesc(desc) {
          return localStorageService.save(STORAGE_KEY, desc);
        },
        getModelInfo: function gameFactionsGetModelInfo(path, factions) {
          return new self.Promise((resolve, reject) => {
            var info = R.path(path, factions);
            if(R.isNil(info)) reject('Model info '+path.join('.')+' not found');
            else resolve(info);
          });
        },
      };
      function updateFaction(faction) {
        // console.log(faction);
        return R.pipe(
          R.assoc('wreck', updateWreck(faction.wreck)),
          (faction) => {
            return R.assoc('models',
                           updateFactionModels(faction, faction.models),
                           faction);
          }
        )(faction);
      }
      function updateFactionModels(faction, models) {
        // console.log(models);
        return R.reduce((mem, section) => {
          // console.log(section);
          return R.assoc(section, updateSection(faction, models[section]), mem);
        }, {}, R.keys(models));
      }
      function updateSection(faction, section) {
        // console.log(section);
        return R.pipe(
          R.keys,
          R.sortBy((entry) => { return section[entry].name; }),
          R.reduce((mem, entry) => {
            // console.log(entry);
            return R.assoc(entry, updateEntry(faction, section[entry]), mem);
          }, {})
        )(section);
      }
      function updateEntry(faction, entry) {
        // console.log(entry);
        if(R.exists(entry.entries)) {
          return updateUnit(faction, entry);
        }
        else {
          return updateModel(faction, null, entry);
        }
      }
      function updateUnit(faction, unit) {
        // console.log(unit);
        return R.assoc('entries', updateUnitEntries(faction, unit, unit.entries), unit);
      }
      function updateUnitEntries(faction, unit, entries) {
        // console.log(unit, entries);
        return R.reduce((mem, category) => {
          // console.log(category);
          return R.assoc(category, updateUnitCategory(faction, unit, entries[category]), mem);
        }, {}, R.keys(entries));    
      }
      function updateUnitCategory(faction, unit, category) {
        return R.reduce((mem, entry) => {
          // console.log(entry);
          return R.assoc(entry, updateModel(faction, unit, category[entry]), mem);
        }, {}, R.keys(category));
      }
      function updateModel(faction, unit, model) {
        // console.log(model);
        unit = R.defaultTo({}, unit);
        var default_fk_name = R.defaultTo(model.name, unit.name);
        return R.pipe(
          R.assoc('fk_name', R.defaultTo(default_fk_name, model.fk_name)),
          R.assoc('unit_name', unit.name),
          R.assoc('img', updateImgs(model.img)),
          R.assoc('damage', updateDamage(model.damage)),
          R.assoc('base_color', faction.color),
          R.assoc('base_radius', BASE_RADIUS[model.base]),
          (model) => {
            if(model.type === 'jack' &&
               R.exists(faction.wreck) &&
               R.exists(faction.wreck[model.base])) {
              return R.assoc('img', R.append(faction.wreck[model.base], model.img), model);
            }
            return model;
          }
        )(model);
      }
      function updateImgs(imgs) {
        // console.log(imgs);
        return R.pipe(
          R.defaultTo([]),
          (imgs) => {
            if(R.isEmpty(imgs)) {
              return R.append({}, imgs);
            }
            return imgs;
          },
          R.map(updateImage)
        )(imgs);
      }
      function updateWreck(wreck) {
        return R.pipe(
          R.defaultTo({}),
          (wreck) => {
            return R.pipe(
              R.keys,
              R.reduce((mem, key) => {
                return R.assoc(key, updateImage(R.assoc('type','wreck',wreck[key])), mem);
              }, {})
            )(wreck);
          }
        )(wreck);
      }
      function updateImage(img) {
        return R.pipe(
          R.assoc('type', R.defaultTo('default', img.type)),
          R.assoc('width', R.defaultTo(60, img.width)),
          R.assoc('height', R.defaultTo(60, img.height))
        )(img);
      }
      function updateDamage(damage) {
        // console.log(damage);
        return R.pipe(
          R.defaultTo({ type: 'warrior', n: 1 }),
          (damage) => {
            return R.assoc('type', R.defaultTo('warrior', damage.type), damage);
          },
          (damage) => {
            return R.assoc('total', computeDamageTotal(damage), damage);
          },
          (damage) => {
            return R.assoc('depth', computeDamageDepth(damage), damage);
          }
        )(damage);
      }
      function computeDamageTotal(damage) {
        if(damage.type === 'warrior') return damage.n;
        return R.pipe(
          R.keys,
          R.reject(R.equals('type')),
          R.reject(R.equals('total')),
          R.reject(R.equals('field')),
          R.reduce((mem, key) => {
            return mem + R.pipe(
              R.reject(R.isNil),
              R.length
            )(damage[key]);
          }, 0)
        )(damage);
      }
      function computeDamageDepth(damage) {
        if(damage.type === 'warrior') return damage.n;
        return R.pipe(
          R.keys,
          R.reject(R.equals('type')),
          R.reject(R.equals('total')),
          R.reject(R.equals('field')),
          R.map((key) => {
            return R.length(damage[key]);
          }),
          R.reduce(R.max, 0)
        )(damage);
      }
      R.curryService(gameFactionsService);
      return gameFactionsService;
    }
  ]);
