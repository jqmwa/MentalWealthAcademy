import mysql, { type Pool, type PoolOptions } from 'mysql2/promise';

let pool: Pool | undefined;

export function isDbConfigured() {
  if (process.env.DATABASE_URL) return true;
  return Boolean(process.env.MYSQL_HOST && process.env.MYSQL_USER && process.env.MYSQL_DATABASE);
}

function poolOptionsFromEnv(): PoolOptions {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    const url = new URL(databaseUrl);

    if (url.protocol !== 'mysql:') {
      throw new Error('DATABASE_URL must start with mysql://');
    }

    const port = url.port ? Number(url.port) : 3306;

    return {
      host: url.hostname,
      port,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ''),
      waitForConnections: true,
      connectionLimit: 10,
      namedPlaceholders: true,
    };
  }

  // Fallback env vars
  const host = process.env.MYSQL_HOST;
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DATABASE;
  const port = process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306;

  if (!host || !user || !database) {
    throw new Error(
      'Missing MySQL config. Set DATABASE_URL (recommended) or MYSQL_HOST/MYSQL_USER/MYSQL_PASSWORD/MYSQL_DATABASE.'
    );
  }

  return {
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true,
  };
}

export function getPool(): Pool {
  if (!pool) {
    pool = mysql.createPool(poolOptionsFromEnv());
  }
  return pool;
}

export async function sqlQuery<T = unknown>(query: string, params?: Record<string, unknown> | unknown[]) {
  const [rows] = await getPool().query(query, params as any);
  return rows as T;
}
