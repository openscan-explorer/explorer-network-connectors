/* biome-ignore-all lint/suspicious/noExplicitAny: <TODO> */
// Ethereum L1 RPC Types

export type BlockTag = "latest" | "earliest" | "pending" | "finalized" | "safe";
export type BlockNumberOrTag = string | BlockTag;

// Block Types
export interface EthBlock {
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
  totalDifficulty?: string; // may be present pre/post merge as 0x0
  extraData: string;
  size: string;
  gasLimit: string;
  gasUsed: string;
  timestamp: string;
  transactions: string[] | EthTransaction[]; // transaction hashes or full objects
  uncles: string[];
  baseFeePerGas?: string; // EIP-1559
  mixHash?: string;
  withdrawalsRoot?: string; // Shanghai
  withdrawals?: EthWithdrawal[]; // Shanghai
}

// Transaction Types
export interface EthTransaction {
  blockHash: string | null;
  blockNumber: string | null;
  from: string;
  gas: string;
  gasPrice?: string; // optional for EIP-1559/cancun
  maxFeePerGas?: string; // EIP-1559
  maxPriorityFeePerGas?: string; // EIP-1559
  maxFeePerBlobGas?: string; // EIP-4844
  blobVersionedHashes?: string[]; // EIP-4844
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
  yParity?: string; // EIP-2930/EIP-1559
}

export interface AccessListEntry {
  address: string;
  storageKeys: string[];
}

export interface EthTransactionReceipt {
  transactionHash: string;
  transactionIndex: string;
  blockHash: string;
  blockNumber: string;
  from: string;
  to: string | null;
  cumulativeGasUsed: string;
  effectiveGasPrice?: string; // EIP-1559 (may be absent pre-London)
  gasUsed: string;
  blobGasUsed?: string; // EIP-4844
  blobGasPrice?: string; // EIP-4844
  contractAddress: string | null; // if contract creation
  logs: EthLog[];
  logsBloom: string;
  type: string; // "0x0", "0x1", "0x2", or "0x3"
  root?: string; // pre-Byzantium
  status?: string; // post-Byzantium: "0x0" (failure) or "0x1" (success)
}

// Log Types
export interface EthLog {
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

export interface EthLogFilter {
  fromBlock?: BlockNumberOrTag;
  toBlock?: BlockNumberOrTag;
  address?: string | string[];
  topics?: (string | string[] | null)[];
  blockHash?: string; // alternative to fromBlock/toBlock
}

// Call/Transaction Object Types
export interface EthCallObject {
  from?: string;
  to?: string;
  gas?: string;
  gasPrice?: string;
  maxFeePerGas?: string; // EIP-1559
  maxPriorityFeePerGas?: string; // EIP-1559
  maxFeePerBlobGas?: string; // EIP-4844
  blobVersionedHashes?: string[]; // EIP-4844
  value?: string;
  data?: string;
  accessList?: AccessListEntry[]; // EIP-2930
  type?: string; // "0x0", "0x1", or "0x2"
  nonce?: string;
  chainId?: string;
}

export interface EthWithdrawal {
  index: string;
  validatorIndex: string;
  address: string;
  amount: string;
}

// eth_syncing return type
export interface EthSyncingStatus {
  startingBlock: string;
  currentBlock: string;
  highestBlock: string;
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
