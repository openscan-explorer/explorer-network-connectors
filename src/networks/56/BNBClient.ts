/* biome-ignore-all lint/suspicious/noExplicitAny: <TODO> */
import { NetworkClient } from "../../NetworkClient.js";
import type { StrategyResult } from "../../strategies/strategiesTypes.js";
import type { StrategyConfig } from "../../strategies/requestStrategy.js";
import type {
  BNBBlock,
  BNBTransaction,
  BNBTransactionReceipt,
  BNBLog,
  BNBLogFilter,
  BNBCallObject,
  BlockNumberOrTag,
  AccessListEntry,
  BNBSyncingStatus,
  BNBFinalizedHeader,
  BNBFinalizedBlock,
  BNBBlobSidecars,
  BNBBlobSidecar,
  BNBTransactionDataAndReceipt,
  BNBHealthStatus,
  BNBTxPoolStatus,
} from "./BNBTypes.js";

/**
 * BNB Smart Chain (BSC) network client with typed methods
 * Chain ID: 56 (mainnet), 97 (testnet)
 *
 * BSC is nearly fully compatible with Ethereum/Geth JSON-RPC API
 * with additional BSC-specific methods for fast finality (BEP-126)
 * and blob transactions (BEP-336).
 *
 * Note: eth_getLogs is disabled on official BSC public endpoints.
 * Use third-party providers (NodeReal, Ankr, Moralis, etc.) for log queries.
 */
export class BNBClient extends NetworkClient {
  constructor(config: StrategyConfig) {
    super(config);
  }

  // ===== BSC-Specific Methods (NETWORK-SPECIFIC - MOST IMPORTANT!) =====
  // BEP-126: Fast Finality Methods
  // BEP-336: Blob Transaction Methods
  // BSC Utility Methods

  /**
   * Get block header by number with support for "safe" and "finalized" tags
   * BSC-specific extension supporting fast finality (BEP-126)
   *
   * @param blockTag - Block number or tag ("latest", "safe", "finalized")
   */
  async getHeaderByNumber(
    blockTag: BlockNumberOrTag,
  ): Promise<StrategyResult<BNBFinalizedHeader | null>> {
    return this.execute<BNBFinalizedHeader | null>("eth_getHeaderByNumber", [blockTag]);
  }

  /**
   * Get finalized block header with security level control (BEP-126)
   *
   * @param verifiedValidatorNum - Security level:
   *   -1: at least 1/2 of current validators
   *   -2: at least 2/3 of current validators (recommended)
   *   -3: highest security level
   */
  async getFinalizedHeader(
    verifiedValidatorNum: -1 | -2 | -3 = -2,
  ): Promise<StrategyResult<BNBFinalizedHeader | null>> {
    return this.execute<BNBFinalizedHeader | null>("eth_getFinalizedHeader", [
      verifiedValidatorNum,
    ]);
  }

  /**
   * Get finalized block with security level control (BEP-126)
   *
   * @param verifiedValidatorNum - Security level (-1, -2, or -3)
   * @param fullTx - If true, returns full transaction objects; if false, only hashes
   */
  async getFinalizedBlock(
    verifiedValidatorNum: -1 | -2 | -3 = -2,
    fullTx: boolean = false,
  ): Promise<StrategyResult<BNBFinalizedBlock | null>> {
    return this.execute<BNBFinalizedBlock | null>("eth_getFinalizedBlock", [
      verifiedValidatorNum,
      fullTx,
    ]);
  }

  /**
   * Create a filter to trace latest finalized blocks (BEP-126)
   * Returns a filter ID valid for 5 minutes
   */
  async newFinalizedHeaderFilter(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_newFinalizedHeaderFilter");
  }

  /**
   * Get blob sidecars for all transactions in a block (BEP-336)
   *
   * @param blockTag - Block number or tag
   * @param fullBlob - If true, returns full blob data; if false, only first 32 bytes
   */
  async getBlobSidecars(
    blockTag: BlockNumberOrTag,
    fullBlob: boolean = true,
  ): Promise<StrategyResult<BNBBlobSidecars | null>> {
    return this.execute<BNBBlobSidecars | null>("eth_getBlobSidecars", [blockTag, fullBlob]);
  }

