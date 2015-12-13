'use strict';

angular.module('clickApp.directives')
  .factory('prompt', [
    function() {
      var state;
      var state_resolves = [];
      function getState() {
        if(R.exists(state)) return state;
        return new self.Promise(function(resolve/*, reject*/) {
          state_resolves.push(resolve);
        });
      }
      var prompt_resolve;
      return {
        register: function(st) {
          state = st;
          state.doValidate = function promptDoValidate() {
            var value = state.close();
            prompt_resolve.resolve(value);
            prompt_resolve = null;
          };
          state.doCancel = function promptDoCancel() {
            state.close();
            prompt_resolve.reject('canceled');
            prompt_resolve = null;
          };

          R.forEach(function(resolve) {
            resolve(state);
          }, state_resolves);
          state_resolves = [];

          return state;
        },
        prompt: function(prompt_type, msg, input_value) {
          return self.Promise.resolve(getState())
            .then(function(state) {
              state.open({
                prompt_type: prompt_type,
                message: R.type(msg) === 'String' ? [msg] : msg,
                input_type: R.type(input_value) === 'Number' ? 'number' : 'text',
                input_value: input_value,
              });
              return new self.Promise(function(resolve, reject) {
                prompt_resolve = {
                  resolve: resolve,
                  reject: reject,
                };
              });
            });
        }
      };
    }
  ])
  .directive('prompt', [
    '$window',
    'prompt',
    function($window,
             promptService) {
      return {
        restrict: 'E',
        templateUrl: 'partials/directives/prompt.html',
        scope: true,
        link: function(scope, element/*, attrs*/) {
          var form = element[0].querySelector('form');
          var msg_container = element[0].querySelector('p');
          var input = element[0].querySelector('input');
          var cancel = element[0].querySelector('button.btn-default');

          element[0].style.display = 'none';

          var state = promptService.register({
            open: function promptOpen(options) {
              options = R.defaultTo({}, options);
              $window.requestAnimationFrame(function _promptOpen() {
                msg_container.innerHTML = R.defaultTo([], options.message).join('<br />');
                input.setAttribute('type', R.defaultTo('text', options.input_type));
                input.style.display = (options.prompt_type === 'prompt') ? 'initial' : 'none';
                cancel.style.display = (options.prompt_type !== 'alert') ? 'initial' : 'none';
                element[0].style.display = 'initial';
                input.focus();
                input.value = R.defaultTo(null, options.input_value);
              });
            },
            close: function promptClose() {
              var value = input.value;
              if(input.getAttribute('type') === 'number') {
                value = (R.length(value) === 0) ? null : parseFloat(value);
              }
              element[0].style.display = 'none';
              return value;
            },
          });

          form.addEventListener('submit', state.doValidate);
          cancel.addEventListener('click', state.doCancel);
        }
      };
    }
  ]);
