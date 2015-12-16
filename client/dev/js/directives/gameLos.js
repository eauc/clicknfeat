'use strict';

angular.module('clickApp.directives').directive('clickGameLos', ['modes', 'gameLos', 'gameModels', 'gameFactions', function (modesService, gameLosService, gameModelsService, gameFactionsService) {
  return {
    restrict: 'A',
    link: function link(scope, el /*, attrs*/) {
      var map = document.getElementById('map');
      var under_models_container = document.getElementById('game-under-models');
      var svgNS = map.namespaceURI;

      var local_element = createLosElement(svgNS, under_models_container, el[0]);
      var remote_element = createLosElement(svgNS, under_models_container, el[0]);

      scope.onGameEvent('changeLocalLos', function () {
        updateLine(scope.game.los.local, local_element.line);
      }, scope);
      scope.onGameEvent('changeRemoteLos', function (event, los) {
        if (R.isNil(los)) return;

        updateLine(scope.game.los.remote, remote_element.line);

        var display = gameLosService.isDisplayed(los) || 'LoS' === modesService.currentModeName(scope.modes);
        updateEnvelope(scope.game.los.remote, display, remote_element.envelope);
        updateOriginTarget(scope.factions, scope.game.models, gameLosService.origin(los), display, remote_element.origin);
        updateOriginTarget(scope.factions, scope.game.models, gameLosService.target(los), display, remote_element.target);
      }, scope);
    }
  };
  function createLosElement(svgNS, under_models_container, parent) {
    var group = document.createElementNS(svgNS, 'g');
    parent.appendChild(group);

    var line = document.createElementNS(svgNS, 'line');
    line.style['marker-start'] = 'url(#los-start)';
    line.style['marker-end'] = 'url(#los-end)';
    group.appendChild(line);

    var origin = document.createElementNS(svgNS, 'circle');
    origin.classList.add('los-origin');
    origin.setAttribute('cx', '0');
    origin.setAttribute('cy', '0');
    origin.setAttribute('r', '0');
    origin.style.visibility = 'hidden';
    parent.appendChild(origin);

    var target = document.createElementNS(svgNS, 'circle');
    target.classList.add('los-target');
    target.setAttribute('cx', '0');
    target.setAttribute('cy', '0');
    target.setAttribute('r', '0');
    target.style.visibility = 'hidden';
    parent.appendChild(target);

    var envelope = document.createElementNS(svgNS, 'polygon');
    envelope.classList.add('los-envelope');
    envelope.setAttribute('points', '0,0 0,0 0,0');
    envelope.style.visibility = 'hidden';
    under_models_container.insertBefore(envelope, under_models_container.firstChild);

    return { container: group,
      line: line,
      origin: origin,
      target: target,
      envelope: envelope
    };
  }
  function updateLine(los, line) {
    line.style['visibility'] = los.display ? 'visible' : 'hidden';
    line.setAttribute('x1', los.start.x + '');
    line.setAttribute('y1', los.start.y + '');
    line.setAttribute('x2', los.end.x + '');
    line.setAttribute('y2', los.end.y + '');
  }
  function updateEnvelope(los, display, envelope) {
    var _ref = los.envelope || {};

    var _ref$left = _ref.left;
    _ref$left = _ref$left === undefined ? {} : _ref$left;
    var _ref$left$start = _ref$left.start;
    _ref$left$start = _ref$left$start === undefined ? {} : _ref$left$start;
    var _ref$left$start$x = _ref$left$start.x;
    var x1 = _ref$left$start$x === undefined ? 0 : _ref$left$start$x;
    var _ref$left$start$y = _ref$left$start.y;
    var y1 = _ref$left$start$y === undefined ? 0 : _ref$left$start$y;
    var _ref$left$end = _ref$left.end;
    _ref$left$end = _ref$left$end === undefined ? {} : _ref$left$end;
    var _ref$left$end$x = _ref$left$end.x;
    var x2 = _ref$left$end$x === undefined ? 0 : _ref$left$end$x;
    var _ref$left$end$y = _ref$left$end.y;
    var y2 = _ref$left$end$y === undefined ? 0 : _ref$left$end$y;
    var _ref$right = _ref.right;
    _ref$right = _ref$right === undefined ? {} : _ref$right;
    var _ref$right$start = _ref$right.start;
    _ref$right$start = _ref$right$start === undefined ? {} : _ref$right$start;
    var _ref$right$start$x = _ref$right$start.x;
    var x4 = _ref$right$start$x === undefined ? 0 : _ref$right$start$x;
    var _ref$right$start$y = _ref$right$start.y;
    var y4 = _ref$right$start$y === undefined ? 0 : _ref$right$start$y;
    var _ref$right$end = _ref$right.end;
    _ref$right$end = _ref$right$end === undefined ? {} : _ref$right$end;
    var _ref$right$end$x = _ref$right$end.x;
    var x3 = _ref$right$end$x === undefined ? 0 : _ref$right$end$x;
    var _ref$right$end$y = _ref$right$end.y;
    var y3 = _ref$right$end$y === undefined ? 0 : _ref$right$end$y;

    var points = [[x1, y1].join(','), [x2, y2].join(','), [x3, y3].join(','), [x4, y4].join(',')].join(' ');
    console.log('gameLos envelope points', points);
    envelope.setAttribute('points', points);
    envelope.style['visibility'] = display ? 'visible' : 'hidden';
  }
  function updateOriginTarget(factions, models, stamp, display, element) {
    R.pipeP(function (stamp) {
      if (R.exists(stamp)) {
        return gameModelsService.findStamp(stamp, models);
      }
      return self.Promise.resolve(null);
    }, function (model) {
      if (!display || R.isNil(model)) {
        element.style.visibility = 'hidden';
        return;
      }
      R.pipeP(gameFactionsService.getModelInfo$(model.state.info), function (info) {
        element.setAttribute('cx', model.state.x + '');
        element.setAttribute('cy', model.state.y + '');
        element.setAttribute('r', info.base_radius + '');
        element.style.visibility = 'visible';
      })(factions);
    })(stamp);
  }
}]).directive('clickGameLosClip', [function () {
  return {
    restrict: 'A',
    link: function link(scope, el /*, attrs*/) {
      scope.onGameLoad.then(function () {
        updateEnvelope(scope.game.los, el[0]);
      });

      scope.onGameEvent('changeRemoteLos', function (event, los) {
        updateEnvelope(los.remote, el[0]);
      }, scope);
    }
  };
  function updateEnvelope(los, envelope) {
    var _ref2 = los.envelope || {};

    var _ref2$left = _ref2.left;
    _ref2$left = _ref2$left === undefined ? {} : _ref2$left;
    var _ref2$left$start = _ref2$left.start;
    _ref2$left$start = _ref2$left$start === undefined ? {} : _ref2$left$start;
    var _ref2$left$start$x = _ref2$left$start.x;
    var x1 = _ref2$left$start$x === undefined ? 0 : _ref2$left$start$x;
    var _ref2$left$start$y = _ref2$left$start.y;
    var y1 = _ref2$left$start$y === undefined ? 0 : _ref2$left$start$y;
    var _ref2$left$end = _ref2$left.end;
    _ref2$left$end = _ref2$left$end === undefined ? {} : _ref2$left$end;
    var _ref2$left$end$x = _ref2$left$end.x;
    var x2 = _ref2$left$end$x === undefined ? 0 : _ref2$left$end$x;
    var _ref2$left$end$y = _ref2$left$end.y;
    var y2 = _ref2$left$end$y === undefined ? 0 : _ref2$left$end$y;
    var _ref2$right = _ref2.right;
    _ref2$right = _ref2$right === undefined ? {} : _ref2$right;
    var _ref2$right$start = _ref2$right.start;
    _ref2$right$start = _ref2$right$start === undefined ? {} : _ref2$right$start;
    var _ref2$right$start$x = _ref2$right$start.x;
    var x4 = _ref2$right$start$x === undefined ? 0 : _ref2$right$start$x;
    var _ref2$right$start$y = _ref2$right$start.y;
    var y4 = _ref2$right$start$y === undefined ? 0 : _ref2$right$start$y;
    var _ref2$right$end = _ref2$right.end;
    _ref2$right$end = _ref2$right$end === undefined ? {} : _ref2$right$end;
    var _ref2$right$end$x = _ref2$right$end.x;
    var x3 = _ref2$right$end$x === undefined ? 0 : _ref2$right$end$x;
    var _ref2$right$end$y = _ref2$right$end.y;
    var y3 = _ref2$right$end$y === undefined ? 0 : _ref2$right$end$y;

    var points = [[x1, y1].join(','), [x2, y2].join(','), [x3, y3].join(','), [x4, y4].join(',')].join(' ');
    console.log('gameLos clip points', points, los);
    envelope.setAttribute('points', points);
  }
}]).directive('clickGameLosDarkness', ['gameLos', 'modes', function (gameLosService, modesService) {
  return {
    restrict: 'A',
    link: function link(scope, el) {
      console.log('gameLosDarkness', scope, el);

      updatePolygon(scope, scope.game.los, el[0]);
      scope.onGameEvent('changeRemoteLos', function (event, los) {
        updatePolygon(scope, los, el[0]);
      }, scope);
    }
  };
  function updatePolygon(scope, los, polygon) {
    var _ref3 = scope.envelope || {};

    var _ref3$left = _ref3.left;
    _ref3$left = _ref3$left === undefined ? {} : _ref3$left;
    var _ref3$left$start = _ref3$left.start;
    _ref3$left$start = _ref3$left$start === undefined ? {} : _ref3$left$start;
    var _ref3$left$start$x = _ref3$left$start.x;
    var x1 = _ref3$left$start$x === undefined ? 0 : _ref3$left$start$x;
    var _ref3$left$start$y = _ref3$left$start.y;
    var y1 = _ref3$left$start$y === undefined ? 0 : _ref3$left$start$y;
    var _ref3$left$end = _ref3$left.end;
    _ref3$left$end = _ref3$left$end === undefined ? {} : _ref3$left$end;
    var _ref3$left$end$x = _ref3$left$end.x;
    var x2 = _ref3$left$end$x === undefined ? 0 : _ref3$left$end$x;
    var _ref3$left$end$y = _ref3$left$end.y;
    var y2 = _ref3$left$end$y === undefined ? 0 : _ref3$left$end$y;
    var _ref3$right = _ref3.right;
    _ref3$right = _ref3$right === undefined ? {} : _ref3$right;
    var _ref3$right$start = _ref3$right.start;
    _ref3$right$start = _ref3$right$start === undefined ? {} : _ref3$right$start;
    var _ref3$right$start$x = _ref3$right$start.x;
    var x4 = _ref3$right$start$x === undefined ? 0 : _ref3$right$start$x;
    var _ref3$right$start$y = _ref3$right$start.y;
    var y4 = _ref3$right$start$y === undefined ? 0 : _ref3$right$start$y;
    var _ref3$right$end = _ref3$right.end;
    _ref3$right$end = _ref3$right$end === undefined ? {} : _ref3$right$end;
    var _ref3$right$end$x = _ref3$right$end.x;
    var x3 = _ref3$right$end$x === undefined ? 0 : _ref3$right$end$x;
    var _ref3$right$end$y = _ref3$right$end.y;
    var y3 = _ref3$right$end$y === undefined ? 0 : _ref3$right$end$y;

    var points = [[x1, y1].join(','), [x2, y2].join(','), [x3, y3].join(','), [x4, y4].join(',')].join(' ');
    console.log('gameLosDarkness envelope points', points);
    polygon.setAttribute('points', points);

    var display = gameLosService.isDisplayed(los) || 'LoS' === modesService.currentModeName(scope.modes);
    polygon.style['visibility'] = display ? 'visible' : 'hidden';
  }
}]).directive('clickGameLosRefresh', [function () {
  return {
    restrict: 'A',
    scope: true,
    link: function link(scope) {
      console.log('gameLosRefresh', scope);

      scope.digestOnGameEvent('changeRemoteLos', scope);
    }
  };
}]);
//# sourceMappingURL=gameLos.js.map
