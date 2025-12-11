/* biome-ignore-all lint/suspicious/noExplicitAny: <TODO> */
// BNB Smart Chain Testnet RPC Types
// Chain ID: 97
// BSC Testnet is fully compatible with BSC mainnet API

// Re-export all types from BNB mainnet as they are identical
export type {
  BlockTag,
  BlockNumberOrTag,
  BNBBlock as BNBTestnetBlock,
  BNBTransaction as BNBTestnetTransaction,
  BNBTransactionReceipt as BNBTestnetTransactionReceipt,
  BNBLog as BNBTestnetLog,
  BNBLogFilter as BNBTestnetLogFilter,
  BNBCallObject as BNBTestnetCallObject,
  BNBWithdrawal as BNBTestnetWithdrawal,
  BNBSyncingStatus as BNBTestnetSyncingStatus,
  BNBFinalizedHeader as BNBTestnetFinalizedHeader,
  BNBFinalizedBlock as BNBTestnetFinalizedBlock,
  BNBBlobSidecar as BNBTestnetBlobSidecar,
  BNBBlobSidecars as BNBTestnetBlobSidecars,
  BNBTransactionDataAndReceipt as BNBTestnetTransactionDataAndReceipt,
  BNBHealthStatus as BNBTestnetHealthStatus,
  BNBTxPoolStatus as BNBTestnetTxPoolStatus,
  AccessListEntry,
  JsonRpcRequest,
  JsonRpcResponse,
} from "../56/BNBTypes.js";
