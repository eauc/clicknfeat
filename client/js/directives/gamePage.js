'use strict';

angular.module('clickApp.directives')
  .directive('clickGamePage', [
    '$window',
    function($window) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          console.log('gamePage', element);
          var gameview = element[0].querySelector('#gameview');
          var viewport = element[0].querySelector('#viewport');
          var menu = element[0].querySelector('#menu');
          var map = element[0].querySelector('#map');

          var toggleMenuClick = (function() {
            var menu_hidden = false;
            var gameview_width_mem;
            return function toggleMenuClick(event) {
              if(!menu_hidden) {
                var rect = gameview.getBoundingClientRect();
                gameview_width_mem = rect.width;
                gameview.style.width = $window.innerWidth+'px';
              }
              else {
                gameview.style.width = gameview_width_mem+'px';
              }
              gameview.classList.toggle('resizable');
              menu.classList.toggle('hidden');
              menu_hidden = !menu_hidden;
            };
          })();

          function clickMap(event) {
            console.log('clickMap', event);
            var event_x, event_y;
            if(event.offsetX) {
              event_x = event.offsetX;
              event_y = event.offsetY;
            }
            else {
              event_x = event.layerX;
              event_y = event.layerY;
            }
            var rect = map.getBoundingClientRect();
            var map_x = event_x * 480 / rect.width;
            var map_y = event_y * 480 / rect.height;
            console.log('clickMap', map_x, map_y);
            scope.$emit('clickMap', { x: map_x, y: map_y }, event);
          }

          var flipMap = (function() {
            var flip = false;
            return function flipMap() {
              flip = !flip;
              if(flip) {
                map.style.transform = 'scaleX(-1) scaleY(-1)';
              }
              else {
                map.style.transform = '';
              }
            };
          })();

          function zoomReset() {
            var rect = viewport.getBoundingClientRect();
            var hw = Math.min(rect.width, rect.height);
            setMapDimensions(hw);
          }

          function zoomIn() {
            var vp = findViewportCenter();
            var cx_cy = vp[0];
            var vw_vh = vp[1];
    
            var rect = map.getBoundingClientRect();
            var cx = (vw_vh[0] > rect.width) ? rect.width / 2 : cx_cy[0];
            var cy = (vw_vh[1] > rect.height) ? rect.height / 2 : cx_cy[1];

            setMapDimensions(rect.width*2);
            setViewportCenter(cx*2, cy*2, vw_vh[0], vw_vh[1]);
          }

          function zoomOut() {
            var vp = findViewportCenter();
            var cx_cy = vp[0];
            var vw_vh = vp[1];
            var hw = Math.min(vw_vh[0], vw_vh[1]);
            
            var rect = map.getBoundingClientRect();

            setMapDimensions(Math.max(hw-15, rect.width/2));
            setViewportCenter(cx_cy[0]/2, cx_cy[1]/2, vw_vh[0], vw_vh[1]);
          }

          function setMapDimensions(dim) {
            $window.requestAnimationFrame(function _setMapDimensions() {
              map.style.width = dim+'px';
              map.style.height = dim+'px';
            });
          }          

          function findViewportCenter() {
            var rect = viewport.getBoundingClientRect();
            var vw = rect.width;
            var vh = rect.height;

            var cx = viewport.scrollLeft + rect.width/2;
            var cy = viewport.scrollTop + rect.height/2;

            return [[cx, cy], [vw, vh]];
          }

          function setViewportCenter(cx, cy, vw, vh) {
            $window.requestAnimationFrame(function _setViewportCenter() {
              viewport.scrollLeft = cx - vw/2;
              viewport.scrollTop = cy - vh/2;
            });
          }

          element[0]
            .querySelector('#menu-toggle')
            .addEventListener('click', toggleMenuClick);
          map.addEventListener('click', clickMap);
          scope.$on('flipMap', flipMap);
          scope.$on('zoomIn', zoomIn);
          scope.$on('zoomOut', zoomOut);
          scope.$on('zoomReset', zoomReset);

          var rect = gameview.getBoundingClientRect();
          gameview.style.width = (rect.height+100)+'px';
          setMapDimensions(rect.height-15);
        }
      };
    }
  ]);
// $window.addEventListener('resize', function(event) {
//   var rect = viewport.getBoundingClientRect();
//   var hw = Math.min(rect.width, rect.height);
  
//   rect = map.getBoundingClientRect();
//   if(rect.width < hw) {
//     setMapDimensions(hw);
//   }
// });
