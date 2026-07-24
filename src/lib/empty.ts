const empty = new Proxy({}, {
  get() {
    return () => Promise.resolve(null);
  }
});

export const Pool = class Pool {
  connect() { return Promise.resolve(); }
  query() { return Promise.resolve({ rows: [] }); }
  on() {}
};

export const PrismaClient = class PrismaClient {
  $extends() { return this; }
};

export const PrismaPg = class PrismaPg {
  constructor() {}
};

export default empty;
