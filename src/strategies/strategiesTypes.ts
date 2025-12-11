export interface RPCMetadata {
  strategy: "parallel" | "fallback";
  timestamp: number;
  responses: RPCProviderResponse[];
  hasInconsistencies: boolean;
}

export interface RPCProviderResponse {
  url: string;
  status: "success" | "error";
  responseTime: number;
  // biome-ignore lint/suspicious/noExplicitAny: <TODO>
  data?: any;
  error?: string;
  hash?: string;
}

export interface StrategyResult<T> {
  success: boolean;
  data?: T;
  errors?: RPCProviderResponse[];
  metadata?: RPCMetadata;
}

export interface RequestStrategy {
  /**
   * Execute an RPC request using this strategy
   *
   * @param method - The RPC method name (e.g., "eth_getBlockByNumber")
   * @param params - The RPC method parameters
   * @returns Strategy result with data and optional metadata
   */

  // biome-ignore lint/suspicious/noExplicitAny: <TODO>
  execute<T>(method: string, params: any[]): Promise<StrategyResult<T>>;

  /**
   * Get the strategy name for logging/debugging
   */
  getName(): string;
}
