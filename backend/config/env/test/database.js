module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', 'db'),
      port: env.int('DATABASE_PORT', 5432),
      database: 'science_of_africa_test',
      user: env('DATABASE_USERNAME', 'akvo'),
      password: env('DATABASE_PASSWORD', 'password'),
      ssl: false,
    },
    pool: { 
      min: 0, 
      max: 5,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      idleTimeoutMillis: 1000,
      reapIntervalMillis: 1000,
    },
  },
});
