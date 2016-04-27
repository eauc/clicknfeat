'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.directives').controller('clickGameEditDamageCtrl', gameEditDamageCtrl).directive('clickGameEditDamage', gameEditDamageDirectiveFactory);

  gameEditDamageCtrl.$inject = ['$scope'];
  function gameEditDamageCtrl() {
    console.log('init clickGameEditDamageCtrl');
  }

  gameEditDamageDirectiveFactory.$inject = ['gameFactions', 'gameMap'];
  function gameEditDamageDirectiveFactory(gameFactionsModel, gameMapService) {
    return {
      restrict: 'A',
      templateUrl: 'app/components/game/edit_damage/edit_damage.html',
      scope: true,
      controller: 'clickGameEditDamageCtrl',
      controllerAs: 'edit_damage',
      link: link
    };

    function link(scope, element) {
      console.log('gameEditDamage');
      var viewport = document.getElementById('viewport');
      var map = document.getElementById('map');
      var state = scope.state;
      var container = element[0];

      var opened = false;
      closeEditDamage();
      scope.onStateChangeEvent('Game.editDamage.toggle', toggleEditDamage, scope);
      scope.onStateChangeEvent('Game.editDamage.open', openEditDamage, scope);
      scope.onStateChangeEvent('Game.editDamage.close', closeEditDamage, scope);
      scope.doClose = closeEditDamage;

      function toggleEditDamage(event, selection) {
        console.log('toggleEditDamage');
        if (opened) {
          closeEditDamage();
        } else {
          openEditDamage(event, selection);
        }
      }
      function closeEditDamage() {
        // console.log('closeEditDamage');
        opened = false;
        scope.selection = {};

        container.style.display = 'none';
        container.style.visibility = 'hidden';
        container.style.left = 0 + 'px';
        container.style.top = 0 + 'px';
      }
      function openEditDamage(_event_, _ref) {
        var _ref2 = _slicedToArray(_ref, 1);

        var selection = _ref2[0];

        // console.log('openEditDamage');
        opened = true;
        scope.selection = selection;
        var info = gameFactionsModel.getModelInfo(scope.selection.state.info, state.factions);
        scope.info = info;
        scope.$digest();

        self.window.requestAnimationFrame(displayEditDamage);
      }
      function displayEditDamage() {
        container.style.display = 'initial';
        container.style.visibility = 'hidden';

        self.window.requestAnimationFrame(showEditDamage);
      }
      function showEditDamage() {
        placeEditDamage();
        container.style.visibility = 'visible';
      }
      function placeEditDamage() {
        var detail_rect = container.getBoundingClientRect();
        var screen_pos = gameMapService.mapToScreenCoordinates(map, scope.selection.state);
        var viewport_rect = viewport.getBoundingClientRect();

        var max_top = viewport_rect.height - detail_rect.height;
        var max_left = viewport_rect.width - detail_rect.width;

        var top = Math.max(0, Math.min(max_top, screen_pos.y - detail_rect.height / 2));
        var left = Math.max(0, Math.min(max_left, screen_pos.x - detail_rect.width / 2));

        container.style.top = top + 'px';
        container.style.left = left + 'px';
      }
    }
  }
})();
//# sourceMappingURL=editDamage.js.map
