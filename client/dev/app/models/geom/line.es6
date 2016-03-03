(function() {
  angular.module('clickApp.services')
    .factory('line', lineModelFactory);

  lineModelFactory.$inject = [
    'point'
  ];
  function lineModelFactory(pointModel) {
    const lineModel = {
      length: lineLength,
      vector: lineVector
    };
    R.curryService(lineModel);
    return lineModel;

    function lineLength(line) {
      return pointModel.distanceTo(line.end, line.start);
    }
    function lineVector(line) {
      const length = lineModel.length(line);
      return {
        x: (line.end.x - line.start.x) / length,
        y: (line.end.y - line.start.y) / length
      };
    }
  }
})();
