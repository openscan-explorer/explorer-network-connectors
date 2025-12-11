/* biome-ignore-all lint/suspicious/noExplicitAny: <TODO> */
// Arbitrum RPC Types

export type ArbitrumBlockTag = "latest" | "earliest" | "pending";
export type BlockNumberOrTag = string | ArbitrumBlockTag;

// Block Types
export interface ArbitrumBlock {
  baseFeePerGas: string;
  difficulty: string;
  extraData: string;
  gasLimit: string;
  gasUsed: string;
  hash: string;
  l1BlockNumber: string;
  logsBloom: string;
  miner: string;
  mixHash: string;
  nonce: string;
  number: string;
  parentHash: string;
  receiptsRoot: string;
  sendCount: string;
  sendRoot: string;
  sha3Uncles: string;
  size: string;
  stateRoot: string;
  timestamp: string;
  transactions: string[] | ArbitrumTransaction[];
  transactionsRoot: string;
  uncles: string[];
}

// Transaction Types
export interface ArbitrumTransaction {
  blockHash: string;
  blockNumber: string;
  from: string;
  gas: string;
  gasPrice: string;
  hash: string;
  input: string;
  nonce: string;
  to: string;
  transactionIndex?: string;
  value: string;
  type: string;
  chainId: string;
  v: string;
  r: string;
  s: string;
}

export interface ArbitrumTransactionReceipt {
  blockHash: string;
  blockNumber: string;
  contractAddress: string | null;
  cumulativeGasUsed: string;
  effectiveGasPrice: string;
  from: string;
  gasUsed: string;
  gasUsedForL1: string;
  l1BlockNumber: string;
  logs: ArbitrumLog[];
  logsBloom: string;
  status: string;
  timeboosted: boolean;
  to: string;
  transactionHash: string;
  transactionIndex: string;
  type: string;
}

// Log Types
export interface ArbitrumLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string;
  transactionHash: string;
  transactionIndex: string;
  blockHash: string;
  logIndex: string;
  removed: boolean;
}

export interface ArbitrumLogFilter {
  fromBlock?: BlockNumberOrTag;
  toBlock?: BlockNumberOrTag;
  address?: string | string[];
  topics?: (string | string[] | null)[];
  blockHash?: string;
}

// Call/Transaction Object Types
export interface ArbitrumCallObject {
  from?: string;
  to?: string;
  gas?: string;
  gasPrice?: string;
  value?: string;
  data?: string;
  nonce?: string;
  [key: string]: any;
}

// ===== Trace Types =====

/**
 * Call types for CALL-like operations
 */
export type TraceCallType = "call" | "callcode" | "delegatecall" | "staticcall";

/**
 * Creation methods for CREATE operations
 */
export type TraceCreationMethod = "create" | "create2";

/**
 * Reward types for mining rewards
 */
export type TraceRewardType = "block" | "uncle" | "emptystep" | "external";

/**
 * Call action - represents CALL, CALLCODE, DELEGATECALL, STATICCALL operations
 */
export interface TraceActionCall {
  from: string;
  to: string;
  value: string;
  gas: string;
  input: string;
  callType: TraceCallType;
}

/**
 * Create action - represents CREATE or CREATE2 operations
 */
export interface TraceActionCreate {
  from: string;
  value: string;
  gas: string;
  init: string;
  creationMethod?: TraceCreationMethod;
}

/**
 * Suicide/SelfDestruct action - represents SELFDESTRUCT operation
 */
export interface TraceActionSuicide {
  address: string;
  refundAddress: string;
  balance: string;
}

/**
 * Reward action - represents block or uncle mining rewards
 */
export interface TraceActionReward {
  author: string;
  value: string;
  rewardType: TraceRewardType;
}

/**
 * Union type for all trace actions
 */
export type TraceAction =
  | TraceActionCall
  | TraceActionCreate
  | TraceActionSuicide
  | TraceActionReward;

/**
 * Result of a successful CALL operation
 */
export interface TraceResultCall {
  gasUsed: string;
  output: string;
}

/**
 * Result of a successful CREATE operation
 */
export interface TraceResultCreate {
  gasUsed: string;
  code: string;
  address: string;
}

/**
 * Union type for trace results
 */
export type TraceResult = TraceResultCall | TraceResultCreate | null;

