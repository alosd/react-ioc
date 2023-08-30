import { createElement, ComponentType, ComponentClass, ReactNode } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { AUTO_BINDING, BindingFunction, Injector, InjectorContext, registrationQueue } from './injector';
import { addBindings } from './bindings';
import { isObject, isFunction, Definition, Token } from './types';
import { logError, getDebugName } from './errors';

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

const Initialized: unique symbol = (typeof Symbol === 'function' ? Symbol() : '__init__') as any;
export abstract class InjectedService {
	[Initialized]?: boolean;
	abstract initProvider(refresh: () => void): void;
}

type ProviderOptions = {
	autoCreateBinding: (token: Token) => BindingFunction;
};

/**
 * Decorator or HOC that register dependency injection bindings
 * in scope of decorated class
 * @param definitions Dependency injection configuration
 * @returns Decorator or HOC
 */

export const provider: (...args: any[]) => <P = {}>(target: ComponentType<P>) => ProviderMixin<ComponentType<P>> = (...args: any[]) => Wrapped => {
	let options: ProviderOptions;
	let definitions: Definition[];
	[options, ...definitions] = args;
	if (typeof options != 'object' || !options.autoCreateBinding) {
		[...definitions] = args;
		options = {} as any;
	}

	const bindingMap = new Map<Token, BindingFunction>();

	if (options.autoCreateBinding) {
		const _autoBind = options.autoCreateBinding;
		options.autoCreateBinding = token => {
			const fn = _autoBind(token);
			fn[AUTO_BINDING] = true;
			addBindings(bindingMap, [{ token, binding: fn }]);
			return null as any;
		};
	}

	addBindings(bindingMap, definitions);

	class Provider extends Injector {
		_parent = (this.context as any)?.injector as Injector;
		_bindingMap = bindingMap;
		_instanceMap = new Map();
		_asyncInstanceMap = new Map();
		_autoFactory = options.autoCreateBinding;
		state = { injector: this };

		_initInstance(instance: Object) {
			if (instance instanceof InjectedService && !instance[Initialized]) {
				instance.initProvider(() => {
					this.setState({ injector: this });
					this._childNotifications.trigger();
				});
				instance[Initialized] = true;
			}
		}

		componentDidMount() {
			this._instanceMap.forEach(instance => {
				this._initInstance(instance);
			});
		}

		componentWillUnmount() {
			this._instanceMap.forEach(instance => {
				if (isObject(instance) && isFunction(instance.dispose)) {
					instance.dispose();
				}
			});
		}

		render(): ReactNode {
			return createElement(InjectorContext.Provider, { value: this.state }, createElement(Wrapped as any, this.props as any));
		}

		static WrappedComponent = Wrapped;

		/**
		 * Register dependency injection bindings in scope of decorated class
		 * @param {...Definition} definitions Dependency injection configuration
		 */
		static register(...definitions: Definition[]) {
			addBindings(bindingMap, definitions);
		}
	}

	if (__DEV__) {
		(Provider as ComponentClass).displayName = `Provider(${Wrapped.displayName || Wrapped.name})`;

		Object.defineProperty(Provider, 'contextType', {
			get() {
				return InjectorContext;
			},
			set() {
				logError(`You are trying to overwrite ${(Provider as ComponentClass).displayName}.contextType = InjectorContext`);
			}
		});
	} else {
		Provider.contextType = InjectorContext;
	}

	// static fields from component should be visible on the generated Consumer
	return hoistNonReactStatics((Provider as unknown) as ComponentType<any>, Wrapped) as any;
};

/**
 * Decorator that lazily registers class in scope of specified Provider.
 * @param getProvider Lambda function that returns Provider
 * @param biding Dependency injection binding
 * @returns Decorator
 */

export const registerIn: <T extends Function>(getProvider: () => Provider, binding?: Function) => (target: T) => T = (getProvider, binding) => constructor => {
	registrationQueue.push(() => {
		if (__DEV__) {
			const provider = getProvider();
			if (!isFunction(provider) || !(provider.prototype instanceof Injector)) {
				logError(`${getDebugName(provider)} is not a valid Provider. Please use:\n` + `@registerIn(() => MyProvider)\n` + `class ${getDebugName(constructor)} {}\n`);
			} else {
				provider.register(binding ? [constructor, binding] : constructor);
			}
		} else {
			getProvider().register(binding ? [constructor, binding] : constructor);
		}
	});
	return constructor;
};
