(function() {
  R.extend = function extend(obj, ...extensions) {
    // obj = R.clone(obj);
    R.forEach((source) => {
      for(var prop in source) {
        obj[prop] = source[prop];
      }
    }, extensions);
    return obj;
  };

  R.deepExtend = function deepExtend(obj, ...extensions) {
    const parentRE = /#{\s*?_\s*?}/;

    // obj = R.clone(obj);
    R.forEach((source) => {
      for(var prop in source) {
        if( R.isNil(obj[prop]) ||
            R.type(obj[prop]) === 'Function' ||
            R.type(source[prop]) === 'Date'
          ) {
          obj[prop] = source[prop];
        }
        else if( R.type(source[prop]) === 'String' &&
                 parentRE.test(source[prop])
               ) {
          if(R.type(obj[prop]) === 'String') {
            obj[prop] = source[prop].replace(parentRE, obj[prop]);
          }
        }
        else if( R.type(obj[prop]) === 'Array' ||
                 R.type(source[prop]) === 'Array'
               ){
          if( R.type(obj[prop]) !== 'Array' ||
              R.type(source[prop]) !== 'Array'
            ){
            throw new Error('Trying to combine an array with a non-array (' + prop + ')');
          }
          else {
            // DO NOT remove nil entries from arrays
            // obj[prop] = R.reject(R.isNil, R.deepExtend(obj[prop], source[prop]));
            obj[prop] = R.deepExtend(obj[prop], source[prop]);
          }
        }
        else if( R.type(obj[prop]) === 'Object' ||
                 R.type(source[prop]) === 'Object'
               ){
          if( R.type(obj[prop]) !== 'Object' ||
              R.type(source[prop]) !== 'Object'
            ) {
            throw new Error('Trying to combine an object with a non-object (' + prop + ')');
          }
          else {
            obj[prop] = R.deepExtend(obj[prop], source[prop]);
          }
        }
        else {
          obj[prop] = source[prop];
        }
      }
    }, extensions);
    return obj;
  };
})();
