function GenId() {
  return "g_" + Date.now() + "_" + Math.ceil(Math.random() * 100);
}

function isArray(a) {
  return Array.isArray(a);
}
function isNumber(n) {
  return "[object Number]" === Object.prototype.toString.call(n);
}

function isString(s) {
  return "[object String]" === Object.prototype.toString.call(s);
}

function isBoolean(b) {
  return "[object Boolean]" === Object.prototype.toString.call(b);
}

function clone(object) {
  if (isNumber(object)) {
    return "object" === typeof object ? new Number(object.valueOf()) : object;
  }
  if (isString(object)) {
    return "object" === typeof object ? new String(object.valueOf()) : object;
  }
  if (isBoolean(object)) {
    return "object" === typeof object ? new Boolean(object.valueOf()) : object;
  }
  if (isArray(object)) {
    return object.map(function(it) {
      return clone(it);
    });
  }
  if (null === object) {
    return null;
  }
  if ("object" === typeof object) {
    let copy = {};
    for (let key in object) {
      copy[key] = clone(object[key]);
    }
    return copy;
  }
  return object;
}

function isEmptyObject(obj) {
  if (!obj) {
    return false;
  }
  let empty = true;
  for (let key in obj) {
    empty = false;
    break;
  }

  return empty;
}

function equal(a, b) {
  if (typeof a !== typeof b) {
    return false;
  }
  if (a === null || b === null) {
    return a === b;
  }
  if (a === undefined || b === undefined) {
    return a === b;
  }

  if (isBoolean(a) || isNumber(a) || isString(a)) {
    return a == b;
  }
  if (isArray(a)) {
    if (a.length != b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!equal(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }

  if ("object" === typeof a) {
    for (let key in a) {
      if (!equal(a[key], b[key])) {
        return false;
      }
    }

    return true;
  }

  return false;
}

let chain = {
  is: function(a) {
    return {
      contain: function(b) {
        if ("object" === typeof a && "object" === typeof b) {
          for (let key in b) {
            if (key in a) {
              if (!equal(a[key], b[key])) {
                return false;
              }
            } else {
              return false;
            }
          }

          return true;
        }
        return false;
      },
      equal: function(b) {
        return equal(a, b);
      }
    };
  }
};

function nullOrUndefined(a) {
  return a === null || a === undefined;
}

export { clone, chain, equal, isEmptyObject, nullOrUndefined, GenId };
