// Base client
export { NetworkClient } from "./NetworkClient.ts";

// Ethereum (Chain ID: 1)
export { EthereumClient } from "./networks/1/EthereumClient.ts";
export type {
  EthBlock,
  EthTransaction,
  EthTransactionReceipt,
  EthLog,
  EthLogFilter,
  EthCallObject,
  EthWithdrawal,
  EthSyncingStatus,
  BlockNumberOrTag as EthBlockNumberOrTag,
  BlockTag as EthBlockTag,
  AccessListEntry as EthAccessListEntry,
} from "./networks/1/EthereumTypes.ts";

// Optimism (Chain ID: 10)
export { OptimismClient } from "./networks/10/OptimismClient.ts";
export type {
  OptimismBlock,
  OptimismTransaction,
  OptimismTransactionReceipt,
  OptimismLog,
  OptimismLogFilter,
  OptimismCallObject,
  OptimismOutputAtBlock,
  OptimismSyncStatus,
  OptimismRollupConfig,
  OpP2PSelfInfo,
  OpP2PPeersResponse,
  OpP2PPeerStats,
  BlockNumberOrTag as OptimismBlockNumberOrTag,
  BlockTag as OptimismBlockTag,
  AccessListEntry as OptimismAccessListEntry,
} from "./networks/10/OptimismTypes.ts";

// BNB Smart Chain (Chain ID: 56)
export { BNBClient } from "./networks/56/BNBClient.ts";
export type {
  BNBBlock,
  BNBTransaction,
  BNBTransactionReceipt,
  BNBLog,
  BNBLogFilter,
  BNBCallObject,
  BNBSyncingStatus,
  BNBFinalizedHeader,
  BNBFinalizedBlock,
  BNBBlobSidecars,
  BNBBlobSidecar,
  BNBTransactionDataAndReceipt,
  BNBHealthStatus,
  BNBTxPoolStatus,
  BlockNumberOrTag as BNBBlockNumberOrTag,
  BlockTag as BNBBlockTag,
  AccessListEntry as BNBAccessListEntry,
} from "./networks/56/BNBTypes.ts";

// Polygon (Chain ID: 137)
export { PolygonClient } from "./networks/137/PolygonClient.ts";
export type {
  PolygonBlock,
  PolygonTransaction,
  PolygonTransactionReceipt,
  PolygonLog,
  PolygonLogFilter,
  PolygonCallObject,
  BorValidator,
  BorSnapshot,
  BlockNumberOrTag as PolygonBlockNumberOrTag,
  BlockTag as PolygonBlockTag,
  AccessListEntry as PolygonAccessListEntry,
} from "./networks/137/PolygonTypes.ts";

// Base (Chain ID: 8453)
export { BaseClient } from "./networks/8453/BaseClient.ts";
export type {
  BaseBlock,
  BaseTransaction,
  BaseTransactionReceipt,
  BaseLog,
  BaseLogFilter,
  BaseCallObject,
  OptimismOutputAtBlock as BaseOutputAtBlock,
  OptimismSyncStatus as BaseSyncStatus,
  OptimismRollupConfig as BaseRollupConfig,
  OpP2PSelfInfo as BaseP2PSelfInfo,
  OpP2PPeersResponse as BaseP2PPeersResponse,
  OpP2PPeerStats as BaseP2PPeerStats,
  BlockNumberOrTag as BaseBlockNumberOrTag,
  BlockTag as BaseBlockTag,
  AccessListEntry as BaseAccessListEntry,
} from "./networks/8453/BaseTypes.ts";

// Arbitrum (Chain ID: 42161)
export { ArbitrumClient } from "./networks/42161/ArbitrumClient.ts";
export type {
  ArbitrumBlock,
  ArbitrumTransaction,
  ArbitrumTransactionReceipt,
  ArbitrumLog,
  ArbitrumLogFilter,
  ArbitrumCallObject,
  ArbitrumTrace,
  ArbitrumTraceResponse,
  ArbitrumTraceOptions,
  BlockNumberOrTag as ArbitrumBlockNumberOrTag,
} from "./networks/42161/ArbitrumTypes.ts";

// Aztec (Chain ID: 677868)
export { AztecClient } from "./networks/677868/AztecClient.ts";
export type {
  L2Block as AztecL2Block,
  BlockHeader as AztecBlockHeader,
  L2Tips as AztecL2Tips,
  Tx as AztecTx,
  TxReceipt as AztecTxReceipt,
  IndexedTxEffect as AztecIndexedTxEffect,
  TxValidationResult as AztecTxValidationResult,
  PublicSimulationOutput as AztecPublicSimulationOutput,
  WorldStateSyncStatus as AztecWorldStateSyncStatus,
  NodeInfo as AztecNodeInfo,
  L1ContractAddresses as AztecL1ContractAddresses,
  ProtocolContractAddresses as AztecProtocolContractAddresses,
  GasFees as AztecGasFees,
  BlockNumberOrLatest as AztecBlockNumberOrLatest,
} from "./networks/677868/AztecTypes.ts";

// Client Factory (Chain ID-based instantiation)
export { ClientFactory } from "./factory/ClientRegistry.ts";
export type { SupportedChainId, ClientConstructor, ChainIdToClient } from "./factory/ClientRegistry.ts";

// Strategy types and factory
export { StrategyFactory } from "./strategies/requestStrategy.ts";
export type { StrategyConfig } from "./strategies/requestStrategy.ts";
export type {
  RequestStrategy,
  StrategyResult,
  RPCMetadata,
  RPCProviderResponse,
} from "./strategies/strategiesTypes.ts";

// Concrete strategies
export { FallbackStrategy } from "./strategies/fallbackStrategy.ts";
export { ParallelStrategy } from "./strategies/parallelStrategy.ts";

// Legacy RPC client (for backwards compatibility)
export { RpcClient } from "./RpcClient.ts";
