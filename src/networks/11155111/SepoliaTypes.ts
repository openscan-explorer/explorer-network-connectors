/* biome-ignore-all lint/suspicious/noExplicitAny: <TODO> */
// Sepolia Testnet RPC Types
// Chain ID: 11155111
// Sepolia is fully compatible with Ethereum mainnet API

// Re-export all types from Ethereum mainnet as they are identical
export type {
  BlockTag,
  BlockNumberOrTag,
  EthBlock as SepoliaBlock,
  EthTransaction as SepoliaTransaction,
  EthTransactionReceipt as SepoliaTransactionReceipt,
  EthLog as SepoliaLog,
  EthLogFilter as SepoliaLogFilter,
  EthCallObject as SepoliaCallObject,
  EthWithdrawal as SepoliaWithdrawal,
  EthSyncingStatus as SepoliaSyncingStatus,
  AccessListEntry,
  JsonRpcRequest,
  JsonRpcResponse,
} from "../1/EthereumTypes.js";
