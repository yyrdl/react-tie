/**
 *
 * build a bradge between the view and the data
 *
 */

import Tree from "./tree";
import Setting from "./setting";
import { setOriginalUpdate } from "./tie_util";
import { hookUpdate } from "./hook/data_methods";

/**
 * @param {String} dataName
 * @return {Setting}
 * @api public
 */
function tie(dataName) {
  return new Setting(dataName);
}

/**
 * @param {String} dataName
 * @param {Object} methods
 * **/
function declare(dataName, methods) {
  if ("function" === typeof methods.update) {
    setOriginalUpdate(methods);
    methods.update = hookUpdate(dataName, methods.update);
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
