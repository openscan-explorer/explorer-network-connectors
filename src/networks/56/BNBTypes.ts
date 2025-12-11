/* biome-ignore-all lint/suspicious/noExplicitAny: <TODO> */
// BNB Smart Chain (BSC) RPC Types
// BSC is nearly fully compatible with Ethereum/Geth JSON-RPC API
// Chain ID: 56 (mainnet), 97 (testnet)

export type BlockTag = "latest" | "earliest" | "pending" | "safe" | "finalized";
export type BlockNumberOrTag = string | BlockTag;

// Block Types
export interface BNBBlock {
  number: string; // hex-encoded block number
  hash: string;
  parentHash: string;
  nonce: string;
  sha3Uncles: string;
  logsBloom: string;
  transactionsRoot: string;
  stateRoot: string;
  receiptsRoot: string;
  miner: string;
  difficulty: string;
  totalDifficulty?: string;
  extraData: string;
  size: string;
  gasLimit: string;
  gasUsed: string;
  timestamp: string;
  transactions: string[] | BNBTransaction[];
  uncles: string[];
  baseFeePerGas?: string; // Always 0 on BSC (BEP-226)
  mixHash?: string;
  withdrawalsRoot?: string;
  withdrawals?: BNBWithdrawal[];
}

// Transaction Types
export interface BNBTransaction {
  blockHash: string | null;
  blockNumber: string | null;
  from: string;
  gas: string;
  gasPrice?: string;
  maxFeePerGas?: string; // EIP-1559 via BEP-226
  maxPriorityFeePerGas?: string; // EIP-1559 via BEP-226
  maxFeePerBlobGas?: string; // EIP-4844 via BEP-336
  blobVersionedHashes?: string[]; // EIP-4844 via BEP-336
  hash: string;
  input: string;
  nonce: string;
  to: string | null;
  transactionIndex: string | null;
  value: string;
  type: string; // "0x0" (legacy), "0x1" (EIP-2930), "0x2" (EIP-1559), "0x3" (EIP-4844)
  accessList?: AccessListEntry[]; // EIP-2930
  chainId?: string;
  v: string;
  r: string;
  s: string;
  yParity?: string;
}

export interface AccessListEntry {
  address: string;
  storageKeys: string[];
}

export interface BNBTransactionReceipt {
  transactionHash: string;
  transactionIndex: string;
  blockHash: string;
  blockNumber: string;
  from: string;
  to: string | null;
  cumulativeGasUsed: string;
  effectiveGasPrice?: string;
  gasUsed: string;
  blobGasUsed?: string; // EIP-4844
  blobGasPrice?: string; // EIP-4844
  contractAddress: string | null;
  logs: BNBLog[];
  logsBloom: string;
  type: string;
  root?: string;
  status?: string; // "0x0" (failure) or "0x1" (success)
}

// Log Types
export interface BNBLog {
  removed?: boolean;
  logIndex: string;
  transactionIndex: string;
  transactionHash: string;
  blockHash: string;
  blockNumber: string;
  address: string;
  data: string;
  topics: string[];
}

export interface BNBLogFilter {
  fromBlock?: BlockNumberOrTag;
  toBlock?: BlockNumberOrTag;
  address?: string | string[];
  topics?: (string | string[] | null)[];
  blockHash?: string;
}

// Call/Transaction Object Types
export interface BNBCallObject {
  from?: string;
  to?: string;
  gas?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  maxFeePerBlobGas?: string;
  blobVersionedHashes?: string[];
  value?: string;
  data?: string;
  accessList?: AccessListEntry[];
  type?: string;
  nonce?: string;
  chainId?: string;
}

export interface BNBWithdrawal {
  index: string;
  validatorIndex: string;
  address: string;
  amount: string;
}

// eth_syncing return type
export interface BNBSyncingStatus {
  startingBlock: string;
  currentBlock: string;
  highestBlock: string;
}

// BSC-Specific Types (BEP-126: Fast Finality)
export interface BNBFinalizedHeader {
  parentHash: string;
  sha3Uncles: string;
  miner: string;
  stateRoot: string;
  transactionsRoot: string;
  receiptsRoot: string;
  logsBloom: string;
  difficulty: string;
  number: string;
  gasLimit: string;
  gasUsed: string;
  timestamp: string;
  extraData: string;
  mixHash: string;
  nonce: string;
  baseFeePerGas?: string;
  withdrawalsRoot?: string;
  hash: string;
}

export interface BNBFinalizedBlock {
  header: BNBFinalizedHeader;
  transactions: string[] | BNBTransaction[];
  uncles: string[];
  withdrawals?: BNBWithdrawal[];
}

// BSC-Specific Types (BEP-336: Blob Transactions)
export interface BNBBlobSidecar {
  blockHash: string;
  blockNumber: string;
  txHash: string;
  txIndex: string;
  blobItem: {
    blobHash: string;
    kzgCommitment: string;
    kzgProof: string;
    blob?: string; // Full blob data (optional, controlled by fullBlob parameter)
  };
}

export interface BNBBlobSidecars {
  blockHash: string;
  blockNumber: string;
  sidecars: BNBBlobSidecar[];
}

// Transaction data and receipt combined response
export interface BNBTransactionDataAndReceipt {
  transaction: BNBTransaction;
  receipt: BNBTransactionReceipt;
}

// Health check response
export type BNBHealthStatus = boolean;

// TxPool types
export interface BNBTxPoolStatus {
  pending: string;
  queued: string;
}

// JSON-RPC Types
export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: number | string;
  method: string;
  params?: any[];
}

export interface JsonRpcResponse<T = any> {
  jsonrpc: "2.0";
  id: number | string;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}
