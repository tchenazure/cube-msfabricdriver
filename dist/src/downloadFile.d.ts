import { Response } from 'node-fetch';
export declare function fetch(url: any): Promise<Response>;
export declare function getProxySettings(): Promise<string>;
export declare function getHttpAgentForProxySettings(): Promise<import("http-proxy-agent/dist/agent").default | undefined>;
type ByteProgressCallback = (info: {
    progress: number;
    eta: number;
    speed: string;
}) => void;
export declare function streamWithProgress(response: Response, progressCallback: ByteProgressCallback): Promise<string>;
type DownloadFile = {
    showProgress: boolean;
    cwd: string;
};
export declare function downloadFile(url: string, { cwd }: DownloadFile): Promise<void>;
export {};
//# sourceMappingURL=downloadFile.d.ts.map