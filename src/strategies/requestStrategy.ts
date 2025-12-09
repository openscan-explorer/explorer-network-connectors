import type { RequestStrategy } from "./strategiesTypes.ts";
import { FallbackStrategy } from "./fallbackStrategy.ts";
import { ParallelStrategy } from "./parallelStrategy.ts";
import { RpcClient } from "../RpcClient.ts";

export interface StrategyConfig {
  type: "fallback" | "parallel";
  rpcUrls: string[];
}

export class StrategyFactory {
  /**
   * Create a request strategy with multiple RPC clients
   * @param config - Strategy configuration with type and RPC URLs
   * @returns Configured request strategy
   */
  static create(config: StrategyConfig): RequestStrategy {
    if (!config.rpcUrls || config.rpcUrls.length === 0) {
      throw new Error("At least one RPC URL must be provided");
    }

    // Create RPC clients for each URL
    const rpcClients = config.rpcUrls.map(
      (urlConfig) => new RpcClient(urlConfig)
    );

    switch (config.type) {
      case "fallback":
        return new FallbackStrategy(rpcClients);
      case "parallel":
        return new ParallelStrategy(rpcClients);
      default:
        throw new Error(`Unknown strategy type: ${config.type}`);
    }
  }
}
