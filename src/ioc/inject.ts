import 'reflect-metadata';
import { InjectorContext, getInjector, getInstance, InjectedPromiseProp, InjectedPromise } from './injector';
import { isValidMetadata, isReactComponent, isFunction, Constructor, Token } from './types';
import { getDebugName, logInvalidMetadata, logNotFoundProvider, logError } from './errors';
import { ComponentClass } from 'react';

/**
 * Property decorator that resolves a class instance
 * which registered by some Provider in hierarchy.
 * Instance is cached in Provider that registers it's class.
 * @param token Dependency injection token
 * @returns Property decorator
 */
export function inject(token?: Token): PropertyDecorator;

/**
 * Property decorator that resolves a class instance
 * which registered by some Provider in hierarchy.
 * Instance is cached in Provider that registers it's class.
 */
export function inject(target: Object, key: string | symbol): void;
/**
 * Create a class instance that registered by some Provider in hierarchy.
 * Instance is cached in Provider that registers it's class.
 * @param target The object in which we inject class instance
 * @param token Dependency injection token
 * @returns Resolved class instance
 */
export function inject<T>(target: Object, token: Constructor<T> | Token): T;

export function inject<T>(targetOrToken?: Object | Token, keyOrToken?: string | symbol | Token | Constructor<T>) {
	if (isFunction(keyOrToken)) {
		return injectFunction(targetOrToken as Object, keyOrToken);
	}

	let token = targetOrToken as Object;
	if (!keyOrToken) {
		return injectDecorator;
	}
	return injectDecorator(token, keyOrToken as string | symbol);

	function injectDecorator(prototype: Object, key: string | symbol) {
		if (__DEV__) {
			defineContextType(prototype);
		} else {
			(prototype.constructor as ComponentClass).contextType = InjectorContext;
		}

		if (!token) {
			token = Reflect.getMetadata('design:type', prototype, key);
			if (__DEV__) {
				if (!isValidMetadata(token)) {
					logInvalidMetadata(targetOrToken as Object, token);
				}
			}
		}

		const descriptor = {
			configurable: true,
			enumerable: true,
			get() {
				const instance = injectFunction(this, token);
				if (instance instanceof Promise && (instance as InjectedPromise<any>)[InjectedPromiseProp]) {
					console.warn(
						`%c Possible problem - trying to access an incompletely initialized property ${this.constructor.name}.${key as string} - probably a circular reference`,
						'color:red'
					);
					instance.then(value => {
						Object.defineProperty(this, key, {
							enumerable: true,
							writable: true,
							value
						});
					});
				}
				Object.defineProperty(this, key, {
					enumerable: true,
					writable: true,
					value: instance
				});
				return instance;
			},
			set(instance: Object) {
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
function injectFunction(target: Object, token: Token) {
	const injector = getInjector(target);
	if (__DEV__) {
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
function defineContextType(prototype: Object) {
	if (isReactComponent(prototype)) {
		const constructor = prototype.constructor;
		const className = getDebugName(constructor);
		if ((constructor as ComponentClass).contextType !== InjectorContext) {
			if ((constructor as ComponentClass).contextType) {
				logError(`Decorator tries to overwrite existing ${className}.contextType`);
			} else {
				Object.defineProperty(constructor, 'contextType', {
					get() {
						return InjectorContext;
					},
					set() {
						logError(`You are trying to overwrite ${className}.contextType = InjectorContext`);
					}
				});
			}
		}
	}
}
