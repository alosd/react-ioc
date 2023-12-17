import { Component, createContext } from 'react';
import { LiteEventImpl } from '../liteEvent';
import { logNotFoundDependency } from './errors';
import { Token } from './types';

/* istanbul ignore next */
export const INJECTOR: unique symbol = Symbol();
export const InjectedPromiseProp: unique symbol = Symbol();
export const EXISING_BINDING: unique symbol = Symbol();
export const AUTO_BINDING: unique symbol = Symbol();

export interface BindingMark {
	[EXISING_BINDING]?: boolean;
	[AUTO_BINDING]?: boolean;
	pre?: () => void;
	post?: (instance: any) => void;
}
export type BindingFunction = ((injector: Injector, postPromise: Promise<any>) => any) & BindingMark;

export interface InjectedPromise<T> extends Promise<T> {
	[InjectedPromiseProp]?: boolean;
}

interface InjectedInstance {
	[INJECTOR]?: Injector;
}

type InjectorContextType = { injector?: Injector };

/** React Context for Injector */
export const InjectorContext = createContext<InjectorContextType>({});
if (__DEV__) {
	InjectorContext.displayName = 'InjectorContext';
}

/**
 * Dependency injection container
 * @internal
 */
export abstract class Injector<P = {}> extends Component<P> {
	_parent?: Injector;

	_bindingMap!: Map<Token, BindingFunction>;

	_instanceMap!: Map<Token, Object>;

	_asyncInstanceMap!: Map<Token, Promise<Object>>;

	_childNotifications = new LiteEventImpl();

	_autoFactory?: (token: Token) => void;

	abstract _initInstance(instance: Object): void;
}

/**
 * Find Injector for passed object and cache it inside this object
 * @internal
 * @param {Object} target The object in which we inject value
 * @returns {Injector}
 */
export function getInjector(target: Object) {
	let injector = (target as InjectedInstance)[INJECTOR];
	if (injector) {
		return injector;
	}
	injector = currentInjector || ((target as Component).context as InjectorContextType)?.injector;
	if (injector instanceof Injector) {
		(target as InjectedInstance)[INJECTOR] = injector;
		return injector;
	}
	return injector;
}

export function getExistedBinding(injector: Injector | undefined, token: Token) {
	while (injector) {
		if (injector._bindingMap.has(token)) {
			return injector;
		}
		injector = injector._parent;
	}
	return injector;
}

let currentInjector: Injector | null = null;

/**
 * Resolve a class instance that registered by some Provider in hierarchy.
 * Instance is cached in Provider that registers it's class.
 * @internal
 * @param {Injector} injector Injector instance
 * @param {Token} token Dependency injection token
 * @returns {Object} Resolved class instance
 */
export function getInstance(injector: Injector | undefined, token: Token): Object | undefined {
	if (registrationQueue.length > 0) {
		registrationQueue.forEach(registration => {
			registration();
		});
		registrationQueue.length = 0;
	}
	while (injector) {
		let instance = injector._instanceMap.get(token)!;
		if (instance !== undefined) {
			return instance;
		}
		const delayed = injector._asyncInstanceMap.get(token);
		if (delayed) {
			return delayed;
		}
		const binding = injector._bindingMap.get(token);
		if (binding) {
			const prevInjector = currentInjector;
			currentInjector = injector;
			try {
				if (binding[EXISING_BINDING]) {
					const parentinjector = getExistedBinding(injector._parent, token);
					if (parentinjector) {
						return getInstance(parentinjector, token);
					}
				}

				let resolver: (obj: Object) => void = () => {};
				const _p = new Promise(r => {
					resolver = r;
				}) as InjectedPromise<any>;
				_p[InjectedPromiseProp] = true;
				injector._asyncInstanceMap.set(token, _p);
				if (binding.pre) {
					binding.pre();
				}

				instance = binding(injector, _p);

				if (instance === undefined && binding[AUTO_BINDING]) {
					injector = injector._parent;
					continue;
				}

				injector._instanceMap.set(token, instance);
				injector._initInstance(instance);

				if (binding.post) {
					binding.post(instance);
				}

				resolver(instance);
			} finally {
				currentInjector = prevInjector;
			}

			return instance;
		} else {
			if (injector._autoFactory) {
				const parentinjector = getExistedBinding(injector._parent, token);
				if (!parentinjector) {
					injector._autoFactory(token);
					continue;
				}
			}
		}
		injector = injector._parent;
	}
	if (__DEV__) {
		logNotFoundDependency(token);
	}
	return undefined;
}

/**
 * @internal
 */
export const registrationQueue: (() => void)[] = [];
