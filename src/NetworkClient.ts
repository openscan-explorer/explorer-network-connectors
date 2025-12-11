import type { RequestStrategy, StrategyResult } from "./strategies/strategiesTypes.js";
import { StrategyFactory, type StrategyConfig } from "./strategies/requestStrategy.js";

/**
 * Base network client that uses strategy pattern for RPC requests
 * Provides a foundation for network-specific implementations
 */
export class NetworkClient {
  protected strategy: RequestStrategy;
  protected rpcUrls: string[];

  constructor(config: StrategyConfig) {
    this.strategy = StrategyFactory.create(config);
    this.rpcUrls = config.rpcUrls;
  }

  /**
   * Execute any RPC method with the configured strategy
   * @param method - The RPC method name (e.g., "eth_blockNumber")
   * @param params - The method parameters
   * @returns Strategy result with data and optional metadata
   */
  // biome-ignore lint/suspicious/noExplicitAny: <TODO>
  async execute<T>(method: string, params: any[] = []): Promise<StrategyResult<T>> {
    return this.strategy.execute<T>(method, params);
  }

  /**
   * Get the underlying strategy instance
   */
  getStrategy(): RequestStrategy {
    return this.strategy;
  }

  /**
   * Get the strategy name (fallback or parallel)
   */
  getStrategyName(): string {
    return this.strategy.getName();
  }

  /**
   * Get the RPC URLs
   */
  getRpcUrls(): string[] {
    return this.rpcUrls;
  }

  /**
   * Update Strategy
   */
  updateStrategy(type: StrategyConfig["type"]) {
    this.strategy = StrategyFactory.create({
      type,
      rpcUrls: this.rpcUrls,
    });
  }
}
