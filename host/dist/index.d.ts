import type { DshHostContext, Disposer } from './types/dshContext.ts';
import { configSchema } from './config/schema.ts';
export declare const inject: readonly ["agents", "tools"];
export declare function setup(ctx: DshHostContext): Promise<Disposer>;
export { configSchema };
