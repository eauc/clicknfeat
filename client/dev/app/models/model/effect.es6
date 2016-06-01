(function() {
  angular.module('clickApp.services')
    .factory('modelEffect', modelEffectServiceFactory);

  modelEffectServiceFactory.$inject = [];
  function modelEffectServiceFactory() {
    const EFFECTS = [
      [ 'b' , '/data/icons/Blind.png'      ],
      [ 'c' , '/data/icons/Corrosion.png'  ],
      [ 'd' , '/data/icons/BoltBlue.png'   ],
      [ 'f' , '/data/icons/Fire.png'       ],
      [ 'e' , '/data/icons/BoltYellow.png' ],
      [ 'k' , '/data/icons/KD.png'         ],
      [ 't' , '/data/icons/Stationary.png' ],
    ];
    const EFFECT_LENS = R.lensPath(['state','eff']);
    return (modelService) => {
      const modelEffectModel = {
        isEffectDisplayed: modelIsEffectDisplayed,
        setEffectDisplay: modelSetEffectDisplay,
        toggleEffectDisplay: modelToggleEffectDisplay,
        renderEffect: modelRenderEffect
      };
      return modelEffectModel;

      function modelIsEffectDisplayed(effect, model) {
        return !!R.find(R.equals(effect), R.viewOr([], EFFECT_LENS, model));
      }
      function modelSetEffectDisplay(effect, set, model) {
        const update = ( set
                         ? R.compose(R.uniq, R.append(effect), R.defaultTo([]))
                         : R.compose(R.reject(R.equals(effect)), R.defaultTo([]))
                       );
        return R.over(EFFECT_LENS, update, model);
      }
      function modelToggleEffectDisplay(effect, model) {
        const update = ( modelService.isEffectDisplayed(effect, model)
                         ? R.compose(R.reject(R.equals(effect)), R.defaultTo([]))
                         : R.compose(R.append(effect), R.defaultTo([]))
                       );
        return R.over(EFFECT_LENS, update, model);
      }
      function modelRenderEffect({ img }, model) {
        const effects = R.thread(EFFECTS)(
          R.filter(([key]) => modelEffectModel.isEffectDisplayed(key, model)),
          (actives) => {
            const base_x = img.width / 2 - (R.length(actives) * 10 / 2);
            const base_y = img.height / 2 + model.info.base_radius + 1;
            return R.addIndex(R.reduce)((mem, [key, link], i) => {
              return R.assoc(key, {
                show: modelEffectModel.isEffectDisplayed(key, model),
                x: base_x + i * 10, y: base_y, link
              }, mem);
            }, {}, actives);
          }
        );
        return { effects };
      }
    };
  }
})();
