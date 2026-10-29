import fs from 'fs';
import os from 'os';
import path from 'path';

// Runs before each test file: isolated in-memory DB, temp data dir, fast bcrypt, fixed JWT secret.
process.env.SMARTFLOW_DB = ':memory:';
process.env.SMARTFLOW_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'smartflow-test-'));
process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-123';
process.env.BCRYPT_ROUNDS = '4';
delete process.env.ANTHROPIC_API_KEY; // tests must never call the real API
