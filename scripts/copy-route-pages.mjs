// The web server ignores .htaccess, so a reload of /board would end in "Not Found".
// This script puts a copy of index.html into a folder per route (board/index.html, ...).
// The server then opens that folder and Angular shows the right page.
// Run after the build: npm run build:deploy

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROUTES_FILE = 'src/app/app.routes.ts';
const OUTPUT_DIR = 'dist/join/browser';

/**
 * Reads the route paths from the routes file. The start page ('') and the
 * wildcard ('**') need no folder.
 * @returns Paths like 'board' or 'addTask'.
 */
function readRoutePaths() {
  const source = readFileSync(ROUTES_FILE, 'utf8');
  const paths = [...source.matchAll(/path:\s*'([^']*)'/g)].map((match) => match[1]);
  return paths.filter((path) => path !== '' && path !== '**');
}

/**
 * Copies index.html into the folder of one route.
 * @param path - Route path, e.g. 'board'.
 */
function copyIndexFor(path) {
  const folder = join(OUTPUT_DIR, path);
  mkdirSync(folder, { recursive: true });
  copyFileSync(join(OUTPUT_DIR, 'index.html'), join(folder, 'index.html'));
  console.log(`Created ${join(folder, 'index.html')}`);
}

readRoutePaths().forEach(copyIndexFor);
