import { Context, PropsWithChildren } from 'react';

type ClassDecorator = <T extends Function>(target: T) => T;
export type Constructor<T> = new (...args: any[]) => T;
export type Token = Function | Object | string | symbol;
type InstancePromise<T extends new (...args: any) => any> = T extends Constructor<infer C> ? Promise<C> : Promise<T>;
type PromisifyArray<T extends [any, ...any[]]> = [
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

export type DefinitionObject = { token: Token; binding: Function; useExisting?: boolean };
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
type BindingFunction = Function;
export type ProviderOptions = {
	autoCreateBinding: (token: Token, resolve: (token: Token) => any) => BindingFunction | undefined;
};
export declare function provider(options: ProviderOptions, ...definitions: Definition[]): <T extends Function>(target: T) => ProviderMixin<T>;
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
export declare function useInstances<T extends [...any[]]>(...tokens: { [K in keyof T]: Constructor<T[K]> | Token }): T;

export declare function configureBinding<T>(binding: T, options?: { pre?: Function; post?: (instance: any) => void; useExisting?: boolean }): T;
/**
 * Bind dependency to specified class.
 * @param cosntructor Constructor
 * @returns Dependency resolver
 */
export declare const toClass: (cosntructor: Constructor<any>) => Function;

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
export declare function toFactory<T extends (resolve: (token: Token) => any) => any>(factory: T): Function;

/**
 * Bind dependency to specified factory funciton.
 * @param deps Factory dependencies
 * @param factory Factory
 * @returns Dependency resolver
 */
export declare function toFactory<T extends [any, ...any[]]>(deps: { [K in keyof T]: Constructor<T[K]> | Token }, factory: (...args: T) => any): Function;

/**
 * Bind dependency to specified factory funciton.
 * @param deps Factory dependencies
 * @param factory Factory
 * @returns Dependency resolver
 */
export declare function toFactory<T extends [...any[]]>(deps: { [K in keyof T]: Constructor<T[K]> | Token }, factory: (...args: T) => any): Function;

/**
 * Bind async dependency to specified factory funciton.
 * @param deps Factory dependencies
 * @param factory Factory
 * @returns Dependency resolver
 */
export declare function toAsyncFactory<T extends [any, ...any[]]>(deps: { [K in keyof T]: Constructor<T[K]> | Token }, factory: (...args: PromisifyArray<T>) => any): Function;
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
export declare const ComponentWithServices: React.FC<PropsWithChildren<{
	services: Definition[];
	/* 	deps?: React.DependencyList; */
}>>;

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
