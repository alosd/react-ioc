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

/**
 * @internal
 */
export type InstancePromise<T extends new (...args: any) => any> =  T extends Constructor<infer C> ? Promise<C> : Promise<T>;

/**
 * @internal
 */
export type PromisifyArray<T extends [any, ...any[]]> = [  
  InstancePromise<T[0]>,
  InstancePromise<T[1]>,
  InstancePromise<T[2]>,
  InstancePromise<T[3]>,
  InstancePromise<T[4]>,
  InstancePromise<T[5]>,
  InstancePromise<T[6]>,
  InstancePromise<T[7]>,
  InstancePromise<T[8]>,
  InstancePromise<T[9]>,
  InstancePromise<T[10]>
];