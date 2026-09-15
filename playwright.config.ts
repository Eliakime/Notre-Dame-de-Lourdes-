import { defineConfig } from '@playwright/test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
const documents=mkdtempSync(path.join(tmpdir(),'ndl-tests-'));
export default defineConfig({testDir:'./tests',fullyParallel:false,workers:1,use:{baseURL:'http://localhost:3100',browserName:'chromium'},webServer:{command:'npm run dev -- --port 3100',url:'http://localhost:3100',reuseExistingServer:false,timeout:120000,env:{ADMIN_UPLOAD_TOKEN:'test-only-0123456789abcdef0123456789abcdef',DOCUMENTS_DIR:documents}},reporter:'list'});
