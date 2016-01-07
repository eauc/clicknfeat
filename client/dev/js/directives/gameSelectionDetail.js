'use strict';

angular.module('clickApp.directives').controller('clickGameSelectionDetailCtrl', ['$scope', 'game', 'gameFactions', function ($scope, gameService, gameFactionsService) {
  console.log('init clickGameSelectionDetailCtrl');
  var state = $scope.state;

  $scope.edit = { label: '',
    max_deviation: 0
  };
  var updateOnOpenType = {
    template: function template() {
      $scope.edit.max_deviation = R.pathOr(0, ['state', 'm'], $scope.selection);
    },
    model: function model() {
      gameFactionsService.getModelInfo($scope.selection.state.info, state.factions).then(function (info) {
        $scope.info = info;
        $scope.$digest();
      });
    }
  };
  $scope.show = { info: false };
  $scope.updateOnOpen = function () {
    $scope.show.info = false;
    updateOnOpenType[$scope.type]();
  };
  $scope.labelDisplay = function (l) {
    return s.truncate(l, 12);
  };

  $scope.doSetMaxDeviation = function () {
    var max = $scope.edit.max_deviation > 0 ? $scope.edit.max_deviation : null;
    $scope.stateEvent('Game.command.execute', 'onTemplates', ['setMaxDeviation', [max], [$scope.selection.state.stamp]]);
  };
  $scope.doAddLabel = function () {
    var cmd = $scope.type === 'template' ? 'onTemplates' : 'onModels';
    var new_label = s.trim($scope.edit.label);
    if (R.length(new_label) === 0) return;

    $scope.stateEvent('Game.command.execute', cmd, ['addLabel', [new_label], [$scope.selection.state.stamp]]).then(function () {
      $scope.$digest();
    });
    $scope.edit.label = '';
  };
  $scope.doRemoveLabel = function (label) {
    var cmd = $scope.type === 'template' ? 'onTemplates' : 'onModels';
    $scope.stateEvent('Game.command.execute', cmd, ['removeLabel', [label], [$scope.selection.state.stamp]]).then(function () {
      $scope.$digest();
    });
  };
}]).directive('clickGameSelectionDetail', ['$window', 'game', 'gameMap', function ($window, gameService, gameMapService) {
  return {
    restrict: 'A',
    scope: true,
    controller: 'clickGameSelectionDetailCtrl',
    link: function link(scope, element) {
      console.log('gameSelectionDetail');
      var viewport = document.getElementById('viewport');
      var map = document.getElementById('map');

      scope.type = 'model';
      closeSelectionDetail();

      function openSelectionDetail($event, type, selection) {
        // console.log('openSelectionDetail');
        scope.type = type;
        scope.selection = selection;
        scope.edit = { label: '',
          max_deviation: 0
        };
        scope.updateOnOpen();
        $window.requestAnimationFrame(displaySelectionDetail);
      }
      function closeSelectionDetail() {
        // console.log('closeSelectionDetail');
        scope.selection = {};
        element[0].style.display = 'none';
        element[0].style.visibility = 'hidden';
        element[0].style.left = 0 + 'px';
        element[0].style.top = 0 + 'px';
      }
      function displaySelectionDetail() {
        scope.$digest();
        element[0].style.display = 'initial';
        element[0].style.visibility = 'hidden';
        $window.requestAnimationFrame(showSelectionDetail);
      }
      function showSelectionDetail() {
        placeSelectionDetail();
        element[0].style.visibility = 'visible';
      }
      function placeSelectionDetail() {
        var detail_rect = element[0].getBoundingClientRect();
        var screen_pos = gameMapService.mapToScreenCoordinates(map, scope.selection.state);
        var viewport_rect = viewport.getBoundingClientRect();
        if (detailCanFitRight(viewport_rect, detail_rect, screen_pos)) {
          element[0].style.left = alignRight(detail_rect, screen_pos);
        } else {
          element[0].style.left = alignLeft(detail_rect, screen_pos);
        }
        if (detailCanFitBottom(viewport_rect, detail_rect, screen_pos)) {
          element[0].style.top = alignBottom(detail_rect, screen_pos);
        } else {
          element[0].style.top = alignTop(detail_rect, screen_pos);
        }
      }
      function detailCanFitRight(viewport_rect, detail_rect, screen_pos) {
        return screen_pos.x + detail_rect.width <= viewport_rect.right;
      }
      function alignRight(detail_rect, screen_pos) {
        return screen_pos.x + 'px';
      }
      function alignLeft(detail_rect, screen_pos) {
        return Math.max(0, screen_pos.x - detail_rect.width) + 'px';
      }
      function detailCanFitBottom(viewport_rect, detail_rect, screen_pos) {
        return screen_pos.y + detail_rect.height <= viewport_rect.bottom;
      }
      function alignBottom(detail_rect, screen_pos) {
        return screen_pos.y + 'px';
      }
      function alignTop(detail_rect, screen_pos) {
        return Math.max(0, screen_pos.y - detail_rect.height) + 'px';
      }

      scope.onStateChangeEvent('Game.selectionDetail.open', openSelectionDetail, scope);
      scope.onStateChangeEvent('Game.selectionDetail.close', closeSelectionDetail, scope);
      scope.doClose = closeSelectionDetail;
    }
  };
}]);
//# sourceMappingURL=gameSelectionDetail.js.map
