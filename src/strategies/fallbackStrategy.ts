import type { RequestStrategy, StrategyResult, RPCProviderResponse } from "./strategiesTypes.ts";
import { RpcClient } from "../RpcClient.ts";


export class FallbackStrategy implements RequestStrategy {
  private rpcClients: RpcClient[]
  constructor(rpcClients: RpcClient[]) {
    if (rpcClients.length === 0) {
      throw new Error("At least one RPC client must be provided");
    }
    this.rpcClients = rpcClients;
  }

  /**
   * Execute request with automatic fallback
   * Tries each RPC client sequentially until one succeeds
   */
  async execute<T>(method: string, params: any[]): Promise<StrategyResult<T>> {
    const errors: RPCProviderResponse[] = [];

    // Try each RPC client in order
    for (const rpcClient of this.rpcClients) {
      const startTime = Date.now();
      try {
        const data = await rpcClient.call<T>(method, params);

        return {
          success: true,
          data,
          // No metadata in fallback mode - we don't track which provider responded
          metadata: undefined,
        };
      } catch (error) {
        const responseTime = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push({
          url: rpcClient.getUrl(),
          status: "error",
          responseTime,
          error: errorMessage,
        });
        // Continue to next RPC client
      }
    }

    // All RPC clients failed - return errors
    return {
      success: false,
      errors,
    };
  }

  getName(): string {
    return "fallback";
  }
}

