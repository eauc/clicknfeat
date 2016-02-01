angular.module('clickApp.services')
  .factory('templateMode', [
    'modes',
    'settings',
    'defaultMode',
    'template',
    'game',
    'gameTemplates',
    'gameTemplateSelection',
    function templateModeServiceFactory(modesService,
                                        settingsService,
                                        defaultModeService,
                                        templateService,
                                        gameService,
                                        gameTemplatesService,
                                        gameTemplateSelectionService) {
      let template_actions = Object.create(defaultModeService.actions);
      function clearTemplateSelection(state) {
        return state.event('Game.update', R.lensProp('template_selection'),
                           gameTemplateSelectionService.clear$('local', state));
      }
      template_actions.modeBackToDefault = clearTemplateSelection;
      template_actions.clickMap = clearTemplateSelection;
      template_actions.rightClickMap = clearTemplateSelection;
      template_actions.delete = (state) => {
        let stamps = gameTemplateSelectionService
              .get('local', state.game.template_selection);
        return state.event('Game.command.execute',
                           'deleteTemplates', [stamps]);
      };
      template_actions.toggleLock = (state) => {
        let stamps = gameTemplateSelectionService
              .get('local', state.game.template_selection);
        return R.pipeP(
          () => {
            return gameTemplatesService
              .findStamp(stamps[0], state.game.templates);
          },
          (template) => {
            let is_locked = templateService.isLocked(template);
        
            return state.event('Game.command.execute',
                               'lockTemplates', [!is_locked, stamps]);
          }
        )();
      };
      let moves = [
        ['moveFront', 'up'],
        ['moveBack', 'down'],
        ['rotateLeft', 'left'],
        ['rotateRight', 'right'],
      ];
      R.forEach(([move]) => {
        template_actions[move] = (state) => {
          let stamps = gameTemplateSelectionService
                .get('local', state.game.template_selection);
          return state.event('Game.command.execute',
                             'onTemplates', [ move, [false], stamps ]);
        };
        template_actions[move+'Small'] = (state) => {
          let stamps = gameTemplateSelectionService
                .get('local', state.game.template_selection);
          return state.event('Game.command.execute',
                             'onTemplates', [ move, [true], stamps ]);
        };
      }, moves);
      let shifts = [
        ['shiftUp', 'ctrl+up', 'shiftDown'],
        ['shiftDown', 'ctrl+down', 'shiftUp'],
        ['shiftLeft', 'ctrl+left', 'shiftRight'],
        ['shiftRight', 'ctrl+right', 'shiftLeft'],
      ];
      R.forEach(([shift, key, flip_shift]) => {
        key = key;
        template_actions[shift] = (state) => {
          let stamps = gameTemplateSelectionService
                .get('local', state.game.template_selection);
          let template_shift = ( R.path(['ui_state', 'flip_map'], state) ?
                                 flip_shift :
                                 shift
                               );
          return state.event('Game.command.execute',
                             'onTemplates', [ template_shift, [false], stamps ]);
        };
        template_actions[shift+'Small'] = (state) => {
          let stamps = gameTemplateSelectionService
                .get('local', state.game.template_selection);
          let template_shift = ( R.path(['ui_state', 'flip_map'], state) ?
                                 flip_shift :
                                 shift
                               );
          return state.event('Game.command.execute',
                             'onTemplates', [ template_shift, [true], stamps ]);
        };
      }, shifts);

      (() => {
        let drag_template_start_state;
        function updateStateWithDelta(event, state) {
          let dx = event.now.x - event.start.x;
          let dy = event.now.y - event.start.y;
          state.x = drag_template_start_state.x + dx;
          state.y = drag_template_start_state.y + dy;
        }
        template_actions.dragStartTemplate = (state, event) => {
          if(templateService.isLocked(event.target)) {
            return self.Promise.reject('Template is locked');
          }
          
          drag_template_start_state = R.clone(event.target.state);
          template_actions.dragTemplate(state, event);
          return state
            .event('Game.update', R.lensProp('template_selection'),
                   gameTemplateSelectionService.set$('local', [event.target.state.stamp], state));
        };
        defaultModeService.actions.dragStartTemplate = template_actions.dragStartTemplate;
        template_actions.dragTemplate = (state, event) => {
          if(templateService.isLocked(event.target)) {
            return self.Promise.reject('Template is locked');
          }
          
          updateStateWithDelta(event, event.target.state);
          state.changeEvent(`Game.template.change.${event.target.state.stamp}`);
          return null;
        };
        template_actions.dragEndTemplate = (state, event) => {
          if(templateService.isLocked(event.target)) {
            return self.Promise.reject('Template is locked');
          }

          event.target.state.x = drag_template_start_state.x;
          event.target.state.y = drag_template_start_state.y;

          let end_state = R.clone(drag_template_start_state);
          updateStateWithDelta(event, end_state);

          return state.event('Game.command.execute',
                             'onTemplates', [ 'setPosition',
                                              [end_state],
                                              [event.target.state.stamp]
                                            ]);
        };
      })();

      let template_default_bindings = {
        'clickMap': 'clickMap',
        'rightClickMap': 'rightClickMap',
        'delete': 'del',
        'toggleLock': 'l'
      };
      R.forEach(([move, key]) => {
        template_default_bindings[move] = key;
        template_default_bindings[move+'Small'] = 'shift+'+key;
      }, moves);
      R.forEach(([shift, key]) => {
        template_default_bindings[shift] = key;
        template_default_bindings[shift+'Small'] = 'shift+'+key;
      }, shifts);
      let template_bindings = R.extend(Object.create(defaultModeService.bindings),
                                       template_default_bindings);
      let template_buttons = [
        [ 'Delete', 'delete' ],
        [ 'Lock/Unlock', 'toggleLock' ],
      ];
      let template_mode = {
        onEnter: () => { },
        onLeave: () => { },
        name: 'Template',
        actions: template_actions,
        buttons: template_buttons,
        bindings: template_bindings
      };
      // modesService.registerMode(template_mode);
      settingsService.register('Bindings',
                               template_mode.name,
                               template_default_bindings,
                               (bs) => {
                                 R.extend(template_mode.bindings, bs);
                               });
      return template_mode;
    }
  ]);
