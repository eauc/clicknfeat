'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.directives').controller('clickGameSelectionDetailCtrl', gameSelectionDetailCtrl).directive('clickGameSelectionDetail', gameSelectionDetailDirectiveFactory);

  gameSelectionDetailCtrl.$inject = ['$scope', 'appGame',
  // 'gameFactions',
  // 'gameModels',
  'gameTemplates'];
  function gameSelectionDetailCtrl($scope, appGameService,
  // gameFactionsModel,
  // gameModelsModel,
  gameTemplatesModel) {
    var vm = this;
    console.log('init clickGameSelectionDetailCtrl');

    vm.edit = { label: '',
      max_deviation: 0
    };
    vm.show = { info: false };
    vm.onOpen = onOpen;
    vm.labelDisplay = labelDisplay;

    vm.doSetMaxDeviation = doSetMaxDeviation;
    vm.doAddLabel = doAddLabel;
    vm.doRemoveLabel = doRemoveLabel;

    activate();

    function activate() {
      $scope.listenSignal(updateTemplateElement, appGameService.templates.changes, $scope);
      // $scope.onStateChangeEvent('Game.models.change',
      //                           updateElement,
      //                           $scope);
    }
    function onOpen() {
      vm.show.info = false;
      if (R.isNil(vm.type)) return;

      if ('template' === vm.type) {
        var templates = appGameService.templates.templates.sample();
        updateTemplateElement([templates, [vm.element.stamp]]);
      }
    }
    function updateTemplateElement(_ref) {
      var _ref2 = _slicedToArray(_ref, 2);

      var templates = _ref2[0];
      var stamps = _ref2[1];

      if (!R.find(R.equals(vm.element.stamp), stamps)) {
        return;
      }
      R.thread(templates)(gameTemplatesModel.findStamp$(vm.element.stamp), R.when(R.exists, function (template) {
        vm.element = template.state;
        vm.edit.max_deviation = R.propOr(0, 'm', vm.element);
      }));
    }
    // function updateModelElement() {
    //   return R.thread($scope.state.game)(
    //     R.prop('models'),
    //     gameModelsModel.findStamp$(vm.element.stamp),
    //     (model) => {
    //       vm.element = model.state;
    //     },
    //     () => gameFactionsModel
    //       .getModelInfo(vm.element.info, $scope.state.factions),
    //     (info) => {
    //       vm.info = info;
    //     }
    //   );
    // }
    function labelDisplay(l) {
      return s.truncate(l, 12);
    }
    function doSetMaxDeviation() {
      var max = vm.edit.max_deviation > 0 ? vm.edit.max_deviation : null;
      $scope.sendAction('Game.command.execute', 'onTemplates', ['setMaxDeviation', [max], [vm.element.stamp]]);
    }
    function doAddLabel() {
      var cmd = vm.type === 'template' ? 'onTemplates' : 'onModels';
      var new_label = s.trim(vm.edit.label);
      if (R.length(new_label) === 0) return;

      $scope.sendAction('Game.command.execute', cmd, ['addLabel', [new_label], [vm.element.stamp]]);
      vm.edit.label = '';
    }
    function doRemoveLabel(label) {
      var cmd = vm.type === 'template' ? 'onTemplates' : 'onModels';
      $scope.sendAction('Game.command.execute', cmd, ['removeLabel', [label], [vm.element.stamp]]);
    }
  }

  gameSelectionDetailDirectiveFactory.$inject = ['appGame', 'gameMap'];
  function gameSelectionDetailDirectiveFactory(appGameService, gameMapService) {
    var gameSelectionDetailDirective = {
      restrict: 'A',
      scope: true,
      controller: 'clickGameSelectionDetailCtrl',
      controllerAs: 'selection',
      link: link
    };
    return gameSelectionDetailDirective;

    function link(scope, element) {
      console.log('gameSelectionDetail');
      element = element[0];
      var viewport = document.getElementById('viewport');
      var map = document.getElementById('map');
      var vm = scope.selection;

      vm.type = 'model';
      closeSelectionDetail();
      scope.bindCell(function (detail) {
        if (R.isNil(detail)) {
          closeSelectionDetail();
        } else {
          openSelectionDetail(detail);
        }
      }, appGameService.view.detail, scope);
      vm.doClose = closeSelectionDetail;

      function openSelectionDetail(_ref3) {
        var type = _ref3.type;
        var element = _ref3.element;

        console.info('openSelectionDetail');
        vm.type = type;
        vm.element = element.state;
        vm.edit = { label: '',
          max_deviation: 0
        };
        vm.onOpen();
        self.window.requestAnimationFrame(displaySelectionDetail);
      }
      function closeSelectionDetail() {
        // console.log('closeSelectionDetail');
        vm.type = null;
        vm.element = {};
        element.style.display = 'none';
        element.style.visibility = 'hidden';
        element.style.left = 0 + 'px';
        element.style.top = 0 + 'px';
      }
      function displaySelectionDetail() {
        // console.log('displaySelectionDetail');
        element.style.display = 'initial';
        element.style.visibility = 'hidden';
        self.window.requestAnimationFrame(showSelectionDetail);
      }
      function showSelectionDetail() {
        // console.log('showSelectionDetail');
        placeSelectionDetail();
        element.style.visibility = 'visible';
      }
      function placeSelectionDetail() {
        // console.log('placeSelectionDetail');
        var detail_rect = element.getBoundingClientRect();
        var screen_pos = gameMapService.mapToScreenCoordinates(map, vm.element);
        var viewport_rect = viewport.getBoundingClientRect();
        if (detailCanFitRight(viewport_rect, detail_rect, screen_pos)) {
          element.style.left = alignRight(detail_rect, screen_pos);
        } else {
          element.style.left = alignLeft(detail_rect, screen_pos);
        }
        if (detailCanFitBottom(viewport_rect, detail_rect, screen_pos)) {
          element.style.top = alignBottom(detail_rect, screen_pos);
        } else {
          element.style.top = alignTop(detail_rect, screen_pos);
        }
      }
      function detailCanFitRight(viewport_rect, detail_rect, screen_pos) {
        return screen_pos.x + detail_rect.width <= viewport_rect.right;
      }
      function alignRight(_detail_rect_, screen_pos) {
        return screen_pos.x + 'px';
      }
      function alignLeft(detail_rect, screen_pos) {
        return Math.max(0, screen_pos.x - detail_rect.width) + 'px';
      }
      function detailCanFitBottom(viewport_rect, detail_rect, screen_pos) {
        return screen_pos.y + detail_rect.height <= viewport_rect.bottom;
      }
      function alignBottom(_detail_rect_, screen_pos) {
        return screen_pos.y + 'px';
      }
      function alignTop(detail_rect, screen_pos) {
        return Math.max(0, screen_pos.y - detail_rect.height) + 'px';
      }
    }
  }
})();
//# sourceMappingURL=selectionOsd.js.map
