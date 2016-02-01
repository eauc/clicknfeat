angular.module('clickApp.directives')
  .factory('clickGameModelLoS', [
    function() {
      return {
        create: function clickGameModelLoSCreate(svgNS, info, parent) {
          let direction_los = document.createElementNS(svgNS, 'line');
          direction_los.classList.add('model-los-selection');
          direction_los.setAttribute('x1', (info.img[0].width/2)+'');
          direction_los.setAttribute('y1', (info.img[0].height/2)+'');
          direction_los.setAttribute('x2', (info.img[0].width/2)+'');
          direction_los.setAttribute('y2', (info.img[0].height/2-700)+'');
          parent.appendChild(direction_los);

          let front_arc_los = document.createElementNS(svgNS, 'line');
          front_arc_los.classList.add('model-los-selection');
          front_arc_los.setAttribute('x1', (info.img[0].width/2-700)+'');
          front_arc_los.setAttribute('y1', (info.img[0].height/2)+'');
          front_arc_los.setAttribute('x2', (info.img[0].width/2+700)+'');
          front_arc_los.setAttribute('y2', (info.img[0].height/2)+'');
          parent.appendChild(front_arc_los);

          return [ direction_los, front_arc_los ];
        },
        update: function clickGameModelLoSUpdate() {
        }
      };
    }
  ]);
