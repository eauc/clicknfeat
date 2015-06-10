'use strict';

self.gameFactionsServiceFactory = function gameFactionsServiceFactory(httpService) {
  var gameFactionsService = {
    init: function gameFactionsInit() {
      var factions = {};
      return httpService.get('/data/model/factions.json')
        .then(function(data) {
          return R.map(function(faction) {
            return httpService.get(data[faction])
              .then(function(data) {
                factions[faction] = data;
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
    return R.assoc('models', updateModels(faction.color, faction.models), faction);
  }
  function updateModels(faction_color, models) {
    // console.log(models);
    return R.reduce(function(mem, section) {
      // console.log(section);
      return R.assoc(section, updateSection(faction_color, models[section]), mem);
    }, {}, R.keys(models));
  }
  function updateSection(faction_color, section) {
    // console.log(section);
    return R.reduce(function(mem, entry) {
      // console.log(entry);
      return R.assoc(entry, updateEntry(faction_color, section[entry]), mem);
    }, {}, R.keys(section));    
  }
  function updateEntry(faction_color, entry) {
    // console.log(entry);
    if(R.exists(entry.entries)) {
      return updateUnit(faction_color, entry);
    }
    else {
      return updateModel(faction_color, null, entry);
    }
  }
  function updateUnit(faction_color, unit) {
    // console.log(unit);
    return R.assoc('entries', updateUnitEntries(faction_color, unit.name, unit.entries), unit);
  }
  function updateUnitEntries(faction_color, unit_name, entries) {
    // console.log(unit_name, entries);
    return R.reduce(function(mem, category) {
      // console.log(category);
      return R.assoc(category, updateUnitCategory(faction_color, unit_name, entries[category]), mem);
    }, {}, R.keys(entries));    
  }
  function updateUnitCategory(faction_color, unit_name, category) {
    return R.reduce(function(mem, entry) {
      // console.log(entry);
      return R.assoc(entry, updateModel(faction_color, unit_name, category[entry]), mem);
    }, {}, R.keys(category));    
  }
  function updateModel(faction_color, name, model) {
    // console.log(model);
    name = R.defaultTo(model.name, name);
    return R.pipe(
      R.assoc('fk_name', R.defaultTo(name, model.fk_name)),
      R.assoc('img', updateImgs(model.img)),
      R.assoc('damage', updateDamage(model.damage)),
      R.assoc('base_color', faction_color)
    )(model);
  }
  function updateImgs(imgs) {
    // console.log(imgs);
    return R.map(function(img) {
      // console.log(img);
      return R.pipe(
        R.assoc('type', R.defaultTo('default', img.type)),
        R.assoc('width', R.defaultTo(60, img.width)),
        R.assoc('height', R.defaultTo(60, img.height))
      )(img);
    }, imgs);
  }
  function updateDamage(damage) {
    // console.log(damage);
    return R.pipe(
      R.defaultTo({ type: 'warrior', n: 1 }),
      function(damage) {
        return R.assoc('type', R.defaultTo('warrior', damage.type), damage);
      }
    )(damage);
  }
  return gameFactionsService;
};
