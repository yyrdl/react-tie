import { clone, chain, isEmptyObject, nullOrUndefined } from "./util";

const TIE_TREE = {};
const Method_TREE = {};
const UPDATE_VIEWS = {};

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
 * @return {String}
 * @api public
 *
 */
function genEleId() {
  return "tie" + Date.now() + "_" + Math.ceil(Math.random() * 100);
}

/**
 * @param {String} eleId
 * @return {Array} result
 * @api public
 *
 */
function getDataNameAndStateName(eleId) {
  let result = [];
  for (let dataName in TIE_TREE) {
    if (eleId in TIE_TREE[dataName]) {
      for (let stateName in TIE_TREE[dataName][eleId]) {
        result.push({
          dataName: dataName,
          stateName: stateName,
          identifier: TIE_TREE[dataName][eleId][stateName].identifier,
          map: TIE_TREE[dataName][eleId][stateName].map
        });
      }
    }
  }
  return result;
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
 * @param {Function} func
 * @return {Null}
 * @api public
 *
 */
function setUpdateView(eleId, func) {
  UPDATE_VIEWS[eleId] = func;
}

/**
 * @param {String} eleId
 * @api public
 *
 */
function getUpdateView(eleId) {
  return UPDATE_VIEWS[eleId] || function() {};
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
      if ("function" === typeof UPDATE_VIEWS[eleId]) {
        if (
          nullOrUndefined(binder.identifier) ||
          chain.is(binder.identifier).contain(identifier) ||
          chain.is(data).contain(binder.identifier) ||
          isEmptyObject(binder.identifier)
        ) {
          UPDATE_VIEWS[eleId](state, binder);
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
  let binders = getDataNameAndStateName(eleId);
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
  delete UPDATE_VIEWS[eleId];

  let binders = getDataNameAndStateName(eleId);

  for (let i = 0; i < binders.length; i++) {
    delete TIE_TREE[binders[i].dataName][eleId];
  }
}

export default {
  genEleId,
  getDataNameAndStateName,
  addBinder,
  dispatchStateChange,
  dispatchDataChange,
  getMethods,
  setMethods,
  untie,
  setUpdateView,
  getUpdateView
};
