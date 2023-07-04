import { ImmutableServiceInternal, ImmutableService, STORES, PROVIDER } from './service';

/**
 * Property Decorator convert property to immutable
 * Changes for such property allowed only from methods marked with @action or @asyncAction decorator
 */
export function store() {
	return function(target: ImmutableService, propertyKey: string) {
		const service = (target as unknown) as ImmutableServiceInternal;
		service[STORES] = service[STORES] ?? [];
		service[STORES].push(propertyKey);
	};
}

/**
 * Method decorator allow to change properties marked with @store within method.
 * After method execution, the React Context in which the service is located will be updated
 */
// export function asyncAction() {
// 	return function(target: ImmutableService, propertyKey: string, descriptor: PropertyDescriptor) {
// 		const fn = descriptor.value as Function;
// 		descriptor.value = async function(args: any[]) {
// 			(this as ImmutableServiceInternal)[PROVIDER].start();
// 			let res = undefined;
// 			try {
// 				res = await fn.call(this, args);
// 			} finally {
// 				(this as ImmutableServiceInternal)[PROVIDER].finish();
// 			}

// 			return res;
// 		};
// 	};
// }

const waitForFinish = async (service: ImmutableServiceInternal, promise: Promise<any>) => {
	try {
		return await promise;
	} finally {
		service[PROVIDER].finish();
	}
};
const checkForPromise = (value: any) => {
	//return value instanceof Promise
	return value && typeof value['then'] === 'function';
};
/**
 * Method decorator allow to change properties marked with @store within method.
 * After method execution, the React Context in which the service is located will be updated
 */
export function action() {
	return function(_target: ImmutableService, _propertyKey: string, descriptor: PropertyDescriptor) {
		const fn = descriptor.value as Function;
		descriptor.value = function(args: any[]) {
			(this as ImmutableServiceInternal)[PROVIDER].start();

			let isPromise = false;
			try {
				let res = fn.call(this, args);
				isPromise = checkForPromise(res);
				if (isPromise) {
					return waitForFinish(this as ImmutableServiceInternal, res);
				} else {
					return res;
				}
			} finally {
				if (!isPromise) {
					(this as ImmutableServiceInternal)[PROVIDER].finish();
				}
			}
		};
	};
}
