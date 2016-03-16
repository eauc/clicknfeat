(function() {
  angular.module('clickApp.directives')
    .factory('prompt', promptServiceFactory)
    .directive('prompt', promptDirectiveFactory);

  promptServiceFactory.$inject = [];
  function promptServiceFactory() {
    let state;
    const state_resolves = [];
    let prompt_resolve;

    const promptService =  {
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
      return R.threadP()(
        getState,
        openPrompt,
        registerPromptResolve
      );

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
      return new self.Promise((resolve, reject) => {
        prompt_resolve = {
          resolve: resolve,
          reject: reject
        };
      });
    }
    function getState() {
      return ( R.exists(state)
               ? state
               : registerStateClient()
             );
    }
    function registerStateClient() {
      return new self.Promise((resolve) => {
        state_resolves.push(resolve);
      });
    }
    function resolveStateClients() {
      R.forEach((resolve) => {
        resolve(state);
      }, state_resolves);
      state_resolves.length = 0;
    }
    function stateDoValidate() {
      const value = state.close();
      prompt_resolve.resolve(value);
      prompt_resolve = null;
    }
    function  stateDoCancel() {
      state.close();
      prompt_resolve.reject('canceled');
      prompt_resolve = null;
    }
  }

  promptDirectiveFactory.$inject = [
    'prompt',
  ];
  function promptDirectiveFactory(promptService) {
    const promptDirective = {
      restrict: 'E',
      templateUrl: 'app/components/prompt/prompt.html',
      scope: true,
      link: link
    };
    return promptDirective;

    function link(_scope_, element) {
      element = element[0];
      const form = element.querySelector('form');
      const msg_container = element.querySelector('p');
      const input = element.querySelector('input');
      const cancel = element.querySelector('button.btn-default');

      element.style.display = 'none';

      const state = promptService.register({
        open: promptOpen,
        close: promptClose
      });

      form.addEventListener('submit', state.doValidate);
      cancel.addEventListener('click', state.doCancel);

      function promptOpen(options = {}) {
        let { message,
              input_type,
              prompt_type,
              input_value
            } = options;
        self.window.requestAnimationFrame(() => {
          msg_container.innerHTML = R.defaultTo([], message).join('<br />');
          input.setAttribute('type', R.defaultTo('text', input_type));
          input.style.display = (prompt_type === 'prompt') ? 'initial' : 'none';
          cancel.style.display = (prompt_type !== 'alert') ? 'initial' : 'none';
          element.style.display = 'initial';
          input.focus();
          input.value = R.defaultTo(null, input_value);
        });
      }
      function promptClose() {
        let value = input.value;
        if(input.getAttribute('type') === 'number') {
          value = (R.length(value) === 0) ? null : parseFloat(value);
        }
        element.style.display = 'none';
        return value;
      }
    }
  }
})();
