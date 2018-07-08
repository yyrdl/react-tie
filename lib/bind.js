import { clone, chain, isEmptyObject } from "./util";
import Tree from "./tree";

function isEleUnmount(ele) {
  return true === ele.IS_UNMOUNT;
}

function isTied(ele) {
  return undefined != ele._TIE_ID_;
}

function setTieId(ele) {
  ele._TIE_ID_ = Tree.genEleId();
}

function getTieId(ele) {
  return ele._TIE_ID_;
}

function hookComponentWillUnmount(reactEle) {
  let componentWillUnmount = reactEle.componentWillUnmount;

  reactEle.componentWillUnmount = function() {
    this.IS_UNMOUNT = true;
    Tree.untie(getTieId(this));
    return componentWillUnmount.apply(this, [].slice.call(arguments));
  };
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
    let temp = binder.map.func(state[binder.stateName]);

    delete state[binder.stateName];

    if ("object" === typeof temp) {
      for (let key in temp) {
        if (key in state) {
          state[key] = chain.merge(temp[key]).to(state[key]);
        } else {
          state[key] = chain.merge(temp[key]).to(ele.state[key]);
        }
      }
    }
  }
  return state;
}

/**
 * @param {Object} ele
 * @return {Null}
 * @api private
 *
 */
function hookSetState(ele) {
  let setState = ele.setState;
  ele._originalSetState = setState;

  let updateView = function(state, binder) {
    if (isEleUnmount(ele)) {
      return Tree.untie(getTieId(ele));
    }

    state = mapState(ele, state, binder);

    if ("object" == typeof binder.map && true == binder.map.persist) {
      ele.setState(state).persist();
    } else {
      ele._originalSetState(state);
    }
  };

  Tree.setUpdateView(getTieId(ele), updateView);

  ele.setState = function(state) {
    let pairs = Tree.getDataNameAndStateName(getTieId(this));

    let lastDatas = [];

    for (let i = 0; i < pairs.length; i++) {
      let stateName = pairs[i].stateName;

      if (stateName in state) {
        lastDatas.push(clone(this.state[stateName]));

        state[stateName] = chain
          .merge(state[stateName])
          .to(this.state[stateName]);
      }
    }

    this._originalSetState(state);

    Tree.dispatchStateChange(state, getTieId(this));

    return {
      persist: function() {
        let k = 0;
        for (let i = 0; i < pairs.length; i++) {
          let stateName = pairs[i].stateName;
          let dataName = pairs[i].dataName;
          if (stateName in state) {
            Tree.getMethods(dataName)._originalUpdate(
              pairs[i].identifier,
              state[stateName],
              lastDatas[k],
              "update"
            );
            k++;
          }
        }
      }
    };
  };
}

function hook(reactEle) {
  if (isTied(reactEle)) {
    return null;
  }
  setTieId(reactEle);
  hookComponentWillUnmount(reactEle);
  hookSetState(reactEle);
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

      state[binder.stateName] = chain
        .merge(state[binder.stateName])
        .to(ele.state[binder.stateName]);

      Tree.getUpdateView(getTieId(ele))(state, binder);

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

  Tree.addBinder(dataName, getTieId(reactEle), binder);

  return initialData(binder, reactEle);
}

export { bind };
