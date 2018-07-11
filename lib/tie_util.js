import { GenId, clone } from "./util";

function isEleUnmount(ele) {
  return true === ele.IS_UNMOUNT;
}

function isTied(ele) {
  return undefined != ele._TIE_ID_;
}

function setTieId(ele) {
  ele._TIE_ID_ = GenId();
}

function getTieId(ele) {
  return ele._TIE_ID_;
}

function invariant(condition, format, a, b, c, d, e, f) {
  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        "Minified exception occurred; use the non-minified dev environment " +
          "for the full error message and additional helpful warnings."
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        format.replace(/%s/g, function() {
          return args[argIndex++];
        })
      );
      error.name = "Invariant Violation";
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
}

/**
 * if map is declared , map the state
 * @param {Object} ele
 * @param {Object} state
 * @param {Object} binder
 * @return {Object} state
 * @api private
 *
 */
function mapState(ele, state, binder) {
  if (
    "object" == typeof binder.map &&
    "function" == typeof binder.map.func &&
    binder.stateName in state
  ) {
    let temp = binder.map.func(state[binder.stateName], ele);

    delete state[binder.stateName];

    if ("object" === typeof temp) {
      for (let key in temp) {
        state[key] = temp[key];
      }
    }
  }
}

function mergeState(state, oldState, stateNames) {
  let obj = clone(oldState);

  for (let key in state) {
    if (stateNames.includes(key)) {
      if ("[object Object]" != Object.prototype.toString.call(state[key])) {
        obj[key] = state[key];
      } else {
        if ("[object Object]" !== Object.prototype.toString.call(obj[key])) {
          obj[key] = state[key];
        } else {
          for (let kk in state[key]) {
            obj[key][kk] = state[key][kk];
          }
        }
      }
    } else {
      obj[key] = state[key];
    }
  }

  return obj;
}

export {
  isTied,
  setTieId,
  getTieId,
  isEleUnmount,
  invariant,
  mapState,
  mergeState
};
