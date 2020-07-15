'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault(ex) {
	return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
}

require('reflect-metadata');
var hoistNonReactStatics = _interopDefault(require('hoist-non-react-statics'));
var tslib = require('tslib');
var immer = require('immer');
var react = require('react');

/**
 * @internal
 */
function isFunction(arg) {
	return typeof arg === 'function';
}
/**
 * @internal
 */
function isObject(arg) {
	return arg && typeof arg === 'object';
}
/**
 * @internal
 */
function isString(arg) {
	return typeof arg === 'string';
}
/**
 * @internal
 */
function isSymbol(arg) {
	return typeof arg === 'symbol';
}
/**
 * @internal
 */
function isToken(arg) {
	return isFunction(arg) || isObject(arg) || isString(arg) || isSymbol(arg);
}
/**
 * @internal
 */
function isReactComponent(prototype) {
	return isObject(prototype) && isObject(prototype.isReactComponent);
}
/**
 * @internal
 */
function isValidMetadata(arg) {
	return isFunction(arg) && [Object, Function, Number, String, Boolean].indexOf(arg) === -1;
}

/**
 * @internal
 */
function getDebugName(value) {
	if (isFunction(value)) {
		return String(value.displayName || value.name);
	}
	if (isObject(value) && isFunction(value.constructor)) {
		return String(value.constructor.name);
	}
	return String(value);
}
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
/**
 * @internal
 */
function logIncorrectBinding(token, binding) {
	var tokenName = getDebugName(token);
	var bindingName = getDebugName(binding);
	logError('Binding [' + tokenName + ', ' + bindingName + '] is incorrect.');
}
/**
 * @internal
 */
function logNotFoundDependency(token) {
	var name = getDebugName(token);
	logError(
		'Dependency ' +
			name +
			' is not found.\nPlease register ' +
			name +
			' in some Provider e.g.\n@provider([' +
			name +
			', ' +
			name +
			'])\nclass App extends React.Component { /*...*/ }'
	);
}
/**
 * @internal
 */
function logNotFoundProvider(target) {
	if (isReactComponent(target)) {
		var name_1 = getDebugName(target);
		logError(
			'Provider is not found.\n  Please define Provider and set ' +
				name_1 +
				'.contextType = InjectorContext e.g.\n  @provider([MyService, MyService])\n  class App extends React.Component { /*...*/ }\n  class ' +
				name_1 +
				' extends React.Component {\n    static contextType = InjectorContext;\n  }'
		);
	} else {
		logError('Provider is not found.\n  Please define Provider e.g.\n  @provider([MyService, MyService])\n  class App extends React.Component { /*...*/ }');
	}
}
/**
 * @internal
 */
function logInvalidMetadata(target, token) {
	var tokenName = getDebugName(token);
	var targetName = getDebugName(target);
	logError(
		tokenName + ' is not a valid dependency.\nPlease specify ES6 class as property type e.g.\nclass MyService {}\nclass ' + targetName + ' {\n  @inject myService: MyService;\n}'
	);
}

/* istanbul ignore next */
var INJECTOR = typeof Symbol === 'function' ? Symbol() : '__injector__';
/** React Context for Injector */
var InjectorContext = react.createContext({});
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
/**
 * Find Injector for passed object and cache it inside this object
 * @internal
 * @param {Object} target The object in which we inject value
 * @returns {Injector}
 */
function getInjector(target) {
	var _a;
	var injector = target[INJECTOR];
	if (injector) {
		return injector;
	}
	injector = currentInjector || ((_a = target.context) === null || _a === void 0 ? void 0 : _a.injector);
	if (injector instanceof Injector) {
		target[INJECTOR] = injector;
		return injector;
	}
	return undefined;
}
var currentInjector = null;
/**
 * Resolve a class instance that registered by some Provider in hierarchy.
 * Instance is cached in Provider that registers it's class.
 * @internal
 * @param {Injector} injector Injector instance
 * @param {Token} token Dependency injection token
 * @returns {Object} Resolved class instance
 */
