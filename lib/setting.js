import { bind } from "./bind";

function Setting(dataName) {
  this._package = {
    dataName: dataName
  };
}
/**
 * @return {Setting} this
 * @api public
 */
Setting.prototype.identifier = function(identifier) {
  this._package.identifier = identifier;

  return this;
};
/**
 * @param {Function} func
 * @param {Boolean} ifPersist
 * @return {Setting} this
 * @api public
 */
Setting.prototype.map = function(func, ifPersist) {
  this._package.map = {
    func: func,
    persist: ifPersist
  };

  return this;
};

/**
 * @param {String} stateName
 * @return {Setting} this
 * @api public
 *
 */
Setting.prototype.named = function(stateName) {
  this._package.stateName = stateName;
  return this;
};

/**
 * @param {Object} ele
 * @return {Promise}
 * @api public
 *
 */
Setting.prototype.bind = function(ele) {
  return bind(ele, this._package);
};

export default Setting;
