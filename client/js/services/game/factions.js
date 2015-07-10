'use strict';

self.gameFactionsServiceFactory = function gameFactionsServiceFactory(httpService) {
  var BASE_RADIUS = {
    huge: 24.605,
    large: 9.842,
    medium: 7.874,
    small: 5.905
  };
  var gameFactionsService = {
    init: function gameFactionsInit() {
      var factions = {};
      return httpService.get('/data/model/factions.json')
        .then(function(data) {
          return R.map(function(faction) {
            return httpService.get(data[faction])
              .then(function(fdata) {
                if(R.isNil(fdata)) {
                  console.log('Error getting '+faction+' faction info', data[faction]);
                }
                factions[faction] = fdata;
              });
          }, R.keys(data));
        })
        .then(function(gets) {
          return self.Promise.all(gets);
        })
        .then(function() { return factions; })
        .then(function(factions) {
          // console.log('before', factions);
          return R.reduce(function(mem, faction) {
            return R.assoc(faction, updateFaction(factions[faction]), mem);
          }, {}, R.keys(factions));
        })
        .catch(function(reason) {
          console.log('error getting factions description', reason);
        });
    },
    getModelInfo: function factionsGetModelInfo(path, factions) {
      return R.path(path, factions);
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
    return R.reduce(function(mem, entry) {
      // console.log(entry);
      return R.assoc(entry, updateEntry(faction, section[entry]), mem);
    }, {}, R.keys(section));    
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
    // console.log(unit_name, entries);
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
      R.reject(R.eq('type')),
      R.reject(R.eq('total')),
      R.reject(R.eq('field')),
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
      R.reject(R.eq('type')),
      R.reject(R.eq('total')),
      R.reject(R.eq('field')),
      R.map(function(key) {
        return R.length(damage[key]);
      }),
      R.max
    )(damage);
  }
  R.curryService(gameFactionsService);
  return gameFactionsService;
};