function getInstance(injector, token) {
	if (registrationQueue.length > 0) {
		registrationQueue.forEach(function(registration) {
			registration();
		});
		registrationQueue.length = 0;
	}
	while (injector) {
		var instance = injector._instanceMap.get(token);
		if (instance !== undefined) {
			return instance;
		}
		var binding = injector._bindingMap.get(token);
		if (binding) {
			var prevInjector = currentInjector;
			currentInjector = injector;
			try {
				instance = binding(injector);
			} finally {
				currentInjector = prevInjector;
			}
			injector._instanceMap.set(token, instance);
			injector._initInstance(instance);
			return instance;
		}
		injector = injector._parent;
	}
	if (process.env.NODE_ENV !== 'production') {
		logNotFoundDependency(token);
	}
	return undefined;
}
/**
 * @internal
 */
var registrationQueue = [];

function inject(targetOrToken, keyOrToken) {
	if (isFunction(keyOrToken)) {
		return injectFunction(targetOrToken, keyOrToken);
	}
	var token = targetOrToken;
	if (!keyOrToken) {
		return injectDecorator;
	}
	return injectDecorator(token, keyOrToken);
	function injectDecorator(prototype, key) {
		if (process.env.NODE_ENV !== 'production') {
			defineContextType(prototype);
		} else {
			prototype.constructor.contextType = InjectorContext;
		}
		if (!token) {
			token = Reflect.getMetadata('design:type', prototype, key);
			if (process.env.NODE_ENV !== 'production') {
				if (!isValidMetadata(token)) {
					logInvalidMetadata(targetOrToken, token);
				}
			}
		}
		var descriptor = {
			configurable: true,
			enumerable: true,
			get: function() {
				var instance = injectFunction(this, token);
				Object.defineProperty(this, key, {
					enumerable: true,
					writable: true,
					value: instance
				});
				return instance;
			},
			set: function(instance) {
				Object.defineProperty(this, key, {
					enumerable: true,
					writable: true,
					value: instance
				});
			}
		};
		Object.defineProperty(prototype, key, descriptor);
		return descriptor;
	}
}
/**
 * Resolve a class instance that registered by some Provider in hierarchy.
 * Instance is cached in Provider that registers it's class.
 * @internal
 * @param {Object} target The object in which we inject class instance
 * @param {Token} token Dependency injection token
 * @returns {Object} Resolved class instance
 */
function injectFunction(target, token) {
	var injector = getInjector(target);
	if (process.env.NODE_ENV !== 'production') {
		if (!injector) {
			logNotFoundProvider(target);
		}
	}
	return getInstance(injector, token);
}
/**
 * Set Class.contextType = InjectorContext
 * @internal
 * @param {Object} prototype React Component prototype
 */
function defineContextType(prototype) {
	if (isReactComponent(prototype)) {
		var constructor = prototype.constructor;
		var className_1 = getDebugName(constructor);
		if (constructor.contextType !== InjectorContext) {
			if (constructor.contextType) {
				logError('Decorator tries to overwrite existing ' + className_1 + '.contextType');
			} else {
				Object.defineProperty(constructor, 'contextType', {
					get: function() {
						return InjectorContext;
					},
					set: function() {
						logError('You are trying to overwrite ' + className_1 + '.contextType = InjectorContext');
					}
				});
			}
		}
	}
}

var IS_BINDING = typeof Symbol === 'function' ? Symbol() : '__binding__';
/**
 * Bind type to specified class.
 * @param constructor Service constructor
 * @returns Dependency resolver
 */
function toClass(constructor) {
	if (process.env.NODE_ENV !== 'production') {
		if (!isFunction(constructor)) {
			logError('Class ' + getDebugName(constructor) + ' is not a valid dependency');
		}
	}
	return asBinding(function(injector) {
		var instance = new constructor();
		if (!instance[INJECTOR]) {
			instance[INJECTOR] = injector;
		}
		return instance;
	});
}
function toFactory(depsOrFactory, factory) {
	if (process.env.NODE_ENV !== 'production') {
		if (factory) {
			if (!Array.isArray(depsOrFactory)) {
				logError('Dependency array ' + getDebugName(depsOrFactory) + ' is invalid');
			}
			if (!isFunction(factory)) {
				logError('Factory ' + getDebugName(factory) + ' is not a valid dependency');
			}
		} else if (!isFunction(depsOrFactory)) {
			logError('Factory ' + getDebugName(depsOrFactory) + ' is not a valid dependency');
		}
	}
	return asBinding(
		factory
			? function(injector) {
					return factory.apply(
						void 0,
						depsOrFactory.map(function(token) {
							return getInstance(injector, token);
						})
					);
			  }
			: depsOrFactory
	);
}
/**
 * Bind type to specified value.
 * @param  value
 * @returns Dependency resolver
 */
