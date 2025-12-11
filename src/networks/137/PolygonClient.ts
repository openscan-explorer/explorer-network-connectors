/* biome-ignore-all lint/suspicious/noExplicitAny: <TODO> */
import { NetworkClient } from "../../NetworkClient.js";
import type { StrategyResult } from "../../strategies/strategiesTypes.js";
import type { StrategyConfig } from "../../strategies/requestStrategy.js";
import type {
  PolygonBlock,
  PolygonTransaction,
  PolygonTransactionReceipt,
  PolygonLog,
  PolygonLogFilter,
  PolygonCallObject,
  BlockNumberOrTag,
  AccessListEntry,
  EthSyncingStatus,
  BorValidator,
  BorSnapshot,
} from "./PolygonTypes.js";

/**
 * Polygon-specific network client with typed methods
 * Chain ID: 137
 * Uses composition to integrate strategies with Polygon RPC methods
 *
 * Documentation: https://docs.polygon.technology/pos/reference/rpc-endpoints/
 */
export class PolygonClient extends NetworkClient {
  constructor(config: StrategyConfig) {
    super(config);
  }

  // ===== BOR-SPECIFIC METHODS (POLYGON CONSENSUS ENGINE) =====

  /**
   * Get the author (validator) address of a block
   * @param blockNumber - Block number (hex string)
   * @returns {StrategyResult<string>} Validator address that produced the block
   */
  async borGetAuthor(blockNumber: string): Promise<StrategyResult<string>> {
    return this.execute<string>("bor_getAuthor", [blockNumber]);
  }

  /**
   * Get the current proposer for the next block
   * @returns {StrategyResult<string>} Address of the current proposer
   */
  async borGetCurrentProposer(): Promise<StrategyResult<string>> {
    return this.execute<string>("bor_getCurrentProposer");
  }

  /**
   * Get the current list of validators participating in consensus
   * @returns {StrategyResult<BorValidator[]>} Array of current validators with their info
   */
  async borGetCurrentValidators(): Promise<StrategyResult<BorValidator[]>> {
    return this.execute<BorValidator[]>("bor_getCurrentValidators");
  }

  /**
   * Get the Merkle root hash for a range of blocks
   * @param startBlock - Starting block number
   * @param endBlock - Ending block number
   * @returns {StrategyResult<string>} Root hash for the block range
   */
  async borGetRootHash(startBlock: number, endBlock: number): Promise<StrategyResult<string>> {
    return this.execute<string>("bor_getRootHash", [startBlock, endBlock]);
  }

  /**
   * Get the list of signers (validators) for a block by its hash
   * @param blockHash - Block hash
   * @returns {StrategyResult<string[]>} Array of signer addresses
   */
  async borGetSignersAtHash(blockHash: string): Promise<StrategyResult<string[]>> {
    return this.execute<string[]>("bor_getSignersAtHash", [blockHash]);
  }

  /**
   * Get a snapshot of the Bor state at a given block
   * @param blockNumber - Block number (hex string or number)
   * @returns {StrategyResult<BorSnapshot>} Snapshot containing validators and recent signers
   */
  async borGetSnapshot(blockNumber: string | number): Promise<StrategyResult<BorSnapshot>> {
    return this.execute<BorSnapshot>("bor_getSnapshot", [blockNumber]);
  }

  /**
   * Get the list of validator addresses who signed a specific block
   * @param blockNumber - Block number (hex string or number)
   * @returns {StrategyResult<string[]>} Array of validator addresses
   */
  async borGetSigners(blockNumber: string | number): Promise<StrategyResult<string[]>> {
    return this.execute<string[]>("bor_getSigners", [blockNumber]);
  }

  // ===== Web3 Methods =====

  /**
   * Get the client version
   * @returns {StrategyResult<string>} Client version string
   */
  async clientVersion(): Promise<StrategyResult<string>> {
    return this.execute<string>("web3_clientVersion");
  }

