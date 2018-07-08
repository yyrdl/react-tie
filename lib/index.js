/**
 *
 * build a bradge between the view and the data
 *
 */

import Tree from "./tree";
import Setting from "./setting";

/**
 * @param {String} dataName
 * @return {Setting}
 * @api public
 */
function tie(dataName) {
  return new Setting(dataName);
}

function _hookUpdate(dataName, update) {
  return function(identifier, data) {
    update.apply(null, [].slice.call(arguments));
    Tree.dispatchDataChange(dataName, identifier, data, null);
  };
}
/**
 * @param {String} dataName
 * @param {Object} methods
 * **/
function declare(dataName, methods) {
  if ("function" === typeof methods.update) {
    methods._originalUpdate = methods.update;
    methods.update = _hookUpdate(dataName, methods.update);
  }

  Tree.setMethods(dataName, methods);
}

/**
 * @param {String} dataName
 * */
function use(dataName) {
  return Tree.getMethods(dataName);
}

export default {
  tie,
  declare,
  use
};
