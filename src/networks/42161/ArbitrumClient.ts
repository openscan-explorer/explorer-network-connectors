import { NetworkClient } from "../../NetworkClient.ts";
import type { StrategyResult } from "../../strategies/strategiesTypes.ts";
import type { StrategyConfig } from "../../strategies/requestStrategy.ts";
import type {
  ArbitrumBlock,
  ArbitrumTransaction,
  ArbitrumTransactionReceipt,
  ArbitrumLog,
  ArbitrumLogFilter,
  ArbitrumCallObject,
  ArbitrumTrace,
  ArbitrumTraceResponse,
  ArbitrumTraceOptions,
  BlockNumberOrTag,
} from "./ArbitrumTypes";

/**
 * Arbitrum-specific network client with strongly typed methods
 * Chain ID: 42161
 * Includes Arbitrum-specific trace methods (arbtrace_*)
 * Uses composition to integrate strategies with Arbitrum RPC methods
 *
 * Documentation: https://docs.arbitrum.io/build-decentralized-apps/nodeinterface/reference
 */
export class ArbitrumClient extends NetworkClient {
  constructor(config: StrategyConfig) {
    super(config);
  }

  // ===== Arbitrum-Specific Trace Methods (NETWORK-SPECIFIC - MOST IMPORTANT!) =====

  /**
   * Trace all calls in a block (Arbitrum-specific)
   * @param blockTag - Block number or tag
   */
  async arbtraceBlock(blockTag: BlockNumberOrTag): Promise<StrategyResult<ArbitrumTrace[]>> {
    return this.execute<ArbitrumTrace[]>("arbtrace_block", [blockTag]);
  }

  /**
   * Trace a transaction (Arbitrum-specific)
   * @param txHash - Transaction hash
   */
  async arbtraceTransaction(txHash: string): Promise<StrategyResult<ArbitrumTrace[]>> {
    return this.execute<ArbitrumTrace[]>("arbtrace_transaction", [txHash]);
  }

  /**
   * Trace a call (Arbitrum-specific)
   * Returns detailed trace information based on requested options
   * @param callObject - Call object
   * @param traceOptions - Array of trace options: 'trace', 'vmTrace', 'stateDiff'
   * @param blockTag - Block number or tag
   */
  async arbtraceCall(
    callObject: ArbitrumCallObject,
    traceOptions?: ArbitrumTraceOptions,
    blockTag?: BlockNumberOrTag
  ): Promise<StrategyResult<ArbitrumTraceResponse>> {
    const params: any[] = [callObject];
    if (traceOptions !== undefined) params.push(traceOptions);
    if (blockTag !== undefined) params.push(blockTag);
    return this.execute<ArbitrumTraceResponse>("arbtrace_call", params);
  }

  /**
   * Trace multiple calls (Arbitrum-specific)
   * Returns detailed trace information for multiple calls based on requested options
   * @param callObjects - Array of call objects
   * @param traceOptions - Array of trace options: 'trace', 'vmTrace', 'stateDiff'
   * @param blockTag - Block number or tag
   */
  async arbtraceCallMany(
    callObjects: ArbitrumCallObject[],
    traceOptions?: ArbitrumTraceOptions,
    blockTag?: BlockNumberOrTag
  ): Promise<StrategyResult<ArbitrumTraceResponse[]>> {
    const params: any[] = [callObjects];
    if (traceOptions !== undefined) params.push(traceOptions);
    if (blockTag !== undefined) params.push(blockTag);
    return this.execute<ArbitrumTraceResponse[]>("arbtrace_callMany", params);
  }

  // ===== Web3 Methods =====

  /**
   * Get the client version
   */
  async clientVersion(): Promise<StrategyResult<string>> {
    return this.execute<string>("web3_clientVersion");
  }

  /**
   * Calculate Keccak-256 hash
   * @param data - Data to hash
   */
  async sha3(data: string): Promise<StrategyResult<string>> {
    return this.execute<string>("web3_sha3", [data]);
  }

  // ===== Net Methods =====

  /**
   * Get the network ID
   */
  async version(): Promise<StrategyResult<string>> {
    return this.execute<string>("net_version");
  }

  /**
   * Check if the node is listening for connections
   */
  async listening(): Promise<StrategyResult<boolean>> {
    return this.execute<boolean>("net_listening");
  }

  /**
   * Get the number of connected peers
   */
  async peerCount(): Promise<StrategyResult<string>> {
    return this.execute<string>("net_peerCount");
  }

