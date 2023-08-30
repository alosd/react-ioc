import { isFunction, isObject, isReactComponent, Token } from './types';
import { ComponentType, ComponentClass, Component } from 'react';

/**
 * @internal
 */
export function getDebugName(value: ComponentType | Component | Object) {
	if (isFunction(value)) {
		return String((value as ComponentClass).displayName || value.name);
	}
	if (isObject(value) && isFunction(value.constructor)) {
		return String(value.constructor.name);
	}
	return String(value);
}

/**
 * @internal
 */
export function logError(message?: string) {
	try {
		throw new Error(message);
	} catch (e) {
		console.error(e);
	}
}

/**
 * @internal
 */
export function logIncorrectBinding(token: Token, binding: Function | Object) {
	const tokenName = getDebugName(token);
	const bindingName = getDebugName(binding);
	logError(`Binding [${tokenName}, ${bindingName}] is incorrect.`);
}

/**
 * @internal
 */
export function logNotFoundDependency(token: Token) {
	const name = getDebugName(token);
	logError(
		`Dependency ${name} is not found.
Please register ${name} in some Provider e.g.
@provider([${name}, ${name}])
class App extends React.Component { /*...*/ }`
	);
}

/**
 * @internal
 */
export function logNotFoundProvider(target?: Object) {
	if (isReactComponent(target)) {
		const name = getDebugName(target!);
		logError(
			`Provider is not found.
  Please define Provider and set ${name}.contextType = InjectorContext e.g.
  @provider([MyService, MyService])
  class App extends React.Component { /*...*/ }
  class ${name} extends React.Component {
    static contextType = InjectorContext;
  }`
		);
	} else {
		logError(
			`Provider is not found.
  Please define Provider e.g.
  @provider([MyService, MyService])
  class App extends React.Component { /*...*/ }`
		);
	}
}

/**
 * @internal
 */
export function logInvalidMetadata(target: Object, token: Token) {
	const tokenName = getDebugName(token);
	const targetName = getDebugName(target);
	logError(
		`${tokenName} is not a valid dependency.
Please specify ES6 class as property type e.g.
class MyService {}
class ${targetName} {
  @inject myService: MyService;
}`
	);
}
