/**
 *
 * build a bradge between the view and the data
 *
 */
import {
	clone,
	chain,
	isEmptyObject
}
from "./util";
import Tree from "./tree";




/**
 * @param {Object} reactEle
 * @param {Object} context
 * @return {Promise}
 * @api private
 */
function _bind(reactEle, context) {
	let dataName = context.dataName;

	if (!reactEle._TIE_ID_) {
		reactEle._TIE_ID_ = Tree.genEleId();
	}

	if (!reactEle._IS_TIED_) {

		reactEle._IS_TIED_ = true;
		/**
		 *
		 * hook componentWillUnmount
		 */
		let componentWillUnmount = reactEle.componentWillUnmount;

		reactEle.componentWillUnmount = function () {
			reactEle.is_unmount = true;
			Tree.untie(this._TIE_ID_);
			return componentWillUnmount.apply(reactEle, [].slice.call(arguments));
		};

		let setState = reactEle.setState;

		reactEle._originalSetState = setState;

		 

		let updateView = function (state,binder) {
			if (!reactEle.is_unmount) {

				if("object" == typeof binder.map && "function" == typeof binder.map.func && binder.stateName in state){
					  let temp = binder.map.func(state[binder.stateName]);
					  delete state[binder.stateName];
					  for(let key in temp){
						  if(key in state){
							state[key] = chain.merge(temp[key]).to(state[key]);
						  }else{
                            state[key] = chain.merge(temp[key]).to(reactEle.state[key]);
						  }
					  }
					   
				} 

				if("object" == typeof binder.map && true == binder.map.persist){
					reactEle.setState(state).persist();
				}else{
					reactEle._originalSetState(state);
				}
				
			} else {
				Tree.untie(reactEle._TIE_ID_);
			}
		}

		Tree.setUpdateView(reactEle._TIE_ID_, updateView);

		reactEle.setState = function (state) {

			let stateNames = Tree.getDataNameAndStateName(reactEle._TIE_ID_);

			let lastDatas = [];

			for (let i = 0; i < stateNames.length; i++) {

				let stateName = stateNames[i].stateName;

				if (stateName in state) {

					lastDatas.push(clone(reactEle.state[stateName]));

					state[stateName] = chain.merge(state[stateName]).to(reactEle.state[stateName]);
				}

			}

			reactEle._originalSetState(state);
         
			Tree.dispatchStateChange(state, this._TIE_ID_);

			return {
				persist: function () {
					let k = 0;
					for (let i = 0; i < stateNames.length; i++) {
						let stateName = stateNames[i].stateName;
						let data_Name = stateNames[i].dataName;
						if (stateName in state) {
							use(data_Name)._originalUpdate(stateNames[i].identifier, state[stateName], lastDatas[k],"update");
							k++;
						}
					}

				}
			};
		};

	}

	let binder = {
		identifier: context.identifier,
		dataName: dataName,
		stateName: context.stateName || dataName,
		map:context.map
	};

	Tree.addBinder(dataName, reactEle._TIE_ID_, binder);

	if ("function" === typeof use(dataName).find) {

		let pro = use(dataName).find(context.identifier || {});

		pro.then((result) => {

			let state = {};
	
			if(isEmptyObject(result) || result == null || undefined == result){
				state = {};
			}else{
				state[binder.stateName] = result;
			}

			Tree.getUpdateView(reactEle._TIE_ID_)(state,binder);

			return result;
		});

		return pro;
	} else {
		return Promise.resolve();
	}
}

function Setting(dataName) {
	this._package = {
		dataName: dataName
	}
}
/**
 * @return {Setting} this
 * @api public
 */
Setting.prototype.identifier = function (identifier) {
	this._package.identifier = identifier;

	return this;
}
/**
 * @param {Function} func
 * @param {Boolean} ifPersist
 * @return {Setting} this
 * @api public
*/
Setting.prototype.map = function (func,ifPersist) {
	this._package.map = {
		func:func,
		persist:ifPersist
	};

	return this;
};

/**
 * @param {String} stateName
 * @return {Setting} this
 * @api public
 *
 */
Setting.prototype.named = function (stateName) {
	this._package.stateName = stateName;
	return this;
}

/**
 * @param {Object} ele
 * @return {Promise}
 * @api public
 *
 */
Setting.prototype.bind = function (ele) {
	return _bind(ele, this._package);
}
/**
 * @param {String} dataName
 * @return {Setting}
 * @api public
 */
function tie(dataName) {
	return new Setting(dataName);
}

function _hookUpdate(dataName, update) {
	return function (identifier, data) {
		Tree.dispatchDataChange(dataName, identifier, data, null);
		update.apply(null,[].slice.call(arguments));
	}
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

export default  {
	tie,
	declare,
	use
};
