module.exports = {
  connection: {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 2,
  },

  timeouts: {
    aggregation: 30000,
    query: 15000,
  },

  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  }
};
