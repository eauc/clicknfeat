'use strict';

angular.module('clickApp.controllers')
  .controller('clickGameSelectionDetailCtrl', [
    '$scope',
    'game',
    'gameFactions',
    function($scope,
             gameService,
             gameFactionsService) {
      console.log('init clickGameSelectionDetailCtrl');
      var updateOnOpenType = {
        template: function updateOnOpenTemplate() {
          $scope.new_max_deviation = R.defaultTo(0, R.path(['state','m'], $scope.selection));
        },
        model: function updateOnOpenModel() {
          $scope.info = gameFactionsService.getModelInfo($scope.selection.state.info,
                                                         $scope.factions);
        },
      };
      $scope.updateOnOpen = function updateOnOpen() {
        updateOnOpenType[$scope.type]();
      };
      
      $scope.doSetMaxDeviation = function doSetMaxDeviation() {
        var max = ($scope.new_max_deviation > 0) ? $scope.new_max_deviation : null;
        gameService.executeCommand('onTemplates', 'setMaxDeviation', max,
                                   [$scope.selection.state.stamp],
                                   $scope, $scope.game);
      };
      $scope.doAddLabel = function doAddLabel() {
        var new_label = s.trim($scope.new_label);
        if(R.length(new_label) === 0) return;
        gameService.executeCommand('onTemplates', 'addLabel', new_label,
                                   [$scope.selection.state.stamp],
                                   $scope, $scope.game);
        $scope.new_label = '';
      };
      $scope.doRemoveLabel = function doRemoveLabel(label) {
        gameService.executeCommand('onTemplates', 'removeLabel', label,
                                   [$scope.selection.state.stamp],
                                   $scope, $scope.game);
      };
    }
  ]);

angular.module('clickApp.directives')
  .directive('clickGameSelectionDetail', [
    '$window',
    'game',
    'gameMap',
    function($window,
             gameService,
             gameMapService) {
      return {
        restrict: 'A',
        scope: true,
        controller: 'clickGameSelectionDetailCtrl',
        link: function(scope, element, attrs) {
          console.log('gameSelectionDetail');
          var viewport = document.getElementById('viewport');
          var map = document.getElementById('map');

          closeSelectionDetail();

          function openSelectionDetail($event, type, selection) {
            // console.log('openSelectionDetail');
            scope.type = type;
            scope.selection = selection;
            scope.updateOnOpen();
            $window.requestAnimationFrame(displaySelectionDetail);
          }
          function closeSelectionDetail() {
            // console.log('closeSelectionDetail');
            scope.selection = {};
            scope.deferDigest(scope);
            $window.requestAnimationFrame(function _closeSelectionDetail() {
              element[0].style.display = 'none';
              element[0].style.visibility = 'hidden';
              element[0].style.left = 0+'px';
              element[0].style.top = 0+'px';
            });
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
            if(detailCanFitRight(viewport_rect, detail_rect, screen_pos)) {
              element[0].style.left = alignRight(detail_rect, screen_pos);
            }
            else {
              element[0].style.left = alignLeft(detail_rect, screen_pos);
            }
            if(detailCanFitBottom(viewport_rect, detail_rect, screen_pos)) {
              element[0].style.top = alignBottom(detail_rect, screen_pos);
            }
            else {
              element[0].style.top = alignTop(detail_rect, screen_pos);
            }
          }
          function detailCanFitRight(viewport_rect, detail_rect, screen_pos) {
            return screen_pos.x + detail_rect.width <= viewport_rect.right;
          }
          function alignRight(detail_rect, screen_pos) {
            return screen_pos.x+'px';
          }
          function alignLeft(detail_rect, screen_pos) {
            return (screen_pos.x-detail_rect.width)+'px';
          }
          function detailCanFitBottom(viewport_rect, detail_rect, screen_pos) {
            return screen_pos.y + detail_rect.height <= viewport_rect.bottom;
          }
          function alignBottom(detail_rect, screen_pos) {
            return screen_pos.y+'px';
          }
          function alignTop(detail_rect, screen_pos) {
            return (screen_pos.y-detail_rect.height)+'px';
          }

          scope.onGameEvent('openSelectionDetail', openSelectionDetail, scope);
          scope.onGameEvent('closeSelectionDetail', closeSelectionDetail, scope);
          scope.doClose = closeSelectionDetail;
        }
      };
    }
  ]);
