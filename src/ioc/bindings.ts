import { INJECTOR, getInstance, Injector, BindingFunction as BindingFunctionI, EXISING_BINDING, AUTO_BINDING } from './injector';
import { isFunction, isToken, Token, Constructor, Definition, DefinitionObject, PromisifyArray, isObject } from './types';
import { logIncorrectBinding, logError, getDebugName } from './errors';

const IS_BINDING: unique symbol = Symbol();

interface BindingMark {
	[IS_BINDING]?: boolean;
	[AUTO_BINDING]?: boolean;
}

export type BindingFunction = BindingFunctionI & BindingMark;
interface InjectedInstance {
	[INJECTOR]?: Injector;
}
/**
 * Bind type to specified class.
 * @param constructor Service constructor
 * @returns Dependency resolver
 */
export function toClass<T>(constructor: Constructor<T>) {
	if (__DEV__) {
		if (!isFunction(constructor)) {
			logError(`Class ${getDebugName(constructor)} is not a valid dependency`);
		}
	}
	return asBinding(injector => {
		const instance = new constructor() as InjectedInstance;
		if (!instance[INJECTOR]) {
			instance[INJECTOR] = injector;
		}
		return instance;
	});
}

/**
 * Bind dependency to specified factory funciton.
 * @param factory Factory
 * @returns Dependency resolver
 */
export function toFactory<T>(factory: (resolve: (token: Token) => any) => T): Function;
/**
 * Bind dependency to specified factory funciton.
 * @param deps Factory dependencies
 * @param factory Factory
 * @returns Dependency resolver
 */
export function toFactory<T extends [any, ...any[]]>(deps: { [K in keyof T]: Constructor<T[K]> | Token }, factory: (...args: T) => any): Function;
export function toFactory(depsOrFactory?: any, factory?: any) {
	if (__DEV__) {
		if (factory) {
			if (!Array.isArray(depsOrFactory)) {
				logError(`Dependency array ${getDebugName(depsOrFactory)} is invalid`);
			}
			if (!isFunction(factory)) {
				logError(`Factory ${getDebugName(factory)} is not a valid dependency`);
			}
		} else if (!isFunction(depsOrFactory)) {
			logError(`Factory ${getDebugName(depsOrFactory)} is not a valid dependency`);
		}
	}
	return asBinding(
		injector=>{
            const instance = factory ? factory(...depsOrFactory.map((token: Token) => getInstance(injector, token))) :  depsOrFactory((token: Token) => getInstance(injector, token));
            if (isObject(instance)){
                if (!instance[INJECTOR]) {
                    instance[INJECTOR] = injector;
                } 
            }
            return instance;
        }	
	);
}

export function configureBinding(
	fn: BindingFunction,
	options?: {
		pre?: () => void;
		post?: (instance: any) => void;
		useExisting?: boolean;
	}
) {
	const { pre, post, useExisting } = options || {};
	if (pre) {
		fn.pre = pre;
	}
	if (post) {
		fn.post = post;
	}
	if (typeof useExisting == 'boolean') {
		fn[EXISING_BINDING] = useExisting;
	}
	return fn;
}

export function toAsyncFactory<T extends [any, ...any[]]>(deps: { [K in keyof T]: Constructor<T[K]> | Token }, factory: (...args: PromisifyArray<T>) => any) {
	return asBinding(injector => factory(...(deps.map((token: Token) => Promise.resolve(getInstance(injector, token))) as PromisifyArray<T>)));
}
/**
 * Bind type to specified value.
 * @param  value
 * @returns Dependency resolver
 */
export function toValue(value: any) {
	if (__DEV__) {
		if (value === undefined) {
			logError(`Please specify some value`);
		}
	}
	return  asBinding((injector) => {
		if (isObject(value)){
            if (!value[INJECTOR]) {
                value[INJECTOR] = injector;
            } 
        }
        return value;
	    });
}

/**
 * Bind type to existing instance located by token.
 * @param {Token} token
 * @return Dependency resolver
 */
export function toExisting(token: Token) {
	if (__DEV__) {
		if (!isFunction(token)) {
			logError(`Token ${getDebugName(token)} is not a valid dependency injection token`);
		}
	}
	return asBinding(injector => getInstance(injector, token));
}

/**
 * Mark function as binding function.
 * @internal
 * @param {Function} binding
 * @returns {Function}
 */
function asBinding(binding: BindingFunction): Function {
	binding[IS_BINDING] = true;
	return binding;
}

/**
 * Add bindings to bindings Map
 * @internal
 */
export function addBindings(bindingMap: Map<Token, Function>, definitions: Definition[]) {
	definitions.forEach(definition => {
		let token, binding;
		const isDef = typeof definition == 'object' && (definition as DefinitionObject).token && (definition as DefinitionObject).binding;
		if (isDef) {
			token = (definition as DefinitionObject).token;
			binding = (definition as DefinitionObject).binding;
		} else if (Array.isArray(definition)) {
			[token, binding = token] = definition;
		} else {
			token = binding = definition;
		}
		if (__DEV__) {
			if (!isToken(token) || !isFunction(binding)) {
				logIncorrectBinding(token, binding as Object);
			}
		}
		// @ts-ignore
		bindingMap.set(token, binding[IS_BINDING] ? binding : toClass(binding));
		if (isDef && typeof (definition as DefinitionObject).useExisting === 'boolean') {
			(bindingMap.get(token) as BindingFunction)[EXISING_BINDING] = (definition as DefinitionObject).useExisting;
		}
	});
}
