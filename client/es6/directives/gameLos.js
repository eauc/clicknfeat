'use strict';

angular.module('clickApp.directives')
  .directive('clickGameLos', [
    function() {
      return {
        restrict: 'A',
        link: function(scope, el/*, attrs*/) {
          var map = document.getElementById('map');
          var svgNS = map.namespaceURI;

          var local_element = createLosElement(svgNS, el[0]);
          var remote_element = createLosElement(svgNS, el[0]);
          
          scope.onGameEvent('changeLocalLos', function onChangeLocalLos() {
            updateLos(map, scope.game.los.local, local_element);
          }, scope);
          scope.onGameEvent('changeRemoteLos', function onChangeRemoteLos(event, los) {
            if(R.isNil(los)) return;
            
            updateLos(map, los.remote, remote_element);

            // var display = ( gameLosService.isDisplayed(los) ||
            //                 'LoS' === modesService.currentModeName(scope.modes)
            //               );
            // updateOrigin(scope.factions, scope.game.models,
            //              los, display,
            //              remote_element.origin);
            // updateTarget(scope.factions, scope.game.models,
            //              los, display,
            //              remote_element.target);
          }, scope);
          // scope.onGameEvent('mapFlipped', function onMapFlippedLos(event) {
          //   updateLosOnMapFlipped(map, scope.game.los.local, local_element);
          //   updateLosOnMapFlipped(map, scope.game.los.remote, remote_element);
          // }, scope);
        }
      };
      function createLosElement(svgNS, parent) {
        var group = document.createElementNS(svgNS, 'g');
        parent.appendChild(group);

        var line = document.createElementNS(svgNS, 'line');
        line.style['marker-start'] = 'url(#los-start)';
        line.style['marker-end'] = 'url(#los-end)';
        group.appendChild(line);

        // var label = labelElementService.create(svgNS, group);

        // var origin = document.createElementNS(svgNS, 'circle');
        // origin.classList.add('los-origin');
        // origin.setAttribute('cx', '0');
        // origin.setAttribute('cy', '0');
        // origin.setAttribute('r', '0');
        // origin.style.visibility = 'hidden';
        // parent.appendChild(origin);

        // var target = document.createElementNS(svgNS, 'circle');
        // target.classList.add('los-target');
        // target.setAttribute('cx', '0');
        // target.setAttribute('cy', '0');
        // target.setAttribute('r', '0');
        // target.style.visibility = 'hidden';
        // parent.appendChild(target);

        return { container: group,
                 line: line,
                 // label: label,
                 // origin: origin,
                 // target: target,
               };
      }
      function updateLos(map, los, element) {
        // var map_flipped = gameMapService.isFlipped(map);
        // var zoom_factor = gameMapService.zoomFactor(map);
        // var label_flip_center = {
        //   x: (los.end.x - los.start.x) / 2 + los.start.x,
        //   y: (los.end.y - los.start.y) / 2 + los.start.y,
        // };
        // var label_text = los.display ? los.length : '';
        self.requestAnimationFrame(function _updateLos() {
          updateLine(los.display, los, element.line);
          // labelElementService.update(map_flipped,
          //                            zoom_factor,
          //                            label_flip_center,
          //                            label_flip_center,
          //                            label_text,
          //                            element.label);
        });
      }
      // function updateLosOnMapFlipped(map, los, element) {
      //   var label_flip_center = {
      //     x: (los.end.x - los.start.x) / 2 + los.start.x,
      //     y: (los.end.y - los.start.y) / 2 + los.start.y,
      //   };
      //   labelElementService.updateOnFlipMap(map, label_flip_center, element.label);
      // }
      function updateLine(visible, los, line) {
        line.style['visibility'] = visible ? 'visible' : 'hidden';
        line.setAttribute('x1', los.start.x+'');
        line.setAttribute('y1', los.start.y+'');
        line.setAttribute('x2', los.end.x+'');
        line.setAttribute('y2', los.end.y+'');
      }
      // function updateOrigin(factions, models, los, display, element) {
      //   var origin = gameLosService.origin(los);
      //   R.pipeP(
      //     function(origin) {
      //       if(R.exists(origin)) {
      //         return gameModelsService.findStamp(origin, models);
      //       }
      //       return self.Promise.resolve(null);
      //     },
      //     function(origin_model) {
      //       if(!display ||
      //          R.isNil(origin_model)) {
      //         element.style.visibility = 'hidden';
      //         return;
      //       }
      //       R.pipeP(
      //         gameFactionsService.getModelInfo$(origin_model.state.info),
      //         function(info) {
      //           element.setAttribute('cx', origin_model.state.x+'');
      //           element.setAttribute('cy', origin_model.state.y+'');
      //           element.setAttribute('r', info.base_radius+'');
      //           element.style.visibility = 'visible';
      //         }
      //       )(factions);
      //     }
      //   )(origin);
      // }
      // function updateTarget(factions, models, los, display, element) {
      //   var target = gameLosService.target(los);
      //   R.pipeP(
      //     function(target) {
      //       if(R.exists(target)) {
      //         return gameModelsService.findStamp(target, models);
      //       }
      //       return self.Promise.resolve(null);
      //     },
      //     function(target_model) {
      //       if(!display ||
      //          R.isNil(target_model)) {
      //         element.style.visibility = 'hidden';
      //         return;
      //       }
            
      //       if(gameLosService.targetReached(los)) {
      //         element.classList.add('reached');
      //       }
      //       else {
      //         element.classList.remove('reached');
      //       }
            
      //       R.pipeP(
      //         gameFactionsService.getModelInfo$(target_model.state.info),
      //         function(info) {
      //           element.setAttribute('cx', target_model.state.x+'');
      //           element.setAttribute('cy', target_model.state.y+'');
      //           element.setAttribute('r', info.base_radius+'');
      //           element.style.visibility = 'visible';
      //         }
      //       )(factions);
      //     }
      //   )(target);
      // }
    }
  ]);