/**
 * Main trace object returned by arbtrace_* methods
 * This is the individual trace for a single operation in a transaction
 * Note: arbtrace_* methods work on blocks prior to 22207816 (pre-Nitro)
 * For blocks after 22207818, use debug_trace* methods instead
 */
export interface ArbitrumTrace {
  /**
   * Type of trace operation
   */
  type: "call" | "create" | "suicide" | "reward";

  /**
   * Action details specific to the operation type
   */
  action: TraceAction;

  /**
   * Result of the operation (null for failed operations or rewards)
   */
  result?: TraceResult;

  /**
   * Error message if the operation failed
   */
  error?: string;

  /**
   * Position in the call hierarchy (array of indices)
   * e.g., [0, 1] means second sub-call of first call
   */
  traceAddress: number[];

  /**
   * Number of child traces
   */
  subtraces: number;

  /**
   * Transaction position in block (null for arbtrace_call)
   */
  transactionPosition?: number | null;

  /**
   * Transaction hash (null for arbtrace_call)
   */
  transactionHash?: string | null;

  /**
   * Block number
   */
  blockNumber?: string;

  /**
   * Block hash
   */
  blockHash?: string;
}

// ===== VM Trace Types =====

/**
 * VM operation memory change
 */
export interface VmTraceMemory {
  data: string;
  off: number;
}

/**
 * VM operation storage change
 */
export interface VmTraceStorage {
  key: string;
  val: string;
}

/**
 * VM operation execution details
 */
export interface VmTraceEx {
  /**
   * Memory changes (null if none)
   */
  mem?: VmTraceMemory | null;

  /**
   * Values pushed to stack
   */
  push?: string[];

  /**
   * Storage changes (null if none)
   */
  store?: VmTraceStorage | null;

  /**
   * Gas used at this point
   */
  used: number;
}

/**
 * Individual VM operation
 */
export interface VmTraceOperation {
  /**
   * Gas cost of this operation
   */
  cost: number;

  /**
   * Execution details (memory, stack, storage changes)
   */
  ex?: VmTraceEx;

  /**
   * Program counter position
   */
  pc: number;

  /**
   * Sub-traces for nested calls (null if none)
   */
  sub?: VmTrace | null;
}

/**
 * VM Trace structure - provides opcode-level execution trace
 */
export interface VmTrace {
  /**
   * Code being executed (hex string)
   */
  code: string;

  /**
   * Array of operations executed
   */
  ops: VmTraceOperation[];
}

// ===== State Diff Types =====

/**
 * State change indicator
 * "=" means no change
 * "*" means value changed from one to another
 * "+" means value was added (account created)
 * "-" means value was removed (account deleted)
 */
export type StateDiffChange<T = string> =
  | "="
  | { "*": { from: T; to: T } }
  | { "+": T }
  | { "-": T };

/**
 * Storage slot changes for an address
 * Maps storage slot (hex string) to its change
 */
export interface StateDiffStorage {
  [storageSlot: string]: StateDiffChange;
}

/**
 * State diff for a single address
 */
export interface StateDiffEntry {
  /**
   * Balance change
   */
  balance: StateDiffChange;

  /**
   * Code change
   */
  code: StateDiffChange;

  /**
   * Nonce change
   */
  nonce: StateDiffChange;

  /**
   * Storage changes by slot
   */
  storage: StateDiffStorage;
}

/**
 * Complete state diff structure
 * Maps address to its state changes
 */
export interface StateDiff {
  [address: string]: StateDiffEntry;
}

// ===== Trace Response Wrappers =====

/**
 * Response from arbtrace_call and arbtrace_callMany
 * Contains optional trace, vmTrace, and stateDiff based on requested options
 */
export interface ArbitrumTraceResponse {
  /**
   * Output data from the call
   */
  output: string;

  /**
   * Array of trace objects (when "trace" is requested)
   */
  trace?: ArbitrumTrace[];

  /**
   * VM execution trace (when "vmTrace" is requested)
   */
  vmTrace?: VmTrace | null;

  /**
   * State changes (when "stateDiff" is requested)
   */
  stateDiff?: StateDiff | null;

  /**
   * Contracts destroyed during execution
   */
  destroyedContracts?: string[] | null;
}

/**
 * Trace options for arbtrace_call and arbtrace_callMany
 */
export type ArbitrumTraceOptions = Array<"trace" | "vmTrace" | "stateDiff">;

// RPC Request/Response Types
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
