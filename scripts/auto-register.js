#!/usr/bin/env node
import { existsSync, mkdirSync, symlinkSync, lstatSync, readlinkSync, rmSync, cpSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { homedir, platform } from 'node:os';

const PLUGIN_NAME = 'dsh-cache-guard';
const PROJECT_ROOT = resolve(dirname(new URL(import.meta.url).pathname.replace(/^\//, '')), '..');

const DSH_PLUGIN_DIRS = [
  join(homedir(), '.dsh', 'plugins'),
  join(homedir(), '.config', 'dsh', 'plugins'),
  join(homedir(), 'AppData', 'Roaming', 'dsh', 'plugins'),
];

function findDshPluginDir() {
  for (const dir of DSH_PLUGIN_DIRS) {
    if (existsSync(dir)) return dir;
  }
  const fallback = DSH_PLUGIN_DIRS[0];
  mkdirSync(fallback, { recursive: true });
  return fallback;
}

function registerPlugin() {
  const pluginDir = findDshPluginDir();
  const target = join(pluginDir, PLUGIN_NAME);

  console.log(`DSH plugin directory: ${pluginDir}`);
  console.log(`Project root: ${PROJECT_ROOT}`);
  console.log(`Target: ${target}`);

  if (existsSync(target) || lstatSync(target, { throwIfNoEntry: false })) {
    try {
      const stat = lstatSync(target);
      if (stat.isSymbolicLink()) {
        console.log(`Removing existing symlink: ${target}`);
        rmSync(target, { force: true });
      } else {
        console.log(`Removing existing directory: ${target}`);
        rmSync(target, { recursive: true, force: true });
      }
    } catch {
      rmSync(target, { recursive: true, force: true });
    }
  }

  const isWindows = platform() === 'win32';
  try {
    if (isWindows) {
      console.log('Windows detected, copying directory (symlink requires admin)');
      cpSync(PROJECT_ROOT, target, {
        recursive: true,
        filter: (src) => !src.includes('node_modules') && !src.includes('.git'),
      });
    } else {
      console.log('Creating symlink...');
      symlinkSync(PROJECT_ROOT, target, 'dir');
    }
    console.log(`\n✅ Plugin "${PLUGIN_NAME}" registered successfully at: ${target}`);
    console.log('\nNext steps:');
    console.log('  1. Restart DSH: dsh web');
    console.log('  2. Open DSH settings and verify dsh-cache-guard is enabled');
    console.log('  3. Trigger a toolset change or long tool chain to see the yellow/PTC hint');
  } catch (err) {
    console.error(`\n❌ Failed to register plugin: ${err.message}`);
    console.error('\nFallback: copy the project directory manually:');
    console.error(`  cp -r "${PROJECT_ROOT}" "${target}"`);
    process.exit(1);
  }
}

registerPlugin();