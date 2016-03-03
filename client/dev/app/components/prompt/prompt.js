'use strict';

(function () {
  angular.module('clickApp.directives').factory('prompt', promptServiceFactory).directive('prompt', promptDirectiveFactory);

  promptServiceFactory.$inject = [];
  function promptServiceFactory() {
    var state = undefined;
    var state_resolves = [];
    var prompt_resolve = undefined;

    var promptService = {
      register: promptRegister,
      promptP: promptPromptP
    };
    R.curryService(promptService);
    return promptService;

    function promptRegister(st) {
      state = st;
      state.doValidate = stateDoValidate;
      state.doCancel = stateDoCancel;

      resolveStateClients();

      return state;
    }
    function promptPromptP(prompt_type, msg, input_value) {
      return R.threadP()(getState, openPrompt, registerPromptResolve);

      function openPrompt(state) {
        state.open({
          prompt_type: prompt_type,
          message: R.type(msg) === 'String' ? [msg] : msg,
          input_type: R.type(input_value) === 'Number' ? 'number' : 'text',
          input_value: input_value
        });
      }
    }
    function registerPromptResolve() {
      return new self.Promise(function (resolve, reject) {
        prompt_resolve = {
          resolve: resolve,
          reject: reject
        };
      });
    }
    function getState() {
      return R.exists(state) ? state : registerStateClient();
    }
    function registerStateClient() {
      return new self.Promise(function (resolve) {
        state_resolves.push(resolve);
      });
    }
    function resolveStateClients() {
      R.forEach(function (resolve) {
        resolve(state);
      }, state_resolves);
      state_resolves.length = 0;
    }
    function stateDoValidate() {
      var value = state.close();
      prompt_resolve.resolve(value);
      prompt_resolve = null;
    }
    function stateDoCancel() {
      state.close();
      prompt_resolve.reject('canceled');
      prompt_resolve = null;
    }
  }

  promptDirectiveFactory.$inject = ['prompt'];
  function promptDirectiveFactory(promptService) {
    var promptDirective = {
      restrict: 'E',
      templateUrl: 'app/components/prompt/prompt.html',
      scope: true,
      link: link
    };
    return promptDirective;

    function link(scope, element) {
      element = element[0];
      var form = element.querySelector('form');
      var msg_container = element.querySelector('p');
      var input = element.querySelector('input');
      var cancel = element.querySelector('button.btn-default');

      element.style.display = 'none';

      var state = promptService.register({
        open: promptOpen,
        close: promptClose
      });

      form.addEventListener('submit', state.doValidate);
      cancel.addEventListener('click', state.doCancel);

      function promptOpen() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
        var message = options.message;
        var input_type = options.input_type;
        var prompt_type = options.prompt_type;
        var input_value = options.input_value;

        self.window.requestAnimationFrame(function () {
          msg_container.innerHTML = R.defaultTo([], message).join('<br />');
          input.setAttribute('type', R.defaultTo('text', input_type));
          input.style.display = prompt_type === 'prompt' ? 'initial' : 'none';
          cancel.style.display = prompt_type !== 'alert' ? 'initial' : 'none';
          element.style.display = 'initial';
          input.focus();
          input.value = R.defaultTo(null, input_value);
        });
      }
      function promptClose() {
        var value = input.value;
        if (input.getAttribute('type') === 'number') {
          value = R.length(value) === 0 ? null : parseFloat(value);
        }
        element.style.display = 'none';
        return value;
      }
    }
  }
})();
//# sourceMappingURL=prompt.js.map
