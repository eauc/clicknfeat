(function() {
  angular.module('clickApp.directives')
    .directive('clickGamePage', clickGamePageDirectiveFactory);

  clickGamePageDirectiveFactory.$inject = [
    '$window',
  ];
  function clickGamePageDirectiveFactory($window) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, element) {
      const toggleMenuClick = (() => {
        let gameview_width_mem;
        return () => {
          const gameview = element[0].querySelector('#gameview');
          const menu = element[0].querySelector('#menu');
          const dice_osd = element[0].querySelector('#dice-osd');
          const chat_osd = element[0].querySelector('#chat-osd');

          const menu_hidden = menu.classList.contains('hidden');
          if(!menu_hidden) {
            const rect = gameview.getBoundingClientRect();
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
      scope.onStateChangeEvent('Game.toggleMenu', toggleMenuClick, scope);

      const gameview = element[0].querySelector('#gameview');
      const rect = gameview.getBoundingClientRect();
      gameview.style.width = (rect.height)+'px';
    }
  }
})();
