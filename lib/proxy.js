import { isEmptyObject, equal } from "./util";

import {
  invariant,
  mapState,
  mergeState,
  isUnmount,
  getBinder
} from "./tie_util";

/***
 *
 * copy from react
 * @param {Object} partialState
 * @param {*}
 * @public
 */
function setState(partialState, callback) {
  !(
    typeof partialState === "object" ||
    typeof partialState === "function" ||
    partialState == null
  )
    ? invariant(
        false,
        "setState(...): takes an object of state variables to update or a function which returns an object of state variables."
      )
    : void 0;
  this.updater.enqueueSetState(this, partialState, callback, "setState");
}

/**
 * @param {ReactElement} ele
 * @param {Object} state
 * @param {Object} binder
 * @return {Null}
 * @public
 */
function updateView(ele, state, binder) {
  if (isUnmount(ele)) {
    return null;
  }

  if (!state || isEmptyObject(state)) {
    return null;
  }

  mapState(ele, state, binder);

  if (!state || isEmptyObject(state)) {
    return null;
  }

  if ("object" == typeof binder.map && true == binder.map.persist) {
    ele.setState(state).persist();
    return null;
  }

  let binders = getBinder(ele);

  state = mergeState(
    state,
    ele.state,
    binders.map(it => {
      return it.stateName;
    })
  );
  if (!equal(state, ele.state)) {
    setState.apply(ele, [state]);
  }
  return null;
}

export { setState, updateView };
