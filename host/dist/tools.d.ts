import type { Disposer, DshHostContext, DshToolDefinition } from './types/dshContext.ts';
import type { HealthSignal } from './model/healthSignal.ts';
import type { HostLightApi } from './hostLightApi.ts';
export declare function hintFor(signal: HealthSignal): string;
export declare function createCacheGuardTools(api: HostLightApi): DshToolDefinition[];
export declare function registerCacheGuardTools(ctx: DshHostContext, api: HostLightApi): Disposer[];
//# sourceMappingURL=tools.d.ts.map