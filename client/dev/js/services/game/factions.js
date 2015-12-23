'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

angular.module('clickApp.services').factory('gameFactions', ['localStorage', 'http', function gameFactionsServiceFactory(localStorageService, httpService) {
  var BASE_RADIUS = {
    huge: 24.605,
    large: 9.842,
    medium: 7.874,
    small: 5.905
  };
  var STORAGE_KEY = 'clickApp.factions_desc';
  var gameFactionsService = {
    init: function gameFactionsInit() {
      return R.pipeP(httpService.get, function (data) {
        return R.map(function (faction) {
          return httpService.get(data[faction]).then(function (fdata) {
            if (R.isNil(fdata)) {
              console.log('factions: Error getting ' + faction + ' info', data[faction]);
            }
            return [faction, fdata];
          });
        }, R.keys(data));
      }, R.promiseAll, R.sortBy(R.compose(R.prop('name'), R.nth(1))), R.reduce(function (mem, _ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var name = _ref2[0];
        var faction = _ref2[1];

        return R.assoc(name, updateFaction(faction), mem);
      }, {}), function (factions) {
        return gameFactionsService.loadDesc().then(gameFactionsService.applyDesc$(factions));
      })('/data/model/factions.json').catch(R.spyError('factions: error getting description'));
    },
    loadDesc: function gameFactionsLoadDesc() {
      return localStorageService.load(STORAGE_KEY).catch(function () {
        console.log('factions: no stored desc');
      }).then(R.defaultTo({}));
    },
    applyDesc: function gameFactionsApplyDesc(factions, desc) {
      return R.deepExtend(factions, desc);
    },
    storeDesc: function gameFactionsStoreDesc(desc) {
      return localStorageService.save(STORAGE_KEY, desc);
    },
    buildReferences: function gameFactionsBuildReferences(factions) {
      return R.reduce(buildFactionRefs(factions), {}, R.keys(factions));
    },
    getModelInfo: function gameFactionsGetModelInfo(path, factions) {
      return new self.Promise(function (resolve, reject) {
        var info = R.path(path, factions);
        if (R.isNil(info)) reject('Model info ' + path.join('.') + ' not found');else resolve(info);
      });
    },
    getListInfo: function gameFactionsGetListInfo(list, references) {
      function parseLine(line) {
        return R.pipe(R.values, R.find(lineMatchesReference(line)), buildEntry(line))(references);
      }
      var lineMatchesReference = R.curry(function (line, reference) {
        return XRegExp.exec(line, reference.regexp);
      });
      var buildEntry = R.curry(function (line, reference) {
        if (R.isNil(reference)) return reference;

        var match = XRegExp.exec(line, reference.regexp);
        return [R.prop('entries', reference), parseNbGrunts(match.nb_grunts), parseNbRepeat(match.nb_repeat)];
      });
      var parseNbGrunts = function parseNbGrunts(nb_grunts) {
        return R.pipe(R.defaultTo('0'), function (s) {
          return parseFloat(s) + 1;
        })(nb_grunts);
      };
      var parseNbRepeat = function parseNbRepeat(nb_repeat) {
        return R.pipe(R.defaultTo('0'), function (s) {
          return parseFloat(s);
        })(nb_repeat);
      };

      return R.pipe(s.lines, R.map(parseLine), R.reject(R.isNil))(list);
    },
    buildModelsList: function gameFactionsBuildModelsList(list, user, references) {
      console.log('buildModelsList', list, user, references);
      var info = gameFactionsService.getListInfo(list, references);
      console.log('buildModelsList: info', info);

      function buildUnit(_ref3) {
        var _ref4 = _slicedToArray(_ref3, 3);

        var entries = _ref4[0];
        var nb_grunts = _ref4[1];
        var nb_repeat = _ref4[2];

        var grunts = buildGrunts(entries, nb_grunts);
        var others = buildOthers(entries, nb_repeat);
        var models = [].concat(_toConsumableArray(grunts), _toConsumableArray(others));
        updateUnit(entries, R.length(grunts), models);
        return models;
      }
      function buildGrunts(entries, nb_grunts) {
        var grunts = [];

        var _R$propOr = R.propOr([], 'grunt', entries);

        var _R$propOr2 = _slicedToArray(_R$propOr, 1);

        var grunt = _R$propOr2[0];

        if (R.exists(grunt) && R.exists(grunt.fk_grunts)) {
          nb_grunts = grunt.fk_grunts;
        }
        if (nb_grunts > 0) {
          var _R$propOr3 = R.propOr([], 'leader', entries);

          var _R$propOr4 = _slicedToArray(_R$propOr3, 1);

          var leader = _R$propOr4[0];

          if (R.exists(leader)) {
            grunts = R.concat(grunts, addModel(1, leader));
            nb_grunts--;
          }
          if (R.exists(grunt)) {
            R.times(function () {
              grunts = R.concat(grunts, addModel(1, grunt));
            }, nb_grunts);
          }
          if (!R.isEmpty(grunts)) {
            grunts[0].dsp = ['l', 'i'];
          }
        }
        return grunts;
      }
      function buildOthers(entries, nb_repeat) {
        return R.pipe(R.omit(['grunt', 'leader']), R.values, R.flatten, R.chain(function (model) {
          return addModel(nb_repeat, model);
        }))(entries);
      }

      var last_unit = {
        name: null,
        number: 0
      };
      function updateUnit(entries, nb_grunts, models) {
        var unit_name = findUnitName(entries);
        if (R.isNil(unit_name) || unit_name !== last_unit.name || nb_grunts > 0) {
          last_unit.number++;
        }
        last_unit.name = unit_name;

        R.forEach(function (model) {
          model.u = last_unit.number;
        }, models);
      }
      function findUnitName(entries) {
        return R.pipe(R.values, R.find(function (entry) {
          return R.find(function (model) {
            return R.exists(model.unit_name);
          }, entry);
        }), R.defaultTo([{}]), R.head, R.prop('unit_name'))(entries);
      }

      var MAX_X = 240;
      var x = 0,
          y = 0,
          y_offset = 0;
      function addModel(nb_repeat, model) {
        var ret = [];
        R.pipe(R.propOr(1, 'fk_repeat'), R.max(nb_repeat), R.times(function () {
          ret.push({
            user: user,
            info: model.path,
            x: x + model.base_radius,
            y: y + model.base_radius,
            r: 0
          });
          x += model.base_radius * 2;
          y_offset = Math.max(y_offset, model.base_radius * 2);
          if (x > MAX_X) {
            x = 0;
            y += y_offset;
            y_offset = 0;
          }
        }))(model);
        return ret;
      }

      return {
        base: { x: 240, y: 240, r: 0 },
        models: R.chain(buildUnit, info)
      };
    },
    buildReferenceRegexp: function gameFactionsBuildReferenceRegexp(name) {
      var regexp = '^\\**\\s*' + name;
      return XRegExp(regexp, 'i');
    }
  };
  function updateFaction(faction) {
    // console.log(faction);
    return R.pipe(R.assoc('wreck', updateWreck(faction.wreck)), function (faction) {
      return R.assoc('models', updateFactionModels(faction, faction.models), faction);
    })(faction);
  }
  function updateFactionModels(faction, models) {
    // console.log(models);
    return R.reduce(function (mem, section) {
      // console.log(section);
      return R.assoc(section, updateSection(faction, models[section]), mem);
    }, {}, R.keys(models));
  }
  function updateSection(faction, section) {
    // console.log(section);
    return R.pipe(R.keys, R.sortBy(function (entry) {
      return section[entry].name;
    }), R.reduce(function (mem, entry) {
      // console.log(entry);
      return R.assoc(entry, updateEntry(faction, section[entry]), mem);
    }, {}))(section);
  }
  function updateEntry(faction, entry) {
    // console.log(entry);
    if (R.exists(entry.entries)) {
      return updateUnit(faction, entry);
    } else {
      return updateModel(faction, null, entry);
    }
  }
  function updateUnit(faction, unit) {
    // console.log(unit);
    return R.assoc('entries', updateUnitEntries(faction, unit, unit.entries), unit);
  }
  function updateUnitEntries(faction, unit, entries) {
    // console.log(unit, entries);
    return R.reduce(function (mem, category) {
      // console.log(category);
      return R.assoc(category, updateUnitCategory(faction, unit, entries[category]), mem);
    }, {}, R.keys(entries));
  }
  function updateUnitCategory(faction, unit, category) {
    return R.reduce(function (mem, entry) {
      // console.log(entry);
      return R.assoc(entry, updateModel(faction, unit, category[entry]), mem);
    }, {}, R.keys(category));
  }
  function updateModel(faction, unit, model) {
    // console.log(model);
    var default_fk_name = model.name;
    if (R.exists(unit)) {
      if (R.exists(unit.fk_name)) {
        default_fk_name = unit.fk_name;
      } else {
        default_fk_name = unit.name + '.*(?<nb_grunts>\\d+)\\s+grunt';
      }
    }
    unit = R.defaultTo({}, unit);
    return R.pipe(R.assoc('fk_name', R.defaultTo(default_fk_name, model.fk_name)), R.assoc('unit_name', unit.name), R.assoc('img', updateImgs(model.img)), R.assoc('damage', updateDamage(model.damage)), R.assoc('base_color', faction.color), R.assoc('base_radius', BASE_RADIUS[model.base]), function (model) {
      if (model.type === 'jack' && R.exists(faction.wreck) && R.exists(faction.wreck[model.base])) {
        return R.assoc('img', R.append(faction.wreck[model.base], model.img), model);
      }
      return model;
    })(model);
  }
  function updateImgs(imgs) {
    // console.log(imgs);
    return R.pipe(R.defaultTo([]), function (imgs) {
      if (R.isEmpty(imgs)) {
        return R.append({}, imgs);
      }
      return imgs;
    }, R.map(updateImage))(imgs);
  }
  function updateWreck(wreck) {
    return R.pipe(R.defaultTo({}), function (wreck) {
      return R.pipe(R.keys, R.reduce(function (mem, key) {
        return R.assoc(key, updateImage(R.assoc('type', 'wreck', wreck[key])), mem);
      }, {}))(wreck);
    })(wreck);
  }
  function updateImage(img) {
    return R.pipe(R.assoc('type', R.defaultTo('default', img.type)), R.assoc('width', R.defaultTo(60, img.width)), R.assoc('height', R.defaultTo(60, img.height)))(img);
  }
  function updateDamage(damage) {
    // console.log(damage);
    return R.pipe(R.defaultTo({ type: 'warrior', n: 1 }), function (damage) {
      return R.assoc('type', R.defaultTo('warrior', damage.type), damage);
    }, function (damage) {
      return R.assoc('total', computeDamageTotal(damage), damage);
    }, function (damage) {
      return R.assoc('depth', computeDamageDepth(damage), damage);
    })(damage);
  }
  function computeDamageTotal(damage) {
    if (damage.type === 'warrior') return damage.n;
    return R.pipe(R.keys, R.reject(R.equals('type')), R.reject(R.equals('total')), R.reject(R.equals('field')), R.reduce(function (mem, key) {
      return mem + R.pipe(R.reject(R.isNil), R.length)(damage[key]);
    }, 0))(damage);
  }
  function computeDamageDepth(damage) {
    if (damage.type === 'warrior') return damage.n;
    return R.pipe(R.keys, R.reject(R.equals('type')), R.reject(R.equals('total')), R.reject(R.equals('field')), R.map(function (key) {
      return R.length(damage[key]);
    }), R.reduce(R.max, 0))(damage);
  }

  var buildFactionRefs = R.curry(function (factions, mem, faction) {
    var models = factions[faction].models;
    return R.reduce(buildTypeRefs(faction, models), mem, R.keys(models));
  });
  var buildTypeRefs = R.curry(function (faction, models, mem, type) {
    var units = models[type];
    return R.reduce(buildUnitRefs(faction, type, units), mem, R.keys(units));
  });
  var buildUnitRefs = R.curry(function (faction, type, units, mem, unit) {
    var entries = units[unit].entries;
    if (R.isNil(entries)) {
      return buildSingleRef(faction, type, units, unit, mem);
    } else {
      return R.reduce(buildEntryTypeRefs(faction, type, unit, entries), mem, R.keys(entries));
    }
  });
  var buildSingleRef = R.curry(function (faction, type, units, unit, mem) {
    unit = R.assoc('path', [faction, 'models', type, unit], units[unit]);
    updateReference('default', unit, mem);
    return mem;
  });
  var buildEntryTypeRefs = R.curry(function (faction, type, unit, entries, mem, entry_type) {
    var category = entries[entry_type];
    return R.reduce(buildEntryRef(faction, type, unit, entry_type, category), mem, R.keys(category));
  });
  var buildEntryRef = R.curry(function (faction, type, unit, entry_type, category, mem, entry_key) {
    var entry = R.assoc('path', [faction, 'models', type, unit, 'entries', entry_type, entry_key], category[entry_key]);
    updateReference(entry_key, entry, mem);
    return mem;
  });
  function updateReference(type, entry, mem) {
    var reference = getReferenceForFkName(entry.fk_name, mem);
    var entries_type = R.defaultTo([], reference.entries[type]);

    entries_type.push(entry);

    reference.entries[type] = entries_type;
    mem[entry.fk_name] = reference;
  }
  function getReferenceForFkName(name, mem) {
    var regexp = gameFactionsService.buildReferenceRegexp(name);
    return R.defaultTo({
      regexp: regexp,
      entries: {}
    }, mem[name]);
  }

  R.curryService(gameFactionsService);
  return gameFactionsService;
}]);
//# sourceMappingURL=factions.js.map