  // ===== Eth Methods =====

  /**
   * Get the protocol version
   */
  async protocolVersion(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_protocolVersion");
  }

  /**
   * Get syncing status
   * Returns false if not syncing, or an object with sync progress if syncing
   */
  async syncing(): Promise<StrategyResult<boolean | Record<string, any>>> {
    return this.execute<boolean | Record<string, any>>("eth_syncing");
  }

  /**
   * Get the chain ID
   */
  async chainId(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_chainId");
  }

  /**
   * Get list of addresses managed by the client/node
   */
  async accounts(): Promise<StrategyResult<string[]>> {
    return this.execute<string[]>("eth_accounts");
  }

  /**
   * Get the current block number
   */
  async blockNumber(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_blockNumber");
  }

  // ===== Block Methods =====

  /**
   * Get block by number
   * @param blockTag - Block number or tag (latest, earliest, pending)
   * @param fullTx - If true, returns full transaction objects; if false, returns transaction hashes
   */
  async getBlockByNumber(
    blockTag: BlockNumberOrTag,
    fullTx: boolean = false
  ): Promise<StrategyResult<ArbitrumBlock | null>> {
    return this.execute<ArbitrumBlock | null>("eth_getBlockByNumber", [blockTag, fullTx]);
  }

  /**
   * Get block by hash
   * @param blockHash - Block hash
   * @param fullTx - If true, returns full transaction objects; if false, returns transaction hashes
   */
  async getBlockByHash(
    blockHash: string,
    fullTx: boolean = false
  ): Promise<StrategyResult<ArbitrumBlock | null>> {
    return this.execute<ArbitrumBlock | null>("eth_getBlockByHash", [blockHash, fullTx]);
  }

