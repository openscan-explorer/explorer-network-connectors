// Base client
export { NetworkClient } from "./NetworkClient.js";

// Ethereum (Chain ID: 1)
export { EthereumClient } from "./networks/1/EthereumClient.js";
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
} from "./networks/1/EthereumTypes.js";

// Optimism (Chain ID: 10)
export { OptimismClient } from "./networks/10/OptimismClient.js";
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
} from "./networks/10/OptimismTypes.js";

// BNB Smart Chain (Chain ID: 56)
export { BNBClient } from "./networks/56/BNBClient.js";
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
} from "./networks/56/BNBTypes.js";

// BNB Smart Chain Testnet (Chain ID: 97)
export { BNBTestnetClient } from "./networks/97/BNBTestnetClient.js";
export type {
  BNBTestnetBlock,
  BNBTestnetTransaction,
  BNBTestnetTransactionReceipt,
  BNBTestnetLog,
  BNBTestnetLogFilter,
  BNBTestnetCallObject,
  BNBTestnetSyncingStatus,
  BNBTestnetFinalizedHeader,
  BNBTestnetFinalizedBlock,
  BNBTestnetBlobSidecars,
  BNBTestnetBlobSidecar,
  BNBTestnetTransactionDataAndReceipt,
  BNBTestnetHealthStatus,
  BNBTestnetTxPoolStatus,
  BlockNumberOrTag as BNBTestnetBlockNumberOrTag,
  BlockTag as BNBTestnetBlockTag,
  AccessListEntry as BNBTestnetAccessListEntry,
} from "./networks/97/BNBTestnetTypes.js";

// Polygon (Chain ID: 137)
export { PolygonClient } from "./networks/137/PolygonClient.js";
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
} from "./networks/137/PolygonTypes.js";

// Base (Chain ID: 8453)
export { BaseClient } from "./networks/8453/BaseClient.js";
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
} from "./networks/8453/BaseTypes.js";

// Arbitrum (Chain ID: 42161)
export { ArbitrumClient } from "./networks/42161/ArbitrumClient.js";
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
} from "./networks/42161/ArbitrumTypes.js";

// Aztec (Chain ID: 677868)
export { AztecClient } from "./networks/677868/AztecClient.js";
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
} from "./networks/677868/AztecTypes.js";

// Sepolia Testnet (Chain ID: 11155111)
export { SepoliaClient } from "./networks/11155111/SepoliaClient.js";
export type {
  SepoliaBlock,
  SepoliaTransaction,
  SepoliaTransactionReceipt,
  SepoliaLog,
  SepoliaLogFilter,
  SepoliaCallObject,
  SepoliaWithdrawal,
  SepoliaSyncingStatus,
  BlockNumberOrTag as SepoliaBlockNumberOrTag,
  BlockTag as SepoliaBlockTag,
  AccessListEntry as SepoliaAccessListEntry,
} from "./networks/11155111/SepoliaTypes.js";

// Client Factory (Chain ID-based instantiation)
export { ClientFactory } from "./factory/ClientRegistry.js";
export type { SupportedChainId, ClientConstructor, ChainIdToClient } from "./factory/ClientRegistry.js";

// Strategy types and factory
export { StrategyFactory } from "./strategies/requestStrategy.js";
export type { StrategyConfig } from "./strategies/requestStrategy.js";
export type {
  RequestStrategy,
  StrategyResult,
  RPCMetadata,
  RPCProviderResponse,
} from "./strategies/strategiesTypes.js";

// Concrete strategies
export { FallbackStrategy } from "./strategies/fallbackStrategy.js";
export { ParallelStrategy } from "./strategies/parallelStrategy.js";

// Legacy RPC client (for backwards compatibility)
export { RpcClient } from "./RpcClient.js";