  /**
   * Get blob sidecar data for a specific transaction (BEP-336)
   *
   * @param txHash - Transaction hash
   * @param fullBlob - If true, returns full blob data; if false, only first 32 bytes (default: true)
   */
  async getBlobSidecarByTxHash(
    txHash: string,
    fullBlob: boolean = true,
  ): Promise<StrategyResult<BNBBlobSidecar | null>> {
    return this.execute<BNBBlobSidecar | null>("eth_getBlobSidecarByTxHash", [txHash, fullBlob]);
  }

  /**
   * Health check endpoint to detect if the RPC function is working correctly
   * Returns true if healthy, false if not
   */
  async health(): Promise<StrategyResult<BNBHealthStatus>> {
    return this.execute<BNBHealthStatus>("eth_health");
  }

  /**
   * Get all transactions for a given block number
   * More efficient than multiple individual transaction queries
   *
   * @param blockTag - Block number or tag
   */
  async getTransactionsByBlockNumber(
    blockTag: BlockNumberOrTag,
  ): Promise<StrategyResult<BNBTransaction[]>> {
    return this.execute<BNBTransaction[]>("eth_getTransactionsByBlockNumber", [blockTag]);
  }

  /**
   * Get both transaction data and receipt in a single call
   * Reduces round-trips compared to separate calls
   *
   * @param txHash - Transaction hash
   */
  async getTransactionDataAndReceipt(
    txHash: string,
  ): Promise<StrategyResult<BNBTransactionDataAndReceipt | null>> {
    return this.execute<BNBTransactionDataAndReceipt | null>("eth_getTransactionDataAndReceipt", [
      txHash,
    ]);
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
   * Get the chain ID
   * Returns 0x38 (56) for BSC mainnet, 0x61 (97) for testnet
   */
  async chainId(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_chainId");
  }

  /**
   * Get syncing status
   * Returns false if not syncing, or an object with sync progress if syncing
   */
  async syncing(): Promise<StrategyResult<boolean | BNBSyncingStatus>> {
    return this.execute<boolean | BNBSyncingStatus>("eth_syncing");
  }

  /**
   * Get the current block number
   */
  async blockNumber(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_blockNumber");
  }

  async getBlockByNumber(
    blockTag: BlockNumberOrTag,
    fullTx: boolean = false,
  ): Promise<StrategyResult<BNBBlock | null>> {
    return this.execute<BNBBlock | null>("eth_getBlockByNumber", [blockTag, fullTx]);
  }

  async getBlockByHash(
    blockHash: string,
    fullTx: boolean = false,
  ): Promise<StrategyResult<BNBBlock | null>> {
    return this.execute<BNBBlock | null>("eth_getBlockByHash", [blockHash, fullTx]);
  }

  async getBlockTransactionCountByNumber(
    blockTag: BlockNumberOrTag,
  ): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getBlockTransactionCountByNumber", [blockTag]);
  }

