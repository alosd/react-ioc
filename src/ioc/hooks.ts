import { useContext, useEffect, useRef, useState } from 'react';
import { InjectorContext, getInstance, Injector } from './injector';
import { logNotFoundProvider } from './errors';
import { Token } from './types';

/**
 * React hook for resolving a class instance that registered by some Provider in hierarchy.
 * Instance is cached in Provider that registers it's class.
 * @param  token Dependency injection token
 * @returns Resolved class instance
 */
export function useInstance(token: Token) {
	const ref = useRef<Object | undefined>(undefined);
	const injector = useContext(InjectorContext)?.injector;
	if (__DEV__) {
		if (!injector) {
			logNotFoundProvider();
		}
	}
	const result = ref.current || (ref.current = getInstance(injector, token));

	const [, updater] = useState({});
	const refUpd = useRef({ updater });
	useEffect(() => {
		// if token found in nearest provider - no update is required - useContext already invoke rerender,
		// otherwise we should manually refresh component
		let event: () => void;
		let publisher: Injector;
		if (injector && result) {
			if (!injector._instanceMap.has(token)) {
				let i = injector._parent;
				while (i) {
					if (i._instanceMap.has(token)) {
						publisher = i;
						event = i._childNotifications.on(() => refUpd.current.updater({}));
					}
					i = i._parent;
				}
			}
		}

		return () => {
			refUpd.current.updater = () => {};
			if (publisher) {
				publisher._childNotifications.off(event);
			}
		};
	}, []);

	return result;
}

/**
 * React hook for resolving a class instances that registered by some Provider in hierarchy.
 * Instances are cached in Provider that registers it's classes.
 * @param  tokens Dependency injection tokens
 * @returns Resolved class instances
 */
export function useInstances(...tokens: Token[]) {
	const ref = useRef<(Object | undefined)[] | null>(null);
	const injector = useContext(InjectorContext)?.injector;
	if (__DEV__) {
		if (!injector) {
			logNotFoundProvider();
		}
	}

	const result = ref.current || (ref.current = tokens.map(token => getInstance(injector, token)));

	const [, updater] = useState({});
	const refUpd = useRef({ updater });
	useEffect(() => {
		// if token found in nearest provider - no update is required - useContext already invoke rerender,
		// otherwise we should manually refresh component
		const subscriptions: { event: () => void; publisher: Injector }[] = [];

		if (injector) {
			tokens.forEach(token => {
				if (!injector._instanceMap.has(token)) {
					let i = injector._parent;
					while (i) {
						if (i._instanceMap.has(token)) {
							subscriptions.push({
								publisher: i,
								event: i._childNotifications.on(() => refUpd.current.updater({}))
							});
						}
						i = i._parent;
					}
				}
			});
		}

		return () => {
			refUpd.current.updater = () => {};
			subscriptions.forEach(s => s.publisher._childNotifications.off(s.event));
		};
	}, []);
	return result;
}
