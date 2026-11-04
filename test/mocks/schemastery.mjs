const chainable = () => {
  const obj = { default: (v) => ({ __default: v, __schema: true }) };
  return obj;
};

const Schema = {
  boolean: chainable,
  const: (v) => ({ default: (d) => ({ __const: v, __default: d, __schema: true }) }),
  union: (arr) => ({ default: (d) => ({ __union: arr, __default: d, __schema: true }) }),
  object: (shape) => ({ __object: shape, __schema: true }),
};

export default Schema;