  async getBlockTransactionCountByHash(blockHash: string): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getBlockTransactionCountByHash", [blockHash]);
  }

  async getBlockReceipts(
    blockTag: BlockNumberOrTag,
  ): Promise<StrategyResult<BNBTransactionReceipt[]>> {
    return this.execute<BNBTransactionReceipt[]>("eth_getBlockReceipts", [blockTag]);
  }

  async getUncleCountByBlockNumber(blockTag: BlockNumberOrTag): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getUncleCountByBlockNumber", [blockTag]);
  }

  async getUncleCountByBlockHash(blockHash: string): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getUncleCountByBlockHash", [blockHash]);
  }

  async getUncleByBlockNumberAndIndex(
    blockTag: BlockNumberOrTag,
    index: string,
  ): Promise<StrategyResult<BNBBlock | null>> {
    return this.execute<BNBBlock | null>("eth_getUncleByBlockNumberAndIndex", [blockTag, index]);
  }

  async getUncleByBlockHashAndIndex(
    blockHash: string,
    index: string,
  ): Promise<StrategyResult<BNBBlock | null>> {
    return this.execute<BNBBlock | null>("eth_getUncleByBlockHashAndIndex", [blockHash, index]);
  }

  async getBalance(
    address: string,
    blockTag: BlockNumberOrTag = "latest",
  ): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getBalance", [address, blockTag]);
  }

  async getCode(
    address: string,
    blockTag: BlockNumberOrTag = "latest",
  ): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getCode", [address, blockTag]);
  }

  async getStorageAt(
    address: string,
    position: string,
    blockTag: BlockNumberOrTag = "latest",
  ): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getStorageAt", [address, position, blockTag]);
  }

  async getTransactionCount(
    address: string,
    blockTag: BlockNumberOrTag = "latest",
  ): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_getTransactionCount", [address, blockTag]);
  }

  async getProof(
    address: string,
    storageKeys: string[],
    blockTag: BlockNumberOrTag,
  ): Promise<StrategyResult<unknown>> {
    return this.execute<unknown>("eth_getProof", [address, storageKeys, blockTag]);
  }

  async sendRawTransaction(signedTx: string): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_sendRawTransaction", [signedTx]);
  }

  async callContract(
    callObject: BNBCallObject,
    blockTag?: BlockNumberOrTag,
  ): Promise<StrategyResult<string>> {
    const params: any[] = [callObject];
    if (blockTag !== undefined) params.push(blockTag);
    return this.execute<string>("eth_call", params);
  }

  async estimateGas(
    txObject: BNBCallObject,
    blockTag?: BlockNumberOrTag,
  ): Promise<StrategyResult<string>> {
    const params: any[] = [txObject];
    if (blockTag !== undefined) params.push(blockTag);
    return this.execute<string>("eth_estimateGas", params);
  }

  async createAccessList(
    txObject: BNBCallObject,
    blockTag?: BlockNumberOrTag,
  ): Promise<StrategyResult<{ accessList: AccessListEntry[]; gasUsed: string }>> {
    const params: any[] = [txObject];
    if (blockTag !== undefined) params.push(blockTag);
    return this.execute<{ accessList: AccessListEntry[]; gasUsed: string }>(
      "eth_createAccessList",
      params,
    );
  }

  // ===== Block / Transaction Queries =====

  async getTransactionByHash(txHash: string): Promise<StrategyResult<BNBTransaction | null>> {
    return this.execute<BNBTransaction | null>("eth_getTransactionByHash", [txHash]);
  }

  async getTransactionByBlockHashAndIndex(
    blockHash: string,
    index: string,
  ): Promise<StrategyResult<BNBTransaction | null>> {
    return this.execute<BNBTransaction | null>("eth_getTransactionByBlockHashAndIndex", [
      blockHash,
      index,
    ]);
  }

  async getTransactionByBlockNumberAndIndex(
    blockTag: BlockNumberOrTag,
    index: string,
  ): Promise<StrategyResult<BNBTransaction | null>> {
    return this.execute<BNBTransaction | null>("eth_getTransactionByBlockNumberAndIndex", [
      blockTag,
      index,
    ]);
  }

  async getTransactionReceipt(
    txHash: string,
  ): Promise<StrategyResult<BNBTransactionReceipt | null>> {
    return this.execute<BNBTransactionReceipt | null>("eth_getTransactionReceipt", [txHash]);
  }

  // ===== Logs & Filters =====
  // NOTE: eth_getLogs is DISABLED on official BSC public endpoints
  // Use third-party providers (NodeReal, Ankr, Moralis, QuickNode, etc.)

  async newFilter(filterObject: BNBLogFilter): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_newFilter", [filterObject]);
  }

  async newBlockFilter(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_newBlockFilter");
  }

  async newPendingTransactionFilter(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_newPendingTransactionFilter");
  }

  async uninstallFilter(filterId: string): Promise<StrategyResult<boolean>> {
    return this.execute<boolean>("eth_uninstallFilter", [filterId]);
  }

  async getFilterChanges(filterId: string): Promise<StrategyResult<any[]>> {
    return this.execute<any[]>("eth_getFilterChanges", [filterId]);
  }

  async getFilterLogs(filterId: string): Promise<StrategyResult<BNBLog[]>> {
    return this.execute<BNBLog[]>("eth_getFilterLogs", [filterId]);
  }

  /**
   * Get logs matching a filter
   *
   * WARNING: This method is DISABLED on official BSC public endpoints.
   * You must use third-party RPC providers (NodeReal, Ankr, Moralis, etc.)
   * or run your own BSC node.
   *
   * Block range limitation: Maximum 5K blocks when available.
   */
  async getLogs(filterObject: BNBLogFilter): Promise<StrategyResult<BNBLog[]>> {
    return this.execute<BNBLog[]>("eth_getLogs", [filterObject]);
  }

  // ===== Fees (EIP-1559 via BEP-226) =====
  // NOTE: BSC implements EIP-1559, but baseFeePerGas is ALWAYS 0

  async gasPrice(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_gasPrice");
  }

  async maxPriorityFeePerGas(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_maxPriorityFeePerGas");
  }

  async feeHistory(
    blockCount: string,
    newestBlock: BlockNumberOrTag,
    rewardPercentiles?: number[],
  ): Promise<StrategyResult<any>> {
    const params: any[] = [blockCount, newestBlock];
    if (rewardPercentiles !== undefined) params.push(rewardPercentiles);
    return this.execute<any>("eth_feeHistory", params);
  }

  // ===== Mining Methods (Limited functionality on BSC PoSA) =====

  async mining(): Promise<StrategyResult<boolean>> {
    return this.execute<boolean>("eth_mining");
  }

  async hashRate(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_hashrate");
  }

  async coinbase(): Promise<StrategyResult<string>> {
    return this.execute<string>("eth_coinbase");
  }

  // ===== TxPool Methods =====

  async txPoolStatus(): Promise<StrategyResult<BNBTxPoolStatus>> {
    return this.execute<BNBTxPoolStatus>("txpool_status");
  }

  async txPoolContent(): Promise<StrategyResult<Record<string, any>>> {
    return this.execute<Record<string, any>>("txpool_content");
  }

  async txPoolInspect(): Promise<StrategyResult<Record<string, any>>> {
    return this.execute<Record<string, any>>("txpool_inspect");
  }

  // ===== Debug Methods =====
  // NOTE: These require explicit enabling on the node

  async debugTraceTransaction(
    txHash: string,
    options: Record<string, any> = {},
  ): Promise<StrategyResult<any>> {
    return this.execute<any>("debug_traceTransaction", [txHash, options]);
  }

  async debugTraceCall(
    callObject: BNBCallObject,
    blockTag: BlockNumberOrTag,
    options: Record<string, any> = {},
  ): Promise<StrategyResult<any>> {
    return this.execute<any>("debug_traceCall", [callObject, blockTag, options]);
  }

  async debugTraceBlockByHash(
    blockHash: string,
    options: Record<string, any> = {},
  ): Promise<StrategyResult<any>> {
    return this.execute<any>("debug_traceBlockByHash", [blockHash, options]);
  }

  async debugTraceBlockByNumber(
    blockTag: BlockNumberOrTag,
    options: Record<string, any> = {},
  ): Promise<StrategyResult<any>> {
    return this.execute<any>("debug_traceBlockByNumber", [blockTag, options]);
  }

  // ===== Trace Methods =====
  // NOTE: Available through third-party providers

  async traceBlock(blockNumber: string | number): Promise<StrategyResult<any>> {
    return this.execute<any>("trace_block", [blockNumber]);
  }

  async traceTransaction(txHash: string): Promise<StrategyResult<any>> {
    return this.execute<any>("trace_transaction", [txHash]);
  }

  async traceCall(
    callObject: BNBCallObject,
    blockTag: BlockNumberOrTag,
    options: Record<string, any> = {},
  ): Promise<StrategyResult<any>> {
    return this.execute<any>("trace_call", [callObject, blockTag, options]);
  }

  async traceRawTransaction(
    signedTx: string,
    options: Record<string, any>,
  ): Promise<StrategyResult<any>> {
    return this.execute<any>("trace_rawTransaction", [signedTx, options]);
  }

  async traceFilter(filter: Record<string, any>): Promise<StrategyResult<any>> {
    return this.execute<any>("trace_filter", [filter]);
  }

  async traceReplayTransaction(txHash: string, traceTypes: string[]): Promise<StrategyResult<any>> {
    return this.execute<any>("trace_replayTransaction", [txHash, traceTypes]);
  }

  async traceReplayBlockTransactions(
    blockTag: BlockNumberOrTag,
    traceTypes: string[],
  ): Promise<StrategyResult<any>> {
    return this.execute<any>("trace_replayBlockTransactions", [blockTag, traceTypes]);
  }
}
