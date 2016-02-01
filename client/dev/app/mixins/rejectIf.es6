R.rejectIf = R.curry((test, reason, obj) => {
  if(test(obj)) return self.Promise.reject(reason);
  else return obj;
});
