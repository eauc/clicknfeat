(function() {
  angular.module('clickApp.directives')
    .controller('clickGameSelectionDetailCtrl', gameSelectionDetailCtrl)
    .directive('clickGameSelectionDetail', gameSelectionDetailDirectiveFactory);

  gameSelectionDetailCtrl.$inject = [
    '$scope',
    'gameTemplates',
    // 'gameFactions',
  ];
  function gameSelectionDetailCtrl($scope,
                                   gameTemplatesModel) {
                                   // gameFactionsModel) {
    const vm = this;
    const state = $scope.state;
    console.log('init clickGameSelectionDetailCtrl');

    vm.edit = { label: '',
                max_deviation: 0
              };
    vm.show = { info: false };
    vm.onOpen = onOpen;
    vm.updateElement = updateElement;
    vm.labelDisplay = labelDisplay;

    vm.doSetMaxDeviation = doSetMaxDeviation;
    vm.doAddLabel = doAddLabel;
    vm.doRemoveLabel = doRemoveLabel;

    const updateOnOpenType = {
      template: updateTemplateElement,
      model: updateModelElement
    };
    function onOpen() {
      vm.show.info = false;
      return updateElement();
    }
    function updateElement() {
      return R.threadP()(
        () => updateOnOpenType[vm.type](),
        () => { $scope.$digest(); }
      );
    }
    function updateTemplateElement() {
      return R.threadP(state.game)(
        R.prop('templates'),
        gameTemplatesModel.findStampP$(vm.element.stamp),
        (template) => {
          vm.element = template.state;
          vm.edit.max_deviation = R.propOr(0, 'm', vm.element);
        }
      );
    }
    function updateModelElement() {
      // R.threadP(state.factions)(
      //   () => gameFactionsModel
      //     .getModelInfoP$(vm.element.state.info),
      //   (info) => {
      //     vm.info = info;
      //     $scope.$digest();
      //   }
      // );
    }
    function labelDisplay(l) {
      return s.truncate(l, 12);
    }
    function doSetMaxDeviation() {
      const max = ( vm.edit.max_deviation > 0
                    ? vm.edit.max_deviation
                    : null
                  );
      $scope
        .stateEvent('Game.command.execute',
                    'onTemplates',
                    [ 'setMaxDeviation', [max],
                      [vm.element.stamp]
                    ])
        .then(updateElement);
    }
    function doAddLabel() {
      const cmd = ( vm.type === 'template'
                    ? 'onTemplates'
                    : 'onModels'
                  );
      const new_label = s.trim(vm.edit.label);
      if(R.length(new_label) === 0) return;

      $scope
        .stateEvent('Game.command.execute',
                    cmd,
                    [ 'addLabel', [new_label],
                      [vm.element.stamp]
                    ])
        .then(updateElement);
      vm.edit.label = '';
    }
    function doRemoveLabel(label) {
      const cmd = ( vm.type === 'template'
                    ? 'onTemplates'
                    : 'onModels'
                  );
      $scope
        .stateEvent('Game.command.execute',
                    cmd,
                    [ 'removeLabel', [label],
                      [vm.element.stamp]
                    ])
        .then(updateElement);
    }
  }

  gameSelectionDetailDirectiveFactory.$inject = [
    'game',
    'gameMap',
  ];
  function gameSelectionDetailDirectiveFactory(gameService,
                                               gameMapService) {
    const gameSelectionDetailDirective = {
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
      const viewport = document.getElementById('viewport');
      const map = document.getElementById('map');
      const vm = scope.selection;

      vm.type = 'model';
      closeSelectionDetail();
      scope.onStateChangeEvent('Game.selectionDetail.open',
                               openSelectionDetail, scope);
      scope.onStateChangeEvent('Game.selectionDetail.close',
                               closeSelectionDetail, scope);
      vm.doClose = closeSelectionDetail;

      function openSelectionDetail($event, type, element) {
        // console.log('openSelectionDetail');
        vm.type = type;
        vm.element = element.state;
        vm.edit = { label: '',
                    max_deviation: 0
                  };
        vm.onOpen().then(() => {
          self.window.requestAnimationFrame(displaySelectionDetail);
        });
      }
      function closeSelectionDetail() {
        // console.log('closeSelectionDetail');
        vm.element = {};
        element.style.display = 'none';
        element.style.visibility = 'hidden';
        element.style.left = 0+'px';
        element.style.top = 0+'px';
      }
      function displaySelectionDetail() {
        // console.log('displaySelectionDetail');
        scope.$digest();
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
        const detail_rect = element.getBoundingClientRect();
        const screen_pos = gameMapService
                .mapToScreenCoordinates(map, vm.element);
        const viewport_rect = viewport.getBoundingClientRect();
        if(detailCanFitRight(viewport_rect, detail_rect, screen_pos)) {
          element.style.left = alignRight(detail_rect, screen_pos);
        }
        else {
          element.style.left = alignLeft(detail_rect, screen_pos);
        }
        if(detailCanFitBottom(viewport_rect, detail_rect, screen_pos)) {
          element.style.top = alignBottom(detail_rect, screen_pos);
        }
        else {
          element.style.top = alignTop(detail_rect, screen_pos);
        }
      }
      function detailCanFitRight(viewport_rect, detail_rect, screen_pos) {
        return screen_pos.x + detail_rect.width <= viewport_rect.right;
      }
      function alignRight(detail_rect, screen_pos) {
        return screen_pos.x+'px';
      }
      function alignLeft(detail_rect, screen_pos) {
        return Math.max(0, screen_pos.x-detail_rect.width)+'px';
      }
      function detailCanFitBottom(viewport_rect, detail_rect, screen_pos) {
        return screen_pos.y + detail_rect.height <= viewport_rect.bottom;
      }
      function alignBottom(detail_rect, screen_pos) {
        return screen_pos.y+'px';
      }
      function alignTop(detail_rect, screen_pos) {
        return Math.max(0, screen_pos.y-detail_rect.height)+'px';
      }
    }
  }
})();
