import { Headers, Request, Response } from 'node-fetch';
import bytes from 'bytes';
import { throttle } from 'throttle-debounce';
import { SingleBar } from 'cli-progress';
import { mkdirpSync } from 'fs-extra';
import fs from 'fs';
import * as os from 'os';
import crypto from 'crypto';
import * as path from 'path';
import { exec } from 'child_process';
import HttpsProxyAgent from 'http-proxy-agent';

export async function fetch(url: any) {
    const {default: fetch} = await import("node-fetch");
    return await fetch(url);
};

function getCommandOutput(command: string) {
    return new Promise<string>((resolve, reject) => {
      exec(command, (error, stdout) => {
        if (error) {
          reject(error.message);
          return;
        }
  
        resolve(stdout);
      });
    });
  }
  
  export async function getProxySettings() {
    const [proxy] = (
      await Promise.all([getCommandOutput('npm config -g get https-proxy'), getCommandOutput('npm config -g get proxy')])
    )
      .map((s) => s.trim())
      .filter((s) => !['null', 'undefined', ''].includes(s));
  
    return proxy;
  }
  
  export async function getHttpAgentForProxySettings() {
    const proxy = await getProxySettings();
  
    return proxy ? HttpsProxyAgent(proxy) : undefined;
  }

type ByteProgressCallback = (info: { progress: number; eta: number; speed: string }) => void;

export async function streamWithProgress(
  response: Response,
  progressCallback: ByteProgressCallback
): Promise<string> {
  const total = parseInt(response.headers.get('Content-Length') || '0', 10);
  const startedAt = Date.now();

  let done = 0;

  const throttled = throttle(
    10,
    () => {
      const elapsed = (Date.now() - startedAt) / 1000;
      const rate = done / elapsed;
      const speed = `${bytes(rate)}/s`;
      const estimated = total / rate;
      const progress = parseInt(<any>((done / total) * 100), 10);
      const eta = estimated - elapsed;

      progressCallback({
        progress,
        eta,
        speed
      });
    },
  );

  const saveFilePath = path.join(os.tmpdir(), crypto.randomBytes(16).toString('hex'));
  const writer = fs.createWriteStream(
    saveFilePath,
  );

  response?.body?.pipe(writer);
  response?.body?.on('data', (chunk) => {
    done += chunk.length;
    throttled();
  });

  return new Promise<string>(
    (resolve) => {
      // Wait before writer will finish, because response can be done earlier then extracting
      writer.on('finish', () => {
        resolve(saveFilePath);
        console.log(saveFilePath);
      });
    }
  );
}

type DownloadFile = {
    showProgress: boolean;
    cwd: string;
  };
  
  export async function downloadFile(url: string, { cwd }: DownloadFile) {
    
    const request = new Request(url, {
      headers: new Headers({
        'Content-Type': 'application/octet-stream',
      }),
      agent: await getHttpAgentForProxySettings(),
    });
  
    const response = await fetch(request);
    if (!response.ok) {
      throw new Error(`unexpected response ${response.statusText}`);
    }
  
    const bar = new SingleBar({
      format: 'Downloading [{bar}] {percentage}% | Speed: {speed}',
    });
    bar.start(100, 0);
  
    const savedFilePath = await streamWithProgress(response, ({ progress, speed, eta }) => {
      bar.update(progress, {
        speed,
        eta,
      });
    });

    fs.copyFile(savedFilePath, cwd, (err)=> {
        console.error("Error:", err);
    });
    bar.update(100);
    bar.stop();
    
  }

//   downloadFile(
//     'https://repo1.maven.org/maven2/com/microsoft/azure/msal4j/1.13.3/msal4j-1.13.3.jar',
//     {
//       showProgress: true,
//       cwd: path.resolve(path.join(__dirname, '..', 'download/msal4j-1.13.3.jar')),
//     }
//   );
  