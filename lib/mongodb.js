// Database connection utility for Next.js
import mongoose from 'mongoose';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null, healthChecked: false };
}

/**
 * One-time schema health check. Runs once per process lifetime after the
 * first successful DB connection. Drops legacy indexes that the current
 * schema no longer defines but that still exist in the database (Mongoose
 * never auto-drops indexes that disappear from the schema).
 *
 * Specifically: removes `accounts.accountId_1` from `users`. That index was
 * a unique constraint on the nested account-id field in an older schema.
 * It's now causing E11000 duplicate-key errors whenever a user is created
 * without an `accounts` array, because MongoDB treats every `null` value
 * as identical under a unique index.
 */
async function ensureSchemaHealth(conn) {
    try {
        const usersColl = conn.connection.db.collection('users');
        const indexes = await usersColl.indexes();

        const legacyIndexNames = [
            'accounts.accountId_1',
        ];

        for (const name of legacyIndexNames) {
            const found = indexes.find(idx => idx.name === name);
            if (found) {
                try {
                    await usersColl.dropIndex(name);
                    console.log(`[mongodb] dropped legacy index '${name}' from users`);
                } catch (dropErr) {
                    // IndexNotFound is fine (race with another process); other
                    // failures are logged but don't crash the app.
                    if (dropErr?.codeName !== 'IndexNotFound') {
                        console.warn(`[mongodb] could not drop legacy index '${name}':`, dropErr?.message);
                    }
                }
            }
        }
    } catch (e) {
        // Defensive — never block startup over schema-health work.
        console.warn('[mongodb] schema health check failed:', e?.message);
    }
}

async function connectDB() {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
        throw new Error('Please define the MONGODB_URI environment variable');
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    // Run the one-time schema health check after the first connect.
    // Fire-and-forget so subsequent requests don't pay the cost.
    if (!cached.healthChecked) {
        cached.healthChecked = true;
        ensureSchemaHealth(cached.conn).catch(() => {});
    }

    return cached.conn;
}

export default connectDB;