function toValue(value) {
	if (process.env.NODE_ENV !== 'production') {
		if (value === undefined) {
			logError('Please specify some value');
		}
	}
	return asBinding(function() {
		return value;
	});
}
/**
 * Bind type to existing instance located by token.
 * @param {Token} token
 * @return Dependency resolver
 */
function toExisting(token) {
	if (process.env.NODE_ENV !== 'production') {
		if (!isFunction(token)) {
			logError('Token ' + getDebugName(token) + ' is not a valid dependency injection token');
		}
	}
	return asBinding(function(injector) {
		return getInstance(injector, token);
	});
}
/**
 * Mark function as binding function.
 * @internal
 * @param {Function} binding
 * @returns {Function}
 */
function asBinding(binding) {
	binding[IS_BINDING] = true;
	return binding;
}
/**
 * Add bindings to bindings Map
 * @internal
 */
function addBindings(bindingMap, definitions) {
	definitions.forEach(function(definition) {
		var _a;
		var token, binding;
		if (Array.isArray(definition)) {
			(token = definition[0]), (_a = definition[1]), (binding = _a === void 0 ? token : _a);
		} else {
			token = binding = definition;
		}
		if (process.env.NODE_ENV !== 'production') {
			if (!isToken(token) || !isFunction(binding)) {
				logIncorrectBinding(token, binding);
			}
		}
		// @ts-ignore
		bindingMap.set(token, binding[IS_BINDING] ? binding : toClass(binding));
	});
}

var Initialized = typeof Symbol === 'function' ? Symbol() : '__init__';
var InjectedService = /** @class */ (function() {
	function InjectedService() {}
	return InjectedService;
})();
/**
 * Decorator or HOC that register dependency injection bindings
 * in scope of decorated class
 * @param definitions Dependency injection configuration
 * @returns Decorator or HOC
 */
var provider = function() {
	var definitions = [];
	for (var _i = 0; _i < arguments.length; _i++) {
		definitions[_i] = arguments[_i];
	}
	return function(Wrapped) {
		var bindingMap = new Map();
		addBindings(bindingMap, definitions);
		var Provider = /** @class */ (function(_super) {
			tslib.__extends(Provider, _super);
			function Provider() {
				var _a;
				var _this = _super.apply(this, arguments) || this;
				_this._parent = (_a = _this.context) === null || _a === void 0 ? void 0 : _a.injector;
				_this._bindingMap = bindingMap;
				_this._instanceMap = new Map();
				return _this;
			}
			Provider.prototype._initInstance = function(instance) {
				var _this = this;
				if (instance instanceof InjectedService && !instance[Initialized]) {
					instance.initProvider(function() {
						return _this.setState({ injector: _this });
					});
					instance[Initialized] = true;
				}
			};
			Provider.prototype.componentDidMount = function() {
				var _this = this;
				this._instanceMap.forEach(function(instance) {
					_this._initInstance(instance);
				});
			};
			Provider.prototype.componentWillUnmount = function() {
				this._instanceMap.forEach(function(instance) {
					if (isObject(instance) && isFunction(instance.dispose)) {
						instance.dispose();
					}
				});
			};
			Provider.prototype.render = function() {
				return react.createElement(InjectorContext.Provider, { value: { injector: this } }, react.createElement(Wrapped, this.props));
			};
			/**
			 * Register dependency injection bindings in scope of decorated class
			 * @param {...Definition} definitions Dependency injection configuration
			 */
			Provider.register = function() {
				var definitions = [];
				for (var _i = 0; _i < arguments.length; _i++) {
					definitions[_i] = arguments[_i];
				}
				addBindings(bindingMap, definitions);
			};
			Provider.WrappedComponent = Wrapped;
			return Provider;
		})(Injector);
		if (process.env.NODE_ENV !== 'production') {
			Provider.displayName = 'Provider(' + (Wrapped.displayName || Wrapped.name) + ')';
			Object.defineProperty(Provider, 'contextType', {
				get: function() {
					return InjectorContext;
				},
				set: function() {
					logError('You are trying to overwrite ' + Provider.displayName + '.contextType = InjectorContext');
				}
			});
		} else {
			Provider.contextType = InjectorContext;
		}
		// static fields from component should be visible on the generated Consumer
		return hoistNonReactStatics(Provider, Wrapped);
	};
};
/**
 * Decorator that lazily registers class in scope of specified Provider.
 * @param getProvider Lambda function that returns Provider
 * @param biding Dependency injection binding
 * @returns Decorator
 */
