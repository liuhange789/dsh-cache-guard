declare module '@deepseek-ai/schemastery' {
  const Schema: {
    boolean(): { default(value: boolean): unknown };
    const<T>(value: T): { default(value: T): unknown };
    union(schemas: unknown[]): { default(value: unknown): unknown };
    object(shape: Record<string, unknown>): unknown;
  };
  export default Schema;
}