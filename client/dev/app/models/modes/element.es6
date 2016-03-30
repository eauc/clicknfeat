(function() {
  angular.module('clickApp.services')
    .factory('elementMode', elementModeModelFactory);

  elementModeModelFactory.$inject = [
    'defaultMode',
  ];
  function elementModeModelFactory(defaultModeModel) {
    return function buildElementModeModel(type,
                                          elementModel,
                                          gameElementsModel,
                                          gameElementSelectionModel) {
      const element_actions = Object.create(defaultModeModel.actions);
      element_actions.modeBackToDefault = clearElementSelection;
      element_actions.clickMap = clearElementSelection;
      element_actions.rightClickMap = clearElementSelection;
      element_actions.copySelection = copySelection;
      element_actions.delete = doDelete;
      element_actions.toggleLock = toggleLock;

      const moves = [
        ['moveFront', 'up'],
        ['moveBack', 'down'],
        ['rotateLeft', 'left'],
        ['rotateRight', 'right'],
      ];
      R.forEach(buildMove, moves);
      const shifts = [
        ['shiftUp', 'ctrl+up', 'shiftDown'],
        ['shiftDown', 'ctrl+down', 'shiftUp'],
        ['shiftLeft', 'ctrl+left', 'shiftRight'],
        ['shiftRight', 'ctrl+right', 'shiftLeft'],
      ];
      R.forEach(buildShift, shifts);
      buildDrag();

      const element_default_bindings = {
        'clickMap': 'clickMap',
        'rightClickMap': 'rightClickMap',
        'copySelection': 'ctrl+c',
        'delete': 'del',
        'toggleLock': 'l'
      };
      R.forEach(buildMoveBindings, moves);
      R.forEach(buildShiftBindings, shifts);
      const element_bindings = R.extend(Object.create(defaultModeModel.bindings),
                                        element_default_bindings);
      const element_buttons = [
        [ 'Delete', 'delete' ],
        [ 'Lock/Unlock', 'toggleLock' ],
      ];
      const element_mode = {
        onEnter: () => { },
        onLeave: () => { },
        name: s.capitalize(type),
        actions: element_actions,
        buttons: element_buttons,
        bindings: element_bindings
      };

      return element_mode;

      function clearElementSelection(state) {
        state.queueChangeEventP('Game.selectionDetail.close');
        state.queueChangeEventP('Game.editDamage.close');
        state.queueChangeEventP('Game.editLabel.close');
        return state.eventP('Game.update', R.lensProp(`${type}_selection`),
                            gameElementSelectionModel.clear$('local', state));
      }
      function copySelection(state) {
        const stamps = gameElementSelectionModel
                .get('local', state.game[`${type}_selection`]);
        return R.threadP(state.game)(
          R.prop(`${type}s`),
          gameElementsModel.copyStampsP$(stamps),
          (copy) => {
            state.create = copy;
            return state.eventP('Modes.switchTo', `Create${s.capitalize(type)}`);
          }
        );
      }
      function doDelete(state) {
        const stamps = gameElementSelectionModel
                .get('local', state.game[`${type}_selection`]);
        return state.eventP('Game.command.execute',
                            `delete${s.capitalize(type)}`, [stamps]);
      }
      function toggleLock(state) {
        const stamps = gameElementSelectionModel
                .get('local', state.game[`${type}_selection`]);
        return R.threadP(state.game)(
          R.prop(`${type}s`),
          gameElementsModel.findStampP$(stamps[0]),
          (element) => {
            const is_locked = elementModel.isLocked(element);
            return state.eventP('Game.command.execute',
                                `lock${s.capitalize(type)}s`, [!is_locked, stamps]);
          }
        );
      }
      function buildMove([move]) {
        element_actions[move] = (state) => {
          const stamps = gameElementSelectionModel
                  .get('local', state.game[`${type}_selection`]);
          return state.eventP('Game.command.execute',
                              `on${s.capitalize(type)}s`,
                              [ `${move}P`, [false], stamps ]);
        };
        element_actions[move+'Small'] = (state) => {
          const stamps = gameElementSelectionModel
                  .get('local', state.game[`${type}_selection`]);
          return state.eventP('Game.command.execute',
                              `on${s.capitalize(type)}s`,
                              [ `${move}P`, [true], stamps ]);
        };
      }
      function buildShift([shift, _key_, flip_shift]) {
        element_actions[shift] = (state) => {
          const stamps = gameElementSelectionModel
                  .get('local', state.game[`${type}_selection`]);
          const element_shift = ( R.path(['ui_state', 'flip_map'], state)
                                  ? flip_shift
                                  : shift
                                );
          return state.eventP('Game.command.execute',
                              `on${s.capitalize(type)}s`,
                              [ `${element_shift}P`, [false], stamps ]);
        };
        element_actions[shift+'Small'] = (state) => {
          const stamps = gameElementSelectionModel
                  .get('local', state.game[`${type}_selection`]);
          const element_shift = ( R.path(['ui_state', 'flip_map'], state)
                                  ? flip_shift
                                  : shift
                                );
          return state.eventP('Game.command.execute',
                              `on${s.capitalize(type)}s`,
                              [ `${element_shift}P`, [true], stamps ]);
        };
      }

      function buildDrag() {
        element_actions[`dragStart${s.capitalize(type)}`] = dragStartElement;
        defaultModeModel
          .actions[`dragStart${s.capitalize(type)}`] = dragStartElement;
        element_actions[`drag${s.capitalize(type)}`] = dragElement;
        element_actions[`dragEnd${s.capitalize(type)}`] = dragEndElement;

        let drag_element_start_state;
        function dragStartElement(state, event) {
          return R.threadP(event.target)(
            R.rejectIfP(elementModel.isLocked, `${s.capitalize(type)} is locked`),
            () => {
              drag_element_start_state = R.clone(event.target.state);
              return dragElement(state, event);
            },
            () => {
              return state
                .eventP('Game.update',
                        R.lensProp(`${type}_selection`),
                        gameElementSelectionModel
                        .set$('local', [event.target.state.stamp], state));
            }
          );
        }
        function dragElement(state, event) {
          return R.threadP(event.target)(
            R.rejectIfP(elementModel.isLocked, `${s.capitalize(type)} is locked`),
            () => {
              updateStateWithDelta(event, event.target.state);
              state.queueChangeEventP(`Game.${type}.change.${event.target.state.stamp}`);
            }
          );
        }
        function dragEndElement(state, event) {
          return R.threadP(event.target)(
            R.rejectIfP(elementModel.isLocked, `${s.capitalize(type)} is locked`),
            () => {
              event.target.state = R.clone(drag_element_start_state);
              const end_state = R.clone(drag_element_start_state);
              updateStateWithDelta(event, end_state);
              return state.eventP('Game.command.execute',
                                  `on${s.capitalize(type)}s`,
                                  [ 'setPositionP',
                                    [end_state],
                                    [event.target.state.stamp]
                                  ]);
            }
          );
        }
        function updateStateWithDelta(event, state) {
          const dx = event.now.x - event.start.x;
          const dy = event.now.y - event.start.y;
          state.x = drag_element_start_state.x + dx;
          state.y = drag_element_start_state.y + dy;
        }
      }

      function buildMoveBindings([move, keys]) {
        element_default_bindings[move] = keys;
        element_default_bindings[move+'Small'] = 'shift+'+keys;
      }
      function buildShiftBindings([shift, keys]) {
        element_default_bindings[shift] = keys;
        element_default_bindings[shift+'Small'] = 'shift+'+keys;
      }
    };
  }
})();
