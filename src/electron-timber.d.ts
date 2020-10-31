declare module 'electron-timber' {
	export = logger;
	declare const logger: Timber;

	declare class Timber {
		constructor(options?: Record<string, unknown>);
		_initialOptions: Record<string, unknown>;
		isEnabled: boolean;
		name: any;
		_prefixColor: any;
		_timers: Map<any, any>;
		get _options(): any;
		get _console(): Record<string, unknown>;
		_getPrefix(): any;
		log(...arguments_: any[]): void;
		warn(...arguments_: any[]): void;
		error(...arguments_: any[]): void;
		time(label?: string): void;
		timeEnd(label?: string): void;
		streamLog(stream: any): void;
		streamWarn(stream: any): void;
		streamError(stream: any): void;
		create(...arguments_: any[]): Timber;
		getDefaults(): any;
		setDefaults(newDefaults?: Record<string, unknown>): void;
	}
}
