import { createRequire } from 'node:module';
import path from 'node:path';
const require=createRequire(import.meta.url);
// This Windows environment blocks native Node addons. Give Next an exact
// WASM path: its bare-package fallback does not resolve correctly on Windows.
if(process.platform==='win32'){
 try{require('@next/swc-win32-x64-msvc')}catch{
  process.env.NEXT_TEST_WASM_DIR=path.dirname(require.resolve('@next/swc-wasm-nodejs'));
 }
}
await import('next/dist/bin/next');
