(function() {
  angular.module('clickApp.directives')
    .controller('clickGameSelectionDetailCtrl', gameSelectionDetailCtrl)
    .directive('clickGameSelectionDetail', gameSelectionDetailDirectiveFactory);

  gameSelectionDetailCtrl.$inject = [
    '$scope',
    'appGame',
    // 'gameFactions',
    // 'gameModels',
    'gameTemplates',
  ];
  function gameSelectionDetailCtrl($scope,
                                   appGameService,
                                   // gameFactionsModel,
                                   // gameModelsModel,
                                   gameTemplatesModel) {
    const vm = this;
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
      $scope.listenSignal(updateTemplateElement,
                          appGameService.templates.changes,
                          $scope);
      // $scope.onStateChangeEvent('Game.models.change',
      //                           updateElement,
      //                           $scope);
    }
    function onOpen() {
      vm.show.info = false;
      if(R.isNil(vm.type)) return;

      if('template' === vm.type) {
        const templates = appGameService.templates
                .templates.sample();
        updateTemplateElement([templates, [vm.element.stamp]]);
      }
    }
    function updateTemplateElement([templates, stamps]) {
      if(!R.find(R.equals(vm.element.stamp), stamps)) {
        return;
      }
      R.thread(templates)(
        gameTemplatesModel.findStamp$(vm.element.stamp),
        R.when(
          R.exists,
          (template) => {
            vm.element = template.state;
            vm.edit.max_deviation = R.propOr(0, 'm', vm.element);
          }
        )
      );
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
      const max = ( vm.edit.max_deviation > 0
                    ? vm.edit.max_deviation
                    : null
                  );
      $scope.sendAction('Game.command.execute',
                        'onTemplates',
                        [ 'setMaxDeviation', [max],
                          [vm.element.stamp]
                        ]);
    }
    function doAddLabel() {
      const cmd = ( vm.type === 'template'
                    ? 'onTemplates'
                    : 'onModels'
                  );
      const new_label = s.trim(vm.edit.label);
      if(R.length(new_label) === 0) return;

      $scope.sendAction('Game.command.execute',
                        cmd,
                        [ 'addLabel', [new_label],
                          [vm.element.stamp]
                        ]);
      vm.edit.label = '';
    }
    function doRemoveLabel(label) {
      const cmd = ( vm.type === 'template'
                    ? 'onTemplates'
                    : 'onModels'
                  );
      $scope.sendAction('Game.command.execute',
                        cmd,
                        [ 'removeLabel', [label],
                          [vm.element.stamp]
                        ]);
    }
  }

  gameSelectionDetailDirectiveFactory.$inject = [
    'appGame',
    'gameMap',
  ];
  function gameSelectionDetailDirectiveFactory(appGameService,
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
      scope.bindCell((detail) => {
        if(R.isNil(detail)) {
          closeSelectionDetail();
        }
        else {
          openSelectionDetail(detail);
        }
      }, appGameService.view.detail, scope);
      vm.doClose = closeSelectionDetail;

      function openSelectionDetail({type, element }) {
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
        element.style.left = 0+'px';
        element.style.top = 0+'px';
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
      function alignRight(_detail_rect_, screen_pos) {
        return screen_pos.x+'px';
      }
      function alignLeft(detail_rect, screen_pos) {
        return Math.max(0, screen_pos.x-detail_rect.width)+'px';
      }
      function detailCanFitBottom(viewport_rect, detail_rect, screen_pos) {
        return screen_pos.y + detail_rect.height <= viewport_rect.bottom;
      }
      function alignBottom(_detail_rect_, screen_pos) {
        return screen_pos.y+'px';
      }
      function alignTop(detail_rect, screen_pos) {
        return Math.max(0, screen_pos.y-detail_rect.height)+'px';
      }
    }
  }
})();
