(function() {
  angular.module('clickApp.directives')
    .factory('labelElement', labelElementModelFactory);

  labelElementModelFactory.$inject = [
    'gameMap',
  ];
  function labelElementModelFactory(gameMapService) {
    const labelElementService = {
      create: labelElementModelCreate,
      updateOnFlipMap: labelElementModelUpdateOnFlipMap,
      update: labelElementModelUpdate
    };
    return labelElementService;

    function labelElementModelCreate(svgNS, parent) {
      const gLabel = document.createElementNS(svgNS, 'g');
      gLabel.classList.add('label');
      parent.appendChild(gLabel);
      const rectLabel = document.createElementNS(svgNS, 'rect');
      rectLabel.setAttribute('height', '6');
      gLabel.appendChild(rectLabel);
      const textLabel = document.createElementNS(svgNS, 'text');
      gLabel.appendChild(textLabel);

      return { label: gLabel,
               bckgnd: rectLabel,
               text: textLabel
             };
    }
    function labelElementModelUpdateOnFlipMap(map, center, label) {
      const map_flipped = gameMapService.isFlipped(map);
      label.label.setAttribute('transform',
                               map_flipped ? 'rotate(180,'+
                               center.x+','+
                               center.y+')' : '');
    }
    function labelElementModelUpdate(map_flipped,
                                     zoom_factor,
                                     flip_center,
                                     text_center,
                                     text,
                                     label) {
      text = R.defaultTo('', text) + '';
      const visibility = R.length(text) > 0 ? 'visible' : 'hidden';

      updateLabel(map_flipped, flip_center, visibility, label.label);
      if('visible' === visibility) {
        updateText(text_center, text, label.text);

        self.window.requestAnimationFrame(() => {
          updateBackground(zoom_factor, text_center,
                           label.text, label.bckgnd);
        });
      }
    }
    function updateLabel(map_flipped, flip_center, visibility, label) {
      label.style.visibility = visibility;
      label.setAttribute('transform',
                         ( map_flipped ?
                           'rotate(180,'+flip_center.x+','+flip_center.y+')' :
                           ''
                         ));
    }
    function updateText(center, content, text) {
      text.innerHTML = content;
      text.setAttribute('x', center.x+'');
      text.setAttribute('y', center.y+'');
    }
    function updateBackground(zoom_factor, text_center,
                              label, bckgnd) {
      const label_rect = label.getBoundingClientRect();
      const width = label_rect.width / zoom_factor - 2;
      const height = parseFloat(bckgnd.getAttribute('height'));

      bckgnd.setAttribute('x', (text_center.x - width / 2 - 1)+'');
      bckgnd.setAttribute('y', (text_center.y - (height - 1))+'');
      bckgnd.setAttribute('width', (width + 2)+'');
    }
  }
})();
