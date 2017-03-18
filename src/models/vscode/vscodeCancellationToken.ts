export interface IVSCodeCancellationToken {
  readonly isCancellationRequested: boolean;
	/**
	 * An event emitted when cancellation is requested
	 * @event
	 */
  readonly onCancellationRequested: IEvent<any>;
}

type IEvent<T> = (listener: (e: T) => any, thisArgs?: any, disposables?: IDisposable[]) => IDisposable;

interface IDisposable {
    dispose(): void;
  }
