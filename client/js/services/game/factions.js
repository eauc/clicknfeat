'use strict';

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
            function(data) {
              return R.map(function(faction) {
                return httpService.get(data[faction])
                  .then(function(fdata) {
                    if(R.isNil(fdata)) {
                      console.log('factions: Error getting '+faction+' info', data[faction]);
                    }
                    return [ faction, fdata ];
                  });
              }, R.keys(data));
            },
            R.bind(self.Promise.all, self.Promise),
            R.sortBy(R.compose(R.prop('name'), R.nth(1))),
            R.spy('factions_pairs'),
            R.reduce(function(mem, pair) {
              return R.assoc(pair[0], updateFaction(pair[1]), mem);
            }, {}),
            function(factions) {
              return gameFactionsService.loadDesc()
                .then(gameFactionsService.applyDesc$(factions));
            }
          )('/data/model/factions.json').catch(function(reason) {
            console.log('factions: error getting description', reason);
          });
        },
        loadDesc: function() {
          return localStorageService.load(STORAGE_KEY)
            .catch(function() {
              console.log('factions: no stored desc');
            })
            .then(R.defaultTo({}));
        },
        applyDesc: function(factions, desc) {
          return R.deepExtend(factions, desc);
        },
        storeDesc: function(desc) {
          return localStorageService.save(STORAGE_KEY, desc);
        },
        getModelInfo: function factionsGetModelInfo(path, factions) {
          return new self.Promise(function(resolve, reject) {
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
          function(faction) {
            return R.assoc('models',
                           updateFactionModels(faction, faction.models),
                           faction);
          }
        )(faction);
      }
      function updateFactionModels(faction, models) {
        // console.log(models);
        return R.reduce(function(mem, section) {
          // console.log(section);
          return R.assoc(section, updateSection(faction, models[section]), mem);
        }, {}, R.keys(models));
      }
      function updateSection(faction, section) {
        // console.log(section);
        return R.pipe(
          R.keys,
          R.sortBy(function(entry) { return section[entry].name; }),
          R.reduce(function(mem, entry) {
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
        return R.reduce(function(mem, category) {
          // console.log(category);
          return R.assoc(category, updateUnitCategory(faction, unit, entries[category]), mem);
        }, {}, R.keys(entries));    
      }
      function updateUnitCategory(faction, unit, category) {
        return R.reduce(function(mem, entry) {
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
          function(model) {
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
          function(imgs) {
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
          function(wreck) {
            return R.pipe(
              R.keys,
              R.reduce(function(mem, key) {
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
          function(damage) {
            return R.assoc('type', R.defaultTo('warrior', damage.type), damage);
          },
          function(damage) {
            return R.assoc('total', computeDamageTotal(damage), damage);
          },
          function(damage) {
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
          R.reduce(function(mem, key) {
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
          R.map(function(key) {
            return R.length(damage[key]);
          }),
          R.reduce(R.max, 0)
        )(damage);
      }
      R.curryService(gameFactionsService);
      return gameFactionsService;
    }
  ]);
