'use strict';

angular.module('clickApp.controllers')
  .controller('clickGameEditDamageCtrl', [
    '$scope',
    function($scope) {
      console.log('init clickGameEditDamageCtrl');
    }
  ]);

angular.module('clickApp.directives')
  .directive('clickGameEditDamage', [
    '$window',
    'game',
    'gameFactions',
    'gameMap',
    function($window,
             gameService,
             gameFactionsService,
             gameMapService) {
      return {
        restrict: 'A',
        template: [ '<click-game-model-damage info="info.damage"',
                    '  state="selection.state"',
                    '  on-error="gameEvent(\'modeActionError\', reason)">',
                    '</click-game-model-damage>',
                  ].join(''),
        scope: true,
        controller: 'clickGameEditDamageCtrl',
        link: function(scope, element/*, attrs*/) {
          console.log('gameEditDamage');
          let viewport = document.getElementById('viewport');
          let map = document.getElementById('map');

          let opened = false;
          function toggleEditDamage(event, selection) {
            console.log('toggleEditDamage');
            if(opened) {
              closeEditDamage();
            }
            else {
              openEditDamage(event, selection);
            }
          }
          
          closeEditDamage();
          function closeEditDamage() {
            console.log('closeEditDamage');

            opened = false;
            scope.selection = {};

            $window.requestAnimationFrame(function _closeEditDamage() {
              element[0].style.display = 'none';
              element[0].style.visibility = 'hidden';
              element[0].style.left = 0+'px';
              element[0].style.top = 0+'px';
            });
          }
          function openEditDamage($event, selection) {
            console.log('openEditDamage');

            opened = true;
            scope.selection = selection;
            gameFactionsService.getModelInfo(scope.selection.state.info,
                                             scope.factions)
              .then(function(info) {
                scope.info = info;
                scope.$digest();
              });

            $window.requestAnimationFrame(displayEditDamage);
          }
          function displayEditDamage() {
            element[0].style.display = 'initial';
            element[0].style.visibility = 'hidden';

            $window.requestAnimationFrame(showEditDamage);
          }
          function showEditDamage() {
            placeEditDamage();
            element[0].style.visibility = 'visible';
          }
          function placeEditDamage() {
            let detail_rect = element[0].getBoundingClientRect();
            let screen_pos = gameMapService.mapToScreenCoordinates(map, scope.selection.state);
            let viewport_rect = viewport.getBoundingClientRect();

            let max_top = viewport_rect.height - detail_rect.height;
            let max_left = viewport_rect.width - detail_rect.width;

            let top = Math.max(0, Math.min(max_top, screen_pos.y - detail_rect.height / 2));
            let left = Math.max(0, Math.min(max_left, screen_pos.x - detail_rect.width / 2));
            
            element[0].style.top = top + 'px';
            element[0].style.left = left + 'px';
          }

          scope.onGameEvent('toggleEditDamage', toggleEditDamage, scope);
          scope.onGameEvent('openEditDamage', openEditDamage, scope);
          scope.onGameEvent('closeEditDamage', closeEditDamage, scope);
          scope.doClose = closeEditDamage;
        }
      };
    }
  ]);
