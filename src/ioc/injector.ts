import { Component, createContext } from 'react';
import { logNotFoundDependency } from './errors';
import { Token } from './types';

/* istanbul ignore next */
export const INJECTOR: unique symbol = (typeof Symbol === 'function' ? Symbol() : '__injector__') as any;

interface InjectedInstance {
	[INJECTOR]?: Injector;
}

/** React Context for Injector */
export const InjectorContext = createContext<{ injector?: Injector }>({});

/**
 * Dependency injection container
 * @internal
 */
export abstract class Injector<P = {}> extends Component<P> {
	_parent!: Injector;

	_bindingMap!: Map<Token, Function>;

	_instanceMap!: Map<Token, Object>;
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
	injector = currentInjector || (target as Component).context;
	if (injector instanceof Injector) {
		(target as InjectedInstance)[INJECTOR] = injector;
		return injector;
	}
	return undefined;
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
export function getInstance(injector: Injector | undefined, token: Token) {
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
		const binding = injector._bindingMap.get(token);
		if (binding) {
			const prevInjector = currentInjector;
			currentInjector = injector;
			try {
				instance = binding(injector);
			} finally {
				currentInjector = prevInjector;
			}
			injector._instanceMap.set(token, instance);
			return instance;
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
