import type { StrategyConfig } from "../strategies/requestStrategy.js";
import { NetworkClient } from "../NetworkClient.js";
import { EthereumClient } from "../networks/1/EthereumClient.js";
import { OptimismClient } from "../networks/10/OptimismClient.js";
import { BNBClient } from "../networks/56/BNBClient.js";
import { PolygonClient } from "../networks/137/PolygonClient.js";
import { BaseClient } from "../networks/8453/BaseClient.js";
import { ArbitrumClient } from "../networks/42161/ArbitrumClient.js";
import { AztecClient } from "../networks/677868/AztecClient.js";

/**
 * Supported chain IDs for the client factory
 */
export type SupportedChainId = 1 | 10 | 56 | 137 | 8453 | 42161 | 677868;

/**
 * Constructor type for network clients
 */
export type ClientConstructor = new (config: StrategyConfig) => NetworkClient;

/**
 * Map chain IDs to their specific client types
 */
export type ChainIdToClient<T extends SupportedChainId> =
  T extends 1 ? EthereumClient :
  T extends 10 ? OptimismClient :
  T extends 56 ? BNBClient :
  T extends 137 ? PolygonClient :
  T extends 8453 ? BaseClient :
  T extends 42161 ? ArbitrumClient :
  T extends 677868 ? AztecClient :
  NetworkClient;

/**
 * Registry mapping chain IDs to their corresponding client constructors
 */
const CHAIN_REGISTRY: Record<SupportedChainId, ClientConstructor> = {
  1: EthereumClient,
  10: OptimismClient,
  56: BNBClient,
  137: PolygonClient,
  8453: BaseClient,
  42161: ArbitrumClient,
  677868: AztecClient,
};

/**
 * Chain ID to chain name mapping for human-readable error messages
 */
const CHAIN_NAMES: Record<SupportedChainId, string> = {
  1: "Ethereum",
  10: "Optimism",
  56: "BNB Smart Chain",
  137: "Polygon",
  8453: "Base",
  42161: "Arbitrum",
  677868: "Aztec",
};

/**
 * Factory for creating network clients based on chain ID
 * Provides a centralized registry for instantiating chain-specific clients
 */
export class ClientFactory {
  /**
   * Create a network client for the specified chain ID
   *
   * @param chainId - The blockchain chain ID (e.g., 1 for Ethereum, 42161 for Arbitrum)
   * @param config - Strategy configuration with RPC URLs and strategy type
   * @returns NetworkClient instance for the specified chain
   * @throws Error if the chain ID is not supported
   */
  static createClient(chainId: SupportedChainId, config: StrategyConfig): NetworkClient {
    const ClientClass = CHAIN_REGISTRY[chainId];

    if (!ClientClass) {

      throw new Error(
        `Unsupported network ID: `
      );
    }

    return new ClientClass(config);
  }

  /**
   * Create a type-specific network client for the specified chain ID
   * Automatically infers the correct client type based on the chain ID
   *
   * @param chainId - The blockchain chain ID
   * @param config - Strategy configuration with RPC URLs and strategy type
   * @returns Typed client instance (e.g., ArbitrumClient for 42161, EthereumClient for 1)
   * @throws Error if the chain ID is not supported
   */
  static createTypedClient<T extends SupportedChainId>(
    chainId: T,
    config: StrategyConfig
  ): ChainIdToClient<T> {
    return this.createClient(chainId, config) as ChainIdToClient<T>;
  }
}
