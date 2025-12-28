import { Pool, PoolClient } from 'pg';
import dns from 'dns';

// Force IPv4-first DNS resolution (Node.js 17+)
// This helps avoid IPv6 connection issues with Supabase
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

let pool: Pool | undefined;

export function isDbConfigured() {
  if (process.env.DATABASE_URL) return true;
  return Boolean(
    process.env.POSTGRES_HOST &&
    process.env.POSTGRES_USER &&
    process.env.POSTGRES_DATABASE
  );
}

function createPool(): Pool {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    // Supabase connection string format:
    // postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
    // Parse URL and use host/port directly to avoid IPv6 issues
    let poolConfig: any = {
      ssl: databaseUrl.includes('supabase.co') ? { rejectUnauthorized: false } : undefined,
      max: 10, // Connection pool size
      connectionTimeoutMillis: 10000, // 10 second timeout
      idleTimeoutMillis: 30000, // 30 seconds
      allowExitOnIdle: false,
    };

    // For Supabase, parse the URL and use individual connection params
    // This gives us more control over DNS resolution
    if (databaseUrl.includes('supabase.co')) {
      try {
        const url = new URL(databaseUrl.replace(/^postgresql:/, 'http:'));
        const password = url.password;
        const username = url.username;
        const hostname = url.hostname;
        const port = url.port || '5432';
        const database = url.pathname.slice(1) || 'postgres';

        poolConfig = {
          ...poolConfig,
          host: hostname,
          port: parseInt(port, 10),
          user: username,
          password: password,
          database: database,
          // Force IPv4 by using family option in dns lookup
          // Note: pg library doesn't directly support this, but we can set it via lookup
        };
      } catch (err) {
        // If URL parsing fails, fall back to connectionString
        console.warn('Failed to parse DATABASE_URL, using connectionString:', err);
        poolConfig.connectionString = databaseUrl;
      }
    } else {
      poolConfig.connectionString = databaseUrl;
    }

    return new Pool(poolConfig);
  }

  // Fallback to individual env vars
  const host = process.env.POSTGRES_HOST;
  const user = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;
  const database = process.env.POSTGRES_DATABASE;
  const port = process.env.POSTGRES_PORT ? Number(process.env.POSTGRES_PORT) : 5432;

  if (!host || !user || !database) {
    throw new Error(
      'Missing PostgreSQL config. Set DATABASE_URL (recommended) or POSTGRES_HOST/POSTGRES_USER/POSTGRES_PASSWORD/POSTGRES_DATABASE.'
    );
  }

  return new Pool({
    host,
    port,
    user,
    password,
    database,
    max: 10,
    connectionTimeoutMillis: 10000, // 10 second timeout
    idleTimeoutMillis: 30000, // 30 seconds
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    allowExitOnIdle: false,
  });
}

export function getPool(): Pool {
  if (!pool) {
    pool = createPool();
  }
  return pool;
}

/**
 * Execute a SQL query with named parameters
 * Converts named parameters (:param) to PostgreSQL positional parameters ($1, $2, etc.)
 */
export async function sqlQuery<T = unknown>(
  query: string,
  params?: Record<string, unknown> | unknown[]
): Promise<T> {
  const pool = getPool();
  
  try {
    // If params is an array, use it directly (positional)
    if (Array.isArray(params)) {
      const result = await pool.query(query, params);
      return result.rows as T;
    }

    // If params is an object, convert named parameters to positional
    if (params && typeof params === 'object') {
      // Extract parameter names in order they appear in the query
      const paramNames: string[] = [];
      const paramValues: unknown[] = [];
      
      // Replace :paramName with $1, $2, etc.
      let paramIndex = 1;
      const convertedQuery = query.replace(/:(\w+)/g, (match, paramName) => {
        if (!paramNames.includes(paramName)) {
          paramNames.push(paramName);
          paramValues.push(params[paramName]);
        }
        const index = paramNames.indexOf(paramName) + 1;
        return `$${index}`;
      });

      const result = await pool.query(convertedQuery, paramValues);
      return result.rows as T;
    }

    // No parameters
    const result = await pool.query(query);
    return result.rows as T;
  } catch (error: any) {
    // Handle connection errors with helpful messages
    if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND' || error?.code === 'ETIMEDOUT') {
      let errorMessage = '';
      let troubleshooting = '';
      
      if (error?.code === 'ECONNREFUSED') {
        errorMessage = 'Database connection refused.';
        troubleshooting = 'The database server is not accepting connections. Please check:\n' +
          '1. Is the database server running?\n' +
          '2. Is the port correct? (default: 5432)\n' +
          '3. Are firewall rules allowing connections?\n' +
          '4. If using IPv6, try using IPv4 address instead in your DATABASE_URL';
      } else if (error?.code === 'ENOTFOUND') {
        errorMessage = 'Database host not found.';
        troubleshooting = 'The database hostname cannot be resolved. Please check:\n' +
          '1. Is your DATABASE_URL or POSTGRES_HOST correct?\n' +
          '2. Is your DNS working correctly?\n' +
          '3. If using a cloud database (Supabase, etc.), verify the connection string';
      } else {
        errorMessage = 'Database connection timed out.';
        troubleshooting = 'The connection attempt timed out. Please check:\n' +
          '1. Is your network connection stable?\n' +
          '2. Is the database server accessible from your network?\n' +
          '3. Are there any network restrictions or VPN requirements?';
      }
      
      // Check if IPv6 address is in the error
      const ipv6Match = error?.message?.match(/\[([0-9a-f:]+)\]/i);
      if (ipv6Match) {
        troubleshooting += '\n\nNote: IPv6 address detected. If you\'re having connectivity issues, try:\n' +
          '- Using the IPv4 address instead in your DATABASE_URL\n' +
          '- Checking if your network supports IPv6';
      }
      
      const fullMessage = `${errorMessage}\n\nTroubleshooting:\n${troubleshooting}\n\nOriginal error: ${error?.message || 'Unknown error'}`;
      throw new Error(fullMessage);
    }
    
    // Re-throw other errors as-is
    throw error;
  }
}

/**
 * Execute a SQL query with a client (for use within transactions)
 * Converts named parameters (:param) to PostgreSQL positional parameters ($1, $2, etc.)
 */
export function sqlQueryWithClient<T = unknown>(
  client: PoolClient,
  query: string,
  params?: Record<string, unknown> | unknown[]
): Promise<T> {
  // If params is an array, use it directly (positional)
  if (Array.isArray(params)) {
    return client.query(query, params).then(result => result.rows as T);
  }

  // If params is an object, convert named parameters to positional
  if (params && typeof params === 'object') {
    // Extract parameter names in order they appear in the query
    const paramNames: string[] = [];
    const paramValues: unknown[] = [];
    
    // Replace :paramName with $1, $2, etc.
    const convertedQuery = query.replace(/:(\w+)/g, (match, paramName) => {
      if (!paramNames.includes(paramName)) {
        paramNames.push(paramName);
        paramValues.push(params[paramName]);
      }
      const index = paramNames.indexOf(paramName) + 1;
      return `$${index}`;
    });

    return client.query(convertedQuery, paramValues).then(result => result.rows as T);
  }

  // No parameters
  return client.query(query).then(result => result.rows as T);
}

/**
 * Execute a function within a database transaction
 * The function receives a client that can be used to execute queries
 */
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
