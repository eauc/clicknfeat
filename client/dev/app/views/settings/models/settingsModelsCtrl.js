'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.controllers').controller('settingsModelsCtrl', settingsModelsCtrl);

  settingsModelsCtrl.$inject = ['$scope'];
  function settingsModelsCtrl($scope) {
    var vm = this;
    console.log('init settingsModelsCtrl');

    vm.hasDesc = hasDesc;
    vm.doOpenFactionFile = doOpenFactionFile;
    vm.doClearFactionDesc = doClearFactionDesc;
    vm.doClearAllDesc = doClearAllDesc;

    activate();

    function activate() {
      $scope.state.data_ready.then(updateFactions);
      $scope.onStateChangeEvent('Factions.loadDescFile', updateLoadResult, $scope);
    }
    function updateFactions() {
      vm.factions = R.path(['factions', 'base'], $scope.state);
      $scope.$digest();
    }
    function updateLoadResult(_event_, _ref) {
      var _ref2 = _slicedToArray(_ref, 1);

      var result = _ref2[0];

      $scope.result = result;
      $scope.$digest();
    }
    function hasDesc(faction) {
      return R.thread($scope.state)(R.path(['factions', 'desc', faction]), R.type, R.equals('Object'));
    }
    function doOpenFactionFile(faction, files) {
      $scope.stateEvent('Factions.loadDescFile', faction, files[0]);
    }
    function doClearFactionDesc(faction) {
      $scope.stateEvent('Factions.clearDesc', faction);
    }
    function doClearAllDesc() {
      $scope.stateEvent('Factions.clearAllDesc');
    }
  }
})();
//# sourceMappingURL=settingsModelsCtrl.js.map
