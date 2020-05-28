import { useContext, useRef } from "react";
import { InjectorContext, getInstance } from "./injector";
import { logNotFoundProvider } from "./errors";
import type { Token } from './types';

/**
 * React hook for resolving a class instance that registered by some Provider in hierarchy.
 * Instance is cached in Provider that registers it's class.
 * @param  token Dependency injection token
 * @returns Resolved class instance
 */
export function useInstance(token:Token) {
  const ref = useRef<Object|undefined>(undefined);
  const injector = useContext(InjectorContext)?.injector;
  if (__DEV__) {
    if (!injector) {
      logNotFoundProvider();
    }
  }
  return ref.current || (ref.current = getInstance(injector, token));
}

/**
 * React hook for resolving a class instances that registered by some Provider in hierarchy.
 * Instances are cached in Provider that registers it's classes.
 * @param  tokens Dependency injection tokens
 * @returns Resolved class instances
 */
export function useInstances(...tokens:Token[]) {
  const ref = useRef<(Object|undefined)[] |  null>(null);
  const injector = useContext(InjectorContext)?.injector;
  if (__DEV__) {
    if (!injector) {
      logNotFoundProvider();
    }
  }
  return (
    ref.current ||
    (ref.current = tokens.map(token => getInstance(injector, token)))
  );
}
