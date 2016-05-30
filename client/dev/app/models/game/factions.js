'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

(function () {
  angular.module('clickApp.services').factory('gameFactions', gameFactionsModelFactory);

  gameFactionsModelFactory.$inject = ['localStorage', 'http'];
  function gameFactionsModelFactory(localStorageModel, httpModel) {
    var BASE_RADIUS = {
      huge: 24.605,
      large: 9.842,
      medium: 7.874,
      small: 5.905
    };
    var STORAGE_KEY = 'clickApp.factions_desc';
    var gameFactionsModel = {
      initP: gameFactionsInitP,
      loadDefaultP: gameFactionsLoadDefaultP,
      updateDesc: gameFactionsUpdateDesc,
      loadDescP: gameFactionsLoadDescP,
      applyDesc: gameFactionsApplyDesc,
      updateInfo: gameFactionsUpdateInfo,
      storeDesc: gameFactionsStoreDesc,
      buildReferences: gameFactionsBuildReferences,
      getModelInfo: gameFactionsGetModelInfo,
      getListInfo: gameFactionsGetListInfo,
      buildModelsList: gameFactionsBuildModelsList,
      buildReferenceRegexp: gameFactionsBuildReferenceRegexp
    };
    var buildFactionRefs$ = R.curry(buildFactionRefs);
    var buildTypeRefs$ = R.curry(buildTypeRefs);
    var buildUnitRefs$ = R.curry(buildUnitRefs);
    var buildEntryTypeRefs$ = R.curry(buildEntryTypeRefs);
    var buildEntryRef$ = R.curry(buildEntryRef);

    R.curryService(gameFactionsModel);
    return gameFactionsModel;

    function gameFactionsInitP() {
      return R.threadP()(gameFactionsModel.loadDefaultP, function (base) {
        return R.threadP()(gameFactionsModel.loadDescP, function (desc) {
          return {
            base: base,
            desc: desc
          };
        });
      }, gameFactionsModel.updateDesc, R.spyWarn('Factions'));
    }
    function gameFactionsLoadDefaultP() {
      return R.threadP('/data/model/factions.json')(httpModel.getP, function (data) {
        return R.thread(data)(R.keys, R.map(function (faction) {
          return httpModel.getP(data[faction]).then(function (fdata) {
            return [faction, fdata];
          });
        }));
      }, R.allP, R.reduce(function (mem, _ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var name = _ref2[0];
        var faction = _ref2[1];
        return R.assoc(name, faction, mem);
      }, {}));
    }
    function gameFactionsUpdateDesc(factions) {
      return R.thread(factions)(gameFactionsModel.applyDesc, gameFactionsModel.updateInfo, gameFactionsModel.buildReferences);
    }
    function gameFactionsLoadDescP() {
      return R.threadP()(function () {
        return localStorageModel.loadP(STORAGE_KEY).catch(R.spyError('Factions: no stored desc'));
      }, R.defaultTo({}), R.spyWarn('Factions Desc load'));
    }
    function gameFactionsApplyDesc(_ref3) {
      var base = _ref3.base;
      var desc = _ref3.desc;

      return { base: base,
        desc: desc,
        current: R.deepExtend(base, desc)
      };
    }
    function gameFactionsUpdateInfo(_ref4) {
      var base = _ref4.base;
      var desc = _ref4.desc;
      var current = _ref4.current;

      return { base: base,
        desc: desc,
        current: R.thread(current)(R.toPairs, R.sortBy(R.compose(R.prop('name'), R.nth(1))), R.reduce(function (mem, _ref5) {
          var _ref6 = _slicedToArray(_ref5, 2);

          var name = _ref6[0];
          var faction = _ref6[1];

          return R.assoc(name, updateFaction(faction), mem);
        }, {}))
      };
    }
    function gameFactionsStoreDesc(factions) {
      return R.thread(factions)(R.prop('desc'), R.spyWarn('Factions Desc store'), localStorageModel.save$(STORAGE_KEY));
    }
    function gameFactionsBuildReferences(_ref7) {
      var base = _ref7.base;
      var desc = _ref7.desc;
      var current = _ref7.current;

      return {
        base: base,
        desc: desc,
        current: current,
        references: R.reduce(buildFactionRefs$(current), {}, R.keys(current))
      };
    }
    function gameFactionsGetModelInfo(path, factions) {
      return R.path(['current'].concat(_toConsumableArray(path)), factions);
    }
    function gameFactionsGetListInfo(list, references) {
      var lineMatchesReference$ = R.curry(lineMatchesReference);
      var buildEntry$ = R.curry(buildEntry);

      return R.thread(list)(s.lines, R.map(parseLine), R.reject(R.isNil));

      function parseLine(line) {
        return R.thread(references)(R.values, R.find(lineMatchesReference$(line)), buildEntry$(line));
      }
    }
    function lineMatchesReference(line, reference) {
      return XRegExp.exec(line, reference.regexp);
    }
    function buildEntry(line, reference) {
      if (R.isNil(reference)) return reference;

      var match = XRegExp.exec(line, reference.regexp);
      return [R.prop('entries', reference), parseNbGrunts(match.nb_grunts), parseNbRepeat(match.nb_repeat)];
    }
    function parseNbGrunts(nb_grunts) {
      return R.thread(nb_grunts)(R.defaultTo('0'), function (s) {
        return parseFloat(s) + 1;
      });
    }
    function parseNbRepeat(nb_repeat) {
      return R.thread(nb_repeat)(R.defaultTo('0'), function (s) {
        return parseFloat(s);
      });
    }
    function gameFactionsBuildModelsList(list, user, factions) {
      var info = gameFactionsModel.getListInfo(list, factions.references);
      var MAX_X = 240;
      var x = 0,
          y = 0,
          y_offset = 0;
      var last_unit = {
        name: null,
        number: 0
      };

      return {
        base: { x: 240, y: 240, r: 0 },
        models: R.chain(buildUnit, info)
      };

      function buildUnit(_ref8) {
        var _ref9 = _slicedToArray(_ref8, 3);

        var entries = _ref9[0];
        var nb_grunts = _ref9[1];
        var nb_repeat = _ref9[2];

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
        return R.thread(entries)(R.omit(['grunt', 'leader']), R.values, R.flatten, R.chain(function (model) {
          return addModel(nb_repeat, model);
        }));
      }
      function addModel(nb_repeat, model) {
        var ret = [];
        R.thread(model)(R.propOr(1, 'fk_repeat'), R.max(nb_repeat), R.times(addModel_));
        return ret;

        function addModel_() {
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
        }
      }
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
        return R.thread(entries)(R.values, R.find(function (entry) {
          return R.find(function (model) {
            return R.exists(model.unit_name);
          }, entry);
        }), R.defaultTo([{}]), R.head, R.prop('unit_name'));
      }
    }
    function gameFactionsBuildReferenceRegexp(name) {
      var regexp = '^\\**\\s*' + name;
      return XRegExp(regexp, 'i');
    }
    function updateFaction(faction) {
      // console.log(faction);
      return R.thread(faction)(R.assoc('wreck', updateWreck(faction.wreck)), function (faction) {
        return R.assoc('models', updateFactionModels(faction, faction.models), faction);
      });
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
      return R.thread(section)(R.keys, R.sortBy(function (entry) {
        return section[entry].name;
      }), R.reduce(function (mem, entry) {
        // console.log(entry);
        return R.assoc(entry, updateEntry(faction, section[entry]), mem);
      }, {}));
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
      return R.thread(model)(R.assoc('fk_name', R.defaultTo(default_fk_name, model.fk_name)), R.assoc('unit_name', unit.name), R.assoc('img', updateImgs(model.img)), R.assoc('damage', updateDamage(model.damage)), R.assoc('base_color', faction.color), R.assoc('base_radius', BASE_RADIUS[model.base]), function (model) {
        if (model.type === 'jack' && R.exists(faction.wreck) && R.exists(faction.wreck[model.base])) {
          return R.assoc('img', R.append(faction.wreck[model.base], model.img), model);
        }
        return model;
      });
    }
    function updateImgs(imgs) {
      // console.log(imgs);
      return R.thread(imgs)(R.defaultTo([]), function (imgs) {
        if (R.isEmpty(imgs)) {
          return R.append({}, imgs);
        }
        return imgs;
      }, R.map(updateImage));
    }
    function updateWreck(wreck) {
      return R.thread(wreck)(R.defaultTo({}), function (wreck) {
        return R.thread(wreck)(R.keys, R.reduce(function (mem, key) {
          return R.assoc(key, updateImage(R.assoc('type', 'wreck', wreck[key])), mem);
        }, {}));
      });
    }
    function updateImage(img) {
      return R.thread(img)(R.assoc('type', R.defaultTo('default', img.type)), R.assoc('width', R.defaultTo(60, img.width)), R.assoc('height', R.defaultTo(60, img.height)));
    }
    function updateDamage(damage) {
      // console.log(damage);
      return R.thread(damage)(R.defaultTo({ type: 'warrior', n: 1 }), function (damage) {
        return R.assoc('type', R.defaultTo('warrior', damage.type), damage);
      }, function (damage) {
        return R.assoc('total', computeDamageTotal(damage), damage);
      }, function (damage) {
        return R.assoc('depth', computeDamageDepth(damage), damage);
      });
    }
    function computeDamageTotal(damage) {
      if (damage.type === 'warrior') return damage.n;
      return R.thread(damage)(R.keys, R.reject(R.equals('type')), R.reject(R.equals('total')), R.reject(R.equals('field')), R.reduce(function (mem, key) {
        return mem + R.thread(damage[key])(R.reject(R.isNil), R.length);
      }, 0));
    }
    function computeDamageDepth(damage) {
      if (damage.type === 'warrior') return damage.n;
      return R.thread(damage)(R.keys, R.reject(R.equals('type')), R.reject(R.equals('total')), R.reject(R.equals('field')), R.map(function (key) {
        return R.length(damage[key]);
      }), R.reduce(R.max, 0));
    }

    function buildFactionRefs(factions, mem, faction) {
      var models = factions[faction].models;
      return R.reduce(buildTypeRefs$(faction, models), mem, R.keys(models));
    }
    function buildTypeRefs(faction, models, mem, type) {
      var units = models[type];
      return R.reduce(buildUnitRefs$(faction, type, units), mem, R.keys(units));
    }
    function buildUnitRefs(faction, type, units, mem, unit) {
      var entries = units[unit].entries;
      if (R.isNil(entries)) {
        return buildSingleRef(faction, type, units, unit, mem);
      } else {
        return R.reduce(buildEntryTypeRefs$(faction, type, unit, entries), mem, R.keys(entries));
      }
    }
    function buildSingleRef(faction, type, units, unit, mem) {
      unit = R.assoc('path', [faction, 'models', type, unit], units[unit]);
      updateReference('default', unit, mem);
      return mem;
    }
    function buildEntryTypeRefs(faction, type, unit, entries, mem, entry_type) {
      var category = entries[entry_type];
      return R.reduce(buildEntryRef$(faction, type, unit, entry_type, category), mem, R.keys(category));
    }
    function buildEntryRef(faction, type, unit, entry_type, category, mem, entry_key) {
      var entry = R.assoc('path', [faction, 'models', type, unit, 'entries', entry_type, entry_key], category[entry_key]);
      updateReference(entry_key, entry, mem);
      return mem;
    }
    function updateReference(type, entry, mem) {
      var reference = getReferenceForFkName(entry.fk_name, mem);
      var entries_type = R.defaultTo([], reference.entries[type]);

      entries_type.push(entry);

      reference.entries[type] = entries_type;
      mem[entry.fk_name] = reference;
    }
    function getReferenceForFkName(name, mem) {
      var regexp = gameFactionsModel.buildReferenceRegexp(name);
      return R.defaultTo({
        regexp: regexp,
        entries: {}
      }, mem[name]);
    }
  }
})();
//# sourceMappingURL=factions.js.map
