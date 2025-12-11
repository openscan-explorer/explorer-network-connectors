import type { JsonRpcRequest, JsonRpcResponse } from "./RpcClientTypes.js";

export class RpcClient {
  private url: string;
  private requestId: number = 0;

  constructor(url: string) {
    this.url = url;
  }

  // biome-ignore lint/suspicious/noExplicitAny: <TODO>
  async call<T>(method: string, params: any[] = []): Promise<T> {
    const request: JsonRpcRequest = {
      jsonrpc: "2.0",
      id: ++this.requestId,
      method,
      params,
    };

    const response = await fetch(this.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: JsonRpcResponse<T> = (await response.json()) as JsonRpcResponse<T>;

    if (result.error) {
      throw new Error(`RPC error: ${result.error.message}`);
    }

    return result.result as T;
  }

  getUrl(): string {
    return this.url;
  }

  getRequestId(): number {
    return this.requestId;
  }
}
