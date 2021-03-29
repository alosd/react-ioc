import { createElement, FC, /* useCallback, DependencyList, */ useRef, Fragment } from 'react';
import { Definition } from './ioc/types';
import { provider } from './ioc';

const ComponentWithService: FC = ({ children }) => createElement(Fragment, null, children);

export const ComponentWithServices: FC<{
	services: Definition[];
}> = ({ services, children }) => {
	const ref = useRef(provider(...services)(ComponentWithService));
	return createElement(ref.current, null, children);
};
