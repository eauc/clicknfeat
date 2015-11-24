'use strict';

angular.module('clickApp.services')
  .factory('modelWreck', [
    'gameFactions',
    function modelWreckServiceFactory(gameFactionsService) {
      return function(modelService) {
        var modelWreckService = {
          isWreckDisplayed: function modelIsWreckDisplayed(model) {
            return !!R.find(R.equals('w'), model.state.dsp);
          },
          getWreckImage: function modelGetWreckImage(factions, model) {
            return R.pipeR(
              gameFactionsService.getModelInfo$(model.state.info),
              R.prop('img'),
              function(info_img) {
                var img = R.find(R.propEq('type','wreck'), info_img);

                if(R.isNil(img)) {
                  img = R.pipe(
                    R.find(R.propEq('type','default')),
                    R.defaultTo({}),
                    R.assoc('link', null)
                  )(info_img);
                }
                
                return img;
              },
              function(img) {
                var link = modelService.isImageDisplayed(model) ? img.link : null;
                return R.assoc('link', link, img);
              }
            )(factions);
          },
          setWreckDisplay: function modelSetWreckDisplay(set, model) {
            if(set) {
              model.state.dsp = R.uniq(R.append('w', model.state.dsp));
            }
            else {
              model.state.dsp = R.reject(R.equals('w'), model.state.dsp);
            }
          },
          toggleWreckDisplay: function modelToggleWreckDisplay(model) {
            if(modelService.isWreckDisplayed(model)) {
              model.state.dsp = R.reject(R.equals('w'), model.state.dsp);
            }
            else {
              model.state.dsp = R.append('w', model.state.dsp);
            }
          },
        };
        return modelWreckService;
      };
    }
  ]);
