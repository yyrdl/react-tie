import Tree from "./tree";

import { isEmptyObject } from "./util";

import { updateView } from "./proxy";

import { getTieId, setTieId, isTied, mergeState, setBinder } from "./tie_util";

import { hookComponentWillUnmount, hookSetState } from "./hook/react_ele";

/**
 * @param {Object} reactEle
 * @param {Object} context
 * @return {Promise}
 * @api public
 */
function bind(reactEle, context) {
  _hook(reactEle);

  let binder = {
    identifier: context.identifier,
    dataName: context.dataName,
    stateName: context.stateName || context.dataName,
    map: context.map
  };

  setBinder(reactEle, binder);

  Tree.addBinder(context.dataName, getTieId(reactEle), binder);

  return _initialData(binder, reactEle);
}
/**
 * @param {ReactElement}
 * @return {Null}
 * @internal
 */
function _hook(reactEle) {
  if (isTied(reactEle)) {
    return null;
  }
  setTieId(reactEle);
  hookComponentWillUnmount(reactEle);
  hookSetState(reactEle);
  Tree.setReactElementContext(getTieId(reactEle), reactEle);
}

/**
 *  use `find` method  to get the initial data ,
 *  and bind to the state
 *  @param {Object} binder
 *  @param {Object} ele
 *  @return {Promise}
 *  @internal
 *
 */
function _initialData(binder, ele) {
  if ("function" !== typeof Tree.getMethods(binder.dataName).find) {
    return Promise.resolve();
  }

  let pro = Tree.getMethods(binder.dataName).find(binder.identifier || {});

  pro.then(result => {
    let state = {};

    state[binder.stateName] = result;

    if (isEmptyObject(result) || result == null || undefined == result) {
      state = {};
    }
    /*
        * merge with default state
         */

    state = mergeState(state, ele.state, [binder.stateName]);

    updateView(ele, state, binder);

    return result;
  });

  return pro;
}

export { bind };
