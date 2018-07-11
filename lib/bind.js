import { clone, equal, isEmptyObject } from "./util";
import Tree from "./tree";
import { setState, updateView } from "./proxy";

import { getTieId, setTieId, isTied, mergeState } from "./tie_util";

function hookComponentWillUnmount(reactEle) {
  let componentWillUnmount = reactEle.componentWillUnmount;

  reactEle.componentWillUnmount = function() {
    this.IS_UNMOUNT = true;
    Tree.untie(getTieId(this));
    return componentWillUnmount.apply(this, [].slice.call(arguments));
  };
}

function fakeSetState(state) {
  let args = [].slice.call(arguments);

  let lastDatas = [];

  if (
    "[object Object]" === Object.prototype.toString.call(state) &&
    !isEmptyObject(state)
  ) {
    args.shift();

    let binders = this.___Tie_Binders_ || [];

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
  } else {
    setState.apply(this, args);
  }

  return {
    persist: function() {
      for (let i = 0; i < lastDatas.length; i++) {
        let it = lastDatas[i];
        if (it.stateName in state) {
          Tree.getMethods(it.dataName)._originalUpdate(
            it.identifier,
            state[it.stateName],
            it.data,
            "update"
          );
        }
      }
    }
  };
}

/**
 * @param {Object} ele
 * @return {Null}
 * @api private
 *
 */
function hookSetState(ele) {
  ele.setState = fakeSetState;
}

function hook(reactEle) {
  if (isTied(reactEle)) {
    return null;
  }
  setTieId(reactEle);
  hookComponentWillUnmount(reactEle);
  hookSetState(reactEle);
  Tree.setReactElementContext(getTieId(reactEle), reactEle);
}

/**
 *  use find method to get the initial data ,
 *  and bind to the state
 *  @param {Object} binder
 *  @param {Object} ele
 *  @return {Promise}
 *  @api private
 *
 */
function initialData(binder, ele) {
  if ("function" === typeof Tree.getMethods(binder.dataName).find) {
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
  } else {
    return Promise.resolve();
  }
}

/**
 * @param {Object} reactEle
 * @param {Object} context
 * @return {Promise}
 * @api public
 */
function bind(reactEle, context) {
  let dataName = context.dataName;

  hook(reactEle);

  let binder = {
    identifier: context.identifier,
    dataName: dataName,
    stateName: context.stateName || dataName,
    map: context.map
  };

  if (!Array.isArray(reactEle.___Tie_Binders_)) {
    reactEle.___Tie_Binders_ = [];
  }

  reactEle.___Tie_Binders_.push(binder);

  Tree.addBinder(dataName, getTieId(reactEle), binder);

  return initialData(binder, reactEle);
}

export { bind };
