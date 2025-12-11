// Base L2 RPC Types
/** biome-ignore-all lint/suspicious/noExplicitAny: <TODO> */
// Chain ID: 8453
// Base is built on the OP Stack and shares the same RPC methods as Optimism

export type BlockTag = "latest" | "earliest" | "pending" | "safe" | "finalized";
export type BlockNumberOrTag = string | BlockTag;

// Block Types
export interface BaseBlock {
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
  transactions: string[] | BaseTransaction[]; // transaction hashes or full objects
  uncles: string[];
  baseFeePerGas?: string; // EIP-1559
  mixHash?: string;
  withdrawalsRoot?: string;
  withdrawals?: BaseWithdrawal[];
}

// Transaction Types
export interface BaseTransaction {
  blockHash: string | null;
  blockNumber: string | null;
  from: string;
  gas: string;
  gasPrice?: string;
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
  // Base L2-specific fields (OP Stack)
  l1BlockNumber?: string;
  l1TxOrigin?: string | null;
  queueOrigin?: string;
  rawTransaction?: string;
}

export interface AccessListEntry {
  address: string;
  storageKeys: string[];
}

export interface BaseTransactionReceipt {
  transactionHash: string;
  transactionIndex: string;
  blockHash: string;
  blockNumber: string;
  from: string;
  to: string | null;
  cumulativeGasUsed: string;
  effectiveGasPrice?: string; // EIP-1559
  gasUsed: string;
  blobGasUsed?: string; // EIP-4844
  blobGasPrice?: string; // EIP-4844
  contractAddress: string | null; // if contract creation
  logs: BaseLog[];
  logsBloom: string;
  type: string; // "0x0", "0x1", "0x2", or "0x3"
  root?: string; // pre-Byzantium
  status?: string; // post-Byzantium: "0x0" (failure) or "0x1" (success)
  // Base L2-specific fields (OP Stack L1 fee data)
  l1Fee?: string;
  l1GasPrice?: string;
  l1GasUsed?: string;
}

// Log Types
export interface BaseLog {
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

export interface BaseLogFilter {
  fromBlock?: BlockNumberOrTag;
  toBlock?: BlockNumberOrTag;
  address?: string | string[];
  topics?: (string | string[] | null)[];
  blockHash?: string; // alternative to fromBlock/toBlock
}

// Call/Transaction Object Types
export interface BaseCallObject {
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

export interface BaseWithdrawal {
  index: string;
  validatorIndex: string;
  address: string;
  amount: string;
}

// ===== Base-Specific Types (OP Stack) =====

// optimism_outputAtBlock return type
export interface L2BlockRef {
  hash: string;
  number: string;
  parentHash: string;
  timestamp: string;
}

export interface OptimismOutputAtBlock {
  version: string; // DATA(32 bytes)
  outputRoot: string; // DATA(32 bytes)
  blockRef: L2BlockRef;
  withdrawalStorageRoot: string; // DATA(32 bytes)
  stateRoot: string; // DATA(32 bytes)
  syncStatus: OptimismSyncStatus;
}

// optimism_syncStatus return type
export interface OptimismSyncStatus {
  current_l1: {
    hash: string;
    number: string;
    parentHash: string;
    timestamp: string;
  };
  head_l1: {
    hash: string;
    number: string;
    parentHash: string;
    timestamp: string;
  };
  safe_l1: {
    hash: string;
    number: string;
    parentHash: string;
    timestamp: string;
  };
  finalized_l1: {
    hash: string;
    number: string;
    parentHash: string;
    timestamp: string;
  };
  unsafe_l2: {
    hash: string;
    number: string;
    parentHash: string;
    timestamp: string;
    l1origin: {
      hash: string;
      number: string;
    };
    sequenceNumber: string;
  };
  safe_l2: {
    hash: string;
    number: string;
    parentHash: string;
    timestamp: string;
    l1origin: {
      hash: string;
      number: string;
    };
    sequenceNumber: string;
  };
  finalized_l2: {
    hash: string;
    number: string;
    parentHash: string;
    timestamp: string;
    l1origin: {
      hash: string;
      number: string;
    };
    sequenceNumber: string;
  };
  pending_safe_l2: {
    hash: string;
    number: string;
    parentHash: string;
    timestamp: string;
    l1origin: {
      hash: string;
      number: string;
    };
    sequenceNumber: string;
  };
}

// optimism_rollupConfig return type
export interface OptimismRollupConfig {
  genesis: {
    l1: {
      hash: string;
      number: string;
    };
    l2: {
      hash: string;
      number: string;
    };
    l2_time: string;
    system_config: {
      batcherAddr: string;
      overhead: string;
      scalar: string;
      gasLimit: string;
    };
  };
  block_time: string;
  max_sequencer_drift: string;
  seq_window_size: string;
  channel_timeout: string;
  l1_chain_id: string;
  l2_chain_id: string;
  regolith_time?: string;
  canyon_time?: string;
  delta_time?: string;
  ecotone_time?: string;
  fjord_time?: string;
  batch_inbox_address: string;
  deposit_contract_address: string;
  l1_system_config_address: string;
}

// opp2p_self return type
export interface OpP2PSelfInfo {
  peerID: string;
  nodeID: string;
  userAgent: string;
  protocolVersion: string;
  enr: string;
  addresses: string[];
}

// opp2p_peers return type
export interface OpP2PPeerInfo {
  peerID: string;
  nodeID: string;
  userAgent: string;
  protocolVersion: string;
  enr: string;
  addresses: string[];
  direction: string;
  protected: boolean;
  score: number;
  gossipBlocks: boolean;
}

export interface OpP2PPeersResponse {
  totalConnected: number;
  peers: Record<string, OpP2PPeerInfo>;
  bannedPeers: string[];
  bannedIPs: string[];
  bannedSubnets: string[];
}

// opp2p_peerStats return type
export interface OpP2PPeerStats {
  connected: number;
  table: number;
  blocksTopic: number;
  blocksTopicV2: number;
  blocksTopicV3: number;
  banned: number;
  known: number;
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
  params?: string[];
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
