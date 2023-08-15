"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadFile = exports.streamWithProgress = exports.getHttpAgentForProxySettings = exports.getProxySettings = exports.fetch = void 0;
const node_fetch_1 = require("node-fetch");
const bytes_1 = __importDefault(require("bytes"));
const throttle_debounce_1 = require("throttle-debounce");
const cli_progress_1 = require("cli-progress");
const fs_1 = __importDefault(require("fs"));
const os = __importStar(require("os"));
const crypto_1 = __importDefault(require("crypto"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const http_proxy_agent_1 = __importDefault(require("http-proxy-agent"));
async function fetch(url) {
    const { default: fetch } = await Promise.resolve().then(() => __importStar(require("node-fetch")));
    return await fetch(url);
}
exports.fetch = fetch;
;
function getCommandOutput(command) {
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(command, (error, stdout) => {
            if (error) {
                reject(error.message);
                return;
            }
            resolve(stdout);
        });
    });
}
async function getProxySettings() {
    const [proxy] = (await Promise.all([getCommandOutput('npm config -g get https-proxy'), getCommandOutput('npm config -g get proxy')]))
        .map((s) => s.trim())
        .filter((s) => !['null', 'undefined', ''].includes(s));
    return proxy;
}
exports.getProxySettings = getProxySettings;
async function getHttpAgentForProxySettings() {
    const proxy = await getProxySettings();
    return proxy ? (0, http_proxy_agent_1.default)(proxy) : undefined;
}
exports.getHttpAgentForProxySettings = getHttpAgentForProxySettings;
async function streamWithProgress(response, progressCallback) {
    const total = parseInt(response.headers.get('Content-Length') || '0', 10);
    const startedAt = Date.now();
    let done = 0;
    const throttled = (0, throttle_debounce_1.throttle)(10, () => {
        const elapsed = (Date.now() - startedAt) / 1000;
        const rate = done / elapsed;
        const speed = `${(0, bytes_1.default)(rate)}/s`;
        const estimated = total / rate;
        const progress = parseInt(((done / total) * 100), 10);
        const eta = estimated - elapsed;
        progressCallback({
            progress,
            eta,
            speed
        });
    });
    const saveFilePath = path.join(os.tmpdir(), crypto_1.default.randomBytes(16).toString('hex'));
    const writer = fs_1.default.createWriteStream(saveFilePath);
    response?.body?.pipe(writer);
    response?.body?.on('data', (chunk) => {
        done += chunk.length;
        throttled();
    });
    return new Promise((resolve) => {
        // Wait before writer will finish, because response can be done earlier then extracting
        writer.on('finish', () => {
            resolve(saveFilePath);
            console.log(saveFilePath);
        });
    });
}
exports.streamWithProgress = streamWithProgress;
async function downloadFile(url, { cwd }) {
    const request = new node_fetch_1.Request(url, {
        headers: new node_fetch_1.Headers({
            'Content-Type': 'application/octet-stream',
        }),
        agent: await getHttpAgentForProxySettings(),
    });
    const response = await fetch(request);
    if (!response.ok) {
        throw new Error(`unexpected response ${response.statusText}`);
    }
    const bar = new cli_progress_1.SingleBar({
        format: 'Downloading [{bar}] {percentage}% | Speed: {speed}',
    });
    bar.start(100, 0);
    const savedFilePath = await streamWithProgress(response, ({ progress, speed, eta }) => {
        bar.update(progress, {
            speed,
            eta,
        });
    });
    fs_1.default.copyFile(savedFilePath, cwd, (err) => {
        console.error("Error:", err);
    });
    bar.update(100);
    bar.stop();
}
exports.downloadFile = downloadFile;
//   downloadFile(
//     'https://repo1.maven.org/maven2/com/microsoft/azure/msal4j/1.13.3/msal4j-1.13.3.jar',
//     {
//       showProgress: true,
//       cwd: path.resolve(path.join(__dirname, '..', 'download/msal4j-1.13.3.jar')),
//     }
//   );
//# sourceMappingURL=downloadFile.js.map