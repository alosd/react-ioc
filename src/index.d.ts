import { Context } from 'react';

type ClassDecorator = <T extends Function>(target: T) => T;
type Constructor<T> = new (...args: any[]) => T;
type Token = Function | Object | string | symbol;
export type DefinitionObject = { token: Token; binding: Function };
export type Definition = Function | [Function] | [Token, Function] | DefinitionObject;
type Provider = {
	/**
	 * Register dependency injection bindings in scope of decorated class
	 * @param definitions Dependency injection configuration
	 * @returns Decorated constructor
	 */
	register(...definitions: Definition[]): void;
};
type ProviderMixin<T> = T &
	Provider & {
		contextType: typeof InjectorContext;
		WrappedComponent: T;
	};

declare module 'react' {
	namespace Component {
		function register(...definitions: Definition[]): void;
	}
}

export declare const InjectorContext: Context<Function>;

/**
 * Decorator or HOC that register dependency injection bindings
 * in scope of decorated class
 * @param definitions Dependency injection configuration
 * @returns Decorator or HOC
 */
export declare function provider(...definitions: Definition[]): <T extends Function>(target: T) => ProviderMixin<T>;

/**
 * Decorator that lazily registers class in scope of specified Provider.
 * @param getProvider Lambda function that returns Provider
 * @param biding Dependency injection binding
 * @returns Decorator
 */
export declare function registerIn(getProvider: () => Provider, biding?: Function): <T extends Function>(target: T) => T;

/**
 * Property decorator that resolves a class instance
 * which registered by some Provider in hierarchy.
 * Instance is cached in Provider that registers it's class.
 * @param token Dependency injection token
 * @returns Property decorator
 */
export declare function inject(token?: Token): PropertyDecorator;
/**
 * Property decorator that resolves a class instance
 * which registered by some Provider in hierarchy.
 * Instance is cached in Provider that registers it's class.
 */
export declare function inject(target: Object, key: string | symbol): void;
/**
 * Create a class instance that registered by some Provider in hierarchy.
 * Instance is cached in Provider that registers it's class.
 * @param target The object in which we inject class instance
 * @param token Dependency injection token
 * @returns Resolved class instance
 */
export declare function inject<T>(target: Object, token: Constructor<T> | Token): T;

/**
 * React hook for resolving a class instance that registered by some Provider in hierarchy.
 * Instance is cached in Provider that registers it's class.
 * @param token Dependency injection token
 * @returns Resolved class instance
 */
export declare function useInstance<T>(token: Constructor<T> | Token): T;

/**
 * React hook for resolving a class instances that registered by some Provider in hierarchy.
 * Instances are cached in Provider that registers it's classes.
 * @param tokens Dependency injection tokens
 * @returns Resolved class instances
 */
export declare function useInstances<T extends [any, ...any[]]>(...tokens: { [K in keyof T]: Constructor<T[K]> | Token }): T;

/**
 * Bind dependency to specified class.
 * @param cosntructor Constructor
 * @returns Dependency resolver
 */
export declare function toClass(cosntructor: Constructor<any>): Function;

/**
 * Bind dependency to specified value.
 * @param value Any value
 * @returns Dependency resolver
 */
export declare function toValue(value: any): Function;

/**
 * Bind dependency to specified factory funciton.
 * @param factory Factory
 * @returns Dependency resolver
 */
export declare function toFactory(factory: () => any): Function;
/**
 * Bind dependency to specified factory funciton.
 * @param deps Factory dependencies
 * @param factory Factory
 * @returns Dependency resolver
 */
export declare function toFactory<T extends [any, ...any[]]>(deps: { [K in keyof T]: Constructor<T[K]> | Token }, factory: (...args: T) => any): Function;

/**
 * Bind dependency to existing instance located by token.
 * @param token Dependency injection token
 * @returns Dependency resolver
 */
export declare function toExisting(token: Token): Function;

export { inject as Inject, provider as Provider, registerIn as RegisterIn };

export abstract class InjectedService {
	abstract initProvider(refresh: () => void): void;
}
export declare abstract class ImmutableService {
	protected RefreshContext(): void;

	protected waitForAsync<T>(promise: Promise<T>): Promise<T>;
}

/**
 * Component wrapped with provider with injected bindings
 * @param deps Services dependency list ,If present, provider (with all injected services) will be re-created if the values in the list change.
 */
export declare const ComponentWithServices: React.VFC<{
	services: Definition[];
	/* 	deps?: React.DependencyList; */
}>;

/**
 * Property Decorator convert property to immutable
 * Changes for such property allowed only from methods marked with @action or @asyncAction decorator
 */
export declare function store(): (target: ImmutableService, propertyKey: string) => void;

/**
 * Method decorator allow to change properties marked with @store within method.
 * After method execution, the React Context in which the service is located will be updated
 */
export function action(): (target: ImmutableService, propertyKey: string, descriptor: PropertyDescriptor) => void;

//export function asyncAction():(target: ImmutableService, propertyKey: string, descriptor: PropertyDescriptor)=>void;

/** Get the underlying object from immutable value */
export declare function original<T>(value: T): T | undefined;

export declare function enableES5(): void;

export declare function enableMapSet(): void;

/* Lite Event exports */
type ActionsType<T> = (data?: T) => void;

export interface LiteEvent<T = void> {
	on(handler: ActionsType<T>): ActionsType<T>;
	off(handler: ActionsType<T>): void;
}

export declare class LiteEventImpl<T = void> implements LiteEvent<T> {
	on(handler: ActionsType<T>): ActionsType<T>;
	off(handler: ActionsType<T>): void;
	trigger(data: T): void;
}