  /**
   * Calculate Keccak-256 hash
   * @param data - Data to hash (hex string)
   * @returns {StrategyResult<string>} Keccak-256 hash
   */
  async sha3(data: string): Promise<StrategyResult<string>> {
    return this.execute<string>("web3_sha3", [data]);
  }

  // ===== Net Methods =====

  /**
   * Get the network ID
   * @returns {StrategyResult<string>} Network ID
   */
  async version(): Promise<StrategyResult<string>> {
    return this.execute<string>("net_version");
  }

  /**
   * Check if the node is listening for connections
   * @returns {StrategyResult<boolean>} True if listening
   */
  async listening(): Promise<StrategyResult<boolean>> {
    return this.execute<boolean>("net_listening");
  }

  /**
   * Get the number of connected peers
   * @returns {StrategyResult<string>} Number of peers (hex)
   */
  async peerCount(): Promise<StrategyResult<string>> {
    return this.execute<string>("net_peerCount");
  }

  // ===== Eth Methods =====

  /**
   * Get the protocol version
   * @returns {StrategyResult<string>} Protocol version
   */
  async protocolVersion(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_protocolVersion");
  }

  /**
   * Get syncing status
   * @returns {StrategyResult} False if not syncing, or sync progress object
   */
  async syncing(): Promise<StrategyResult<boolean | EthSyncingStatus>> {
    return this.execute<boolean | EthSyncingStatus>("eth_syncing");
  }

  /**
   * Get the chain ID
   * @returns {StrategyResult<string>} Chain ID (hex)
   */
  async chainId(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_chainId");
  }

  /**
   * Get list of addresses managed by the client
   * @returns {StrategyResult<string[]>} Array of addresses
   */
  async accounts(): Promise<StrategyResult<string[]>> {
    return this.execute<string[]>("eth_accounts");
  }

  /**
   * Get the current block number
   * @returns {StrategyResult<string>} Current block number (hex)
   */
  async blockNumber(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_blockNumber");
  }

  // ===== Block Methods =====

  /**
   * Get block by number
   * @param blockTag - Block number (hex) or tag (latest, earliest, pending, safe, finalized)
   * @param fullTx - If true, returns full transaction objects; if false, returns transaction hashes
   * @returns {StrategyResult} Block object or null
   */
  async getBlockByNumber(
    blockTag: BlockNumberOrTag,
    fullTx: boolean = false,
  ): Promise<StrategyResult<PolygonBlock | null>> {
    return this.execute<PolygonBlock | null>("eth_getBlockByNumber", [blockTag, fullTx]);
  }

  /**
   * Get block by hash
   * @param blockHash - Block hash
   * @param fullTx - If true, returns full transaction objects; if false, returns transaction hashes
   * @returns {StrategyResult} Block object or null
   */
  async getBlockByHash(
    blockHash: string,
    fullTx: boolean = false,
  ): Promise<StrategyResult<PolygonBlock | null>> {
    return this.execute<PolygonBlock | null>("eth_getBlockByHash", [blockHash, fullTx]);
  }

