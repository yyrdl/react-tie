import { invariant, mapState, mergeState, isEleUnmount } from "./tie_util";
import { isEmptyObject, equal } from "./util";

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

function updateView(ele, state, binder) {
  if (isEleUnmount(ele)) {
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
  } else {
    let binders = ele.___Tie_Binders_ || [];

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
  }
}

export { setState, updateView };
