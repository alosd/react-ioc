import { Draft, createDraft, finishDraft, immerable } from 'immer';
import { logError } from '../ioc/errors';
import { InjectedService } from '../ioc/provider';

export const PROVIDER: unique symbol = (typeof Symbol === 'function' ? Symbol() : '__store__') as any;
export const STORES: unique symbol = (typeof Symbol === 'function' ? Symbol() : '__stores__') as any;
export const REFRESH: unique symbol = (typeof Symbol === 'function' ? Symbol() : '__refresh__') as any;

/**
 * @internal
 */
export interface ImmutableServiceInternal {
	[REFRESH]?: () => void;
	[PROVIDER]: MutationProvider;
	[STORES]: string[];
	[index: string]: any;
	RefreshContext(): void;
}

/**
 * @internal
 */

class MutationProvider {
	private count = 0;
	private draft?: Draft<ImmutableServiceInternal>;
	private service: ImmutableServiceInternal;
	constructor(service: ImmutableService) {
		this.service = (service as unknown) as ImmutableServiceInternal;
	}
	start(inc = true) {
		if (this.count == 0) {
			const draft = (this.draft = this.draft ?? createDraft(this.service));

			this.service[STORES].forEach(x => {
				this.service[x] = draft[x];
			});
		}
		if (inc) this.count++;
	}
	finish(refresh: boolean = true, dec = true) {
		if (this.count == 0) {
			console.warn('the finish method must be called after corresponding start method');
		} else {
			if (dec) this.count--;
			if (this.count == 0) {
				const draft = this.draft;
				if (draft) {
					this.service[STORES].forEach(x => {
						draft[x] = this.service[x];
					});
					const newstate = finishDraft(draft);
					this.service[STORES].forEach(x => {
						this.service[x] = newstate[x];
					});
					this.draft = undefined;
				} else {
					if (__DEV__) {
						logError('previous state is absent');
					}
				}
			}
		}

		if (refresh) {
			this.service.RefreshContext();
		}
	}
}

// @ts-ignore
export abstract class ImmutableService extends InjectedService {
	private [REFRESH]: () => void;
	// @ts-ignore
	private [STORES]: string[];
	// @ts-ignore
	private [PROVIDER]: MutationProvider;
	// @ts-ignore
	private [immerable]: boolean;

	// @ts-ignore
	private initProvider(refresh: () => void) {
		this[REFRESH] = refresh;
		this[PROVIDER].start();
		this[PROVIDER].finish();
	}

	protected RefreshContext() {
		if (this[REFRESH]) {
			this[REFRESH]();
		}
	}
	constructor() {
		super();
		this[STORES] = this[STORES] ?? [];
		this[immerable] = true;
		this[PROVIDER] = new MutationProvider(this);
	}

	protected async waitForAsync<T>(promise: Promise<T>) {
		this[PROVIDER].finish(true, false);
		try {
			return await promise;
		} finally {
			this[PROVIDER].start(false);
		}
	}
}
