import Tree from "../tree";

/**
 * @param {String} dataName
 * @param {Function} update
 * @return {Function}
 * @public
 */
function hookUpdate(dataName, update) {
  return function(identifier, data) {
    update.apply(null, [].slice.call(arguments));
    Tree.dispatchDataChange(dataName, identifier, data, null);
  };
}

export { hookUpdate };