  /**
   * Get transaction count in a block by block number
   * @param blockTag - Block number or tag
   * @returns {StrategyResult<string>} Transaction count (hex)
   */
  async getBlockTransactionCountByNumber(
    blockTag: BlockNumberOrTag,
  ): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getBlockTransactionCountByNumber", [blockTag]);
  }

  /**
   * Get transaction count in a block by block hash
   * @param blockHash - Block hash
   * @returns {StrategyResult<string>} Transaction count (hex)
   */
  async getBlockTransactionCountByHash(blockHash: string): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getBlockTransactionCountByHash", [blockHash]);
  }

  /**
   * Get uncle count by block number
   * @param blockTag - Block number or tag
   * @returns {StrategyResult<string>} Uncle count (hex)
   */
  async getUncleCountByBlockNumber(blockTag: BlockNumberOrTag): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getUncleCountByBlockNumber", [blockTag]);
  }

  /**
   * Get uncle count by block hash
   * @param blockHash - Block hash
   * @returns {StrategyResult<string>} Uncle count (hex)
   */
  async getUncleCountByBlockHash(blockHash: string): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getUncleCountByBlockHash", [blockHash]);
  }

  /**
   * Get uncle by block number and index
   * @param blockTag - Block number or tag
   * @param index - Uncle index (hex)
   * @returns {StrategyResult} Uncle block or null
   */
  async getUncleByBlockNumberAndIndex(
    blockTag: BlockNumberOrTag,
    index: string,
  ): Promise<StrategyResult<PolygonBlock | null>> {
    return this.execute<PolygonBlock | null>("eth_getUncleByBlockNumberAndIndex", [
      blockTag,
      index,
    ]);
  }

  /**
   * Get uncle by block hash and index
   * @param blockHash - Block hash
   * @param index - Uncle index (hex)
   * @returns {StrategyResult} Uncle block or null
   */
  async getUncleByBlockHashAndIndex(
    blockHash: string,
    index: string,
  ): Promise<StrategyResult<PolygonBlock | null>> {
    return this.execute<PolygonBlock | null>("eth_getUncleByBlockHashAndIndex", [blockHash, index]);
  }

  // ===== Account Methods =====

  /**
   * Get account balance
   * @param address - Account address
   * @param blockTag - Block number or tag (default: latest)
   * @returns {StrategyResult<string>} Balance in wei (hex)
   */
  async getBalance(
    address: string,
    blockTag: BlockNumberOrTag = "latest",
  ): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getBalance", [address, blockTag]);
  }

  /**
   * Get contract code
   * @param address - Contract address
   * @param blockTag - Block number or tag (default: latest)
   * @returns {StrategyResult<string>} Contract bytecode
   */
  async getCode(
    address: string,
    blockTag: BlockNumberOrTag = "latest",
  ): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getCode", [address, blockTag]);
  }

  /**
   * Get storage value at position
   * @param address - Contract address
   * @param position - Storage position (hex)
   * @param blockTag - Block number or tag (default: latest)
   * @returns {StrategyResult<string>} Storage value (hex)
   */
  async getStorageAt(
    address: string,
    position: string,
    blockTag: BlockNumberOrTag = "latest",
  ): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getStorageAt", [address, position, blockTag]);
  }

  /**
   * Get transaction count (nonce) for address
   * @param address - Account address
   * @param blockTag - Block number or tag (default: latest)
   * @returns {StrategyResult<string>} Transaction count (hex)
   */
  async getTransactionCount(
    address: string,
    blockTag: BlockNumberOrTag = "latest",
  ): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getTransactionCount", [address, blockTag]);
  }

  /**
   * Get Merkle proof for account and storage values
   * @param address - Account address
   * @param storageKeys - Array of storage keys
   * @param blockTag - Block number or tag
   * @returns {StrategyResult} Account proof object
   */
  async getProof(
    address: string,
    storageKeys: string[],
    blockTag: BlockNumberOrTag,
  ): Promise<StrategyResult<unknown>> {
    return this.execute<unknown>("eth_getProof", [address, storageKeys, blockTag]);
  }

  // ===== Transaction Methods =====

  /**
   * Get transaction by hash
   * @param txHash - Transaction hash
   * @returns {StrategyResult} Transaction object or null
   */
  async getTransactionByHash(txHash: string): Promise<StrategyResult<PolygonTransaction | null>> {
    return this.execute<PolygonTransaction | null>("eth_getTransactionByHash", [txHash]);
  }

  /**
   * Get transaction by block hash and index
   * @param blockHash - Block hash
   * @param index - Transaction index (hex)
   * @returns {StrategyResult} Transaction object or null
   */
  async getTransactionByBlockHashAndIndex(
    blockHash: string,
    index: string,
  ): Promise<StrategyResult<PolygonTransaction | null>> {
    return this.execute<PolygonTransaction | null>("eth_getTransactionByBlockHashAndIndex", [
      blockHash,
      index,
    ]);
  }

  /**
   * Get transaction by block number and index
   * @param blockTag - Block number or tag
   * @param index - Transaction index (hex)
   * @returns {StrategyResult} Transaction object or null
   */
  async getTransactionByBlockNumberAndIndex(
    blockTag: BlockNumberOrTag,
    index: string,
  ): Promise<StrategyResult<PolygonTransaction | null>> {
    return this.execute<PolygonTransaction | null>("eth_getTransactionByBlockNumberAndIndex", [
      blockTag,
      index,
    ]);
  }

  /**
   * Get transaction receipt
   * @param txHash - Transaction hash
   * @returns {StrategyResult} Transaction receipt or null
   */
  async getTransactionReceipt(
    txHash: string,
  ): Promise<StrategyResult<PolygonTransactionReceipt | null>> {
    return this.execute<PolygonTransactionReceipt | null>("eth_getTransactionReceipt", [txHash]);
  }

  /**
   * Send raw signed transaction
   * @param signedTx - Signed transaction data (hex)
   * @returns {StrategyResult<string>} Transaction hash
   */
  async sendRawTransaction(signedTx: string): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_sendRawTransaction", [signedTx]);
  }

  /**
   * Send transaction (requires unlocked account)
   * @param txObject - Transaction object
   * @returns {StrategyResult<string>} Transaction hash
   */
  async sendTransaction(txObject: PolygonCallObject): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_sendTransaction", [txObject]);
  }

  // ===== Call & Gas Estimation Methods =====

  /**
   * Execute call without creating transaction
   * @param callObject - Call object
   * @param blockTag - Block number or tag (optional)
   * @returns {StrategyResult<string>} Return data
   */
  async call(
    callObject: PolygonCallObject,
    blockTag?: BlockNumberOrTag,
  ): Promise<StrategyResult<string>> {
    const params: any[] = [callObject];
    if (blockTag !== undefined) params.push(blockTag);
    return this.execute<string>("eth_call", params);
  }

  /**
   * Estimate gas for transaction
   * @param txObject - Transaction object
   * @param blockTag - Block number or tag (optional)
   * @returns {StrategyResult<string>} Estimated gas (hex)
   */
  async estimateGas(
    txObject: PolygonCallObject,
    blockTag?: BlockNumberOrTag,
  ): Promise<StrategyResult<string>> {
    const params: any[] = [txObject];
    if (blockTag !== undefined) params.push(blockTag);
    return this.execute<string>("eth_estimateGas", params);
  }

  /**
   * Create access list for transaction
   * @param txObject - Transaction object
   * @param blockTag - Block number or tag (optional)
   * @returns {StrategyResult} Access list and gas used
   */
  async createAccessList(
    txObject: PolygonCallObject,
    blockTag?: BlockNumberOrTag,
  ): Promise<StrategyResult<{ accessList: AccessListEntry[]; gasUsed: string }>> {
    const params: any[] = [txObject];
    if (blockTag !== undefined) params.push(blockTag);
    return this.execute<{ accessList: AccessListEntry[]; gasUsed: string }>(
      "eth_createAccessList",
      params,
    );
  }

  // ===== Fee Methods (EIP-1559) =====

  /**
   * Get current gas price
   * @returns {StrategyResult<string>} Gas price in wei (hex)
   */
  async gasPrice(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_gasPrice");
  }

  /**
   * Get max priority fee per gas (EIP-1559)
   * @returns {StrategyResult<string>} Max priority fee per gas (hex)
   */
  async maxPriorityFeePerGas(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_maxPriorityFeePerGas");
  }

  /**
   * Get fee history (EIP-1559)
   * @param blockCount - Number of blocks to query (hex)
   * @param newestBlock - Newest block to query
   * @param rewardPercentiles - Array of percentiles for priority fee rewards
   * @returns {StrategyResult} Fee history object
   */
  async feeHistory(
    blockCount: string,
    newestBlock: BlockNumberOrTag,
    rewardPercentiles?: number[],
  ): Promise<StrategyResult<any>> {
    const params: any[] = [blockCount, newestBlock];
    if (rewardPercentiles !== undefined) params.push(rewardPercentiles);
    return this.execute<any>("eth_feeHistory", params);
  }

  // ===== Log & Filter Methods =====

  /**
   * Get logs matching filter
   * @param filterObject - Log filter criteria
   * @returns {StrategyResult} Array of logs
   */
  async getLogs(filterObject: PolygonLogFilter): Promise<StrategyResult<PolygonLog[]>> {
    return this.execute<PolygonLog[]>("eth_getLogs", [filterObject]);
  }

  /**
   * Create new log filter
   * @param filterObject - Log filter criteria
   * @returns {StrategyResult<string>} Filter ID
   */
  async newFilter(filterObject: PolygonLogFilter): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_newFilter", [filterObject]);
  }

  /**
   * Create new block filter
   * @returns {StrategyResult<string>} Filter ID
   */
  async newBlockFilter(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_newBlockFilter");
  }

  /**
   * Create new pending transaction filter
   * @returns {StrategyResult<string>} Filter ID
   */
  async newPendingTransactionFilter(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_newPendingTransactionFilter");
  }

  /**
   * Uninstall filter
   * @param filterId - Filter ID
   * @returns {StrategyResult<boolean>} True if filter was uninstalled
   */
  async uninstallFilter(filterId: string): Promise<StrategyResult<boolean>> {
    return this.execute<boolean>("eth_uninstallFilter", [filterId]);
  }

  /**
   * Get filter changes
   * @param filterId - Filter ID
   * @returns {StrategyResult} Array of logs or block hashes
   */
  async getFilterChanges(filterId: string): Promise<StrategyResult<any[]>> {
    return this.execute<any[]>("eth_getFilterChanges", [filterId]);
  }

  /**
   * Get all logs for filter
   * @param filterId - Filter ID
   * @returns {StrategyResult} Array of logs
   */
  async getFilterLogs(filterId: string): Promise<StrategyResult<PolygonLog[]>> {
    return this.execute<PolygonLog[]>("eth_getFilterLogs", [filterId]);
  }

  // ===== TxPool Methods =====

  /**
   * Get transaction pool status
   * @returns {StrategyResult} Pool status with pending and queued counts
   */
  async txpoolStatus(): Promise<StrategyResult<{ pending: string; queued: string }>> {
    return this.execute<{ pending: string; queued: string }>("txpool_status");
  }

  /**
   * Get transaction pool content
   * @returns {StrategyResult} Pool content
   */
  async txpoolContent(): Promise<StrategyResult<Record<string, any>>> {
    return this.execute<Record<string, any>>("txpool_content");
  }

  /**
   * Get transaction pool inspection data
   * @returns {StrategyResult} Pool inspection data
   */
  async txpoolInspect(): Promise<StrategyResult<Record<string, any>>> {
    return this.execute<Record<string, any>>("txpool_inspect");
  }

  // ===== Debug Methods =====

  /**
   * Trace transaction with debug options
   * @param txHash - Transaction hash
   * @param options - Trace options
   * @returns {StrategyResult} Trace result
   */
  async debugTraceTransaction(
    txHash: string,
    options: Record<string, any> = {},
  ): Promise<StrategyResult<any>> {
    return this.execute<any>("debug_traceTransaction", [txHash, options]);
  }

  /**
   * Trace call with debug options
   * @param callObject - Call object
   * @param blockTag - Block number or tag
   * @param options - Trace options
   * @returns {StrategyResult} Trace result
   */
  async debugTraceCall(
    callObject: PolygonCallObject,
    blockTag: BlockNumberOrTag,
    options: Record<string, any> = {},
  ): Promise<StrategyResult<any>> {
    return this.execute<any>("debug_traceCall", [callObject, blockTag, options]);
  }

  /**
   * Get storage range at specific location
   * @param blockHash - Block hash
   * @param txIndex - Transaction index
   * @param address - Contract address
   * @param startKey - Starting storage key
   * @param maxResults - Maximum number of results
   * @returns {StrategyResult} Storage range data
   */
  async debugStorageRangeAt(
    blockHash: string,
    txIndex: number,
    address: string,
    startKey: string,
    maxResults: number,
  ): Promise<StrategyResult<any>> {
    return this.execute<any>("debug_storageRangeAt", [
      blockHash,
      txIndex,
      address,
      startKey,
      maxResults,
    ]);
  }

  // ===== Trace Methods =====

  /**
   * Trace all transactions in a block
   * @param blockNumber - Block number (hex) or number
   * @returns {StrategyResult} Array of traces
   */
  async traceBlock(blockNumber: string | number): Promise<StrategyResult<any>> {
    return this.execute<any>("trace_block", [blockNumber]);
  }

  /**
   * Trace a transaction
   * @param txHash - Transaction hash
   * @returns {StrategyResult} Array of traces
   */
  async traceTransaction(txHash: string): Promise<StrategyResult<any>> {
    return this.execute<any>("trace_transaction", [txHash]);
  }

  /**
   * Trace a call
   * @param callObject - Call object
   * @param traceTypes - Array of trace types (e.g., ["trace", "vmTrace", "stateDiff"])
   * @param blockTag - Block number or tag (optional)
   * @returns {StrategyResult} Trace result
   */
  async traceCall(
    callObject: PolygonCallObject,
    traceTypes: string[],
    blockTag?: BlockNumberOrTag,
  ): Promise<StrategyResult<any>> {
    const params: any[] = [callObject, traceTypes];
    if (blockTag !== undefined) params.push(blockTag);
    return this.execute<any>("trace_call", params);
  }

  /**
   * Trace raw transaction
   * @param signedTx - Signed transaction data
   * @param traceTypes - Array of trace types
   * @returns {StrategyResult} Trace result
   */
  async traceRawTransaction(signedTx: string, traceTypes: string[]): Promise<StrategyResult<any>> {
    return this.execute<any>("trace_rawTransaction", [signedTx, traceTypes]);
  }

  /**
   * Trace transactions matching filter
   * @param filter - Trace filter
   * @returns {StrategyResult} Array of traces
   */
  async traceFilter(filter: Record<string, any>): Promise<StrategyResult<any>> {
    return this.execute<any>("trace_filter", [filter]);
  }

  // ===== Mining Methods (Legacy - usually unsupported) =====

  /**
   * Check if mining is active
   * @returns {StrategyResult<boolean>} True if mining
   */
  async mining(): Promise<StrategyResult<boolean>> {
    return this.execute<boolean>("eth_mining");
  }

  /**
   * Get current hash rate
   * @returns {StrategyResult<string>} Hash rate (hex)
   */
  async hashrate(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_hashrate");
  }

  /**
   * Get mining work
   * @returns {StrategyResult<string[]>} Array with current block header, seed hash, and boundary condition
   */
  async getWork(): Promise<StrategyResult<string[]>> {
    return this.execute<string[]>("eth_getWork");
  }

  /**
   * Submit mining work
   * @param nonce - Nonce (hex)
   * @param powHash - POW hash
   * @param digest - Mix digest
   * @returns {StrategyResult<boolean>} True if work was valid
   */
  async submitWork(
    nonce: string,
    powHash: string,
    digest: string,
  ): Promise<StrategyResult<boolean>> {
    return this.execute<boolean>("eth_submitWork", [nonce, powHash, digest]);
  }

  /**
   * Submit mining hashrate
   * @param hashrate - Hash rate (hex)
   * @param id - Miner ID
   * @returns {StrategyResult<boolean>} True if submission was successful
   */
  async submitHashrate(hashrate: string, id: string): Promise<StrategyResult<boolean>> {
    return this.execute<boolean>("eth_submitHashrate", [hashrate, id]);
  }
}
