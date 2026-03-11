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
    pool: { min: 2, max: 10 },
  },
});
