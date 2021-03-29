'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('hoist-non-react-statics');
var tslib = require('tslib');
var react = require('react');
var immer = require('immer');

/**
 * @internal
 */

/**
 * @internal
 */
function logError(message) {
	try {
		throw new Error(message);
	} catch (e) {
		console.error(e);
	}
}

/** React Context for Injector */
var InjectorContext = react.createContext({});
if (process.env.NODE_ENV !== 'production') {
	InjectorContext.displayName = 'InjectorContext';
}
/**
 * Dependency injection container
 * @internal
 */
var Injector = /** @class */ (function(_super) {
	tslib.__extends(Injector, _super);
	function Injector() {
		return (_super !== null && _super.apply(this, arguments)) || this;
	}
	return Injector;
})(react.Component);

var InjectedService = /** @class */ (function() {
	function InjectedService() {}
	return InjectedService;
})();

var PROVIDER = typeof Symbol === 'function' ? Symbol() : '__store__';
var STORES = typeof Symbol === 'function' ? Symbol() : '__stores__';
var REFRESH = typeof Symbol === 'function' ? Symbol() : '__refresh__';
/**
 * @internal
 */
var MutationProvider = /** @class */ (function() {
	function MutationProvider(service) {
		this.count = 0;
		this.service = service;
	}
	MutationProvider.prototype.start = function(inc) {
		var _this = this;
		var _a;
		if (inc === void 0) {
			inc = true;
		}
		if (this.count == 0) {
			var draft_1 = (this.draft = (_a = this.draft) !== null && _a !== void 0 ? _a : immer.createDraft(this.service));
			this.service[STORES].forEach(function(x) {
				_this.service[x] = draft_1[x];
			});
		}
		if (inc) this.count++;
	};
	MutationProvider.prototype.finish = function(refresh, dec) {
		var _this = this;
		if (refresh === void 0) {
			refresh = true;
		}
		if (dec === void 0) {
			dec = true;
		}
		if (this.count == 0) {
			console.warn('the finish method must be called after corresponding start method');
		} else {
			if (dec) this.count--;
			if (this.count == 0) {
				var draft_2 = this.draft;
				if (draft_2) {
					this.service[STORES].forEach(function(x) {
						draft_2[x] = _this.service[x];
					});
					var newstate_1 = immer.finishDraft(draft_2);
					this.service[STORES].forEach(function(x) {
						_this.service[x] = newstate_1[x];
					});
					this.draft = undefined;
				} else {
					if (process.env.NODE_ENV !== 'production') {
						logError('previous state is absent');
					}
				}
			}
		}
		if (refresh) {
			this.service.RefreshContext();
		}
	};
	return MutationProvider;
})();
// @ts-ignore
var ImmutableService = /** @class */ (function(_super) {
	tslib.__extends(ImmutableService, _super);
	function ImmutableService() {
		var _a;
		var _this = _super.call(this) || this;
		_this[STORES] = (_a = _this[STORES]) !== null && _a !== void 0 ? _a : [];
		_this[immer.immerable] = true;
		_this[PROVIDER] = new MutationProvider(_this);
		return _this;
	}
	// @ts-ignore
	ImmutableService.prototype.initProvider = function(refresh) {
		this[REFRESH] = refresh;
		this[PROVIDER].start();
		this[PROVIDER].finish();
	};
	ImmutableService.prototype.RefreshContext = function() {
		if (this[REFRESH]) {
			this[REFRESH]();
		}
	};
	ImmutableService.prototype.waitForAsync = function(promise) {
		return tslib.__awaiter(this, void 0, void 0, function() {
			return tslib.__generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						this[PROVIDER].finish(true, false);
						_a.label = 1;
					case 1:
						_a.trys.push([1, , 3, 4]);
						return [4 /*yield*/, promise];
					case 2:
						return [2 /*return*/, _a.sent()];
					case 3:
						this[PROVIDER].start(false);
						return [7 /*endfinally*/];
					case 4:
						return [2 /*return*/];
				}
			});
		});
	};
	return ImmutableService;
})(InjectedService);

/**
 * Property Decorator convert property to immutable
 * Changes for such property allowed only from methods marked with @action or @asyncAction decorator
 */
function store() {
	return function(target, propertyKey) {
		var _a;
		var service = target;
		service[STORES] = (_a = service[STORES]) !== null && _a !== void 0 ? _a : [];
		service[STORES].push(propertyKey);
	};
}
/**
 * Method decorator allow to change properties marked with @store within method.
 * After method execution, the React Context in which the service is located will be updated
 */
// export function asyncAction() {
// 	return function(target: ImmutableService, propertyKey: string, descriptor: PropertyDescriptor) {
// 		const fn = descriptor.value as Function;
// 		descriptor.value = async function(args: any[]) {
// 			(this as ImmutableServiceInternal)[PROVIDER].start();
// 			let res = undefined;
// 			try {
// 				res = await fn.call(this, args);
// 			} finally {
// 				(this as ImmutableServiceInternal)[PROVIDER].finish();
// 			}
// 			return res;
// 		};
// 	};
// }
var waitForFinish = function(service, promise) {
	return tslib.__awaiter(void 0, void 0, void 0, function() {
		return tslib.__generator(this, function(_a) {
			switch (_a.label) {
				case 0:
					_a.trys.push([0, , 2, 3]);
					return [4 /*yield*/, promise];
				case 1:
					return [2 /*return*/, _a.sent()];
				case 2:
					service[PROVIDER].finish();
					return [7 /*endfinally*/];
				case 3:
					return [2 /*return*/];
			}
		});
	});
};
var checkForPromise = function(value) {
	//return value instanceof Promise
	return value && typeof value['then'] === 'function';
};
/**
 * Method decorator allow to change properties marked with @store within method.
 * After method execution, the React Context in which the service is located will be updated
 */
function action() {
	return function(_target, _propertyKey, descriptor) {
		var fn = descriptor.value;
		descriptor.value = function(args) {
			this[PROVIDER].start();
			var isPromise = false;
			try {
				var res = fn.call(this, args);
				isPromise = checkForPromise(res);
				if (isPromise) {
					return waitForFinish(this, res);
				} else {
					return res;
				}
			} finally {
				if (!isPromise) {
					this[PROVIDER].finish();
				}
			}
		};
	};
}

exports.original = immer.original;
exports.enableES5 = immer.enableES5;
exports.enableMapSet = immer.enableMapSet;
exports.ImmutableService = ImmutableService;
exports.action = action;
exports.store = store;
//# sourceMappingURL=immutable.js.map
