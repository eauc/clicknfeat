angular.module('clickApp.services')
  .factory('gameTemplates', [
    'template',
    function gameTemplatesServiceFactory(templateService) {
      var gameTemplatesService = {
        create: function() {
          return {
            active: [],
            locked: []
          };
        },
        all: function templatesAll(templates) {
          return R.concat(templates.active, templates.locked);
        },
        findStampIn: function templatesFindStampIn(stamp, where, templates) {
          return new self.Promise((resolve, reject) => {
            var find = R.pipe(
              R.prop(where),
              R.find(R.pathEq(['state','stamp'], stamp))
            )(templates);
            return (R.exists(find) ?
                    resolve(find) :
                    reject(`stamp ${stamp} not found in ${where}`)
                   );
          });
        },
        findStamp: function templatesFindStamp(stamp, templates) {
          return gameTemplatesService
            .findStampIn(stamp, 'active', templates)
            .catch(() => {
              return gameTemplatesService
                .findStampIn(stamp, 'locked', templates);
            });
        },
        findAnyStamps: function templatesFindAnyStamps(stamps, templates) {
          return R.pipePromise(
            R.map((stamp) => {
              return gameTemplatesService
                .findStamp(stamp, templates)
                .catch(R.always(null));
            }),
            R.promiseAll,
            (stamps) => {
              if(R.isEmpty(R.reject(R.isNil, stamps))) {
                return self.Promise.reject('No template found');
              }
              return stamps;
            }
          )(stamps);
        },
        fromStamps: function templatesFromStamps(method, args, stamps, templates) {
          return fromStamps$(R.compose(R.always, R.always(null)),
                             method, args, stamps, templates);
        },
        onStamps: function templatesOnStamps(method, args, stamps, templates) {
          return R.pipeP(
            fromStamps$(R.always, method, args, stamps),
            updateTemplates$(templates)
          )(templates);
        },
        setStateStamps: function templatesSetStateStamps(states, stamps, templates) {
          return R.pipeP(
            gameTemplatesService.findAnyStamps$(stamps),
            R.addIndex(R.map)((template, index) => {
              return ( R.isNil(template) ?
                       null :
                       templateService.setState(states[index], template)
                     );
            }),
            R.reject(R.isNil),
            updateTemplates$(templates)
          )(templates);
        },
        add: function templatesAdd(temps, templates) {
          return R.pipe(
            gameTemplatesService.removeStamps$(R.map(R.path(['state','stamp']), temps)),
            (templates) => {
              return R.assoc('active', R.concat(templates.active, temps), templates);
            }
          )(templates);
        },
        removeStamps: function templatesRemoveStamps(stamps, templates) {
          function inStamps(template) {
            return R.find(R.equals(R.path(['state', 'stamp'], template)), stamps);
          }
          return R.pipe(
            R.assoc('active', R.reject(inStamps, templates.active)),
            R.assoc('locked', R.reject(inStamps, templates.locked))
          )(templates);
        },
        isActive: function templatesIsLocked(stamp, templates) {
          return R.find(R.pathEq(['state','stamp'], stamp), templates.active);
        },
        isLocked: function templatesIsLocked(stamp, templates) {
          return R.find(R.pathEq(['state','stamp'], stamp), templates.locked);
        },
        lockStamps: function templatesLockStamps(lock, stamps, templates) {
          return R.pipePromise(
            gameTemplatesService.findAnyStamps$(stamps),
            R.reject(R.isNil),
            R.map(templateService.setLock$(lock)),
            updateTemplates$(templates)
          )(templates);
        },
        modeForStamp: function templateSelectionModeForStamp(stamp, templates) {
          return R.pipeP(
            gameTemplatesService.findStamp$(stamp),
            R.path(['state','type']),
            R.defaultTo('aoe'),
            (type) => {
              return type+'Template';
            }
          )(templates);
        }
      };
      var fromStamps$ = R.curry((onError, method, args, stamps, templates) => {
        return R.pipeP(
          gameTemplatesService.findAnyStamps$(stamps),
          R.reject(R.isNil),
          R.map((template) => {
            return self.Promise
              .resolve(templateService.call(method, args, template))
              .catch(onError(template));
          }),
          R.promiseAll
        )(templates);
      });
      var updateTemplates$ = R.curry((templates, news) => {
        return R.pipe(
          gameTemplatesService.all,
          R.concat(news),
          R.uniqBy(R.path(['state','stamp'])),
          R.partition(templateService.isLocked),
          ([locked, active]) => {
            return {
              active: active,
              locked: locked
            };
          }
        )(templates);
      });
      R.curryService(gameTemplatesService);
      return gameTemplatesService;
    }
  ]);