var registerIn = function(getProvider, binding) {
	return function(constructor) {
		registrationQueue.push(function() {
			if (process.env.NODE_ENV !== 'production') {
				var provider_1 = getProvider();
				if (!isFunction(provider_1) || !(provider_1.prototype instanceof Injector)) {
					logError(getDebugName(provider_1) + ' is not a valid Provider. Please use:\n' + '@registerIn(() => MyProvider)\n' + ('class ' + getDebugName(constructor) + ' {}\n'));
				} else {
					provider_1.register(binding ? [constructor, binding] : constructor);
				}
			} else {
				getProvider().register(binding ? [constructor, binding] : constructor);
			}
		});
		return constructor;
	};
};

/**
 * React hook for resolving a class instance that registered by some Provider in hierarchy.
 * Instance is cached in Provider that registers it's class.
 * @param  token Dependency injection token
 * @returns Resolved class instance
 */
function useInstance(token) {
	var _a;
	var ref = react.useRef(undefined);
	var injector = (_a = react.useContext(InjectorContext)) === null || _a === void 0 ? void 0 : _a.injector;
	if (process.env.NODE_ENV !== 'production') {
		if (!injector) {
			logNotFoundProvider();
		}
	}
	return ref.current || (ref.current = getInstance(injector, token));
}
/**
 * React hook for resolving a class instances that registered by some Provider in hierarchy.
 * Instances are cached in Provider that registers it's classes.
 * @param  tokens Dependency injection tokens
 * @returns Resolved class instances
 */
function useInstances() {
	var _a;
	var tokens = [];
	for (var _i = 0; _i < arguments.length; _i++) {
		tokens[_i] = arguments[_i];
	}
	var ref = react.useRef(null);
	var injector = (_a = react.useContext(InjectorContext)) === null || _a === void 0 ? void 0 : _a.injector;
	if (process.env.NODE_ENV !== 'production') {
		if (!injector) {
			logNotFoundProvider();
		}
	}
	return (
		ref.current ||
		(ref.current = tokens.map(function(token) {
			return getInstance(injector, token);
		}))
	);
}

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

var ComponentWithServices = function(_a) {
	var services = _a.services,
		children = _a.children,
		deps = _a.deps;
	var ComponentWithService = react.useCallback(
		provider.apply(
			void 0,
			services
		)(function() {
			return react.createElement(react.Fragment, {}, children);
		}),
		deps !== null && deps !== void 0 ? deps : []
	);
	return react.createElement(ComponentWithService);
};

exports.original = immer.original;
exports.enableES5 = immer.enableES5;
exports.enableMapSet = immer.enableMapSet;
exports.InjectedService = InjectedService;
exports.inject = inject;
exports.provider = provider;
exports.registerIn = registerIn;
exports.Inject = inject;
exports.Provider = provider;
exports.RegisterIn = registerIn;
exports.toClass = toClass;
exports.toExisting = toExisting;
exports.toFactory = toFactory;
exports.toValue = toValue;
exports.useInstance = useInstance;
exports.useInstances = useInstances;
exports.ImmutableService = ImmutableService;
exports.action = action;
exports.store = store;
exports.ComponentWithServices = ComponentWithServices;
//# sourceMappingURL=index.js.map
