/**
 * Build script for Chrome Extension
 * Bundles ES modules into browser-compatible code
 */

import esbuild from 'esbuild';
import { readdirSync, statSync, mkdirSync, copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isWatch = process.argv.includes('--watch');
const distDir = join(__dirname, 'dist');

// Ensure dist directory exists
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// Copy static files
function copyStaticFiles() {
  const staticFiles = [
    'manifest.json',
    'popup.html',
    'options.html',
    'background.js',
    'styles/feed-replacer.css',
    'styles/options.css'
  ];
  
  staticFiles.forEach(file => {
    const src = join(__dirname, file);
    const dest = join(distDir, file);
    
    if (existsSync(src)) {
      const destDir = dirname(dest);
      if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true });
      }
      copyFileSync(src, dest);
    }
  });
  
  // Copy icons if they exist
  const iconsDir = join(__dirname, 'icons');
  const distIconsDir = join(distDir, 'icons');
  if (existsSync(iconsDir)) {
    if (!existsSync(distIconsDir)) {
      mkdirSync(distIconsDir, { recursive: true });
    }
    const iconFiles = readdirSync(iconsDir);
    iconFiles.forEach(file => {
      copyFileSync(join(iconsDir, file), join(distIconsDir, file));
    });
  }
}

// Build content scripts
const contentScripts = [
  { entry: 'content/facebook.js', outfile: 'dist/content/facebook.js' },
  { entry: 'content/twitter.js', outfile: 'dist/content/twitter.js' },
  { entry: 'content/instagram.js', outfile: 'dist/content/instagram.js' },
  { entry: 'content/linkedin.js', outfile: 'dist/content/linkedin.js' },
  { entry: 'content/reddit.js', outfile: 'dist/content/reddit.js' },
  { entry: 'content/youtube.js', outfile: 'dist/content/youtube.js' },
  { entry: 'content/quora.js', outfile: 'dist/content/quora.js' }
];

// Build popup script
const popupScript = {
  entry: 'popup.js',
  outfile: 'dist/popup.js'
};

const buildOptions = {
  bundle: true,
  minify: !isWatch,
  sourcemap: isWatch,
  target: ['chrome88', 'firefox78'],
  format: 'iife',
  platform: 'browser'
};

// Run Tailwind CSS build
function buildTailwind() {
  const result = spawnSync('npx', ['tailwindcss', '-i', 'src/options.css', '-o', 'styles/options.css', '--minify'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });
  if (result.status !== 0) {
    throw new Error('Tailwind CSS build failed');
  }
}

async function build() {
  console.log('Building extension...');
  
  buildTailwind();
  
  // Ensure content directory exists
  const contentDir = join(distDir, 'content');
  if (!existsSync(contentDir)) {
    mkdirSync(contentDir, { recursive: true });
  }
  
  // Copy static files
  copyStaticFiles();
  
  // Build content scripts
  const contentPromises = contentScripts.map(script => {
    const outfile = script.outfile;
    const outDir = dirname(outfile);
    if (!existsSync(outDir)) {
      mkdirSync(outDir, { recursive: true });
    }
    
    return esbuild.build({
      ...buildOptions,
      entryPoints: [script.entry],
      outfile: outfile
    }).catch(err => {
      console.error(`Error building ${script.entry}:`, err);
      throw err;
    });
  });
  
  // Build popup script
  const popupOutDir = dirname(popupScript.outfile);
  if (!existsSync(popupOutDir)) {
    mkdirSync(popupOutDir, { recursive: true });
  }
  
  const popupPromise = esbuild.build({
    ...buildOptions,
    entryPoints: [popupScript.entry],
    outfile: popupScript.outfile
  }).catch(err => {
    console.error(`Error building ${popupScript.entry}:`, err);
    throw err;
  });
  
  // Build options script
  const optionsScript = {
    entry: 'options.js',
    outfile: 'dist/options.js'
  };
  
  const optionsOutDir = dirname(optionsScript.outfile);
  if (!existsSync(optionsOutDir)) {
    mkdirSync(optionsOutDir, { recursive: true });
  }
  
  const optionsPromise = esbuild.build({
    ...buildOptions,
    entryPoints: [optionsScript.entry],
    outfile: optionsScript.outfile
  }).catch(err => {
    console.error(`Error building ${optionsScript.entry}:`, err);
    throw err;
  });
  
  await Promise.all([...contentPromises, popupPromise, optionsPromise]);
  
  console.log('Build complete!');
  console.log('Extension files are in the dist/ directory');
  console.log('\nNext steps:');
  console.log('1. Create icons (see create-icons.html)');
  console.log('2. Load dist/ folder in Chrome as unpacked extension');
  console.log('3. Test on social media sites');
}

if (isWatch) {
  console.log('Watching for changes...');
  const ctx = await esbuild.context({
    ...buildOptions,
    entryPoints: contentScripts.map(s => s.entry).concat([popupScript.entry]),
    outdir: 'dist',
    outbase: '.'
  });
  
  await ctx.watch();
  console.log('Watching...');
} else {
  build().catch(console.error);
}
