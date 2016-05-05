(function() {
  angular.module('clickApp.services')
    .factory('behaviours', behavioursModelFactory);

  behavioursModelFactory.$inject = [
    'appTick'
  ];
  function behavioursModelFactory(appTickService) {
    const signalModel = {
      create: signalCreate
    };
    const cellModel = {
      create: cellCreate
    };
    R.curryService(signalModel);
    R.curryService(cellModel);
    const behavioursModel = {
      signalModel,
      cellModel
    };
    return behavioursModel;

    /////////////////////////////////////////////////////
    /////////////////////////////////////////////////////
    /////////////////////////////////////////////////////

    function cellCreate(getValue = R.always(null), init) {
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
      const now = appTickService.now();
      if(this._last_tick === now) return this._value;

      this._last_tick = now;
      this._value = this._getValue();
      return this._value;
    }

    function cellMap(fn) {
      return cellCreate(() => fn(this.sample()));
    }

    function cellChanges() {
      const signal = signalCreate(() => {
        const last = signal._last_value;
        signal._last_value = this.sample();
        return ( signal._last_value !== last
                 ? signal._last_value
                 : null
               );
      });
      signal._last_value = this._value;
      return signal;
    }

    function cellDelay() {
      const cell = cellCreate(() => cell._value, this._value);
      appTickService.addEndListener(() => {
        cell._value = this.sample();
      });
      return cell;
    }

    function cellReduce(fn, init) {
      const cell = this.changes()
              .snapshot(fn, () => last)
              .hold(init);
      const last = cell.delay();
      return cell;
    }

    /////////////////////////////////////////////////////
    /////////////////////////////////////////////////////
    /////////////////////////////////////////////////////

    function signalCreate(getValue = signalDefaultGetValue) {
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
      const now = appTickService.now();
      if(this._last_tick === now) return this._value;

      this._last_tick = now;
      this._value = this._getValue();
      return this._value;
    }

    function signalDefaultGetValue() {
      const ret = this._new_value;
      this._new_value = null;
      return ret;
    }

    function signalSend(value) {
      appTickService.inTransaction(() => {
        this._new_value = value;
      });
    }

    function signalHold(init) {
      const cell = cellCreate(() => R.when(
        R.isNil,
        () => cell._value,
        this._sample()
      ), init);
      return cell;
    }

    function signalMap(fn) {
      return signalCreate(() => R.when(
        R.exists,
        fn,
        this._sample()
      ));
    }

    function signalFilter(fn) {
      return signalCreate(() => R.unless(
        R.allPass([R.exists, fn]),
        () => null,
        this._sample()
      ));
    }

    function signalSnapshot(fn, cellOrGetter) {
      const getCell = ( 'Function' === R.type(cellOrGetter)
                        ? cellOrGetter
                        : R.always(cellOrGetter)
                      );
      return signalCreate(() => R.unless(
        R.isNil,
        (src_value) => fn(getCell().sample(), src_value),
        this._sample()
      ));
    }

    function signalMerge(fn, other) {
      return signalCreate(() => {
        const s1 = this._sample();
        const s2 = other._sample();
        return ( R.isNil(s2)
                 ? s1
                 : ( R.isNil(s1)
                     ? s2
                     : fn(s1, s2)
                   )
               );
      });
    }

    function signalOrElse(other) {
      return this.merge((s1,s2) => (R.exists(s1) ? s1 : s2), other);
    }

    function signalAll(other) {
      return this.map(R.of).merge(R.concat, other.map(R.of));
    }

    function signalListen(fn) {
      const listener = () => {
        const value = this._sample();
        if(R.exists(value)) {
          fn(value);
        }
      };
      appTickService.addTickListener(listener);
      return () => {
        appTickService.removeTickListener(listener);
      };
    }
  }
})();