  /**
   * Get the number of transactions in a block by block number
   * @param blockTag - Block number or tag
   */
  async getBlockTransactionCountByNumber(blockTag: BlockNumberOrTag): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getBlockTransactionCountByNumber", [blockTag]);
  }

  /**
   * Get the number of transactions in a block by block hash
   * @param blockHash - Block hash
   */
  async getBlockTransactionCountByHash(blockHash: string): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getBlockTransactionCountByHash", [blockHash]);
  }

  /**
   * Get uncle count by block number
   * @param blockTag - Block number or tag
   */
  async getUncleCountByBlockNumber(blockTag: BlockNumberOrTag): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getUncleCountByBlockNumber", [blockTag]);
  }

  /**
   * Get uncle count by block hash
   * @param blockHash - Block hash
   */
  async getUncleCountByBlockHash(blockHash: string): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getUncleCountByBlockHash", [blockHash]);
  }

  /**
   * Get uncle by block number and index
   * @param blockTag - Block number or tag
   * @param index - Uncle index
   */
  async getUncleByBlockNumberAndIndex(
    blockTag: BlockNumberOrTag,
    index: string
  ): Promise<StrategyResult<ArbitrumBlock | null>> {
    return this.execute<ArbitrumBlock | null>("eth_getUncleByBlockNumberAndIndex", [blockTag, index]);
  }

  /**
   * Get uncle by block hash and index
   * @param blockHash - Block hash
   * @param index - Uncle index
   */
  async getUncleByBlockHashAndIndex(
    blockHash: string,
    index: string
  ): Promise<StrategyResult<ArbitrumBlock | null>> {
    return this.execute<ArbitrumBlock | null>("eth_getUncleByBlockHashAndIndex", [blockHash, index]);
  }

  // ===== Account Methods =====

  /**
   * Get the balance of an account
   * @param address - Account address
   * @param blockTag - Block number or tag (default: latest)
   */
  async getBalance(address: string, blockTag: BlockNumberOrTag = "latest"): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getBalance", [address, blockTag]);
  }

  /**
   * Get the code at a specific address
   * @param address - Contract address
   * @param blockTag - Block number or tag (default: latest)
   */
  async getCode(address: string, blockTag: BlockNumberOrTag = "latest"): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getCode", [address, blockTag]);
  }

  /**
   * Get storage at a specific position
   * @param address - Contract address
   * @param position - Storage position
   * @param blockTag - Block number or tag (default: latest)
   */
  async getStorageAt(
    address: string,
    position: string,
    blockTag: BlockNumberOrTag = "latest"
  ): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getStorageAt", [address, position, blockTag]);
  }

  /**
   * Get the transaction count (nonce) for an address
   * @param address - Account address
   * @param blockTag - Block number or tag (default: latest)
   */
  async getTransactionCount(
    address: string,
    blockTag: BlockNumberOrTag = "latest"
  ): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getTransactionCount", [address, blockTag]);
  }

  /**
   * Get Merkle proof for account and storage values
   * @param address - Account address
   * @param storageKeys - Array of storage keys
   * @param blockTag - Block number or tag
   */
  async getProof(
    address: string,
    storageKeys: string[],
    blockTag: BlockNumberOrTag
  ): Promise<StrategyResult<unknown>> {
    return this.execute<unknown>("eth_getProof", [address, storageKeys, blockTag]);
  }

  // ===== Transaction Methods =====

  /**
   * Get transaction by hash
   * @param txHash - Transaction hash
   */
  async getTransactionByHash(txHash: string): Promise<StrategyResult<ArbitrumTransaction | null>> {
    return this.execute<ArbitrumTransaction | null>("eth_getTransactionByHash", [txHash]);
  }

  /**
   * Get transaction by block hash and index
   * @param blockHash - Block hash
   * @param index - Transaction index
   */
  async getTransactionByBlockHashAndIndex(
    blockHash: string,
    index: string
  ): Promise<StrategyResult<ArbitrumTransaction | null>> {
    return this.execute<ArbitrumTransaction | null>("eth_getTransactionByBlockHashAndIndex", [blockHash, index]);
  }

  /**
   * Get transaction by block number and index
   * @param blockTag - Block number or tag
   * @param index - Transaction index
   */
  async getTransactionByBlockNumberAndIndex(
    blockTag: BlockNumberOrTag,
    index: string
  ): Promise<StrategyResult<ArbitrumTransaction | null>> {
    return this.execute<ArbitrumTransaction | null>("eth_getTransactionByBlockNumberAndIndex", [blockTag, index]);
  }

  /**
   * Get transaction receipt
   * @param txHash - Transaction hash
   */
  async getTransactionReceipt(txHash: string): Promise<StrategyResult<ArbitrumTransactionReceipt | null>> {
    return this.execute<ArbitrumTransactionReceipt | null>("eth_getTransactionReceipt", [txHash]);
  }

  /**
   * Send raw signed transaction
   * @param signedTx - Signed transaction data
   */
  async sendRawTransaction(signedTx: string): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_sendRawTransaction", [signedTx]);
  }

  /**
   * Send transaction (requires unlocked account)
   * @param txObject - Transaction object
   */
  async sendTransaction(txObject: ArbitrumCallObject): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_sendTransaction", [txObject]);
  }

  // ===== Call & Gas Methods =====

  /**
   * Execute a call without creating a transaction
   * @param callObject - Call object
   * @param blockTag - Block number or tag
   */
  async callContract(callObject: ArbitrumCallObject, blockTag?: BlockNumberOrTag): Promise<StrategyResult<string>> {
    const params: any[] = [callObject];
    if (blockTag !== undefined) params.push(blockTag);
    return this.execute<string>("eth_call", params);
  }

  /**
   * Estimate gas for a transaction
   * @param txObject - Transaction object
   * @param blockTag - Block number or tag
   */
  async estimateGas(txObject: ArbitrumCallObject, blockTag?: BlockNumberOrTag): Promise<StrategyResult<string>> {
    const params: any[] = [txObject];
    if (blockTag !== undefined) params.push(blockTag);
    return this.execute<string>("eth_estimateGas", params);
  }

  /**
   * Get current gas price
   */
  async gasPrice(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_gasPrice");
  }

  /**
   * Get max priority fee per gas (EIP-1559)
   */
  async maxPriorityFeePerGas(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_maxPriorityFeePerGas");
  }

  /**
   * Get fee history (EIP-1559)
   * @param blockCount - Number of blocks to query
   * @param newestBlock - Newest block to query
   * @param rewardPercentiles - Array of percentiles for priority fee rewards
   */
  async feeHistory(
    blockCount: string,
    newestBlock: BlockNumberOrTag,
    rewardPercentiles?: number[]
  ): Promise<StrategyResult<any>> {
    const params: any[] = [blockCount, newestBlock];
    if (rewardPercentiles !== undefined) params.push(rewardPercentiles);
    return this.execute<any>("eth_feeHistory", params);
  }

  // ===== Logs & Filters =====

  /**
   * Get logs matching a filter
   * @param filterObject - Filter criteria
   */
  async getLogs(filterObject: ArbitrumLogFilter): Promise<StrategyResult<ArbitrumLog[]>> {
    return this.execute<ArbitrumLog[]>("eth_getLogs", [filterObject]);
  }

  /**
   * Create a new log filter
   * @param filterObject - Filter criteria
   */
  async newFilter(filterObject: ArbitrumLogFilter): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_newFilter", [filterObject]);
  }

  /**
   * Create a new block filter
   */
  async newBlockFilter(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_newBlockFilter");
  }

  /**
   * Create a new pending transaction filter
   */
  async newPendingTransactionFilter(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_newPendingTransactionFilter");
  }

  /**
   * Uninstall a filter
   * @param filterId - Filter ID
   */
  async uninstallFilter(filterId: string): Promise<StrategyResult<boolean>> {
    return this.execute<boolean>("eth_uninstallFilter", [filterId]);
  }

  /**
   * Get filter changes
   * @param filterId - Filter ID
   */
  async getFilterChanges(filterId: string): Promise<StrategyResult<any[]>> {
    return this.execute<any[]>("eth_getFilterChanges", [filterId]);
  }

  /**
   * Get filter logs
   * @param filterId - Filter ID
   */
  async getFilterLogs(filterId: string): Promise<StrategyResult<ArbitrumLog[]>> {
    return this.execute<ArbitrumLog[]>("eth_getFilterLogs", [filterId]);
  }

  // ===== TxPool Methods =====

  /**
   * Get transaction pool status
   */
  async txpoolStatus(): Promise<StrategyResult<{ pending: string; queued: string }>> {
    return this.execute<{ pending: string; queued: string }>("txpool_status");
  }

  /**
   * Get transaction pool content
   */
  async txpoolContent(): Promise<StrategyResult<Record<string, any>>> {
    return this.execute<Record<string, any>>("txpool_content");
  }

  /**
   * Get transaction pool inspect
   */
  async txpoolInspect(): Promise<StrategyResult<Record<string, any>>> {
    return this.execute<Record<string, any>>("txpool_inspect");
  }

  // ===== Debug Methods =====

  /**
   * Trace a transaction with debug options
   * @param txHash - Transaction hash
   * @param options - Trace options
   */
  async debugTraceTransaction(txHash: string, options: Record<string, any> = {}): Promise<StrategyResult<any>> {
    return this.execute<any>("debug_traceTransaction", [txHash, options]);
  }

  /**
   * Trace a call with debug options
   * @param callObject - Call object
   * @param options - Trace options
   * @param blockTag - Block number or tag
   */
  async debugTraceCall(
    callObject: ArbitrumCallObject,
    options: Record<string, any>,
    blockTag?: BlockNumberOrTag
  ): Promise<StrategyResult<any>> {
    const params: any[] = [callObject, options];
    if (blockTag !== undefined) params.push(blockTag);
    return this.execute<any>("debug_traceCall", params);
  }

  /**
   * Get storage range at a specific location
   * @param blockHash - Block hash
   * @param txIndex - Transaction index
   * @param address - Contract address
   * @param startKey - Starting key
   * @param maxResults - Maximum number of results
   */
  async storageRangeAt(
    blockHash: string,
    txIndex: number,
    address: string,
    startKey: string,
    maxResults: number
  ): Promise<StrategyResult<any>> {
    return this.execute<any>("debug_storageRangeAt", [blockHash, txIndex, address, startKey, maxResults]);
  }

  // ===== Mining Methods (Legacy - mostly unsupported on Arbitrum) =====

  /**
   * Check if mining is active
   */
  async mining(): Promise<StrategyResult<boolean>> {
    return this.execute<boolean>("eth_mining");
  }

  /**
   * Get current hash rate
   */
  async hashRate(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_hashrate");
  }

  /**
   * Get work for mining
   */
  async getWork(): Promise<StrategyResult<string[]>> {
    return this.execute<string[]>("eth_getWork");
  }

  /**
   * Submit mining work
   * @param nonce - Nonce
   * @param powHash - POW hash
   * @param digest - Digest
   */
  async submitWork(nonce: string, powHash: string, digest: string): Promise<StrategyResult<boolean>> {
    return this.execute<boolean>("eth_submitWork", [nonce, powHash, digest]);
  }

  /**
   * Submit hash rate
   * @param hashrate - Hash rate
   * @param id - Miner ID
   */
  async submitHashrate(hashrate: string, id: string): Promise<StrategyResult<boolean>> {
    return this.execute<boolean>("eth_submitHashrate", [hashrate, id]);
  }
}
