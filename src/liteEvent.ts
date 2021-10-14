/* Lite Event exports */
type ActionsType<T> = (data?: T) => void;

export interface LiteEvent<T = void> {
	on(handler: ActionsType<T>): ActionsType<T>;
	off(handler: ActionsType<T>): void;
}

export class LiteEventImpl<T = void> implements LiteEvent<T> {
	private handlers: ActionsType<T>[] = [];

	// on(handler: () => void): () => void;

	on(handler: ActionsType<T>) {
		this.handlers.push(handler);
		return handler;
	}

	off(handler: ActionsType<T>) {
		this.handlers = this.handlers.filter(h => h !== handler);
	}

	trigger(data: T) {
		this.handlers.slice(0).forEach(h => h(data!));
	}
}
