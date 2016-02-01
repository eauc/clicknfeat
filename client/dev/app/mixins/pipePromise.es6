R.promiseAll = R.bind(self.Promise.all, self.Promise);

R.pipePromise = (...args) => {
  return R.pipeP.apply(R, R.prepend(
    R.bind(self.Promise.resolve, self.Promise),
    args
  ));
};
