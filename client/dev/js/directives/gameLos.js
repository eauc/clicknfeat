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
        updateEnvelope(scope.game.los, display, remote_element.envelope);
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
    var _R$pathOr = R.pathOr({}, ['computed', 'envelope'], los);

    var _R$pathOr$left = _R$pathOr.left;
    _R$pathOr$left = _R$pathOr$left === undefined ? {} : _R$pathOr$left;
    var _R$pathOr$left$start = _R$pathOr$left.start;
    _R$pathOr$left$start = _R$pathOr$left$start === undefined ? {} : _R$pathOr$left$start;
    var _R$pathOr$left$start$ = _R$pathOr$left$start.x;
    var x1 = _R$pathOr$left$start$ === undefined ? 0 : _R$pathOr$left$start$;
    var _R$pathOr$left$start$2 = _R$pathOr$left$start.y;
    var y1 = _R$pathOr$left$start$2 === undefined ? 0 : _R$pathOr$left$start$2;
    var _R$pathOr$left$end = _R$pathOr$left.end;
    _R$pathOr$left$end = _R$pathOr$left$end === undefined ? {} : _R$pathOr$left$end;
    var _R$pathOr$left$end$x = _R$pathOr$left$end.x;
    var x2 = _R$pathOr$left$end$x === undefined ? 0 : _R$pathOr$left$end$x;
    var _R$pathOr$left$end$y = _R$pathOr$left$end.y;
    var y2 = _R$pathOr$left$end$y === undefined ? 0 : _R$pathOr$left$end$y;
    var _R$pathOr$right = _R$pathOr.right;
    _R$pathOr$right = _R$pathOr$right === undefined ? {} : _R$pathOr$right;
    var _R$pathOr$right$start = _R$pathOr$right.start;
    _R$pathOr$right$start = _R$pathOr$right$start === undefined ? {} : _R$pathOr$right$start;
    var _R$pathOr$right$start2 = _R$pathOr$right$start.x;
    var x4 = _R$pathOr$right$start2 === undefined ? 0 : _R$pathOr$right$start2;
    var _R$pathOr$right$start3 = _R$pathOr$right$start.y;
    var y4 = _R$pathOr$right$start3 === undefined ? 0 : _R$pathOr$right$start3;
    var _R$pathOr$right$end = _R$pathOr$right.end;
    _R$pathOr$right$end = _R$pathOr$right$end === undefined ? {} : _R$pathOr$right$end;
    var _R$pathOr$right$end$x = _R$pathOr$right$end.x;
    var x3 = _R$pathOr$right$end$x === undefined ? 0 : _R$pathOr$right$end$x;
    var _R$pathOr$right$end$y = _R$pathOr$right$end.y;
    var y3 = _R$pathOr$right$end$y === undefined ? 0 : _R$pathOr$right$end$y;

    var points = [[x1, y1].join(','), [x2, y2].join(','), [x3, y3].join(','), [x4, y4].join(',')].join(' ');
    // console.log('gameLos envelope points', points);
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
        updateEnvelope(los, el[0]);
      }, scope);
    }
  };
  function updateEnvelope(los, envelope) {
    var _R$pathOr2 = R.pathOr({}, ['computed', 'envelope'], los);

    var _R$pathOr2$left = _R$pathOr2.left;
    _R$pathOr2$left = _R$pathOr2$left === undefined ? {} : _R$pathOr2$left;
    var _R$pathOr2$left$start = _R$pathOr2$left.start;
    _R$pathOr2$left$start = _R$pathOr2$left$start === undefined ? {} : _R$pathOr2$left$start;
    var _R$pathOr2$left$start2 = _R$pathOr2$left$start.x;
    var x1 = _R$pathOr2$left$start2 === undefined ? 0 : _R$pathOr2$left$start2;
    var _R$pathOr2$left$start3 = _R$pathOr2$left$start.y;
    var y1 = _R$pathOr2$left$start3 === undefined ? 0 : _R$pathOr2$left$start3;
    var _R$pathOr2$left$end = _R$pathOr2$left.end;
    _R$pathOr2$left$end = _R$pathOr2$left$end === undefined ? {} : _R$pathOr2$left$end;
    var _R$pathOr2$left$end$x = _R$pathOr2$left$end.x;
    var x2 = _R$pathOr2$left$end$x === undefined ? 0 : _R$pathOr2$left$end$x;
    var _R$pathOr2$left$end$y = _R$pathOr2$left$end.y;
    var y2 = _R$pathOr2$left$end$y === undefined ? 0 : _R$pathOr2$left$end$y;
    var _R$pathOr2$right = _R$pathOr2.right;
    _R$pathOr2$right = _R$pathOr2$right === undefined ? {} : _R$pathOr2$right;
    var _R$pathOr2$right$star = _R$pathOr2$right.start;
    _R$pathOr2$right$star = _R$pathOr2$right$star === undefined ? {} : _R$pathOr2$right$star;
    var _R$pathOr2$right$star2 = _R$pathOr2$right$star.x;
    var x4 = _R$pathOr2$right$star2 === undefined ? 0 : _R$pathOr2$right$star2;
    var _R$pathOr2$right$star3 = _R$pathOr2$right$star.y;
    var y4 = _R$pathOr2$right$star3 === undefined ? 0 : _R$pathOr2$right$star3;
    var _R$pathOr2$right$end = _R$pathOr2$right.end;
    _R$pathOr2$right$end = _R$pathOr2$right$end === undefined ? {} : _R$pathOr2$right$end;
    var _R$pathOr2$right$end$ = _R$pathOr2$right$end.x;
    var x3 = _R$pathOr2$right$end$ === undefined ? 0 : _R$pathOr2$right$end$;
    var _R$pathOr2$right$end$2 = _R$pathOr2$right$end.y;
    var y3 = _R$pathOr2$right$end$2 === undefined ? 0 : _R$pathOr2$right$end$2;

    var points = [[x1, y1].join(','), [x2, y2].join(','), [x3, y3].join(','), [x4, y4].join(',')].join(' ');
    // console.log('gameLos clip points', points, los);
    envelope.setAttribute('points', points);
  }
}]).directive('clickGameLosDarkness', ['gameLos', 'modes', function (gameLosService, modesService) {
  return {
    restrict: 'A',
    link: function link(scope, el) {
      // console.log('gameLosDarkness', scope, el);

      updatePolygon(scope, scope.game.los, el[0]);
      scope.onGameEvent('changeRemoteLos', function (event, los) {
        updatePolygon(scope, los, el[0]);
      }, scope);
    }
  };
  function updatePolygon(scope, los, polygon) {
    var _R$propOr = R.propOr({}, 'envelope', scope);

    var _R$propOr$left = _R$propOr.left;
    _R$propOr$left = _R$propOr$left === undefined ? {} : _R$propOr$left;
    var _R$propOr$left$start = _R$propOr$left.start;
    _R$propOr$left$start = _R$propOr$left$start === undefined ? {} : _R$propOr$left$start;
    var _R$propOr$left$start$ = _R$propOr$left$start.x;
    var x1 = _R$propOr$left$start$ === undefined ? 0 : _R$propOr$left$start$;
    var _R$propOr$left$start$2 = _R$propOr$left$start.y;
    var y1 = _R$propOr$left$start$2 === undefined ? 0 : _R$propOr$left$start$2;
    var _R$propOr$left$end = _R$propOr$left.end;
    _R$propOr$left$end = _R$propOr$left$end === undefined ? {} : _R$propOr$left$end;
    var _R$propOr$left$end$x = _R$propOr$left$end.x;
    var x2 = _R$propOr$left$end$x === undefined ? 0 : _R$propOr$left$end$x;
    var _R$propOr$left$end$y = _R$propOr$left$end.y;
    var y2 = _R$propOr$left$end$y === undefined ? 0 : _R$propOr$left$end$y;
    var _R$propOr$right = _R$propOr.right;
    _R$propOr$right = _R$propOr$right === undefined ? {} : _R$propOr$right;
    var _R$propOr$right$start = _R$propOr$right.start;
    _R$propOr$right$start = _R$propOr$right$start === undefined ? {} : _R$propOr$right$start;
    var _R$propOr$right$start2 = _R$propOr$right$start.x;
    var x4 = _R$propOr$right$start2 === undefined ? 0 : _R$propOr$right$start2;
    var _R$propOr$right$start3 = _R$propOr$right$start.y;
    var y4 = _R$propOr$right$start3 === undefined ? 0 : _R$propOr$right$start3;
    var _R$propOr$right$end = _R$propOr$right.end;
    _R$propOr$right$end = _R$propOr$right$end === undefined ? {} : _R$propOr$right$end;
    var _R$propOr$right$end$x = _R$propOr$right$end.x;
    var x3 = _R$propOr$right$end$x === undefined ? 0 : _R$propOr$right$end$x;
    var _R$propOr$right$end$y = _R$propOr$right$end.y;
    var y3 = _R$propOr$right$end$y === undefined ? 0 : _R$propOr$right$end$y;

    var points = [[x1, y1].join(','), [x2, y2].join(','), [x3, y3].join(','), [x4, y4].join(',')].join(' ');
    // console.log('gameLosDarkness envelope points', points);
    polygon.setAttribute('points', points);

    var display = gameLosService.isDisplayed(los) || 'LoS' === modesService.currentModeName(scope.modes);
    polygon.style['visibility'] = display ? 'visible' : 'hidden';
  }
}]).directive('clickGameLosRefresh', [function () {
  return {
    restrict: 'A',
    scope: true,
    link: function link(scope) {
      // console.log('gameLosRefresh', scope);

      scope.digestOnGameEvent('changeRemoteLos', scope);
    }
  };
}]);
//# sourceMappingURL=gameLos.js.map
