/* biome-ignore-all lint/suspicious/noExplicitAny: <TODO> */
// Polygon RPC Types
// Chain ID: 137
// Documentation: https://docs.polygon.technology/pos/reference/rpc-endpoints/

// ===== Block Tags & Identifiers =====

export type BlockTag = "latest" | "earliest" | "pending" | "finalized";
export type BlockNumberOrTag = string | BlockTag;

// ===== Block Structure =====

export interface PolygonBlock {
  // Standard Ethereum block fields
  number: string; // Hex-encoded block number
  hash: string; // Block hash
  parentHash: string; // Parent block hash
  nonce: string; // Nonce for PoW
  sha3Uncles: string; // Uncle hash
  logsBloom: string; // Logs bloom filter
  transactionsRoot: string; // Transaction trie root
  stateRoot: string; // State trie root
  receiptsRoot: string; // Receipts trie root
  miner: string; // Beneficiary address (validator on Polygon)
  difficulty: string; // Difficulty
  totalDifficulty?: string; // Total difficulty
  extraData: string; // Extra data
  size: string; // Block size in bytes
  gasLimit: string; // Gas limit
  gasUsed: string; // Gas used
  timestamp: string; // Timestamp
  transactions: string[] | PolygonTransaction[]; // Tx hashes or full objects
  uncles: string[]; // Uncle hashes

  // EIP-1559 fields
  baseFeePerGas?: string; // Base fee per gas

  // Post-merge fields
  mixHash?: string; // Mix hash

  // Shanghai fields
  withdrawalsRoot?: string; // Withdrawals root
  withdrawals?: PolygonWithdrawal[]; // Withdrawals array
}

// ===== Transaction Structure =====

export interface PolygonTransaction {
  // Standard Ethereum transaction fields
  blockHash: string | null; // Block hash (null if pending)
  blockNumber: string | null; // Block number (null if pending)
  from: string; // Sender address
  gas: string; // Gas limit
  gasPrice?: string; // Gas price (optional for EIP-1559)
  hash: string; // Transaction hash
  input: string; // Transaction data
  nonce: string; // Nonce
  to: string | null; // Recipient address (null for contract creation)
  transactionIndex: string | null; // Transaction index (null if pending)
  value: string; // Value in wei
  type: string; // Transaction type ("0x0", "0x1", "0x2", "0x3")
  chainId?: string; // Chain ID

  // EIP-2930 fields (type 0x1)
  accessList?: AccessListEntry[]; // Access list

  // EIP-1559 fields (type 0x2)
  maxFeePerGas?: string; // Max fee per gas
  maxPriorityFeePerGas?: string; // Max priority fee per gas

  // EIP-4844 fields (type 0x3, blob transactions)
  maxFeePerBlobGas?: string; // Max fee per blob gas
  blobVersionedHashes?: string[]; // Blob versioned hashes

  // Signature fields
  v: string; // Signature V
  r: string; // Signature R
  s: string; // Signature S
  yParity?: string; // Y parity (EIP-2930/1559)
}

// ===== Transaction Receipt =====

export interface PolygonTransactionReceipt {
  // Standard Ethereum receipt fields
  transactionHash: string; // Transaction hash
  transactionIndex: string; // Transaction index in block
  blockHash: string; // Block hash
  blockNumber: string; // Block number
  from: string; // Sender address
  to: string | null; // Recipient address (null for contract creation)
  cumulativeGasUsed: string; // Cumulative gas used in block
  gasUsed: string; // Gas used by this transaction
  contractAddress: string | null; // Contract address (if contract creation)
  logs: PolygonLog[]; // Event logs
  logsBloom: string; // Logs bloom filter
  type: string; // Transaction type

  // EIP-1559 fields
  effectiveGasPrice?: string; // Effective gas price (post-London)

  // EIP-4844 fields
  blobGasUsed?: string; // Blob gas used
  blobGasPrice?: string; // Blob gas price

  // Status fields (mutually exclusive based on fork)
  root?: string; // State root (pre-Byzantium)
  status?: string; // Status ("0x0" failure, "0x1" success, post-Byzantium)
}

// ===== Log Structure =====

export interface PolygonLog {
  removed: boolean; // True if log was removed (chain reorg)
  logIndex: string; // Log index in block
  transactionIndex: string; // Transaction index
  transactionHash: string; // Transaction hash
  blockHash: string; // Block hash
  blockNumber: string; // Block number
  address: string; // Contract address
  data: string; // Log data
  topics: string[]; // Indexed log topics
  blockTimestamp: string; // Block timestamp (Polygon-specific extension)
}

// ===== Log Filter =====

export interface PolygonLogFilter {
  fromBlock?: BlockNumberOrTag; // Starting block
  toBlock?: BlockNumberOrTag; // Ending block
  address?: string | string[]; // Contract address(es)
  topics?: (string | string[] | null)[]; // Topic filters
  blockHash?: string; // Alternative to fromBlock/toBlock
}

// ===== Call/Transaction Object =====

export interface PolygonCallObject {
  from?: string; // Sender address
  to?: string; // Recipient address
  gas?: string; // Gas limit
  gasPrice?: string; // Gas price
  value?: string; // Value in wei
  data?: string; // Transaction data
  nonce?: string; // Nonce
  chainId?: string; // Chain ID
  type?: string; // Transaction type

  // EIP-2930 fields
  accessList?: AccessListEntry[]; // Access list

  // EIP-1559 fields
  maxFeePerGas?: string; // Max fee per gas
  maxPriorityFeePerGas?: string; // Max priority fee per gas

  // EIP-4844 fields
  maxFeePerBlobGas?: string; // Max fee per blob gas
  blobVersionedHashes?: string[]; // Blob versioned hashes
}

// ===== Supporting Types =====

export interface AccessListEntry {
  address: string; // Contract address
  storageKeys: string[]; // Storage keys
}

export interface PolygonWithdrawal {
  index: string; // Withdrawal index
  validatorIndex: string; // Validator index
  address: string; // Recipient address
  amount: string; // Amount in Gwei
}

export interface EthSyncingStatus {
  startingBlock: string; // Starting block
  currentBlock: string; // Current block
  highestBlock: string; // Highest known block
}

// ===== POLYGON BOR-SPECIFIC TYPES =====

/**
 * Validator information in Polygon's Bor consensus
 */
export interface BorValidator {
  ID: number; // Validator identifier
  signer: string; // Validator's address (hex format)
  power: string; // Validator's voting power
  accum: string; // Validator's proposer priority value
}

/**
 * Snapshot of the Bor state at a given block
 */
export interface BorSnapshot {
  number: number; // Block number
  hash: string; // Block hash
  validators: {
    [address: string]: number; // Map of validator addresses to their voting power
  };
  recents: {
    [blockNumber: string]: string; // Map of recent block numbers to signer addresses
  };
}

// ===== JSON-RPC Types =====

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
