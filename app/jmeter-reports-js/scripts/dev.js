#!/usr/bin/env node
/**
 * Starts the Express API and the Vite dev server together, with prefixed output,
 * and shuts both down when one of them exits or when Ctrl+C is pressed.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const services = [
  { name: 'api', color: '\u001B[36m', dir: resolve(root, 'backend'), args: ['run', 'dev'] },
  { name: 'web', color: '\u001B[35m', dir: resolve(root, 'frontend'), args: ['run', 'dev'] },
];

for (const service of services) {
  if (!existsSync(resolve(service.dir, 'node_modules'))) {
    console.error(
      `Dependencies are missing in ${service.dir}. Run "npm run setup" at the project root first.`,
    );
    process.exit(1);
  }
}

const children = [];
let shuttingDown = false;

function stopAll(code) {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  for (const child of children) {
    child.kill('SIGTERM');
  }
  setTimeout(() => process.exit(code), 200).unref();
}

for (const service of services) {
  const child = spawn(npm, service.args, { cwd: service.dir, stdio: ['ignore', 'pipe', 'pipe'] });
  children.push(child);

  const prefix = `${service.color}[${service.name}]\u001B[0m `;
  const relay = (stream, target) => {
    stream.setEncoding('utf8');
    let buffer = '';
    stream.on('data', (chunk) => {
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        target.write(`${prefix}${line}\n`);
      }
    });
  };
  relay(child.stdout, process.stdout);
  relay(child.stderr, process.stderr);

  child.on('exit', (code) => {
    if (!shuttingDown) {
      console.log(`${prefix}exited with code ${code ?? 0}, stopping the other process.`);
    }
    stopAll(code ?? 0);
  });
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => stopAll(0));
}

console.log('API  -> http://localhost:3002/api/health');
console.log('UI   -> http://localhost:5175');
