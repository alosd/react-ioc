import { createElement, FC, useCallback, DependencyList, Fragment } from 'react';
import { Definition } from './ioc/types';
import { provider } from './ioc';

export const ComponentWithServices: FC<{
	services: Definition[];
	deps?: DependencyList;
}> = ({ services, children, deps }) => {
	const ComponentWithService = useCallback(provider(...services)(() => createElement(Fragment, {}, children)) as FC, deps ?? []);
	return createElement(ComponentWithService);
};
