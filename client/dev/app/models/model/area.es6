(function() {
  angular.module('clickApp.services')
    .factory('modelArea', modelAreaModelFactory);

  modelAreaModelFactory.$inject = [
    'gameFactions',
  ];
  function modelAreaModelFactory(gameFactionsModel) {
    return () => {
      const modelAreaModel = {
        isCtrlAreaDisplayedP: modelIsCtrlAreaDisplayedP,
        setCtrlAreaDisplay: modelSetCtrlAreaDisplay,
        toggleCtrlAreaDisplay: modelToggleCtrlAreaDisplay,
        isAreaDisplayed: modelIsAreaDisplayed,
        areaDisplay: modelAreaDisplay,
        setAreaDisplay: modelSetAreaDisplay,
        toggleAreaDisplay: modelToggleAreaDisplay
      };
      return modelAreaModel;

      function modelIsCtrlAreaDisplayedP(factions, model) {
        return R.threadP(factions)(
          gameFactionsModel.getModelInfoP$(model.state.info),
          (info) => {
            return ( info.type === 'wardude' &&
                     ( 'Number' === R.type(info.focus) ||
                       'Number' === R.type(info.fury)
                     ) &&
                     !!R.find(R.equals('a'), model.state.dsp)
                   );
          }
        );
      }
      function modelSetCtrlAreaDisplay(set, model) {
        if(set) {
          return R.over(R.lensPath(['state','dsp']),
                        R.compose(R.uniq, R.append('a')),
                        model);
        }
        else {
          return R.over(R.lensPath(['state','dsp']),
                        R.reject(R.equals('a')),
                        model);
        }
      }
      function modelToggleCtrlAreaDisplay(model) {
        if(R.find(R.equals('a'), model.state.dsp)) {
          return R.over(R.lensPath(['state','dsp']),
                        R.reject(R.equals('a')),
                        model);
        }
        else {
          return R.over(R.lensPath(['state','dsp']),
                        R.append('a'),
                        model);
        }
      }
      function modelIsAreaDisplayed(model) {
        return R.exists(model.state.are);
      }
      function modelAreaDisplay(model) {
        return model.state.are;
      }
      function modelSetAreaDisplay(area, model) {
        return R.assocPath(['state','are'], area, model);
      }
      function modelToggleAreaDisplay(area, model) {
        return R.over(R.lensPath(['state','are']),
                      (are) => { return (area === are) ? null : area; },
                      model);
      }
    };
  }
})();
