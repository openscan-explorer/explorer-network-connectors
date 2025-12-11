export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: number | string;
  method: string;
  // biome-ignore lint/suspicious/noExplicitAny: <TODO>
  params?: any[];
}

// biome-ignore lint/suspicious/noExplicitAny: <TODO>
export interface JsonRpcResponse<T = any> {
  jsonrpc: "2.0";
  id: number | string;
  result?: T;
  error?: {
    code: number;
    message: string;
    // biome-ignore lint/suspicious/noExplicitAny: <TODO>
    data?: any;
  };
}
