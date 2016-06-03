'use strict';

(function () {
  angular.module('clickApp.controllers').controller('settingsBindingsCtrl', settingsBindingsCtrl);

  settingsBindingsCtrl.$inject = ['$scope'];
  function settingsBindingsCtrl($scope) {
    var vm = this;
    console.log('init settingsBindingsCtrl');

    vm.getBindingsKeysForMode = getBindingsKeysForMode;
    vm.doRecordBinding = doRecordBinding;

    activate();

    function activate() {
      updateModes();
      $scope.$on('$destroy', $scope.settings.doUpdateSettings);
    }
    function updateModes() {
      vm.modes = R.thread($scope.state)(R.path(['settings', 'default', 'Bindings']), R.keys, R.sortBy(R.identity));
      vm.mode = R.defaultTo(R.head(vm.modes), vm.mode);
    }
    function getBindingsKeysForMode() {
      return R.thread($scope.state)(R.path(['settings', 'default', 'Bindings', vm.mode]), R.keys, R.sortBy(R.identity));
    }
    function doRecordBinding(action) {
      if (vm.recording) return null;
      vm.recording = action;

      return R.threadP(new self.Promise(record))(updateRecordedBinding, resetViewModel);

      function record(resolve) {
        Mousetrap.record(function (seq) {
          console.log('Mousetrap seq recorded', seq);
          resolve(seq);
        });
      }
      function updateRecordedBinding(seq) {
        if (R.isNil(seq) || R.isEmpty(seq)) {
          return;
        }
        console.log(seq);
        $scope.settings.edit.Bindings[vm.mode][action] = seq.join(' ');
      }
      function resetViewModel() {
        vm.recording = null;
        $scope.$digest();
      }
    }
  }
})();
//# sourceMappingURL=settingsBindingsCtrl.js.map
