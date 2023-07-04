import { createElement, FC, /* useCallback, DependencyList, */ useRef, Fragment, PropsWithChildren } from 'react';
import { Definition } from './ioc/types';
import { provider } from './ioc';

const ComponentWithService: FC<PropsWithChildren> = ({ children }) => createElement(Fragment, null, children);

export const ComponentWithServices: FC<PropsWithChildren<{
	services: Definition[];
}>> = ({ services, children }) => {
	const ref = useRef(provider(...services)(ComponentWithService));
	return createElement(ref.current, null, children);
};
