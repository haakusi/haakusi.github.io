import { createReadStream, existsSync } from 'node:fs';
import { mkdtemp, rm, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { spawn } from 'node:child_process';
const root = resolve(import.meta.dirname, '..');
const chromeCandidates = [
    process.env.CHROME_BIN,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
].filter(Boolean);
const chrome = chromeCandidates.find(existsSync);

if (!chrome) {
    throw new Error('Chrome or Chromium was not found. Set CHROME_BIN and retry.');
}

const mime = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
};

const server = createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const requested = normalize(pathname === '/' ? '/cv.html' : pathname).replace(/^[/\\]+/, '');
    const file = resolve(root, requested);

    if (!file.startsWith(`${root}${sep}`) || !existsSync(file)) {
        response.writeHead(404).end('Not found');
        return;
    }

    response.writeHead(200, {
        'Content-Type': mime[extname(file)] ?? 'application/octet-stream',
        'Cache-Control': 'no-store',
    });
    createReadStream(file).pipe(response);
});

await new Promise((resolveListen, rejectListen) => {
    server.once('error', rejectListen);
    server.listen(0, '127.0.0.1', resolveListen);
});

const address = server.address();
const outputs = [
    { lang: 'en', file: 'swpark_cv.pdf' },
    { lang: 'kr', file: 'swpark_cv_ko.pdf' },
];

const wait = (milliseconds) => new Promise((resolveWait) => setTimeout(resolveWait, milliseconds));

async function renderPdf(output) {
    const profile = await mkdtemp(join(tmpdir(), `haakusi-cv-${output.lang}-`));
    const target = join(root, output.file);
    const url = `http://127.0.0.1:${address.port}/cv.html?lang=${output.lang}`;
    const previousMtime = existsSync(target) ? (await stat(target)).mtimeMs : 0;
    let stderr = '';

    const child = spawn(chrome, [
        '--headless=new',
        '--disable-background-networking',
        '--disable-extensions',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--no-first-run',
        '--no-pdf-header-footer',
        '--run-all-compositor-stages-before-draw',
        '--virtual-time-budget=2500',
        `--user-data-dir=${profile}`,
        `--print-to-pdf=${target}`,
        url,
    ], { stdio: ['ignore', 'ignore', 'pipe'] });

    child.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
    });

    const exitPromise = new Promise((resolveExit) => {
        child.once('error', (error) => resolveExit({ error }));
        child.once('exit', (code, signal) => resolveExit({ code, signal }));
    });

    let lastSize = -1;
    let stableChecks = 0;
    const deadline = Date.now() + 20000;

    while (Date.now() < deadline) {
        await wait(250);
        if (existsSync(target)) {
            const rendered = await stat(target);
            if (rendered.mtimeMs > previousMtime && rendered.size > 10000) {
                stableChecks = rendered.size === lastSize ? stableChecks + 1 : 0;
                lastSize = rendered.size;
                if (stableChecks >= 2) break;
            }
        }
    }

    const rendered = existsSync(target) ? await stat(target) : null;
    if (!rendered || rendered.mtimeMs <= previousMtime || stableChecks < 2) {
        child.kill('SIGTERM');
        await rm(profile, { recursive: true, force: true });
        throw new Error(`PDF rendering timed out: ${target}\n${stderr}`);
    }

    if (child.exitCode === null) child.kill('SIGTERM');
    await Promise.race([exitPromise, wait(2000)]);
    if (child.exitCode === null) child.kill('SIGKILL');
    await rm(profile, { recursive: true, force: true });
    process.stdout.write(`Rendered ${output.file}\n`);
}

try {
    for (const output of outputs) {
        await renderPdf(output);
    }
} finally {
    await new Promise((resolveClose) => server.close(resolveClose));
}
