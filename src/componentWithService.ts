import { createElement, FC, useCallback, DependencyList } from 'react';
import { Definition } from './ioc/types';
import { provider } from './ioc';

export const ComponentWithServices: FC<{
	services: Definition[];
	deps?: DependencyList;
}> = ({ services, children, deps }) => {
	const ComponentWithService = useCallback(
		(() => {
			const fn = () => children;
			if (__DEV__) {
				fn.displayName = 'ComponentWithServices.Children';
			}
			return provider(...services)(fn as FC) as FC;
		})(),
		deps ?? []
	);
	return createElement(ComponentWithService);
};
