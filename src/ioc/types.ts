export type Token = Function | Object | string | symbol;
export type DefinitionObject = { token: Token; binding: Function };
export type Definition = Function | [Function] | [Token, Function] | DefinitionObject;

export type Constructor<T> = new (...args: any[]) => T;

/**
 * @internal
 */
export function isFunction(arg: any): arg is Function {
	return typeof arg === 'function';
}

/**
 * @internal
 */
export function isObject(arg: any): arg is Object {
	return arg && typeof arg === 'object';
}

/**
 * @internal
 */
export function isString(arg: any): arg is string {
	return typeof arg === 'string';
}

/**
 * @internal
 */
export function isSymbol(arg: any): arg is symbol {
	return typeof arg === 'symbol';
}

/**
 * @internal
 */
export function isToken(arg: any): arg is Token {
	return isFunction(arg) || isObject(arg) || isString(arg) || isSymbol(arg);
}

/**
 * @internal
 */
export function isReactComponent(prototype: any) {
	return isObject(prototype) && isObject(prototype.isReactComponent);
}

/**
 * @internal
 */
export function isValidMetadata(arg: any): arg is Function {
	return isFunction(arg) && [Object, Function, Number, String, Boolean].indexOf(arg) === -1;
}
