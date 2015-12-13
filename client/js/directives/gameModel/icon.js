'use strict';

angular.module('clickApp.directives').factory('clickGameModelIcon', ['model', function (modelService) {
  var EFFECTS = [['b', '/data/icons/Blind.png'], ['c', '/data/icons/Corrosion.png'], ['d', '/data/icons/BoltBlue.png'], ['f', '/data/icons/Fire.png'], ['r', '/data/icons/BoltYellow.png'], ['k', '/data/icons/KD.png'], ['s', '/data/icons/Stationary.png']];

  return {
    create: function clickGameModelInconsCreate(svgNS, parent) {
      var effects = R.reduce(function (mem, effect) {
        var image = document.createElementNS(svgNS, 'image');
        image.classList.add('model-image');
        image.setAttribute('x', '0');
        image.setAttribute('y', '0');
        image.setAttribute('width', '10');
        image.setAttribute('height', '10');
        image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', effect[1]);
        image.style.visibility = 'hidden';
        parent.appendChild(image);
        return R.assoc(effect[0], image, mem);
      }, {}, EFFECTS);

      var leader = document.createElementNS(svgNS, 'image');
      leader.classList.add('model-image');
      leader.setAttribute('x', '0');
      leader.setAttribute('y', '0');
      leader.setAttribute('width', '10');
      leader.setAttribute('height', '10');
      leader.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '/data/icons/Leader.png');
      parent.appendChild(leader);

      var lock = document.createElementNS(svgNS, 'image');
      lock.classList.add('model-image');
      lock.setAttribute('x', '0');
      lock.setAttribute('y', '0');
      lock.setAttribute('width', '10');
      lock.setAttribute('height', '10');
      lock.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'data/icons/Lock.png');
      lock.style.visibility = 'visible';
      parent.appendChild(lock);

      return [effects, leader, lock];
    },
    update: function clickGameModelIconsUpdate(info, model, img, el) {
      var effects = el[0];
      R.pipe(R.keys, R.filter(function (effect) {
        return modelService.isEffectDisplayed(effect, model);
      }), function (actives) {
        var base_x = img.width / 2 - R.length(actives) * 10 / 2;
        var base_y = img.height / 2 + info.base_radius + 1;
        R.addIndex(R.forEach)(function (effect, i) {
          effects[effect].setAttribute('x', base_x + i * 10 + '');
          effects[effect].setAttribute('y', base_y + '');
          effects[effect].style.visibility = 'visible';
        }, actives);
      })(effects);
      R.pipe(R.keys, R.reject(function (effect) {
        return modelService.isEffectDisplayed(effect, model);
      }), R.forEach(function (effect) {
        effects[effect].style.visibility = 'hidden';
      }))(effects);

      var leader = el[1];
      leader.setAttribute('x', img.width / 2 - 0.7 * info.base_radius - 5 + '');
      leader.setAttribute('y', img.height / 2 - 0.7 * info.base_radius - 5 + '');
      if (modelService.isLeaderDisplayed(model)) {
        leader.style.visibility = 'visible';
      } else {
        leader.style.visibility = 'hidden';
      }

      var lock = el[2];
      if (!modelService.isLocked(model)) {
        lock.style.visibility = 'hidden';
        return;
      }
      lock.setAttribute('x', img.width / 2 + info.base_radius - 5 + '');
      lock.setAttribute('y', img.height / 2 - 5 + '');
      lock.style.visibility = 'visible';
    }
  };
}]);
//# sourceMappingURL=icon.js.map
