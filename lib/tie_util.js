import { GenId, clone } from "./util";

function isUnmount(ele) {
  return true === ele.IS_UNMOUNT;
}

function setUnmount(ele) {
  ele.IS_UNMOUNT = true;
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

function setBinder(ele, binder) {
  if (!Array.isArray(ele.___Tie_Binders_)) {
    ele.___Tie_Binders_ = [];
  }

  ele.___Tie_Binders_.push(binder);
}

function getBinder(ele) {
  if (!Array.isArray(ele.___Tie_Binders_)) {
    ele.___Tie_Binders_ = [];
  }
  return ele.___Tie_Binders_;
}

function setOriginalUpdate(methods) {
  methods.__Tie_Original_Update_ = methods.update;
}

function getOriginalUpdate(methods) {
  return methods.__Tie_Original_Update_;
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

    if ("object" !== typeof temp) {
      return null;
    }

    for (let key in temp) {
      state[key] = temp[key];
    }
  }
}

function mergeState(state, oldState, stateNames) {
  let obj = clone(oldState);

  for (let key in state) {
    if (!stateNames.includes(key)) {
      obj[key] = state[key];
      continue;
    }

    if ("[object Object]" != Object.prototype.toString.call(state[key])) {
      obj[key] = state[key];
      continue;
    }

    if ("[object Object]" !== Object.prototype.toString.call(obj[key])) {
      obj[key] = state[key];
      continue;
    }

    for (let subKey in state[key]) {
      obj[key][subKey] = state[key][subKey];
    }
  }

  return obj;
}

export {
  isTied,
  setTieId,
  getTieId,
  isUnmount,
  setUnmount,
  invariant,
  mapState,
  mergeState,
  setBinder,
  getBinder,
  setOriginalUpdate,
  getOriginalUpdate
};
