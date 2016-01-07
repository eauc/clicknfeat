angular.module('clickApp.directives')
  .factory('clickGameModelAura', [
    'model',
    function(modelService) {
      return {
        create: function clickGameModelAuraCreate(svgNS, parent) {
          let aura = document.createElementNS(svgNS, 'circle');
          aura.classList.add('color-aura');
          aura.style.filter = 'url(#aura-filter)';
          aura.style.visibility = 'hidden';
          parent.appendChild(aura);

          let state_aura = document.createElementNS(svgNS, 'circle');
          state_aura.classList.add('state-aura');
          state_aura.style.filter = 'url(#state-aura-filter)';
          parent.appendChild(state_aura);

          return [ aura, state_aura ];
        },
        update: function clickGameModeAuraUpdate(info, model, img, element) {
          let [aura,state_aura] = element;

          state_aura.setAttribute('cx', (img.width/2)+'');
          state_aura.setAttribute('cy', (img.height/2)+'');
          state_aura.setAttribute('r', (info.base_radius*1.2)+'');

          aura.setAttribute('cx', (img.width/2)+'');
          aura.setAttribute('cy', (img.height/2)+'');
          aura.setAttribute('r', (info.base_radius*1.2)+'');
          if(modelService.isAuraDisplayed(model)) {
            aura.style.fill = model.state.aur;
            aura.style.visibility = 'visible';
          }
          else {
            aura.style.visibility = 'hidden';
          }
        }
      };
    }
  ]);
