import { createElement, FC, Fragment, PropsWithChildren, useMemo } from 'react';
import { Definition } from './ioc/types';
import { provider } from './ioc';

const ComponentWithService: FC<PropsWithChildren> = ({ children }) => createElement(Fragment, null, children);

export const ComponentWithServices: FC<PropsWithChildren<{
	services: Definition[];
}>> = ({ services, children }) => {
	const instance = useMemo(() => provider(...services)(ComponentWithService), []);
	return createElement(instance, null, children);
};
