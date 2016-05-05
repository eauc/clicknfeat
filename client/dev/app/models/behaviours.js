'use strict';

(function () {
  angular.module('clickApp.services').factory('behaviours', behavioursModelFactory);

  behavioursModelFactory.$inject = ['appTick'];
  function behavioursModelFactory(appTickService) {
    var signalModel = {
      create: signalCreate
    };
    var cellModel = {
      create: cellCreate
    };
    R.curryService(signalModel);
    R.curryService(cellModel);
    var behavioursModel = {
      signalModel: signalModel,
      cellModel: cellModel
    };
    return behavioursModel;

    /////////////////////////////////////////////////////
    /////////////////////////////////////////////////////
    /////////////////////////////////////////////////////

    function cellCreate() {
      var getValue = arguments.length <= 0 || arguments[0] === undefined ? R.always(null) : arguments[0];
      var init = arguments[1];

      return {
        _value: init,
        _getValue: getValue,
        sample: cellSample,
        map: cellMap,
        changes: cellChanges,
        delay: cellDelay,
        reduce: cellReduce
      };
    }

    function cellSample() {
      var now = appTickService.now();
      if (this._last_tick === now) return this._value;

      this._last_tick = now;
      this._value = this._getValue();
      return this._value;
    }

    function cellMap(fn) {
      var _this = this;

      return cellCreate(function () {
        return fn(_this.sample());
      });
    }

    function cellChanges() {
      var _this2 = this;

      var signal = signalCreate(function () {
        var last = signal._last_value;
        signal._last_value = _this2.sample();
        return signal._last_value !== last ? signal._last_value : null;
      });
      signal._last_value = this._value;
      return signal;
    }

    function cellDelay() {
      var _this3 = this;

      var cell = cellCreate(function () {
        return cell._value;
      }, this._value);
      appTickService.addEndListener(function () {
        cell._value = _this3.sample();
      });
      return cell;
    }

    function cellReduce(fn, init) {
      var cell = this.changes().snapshot(fn, function () {
        return last;
      }).hold(init);
      var last = cell.delay();
      return cell;
    }

    /////////////////////////////////////////////////////
    /////////////////////////////////////////////////////
    /////////////////////////////////////////////////////

    function signalCreate() {
      var getValue = arguments.length <= 0 || arguments[0] === undefined ? signalDefaultGetValue : arguments[0];

      return {
        _getValue: getValue,
        _sample: signalSample,
        send: signalSend,
        listen: signalListen,
        hold: signalHold,
        map: signalMap,
        filter: signalFilter,
        snapshot: signalSnapshot,
        merge: signalMerge,
        orElse: signalOrElse,
        all: signalAll
      };
    }

    function signalSample() {
      var now = appTickService.now();
      if (this._last_tick === now) return this._value;

      this._last_tick = now;
      this._value = this._getValue();
      return this._value;
    }

    function signalDefaultGetValue() {
      var ret = this._new_value;
      this._new_value = null;
      return ret;
    }

    function signalSend(value) {
      var _this4 = this;

      appTickService.inTransaction(function () {
        _this4._new_value = value;
      });
    }

    function signalHold(init) {
      var _this5 = this;

      var cell = cellCreate(function () {
        return R.when(R.isNil, function () {
          return cell._value;
        }, _this5._sample());
      }, init);
      return cell;
    }

    function signalMap(fn) {
      var _this6 = this;

      return signalCreate(function () {
        return R.when(R.exists, fn, _this6._sample());
      });
    }

    function signalFilter(fn) {
      var _this7 = this;

      return signalCreate(function () {
        return R.unless(R.allPass([R.exists, fn]), function () {
          return null;
        }, _this7._sample());
      });
    }

    function signalSnapshot(fn, cellOrGetter) {
      var _this8 = this;

      var getCell = 'Function' === R.type(cellOrGetter) ? cellOrGetter : R.always(cellOrGetter);
      return signalCreate(function () {
        return R.unless(R.isNil, function (src_value) {
          return fn(getCell().sample(), src_value);
        }, _this8._sample());
      });
    }

    function signalMerge(fn, other) {
      var _this9 = this;

      return signalCreate(function () {
        var s1 = _this9._sample();
        var s2 = other._sample();
        return R.isNil(s2) ? s1 : R.isNil(s1) ? s2 : fn(s1, s2);
      });
    }

    function signalOrElse(other) {
      return this.merge(function (s1, s2) {
        return R.exists(s1) ? s1 : s2;
      }, other);
    }

    function signalAll(other) {
      return this.map(R.of).merge(R.concat, other.map(R.of));
    }

    function signalListen(fn) {
      var _this10 = this;

      var listener = function listener() {
        var value = _this10._sample();
        if (R.exists(value)) {
          fn(value);
        }
      };
      appTickService.addTickListener(listener);
      return function () {
        appTickService.removeTickListener(listener);
      };
    }
  }
})();
//# sourceMappingURL=behaviours.js.map
