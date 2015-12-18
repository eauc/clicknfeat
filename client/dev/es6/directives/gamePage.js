angular.module('clickApp.directives')
  .directive('clickGamePage', [
    '$window',
    function($window) {
      return {
        restrict: 'A',
        link: function(scope, element/*, attrs*/) {
          let toggleMenuClick = (() => {
            let gameview_width_mem;
            return () => {
              let gameview = element[0].querySelector('#gameview');
              let menu = element[0].querySelector('#menu');
              let dice_osd = element[0].querySelector('#dice-osd');
              let chat_osd = element[0].querySelector('#chat-osd');

              let menu_hidden = menu.classList.contains('hidden');
              if(!menu_hidden) {
                let rect = gameview.getBoundingClientRect();
                gameview_width_mem = rect.width;
                gameview.style.width = $window.innerWidth+'px';
              }
              else {
                gameview.style.width = gameview_width_mem+'px';
              }
              gameview.classList.toggle('resizable');
              menu.classList.toggle('hidden');
              dice_osd.classList.toggle('show');
              chat_osd.classList.toggle('show');
            };
          })();

          element[0]
            .querySelector('#menu-toggle')
            .addEventListener('click', toggleMenuClick);
          scope.onGameEvent('toggleMenu', toggleMenuClick, scope);

          let gameview = element[0].querySelector('#gameview');
          let rect = gameview.getBoundingClientRect();
          gameview.style.width = (rect.height)+'px';
        }
      };
    }
  ]);
