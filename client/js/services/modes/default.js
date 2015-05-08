self.defaultModeServiceFactory = function defaultModeServiceFactory(modesService,
                                                                    commonModeService) {
  var default_actions = Object.create(commonModeService.actions);
  var default_bindings = Object.create(commonModeService.bindings);
  var default_buttons = [
    [ 'Flip Map', 'flipMap' ],
    // [ 'Zoom', 'toggle', 'zoom' ],
    // [ 'Zoom In', 'zoomIn', 'zoom' ],
    // [ 'Zoom Out', 'zoomOut', 'zoom' ],
    // [ 'Zoom Reset', 'zoomReset', 'zoom' ],
  ];
  var default_mode = {
    name: 'Default',
    actions: default_actions,
    buttons: default_buttons,
    bindings: default_bindings,
  };
  modesService.registerMode(default_mode);
  return default_mode;
};
