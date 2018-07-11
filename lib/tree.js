import { clone, chain, isEmptyObject, nullOrUndefined, GenId } from "./util";
import { updateView } from "./proxy";
import { getBinder } from "./tie_util";

const TIE_TREE = {};
const Method_TREE = {};
const REACT_ELEMENTS = {};

/**
 * @param {String} dataName
 * @param {String} eleId
 * @return {Null}
 * @api private
 * **/
function _checkAndInitTieTree(dataName, eleId) {
  if ("object" !== typeof TIE_TREE[dataName]) {
    TIE_TREE[dataName] = {};
  }
  if (!TIE_TREE[dataName][eleId]) {
    TIE_TREE[dataName][eleId] = {};
  }
}

/**
 * @param {String} dataName
 * @param {String} eleId
 * @param {Object} binder
 * @return {Null}
 * @api public
 *
 */
function addBinder(dataName, eleId, binder) {
  _checkAndInitTieTree(dataName, eleId);

  TIE_TREE[dataName][eleId][binder.stateName] = binder;
}

/**
 * @param {String} eleId
 * @param {ReactElement} ele
 * @return {Null}
 * @api public
 *
 */
function setReactElementContext(eleId, ele) {
  REACT_ELEMENTS[eleId] = ele;
}

/**
 * @param {String} eleId
 * @api public
 *
 */
function getReactElementContext(eleId) {
  return REACT_ELEMENTS[eleId] || {};
}
/**
 *
 * @param {String} dataName
 * @param {Object} identifier
 * @param {Object} data
 * @param {String} exceptEleId
 * @return {Null}
 * @api public
 */
function dispatchDataChange(dataName, identifier, data, exceptEleId) {
  if (!TIE_TREE[dataName]) {
    return null;
  }
  for (let eleId in TIE_TREE[dataName]) {
    if (eleId === exceptEleId) {
      continue;
    }
    for (let stateName in TIE_TREE[dataName][eleId]) {
      let binder = TIE_TREE[dataName][eleId][stateName];

      let state = {};
      state[stateName] = clone(data);
      if (undefined != REACT_ELEMENTS[eleId]) {
        if (
          nullOrUndefined(binder.identifier) ||
          chain.is(binder.identifier).contain(identifier) ||
          chain.is(data).contain(binder.identifier) ||
          isEmptyObject(binder.identifier)
        ) {
          updateView(REACT_ELEMENTS[eleId], state, binder);
        }
      }
    }
  }
}
/**
 * @param {Object} state
 * @param {String} eleId
 * @return {Null}
 * @api public
 *
 */
function dispatchStateChange(state, eleId) {
  let binders = getBinder(REACT_ELEMENTS[eleId]);
  for (let i = 0; i < binders.length; i++) {
    let binder = binders[i];
    if (binder.stateName in state) {
      dispatchDataChange(
        binder.dataName,
        binder.identifier,
        state[binder.stateName],
        eleId
      );
    }
  }
}
/**
 * @param {String} dataName
 * @return {Object} methods
 * @api public
 *
 */
function getMethods(dataName) {
  return Method_TREE[dataName];
}
/**
 * @param {String} dataName
 * @param {Object} methods
 * @return {Null}
 * @api public
 */
function setMethods(dataName, methods) {
  Method_TREE[dataName] = methods;
}

/**
 * @param {String} eleId
 * @return {Null}
 * @api private
 */
function untie(eleId) {
  let binders = getBinder(REACT_ELEMENTS[eleId]);

  delete REACT_ELEMENTS[eleId];

  for (let i = 0; i < binders.length; i++) {
    delete TIE_TREE[binders[i].dataName][eleId];
  }
}

export default {
  addBinder,
  dispatchStateChange,
  dispatchDataChange,
  getMethods,
  setMethods,
  untie,
  setReactElementContext,
  getReactElementContext
};
