'use strict';

angular.module('clickApp.directives').factory('prompt', [function () {
  var state;
  var state_resolves = [];
  function getState() {
    if (R.exists(state)) return state;
    return new self.Promise(function (resolve) {
      state_resolves.push(resolve);
    });
  }
  var prompt_resolve;
  return {
    register: function promptRegister(st) {
      state = st;
      state.doValidate = function () {
        var value = state.close();
        prompt_resolve.resolve(value);
        prompt_resolve = null;
      };
      state.doCancel = function () {
        state.close();
        prompt_resolve.reject('canceled');
        prompt_resolve = null;
      };

      R.forEach(function (resolve) {
        resolve(state);
      }, state_resolves);
      state_resolves = [];

      return state;
    },
    prompt: function promptPrompt(prompt_type, msg, input_value) {
      return R.pipePromise(getState, function (state) {
        state.open({
          prompt_type: prompt_type,
          message: R.type(msg) === 'String' ? [msg] : msg,
          input_type: R.type(input_value) === 'Number' ? 'number' : 'text',
          input_value: input_value
        });
        return new self.Promise(function (resolve, reject) {
          prompt_resolve = {
            resolve: resolve,
            reject: reject
          };
        });
      })();
    }
  };
}]).directive('prompt', ['$window', 'prompt', function ($window, promptService) {
  return {
    restrict: 'E',
    templateUrl: 'partials/directives/prompt.html',
    scope: true,
    link: function link(scope, element) {
      var form = element[0].querySelector('form');
      var msg_container = element[0].querySelector('p');
      var input = element[0].querySelector('input');
      var cancel = element[0].querySelector('button.btn-default');

      element[0].style.display = 'none';

      var state = promptService.register({
        open: function promptOpen() {
          var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
          var message = options.message;
          var input_type = options.input_type;
          var prompt_type = options.prompt_type;
          var input_value = options.input_value;

          $window.requestAnimationFrame(function () {
            msg_container.innerHTML = R.defaultTo([], message).join('<br />');
            input.setAttribute('type', R.defaultTo('text', input_type));
            input.style.display = prompt_type === 'prompt' ? 'initial' : 'none';
            cancel.style.display = prompt_type !== 'alert' ? 'initial' : 'none';
            element[0].style.display = 'initial';
            input.focus();
            input.value = R.defaultTo(null, input_value);
          });
        },
        close: function promptClose() {
          var value = input.value;
          if (input.getAttribute('type') === 'number') {
            value = R.length(value) === 0 ? null : parseFloat(value);
          }
          element[0].style.display = 'none';
          return value;
        }
      });

      form.addEventListener('submit', state.doValidate);
      cancel.addEventListener('click', state.doCancel);
    }
  };
}]);
//# sourceMappingURL=prompt.js.map
