'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.controllers').controller('settingsMainCtrl', settingsMainCtrl);

  settingsMainCtrl.$inject = ['$scope'];
  function settingsMainCtrl($scope) {
    var vm = this;
    console.log('init settingsMainCtrl');

    vm.doLoadSettingsFile = doLoadSettingsFile;
    vm.doResetSettings = doResetSettings;

    activate();

    function activate() {
      $scope.onStateChangeEvent('Settings.loadFile', updateLoadResult, $scope);
      $scope.bindCell($scope.state.exports.settings, function (exp) {
        vm.export = exp;
      }, $scope);
    }
    function updateLoadResult(_event_, _ref) {
      var _ref2 = _slicedToArray(_ref, 1);

      var result = _ref2[0];

      vm.load_settings_result = result;
      $scope.$digest();
    }
    function doLoadSettingsFile(files) {
      $scope.stateEvent('Settings.loadFile', files[0]);
    }
    function doResetSettings() {
      $scope.stateEvent('Settings.reset', {});
    }
  }
})();
//# sourceMappingURL=settingsMainCtrl.js.map
