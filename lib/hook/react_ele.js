import Tree from "../tree";

import { equal, isEmptyObject, clone } from "../util";
import { setState } from "../proxy";

import {
  getTieId,
  setUnmount,
  mergeState,
  getBinder,
  getOriginalUpdate
} from "../tie_util";
/**
 *
 * @param {ReactElement}
 * @return {Null}
 * @public
 */
function hookComponentWillUnmount(reactEle) {
  let componentWillUnmount = reactEle.componentWillUnmount;

  reactEle.componentWillUnmount = function() {
    setUnmount(this);
    Tree.untie(getTieId(this));
    return componentWillUnmount.apply(this, [].slice.call(arguments));
  };
}

/**
 * @param {Object} state
 * @param {Array} lastDatas
 * @return {object}
 * @internal
 */
function _persist(state, lastDatas) {
  function op() {
    for (let i = 0; i < lastDatas.length; i++) {
      let it = lastDatas[i];
      if (it.stateName in state) {
        getOriginalUpdate(Tree.getMethods(it.dataName))(
          it.identifier,
          state[it.stateName],
          it.data,
          "update"
        );
      }
    }
  }

  return { persist: op };
}

function _fakeSetState(state) {
  let args = [].slice.call(arguments);

  let lastDatas = [];

  if (
    "[object Object]" != Object.prototype.toString.call(state) ||
    isEmptyObject(state)
  ) {
    setState.apply(this, args);
    return _persist(state, lastDatas);
  }

  args.shift();

  let binders = getBinder(this);

  for (let i = 0; i < binders.length; i++) {
    let stateName = binders[i].stateName;
    if (stateName in state) {
      lastDatas.push({
        data: clone(this.state[stateName]),
        dataName: binders[i].dataName,
        stateName: stateName,
        identifier: binders[i].identifier
      });
    }
  }

  state = mergeState(
    state,
    this.state,
    binders.map(it => {
      return it.stateName;
    })
  );

  if (!equal(state, this.state)) {
    args.unshift(state);

    setState.apply(this, args);

    Tree.dispatchStateChange(state, getTieId(this));
  }
  return _persist(state, lastDatas);
}

/**
 * @param {ReactElement}
 * @return {Null}
 * @public
 */
function hookSetState(ele) {
  ele.setState = _fakeSetState;
}

export { hookComponentWillUnmount, hookSetState };
