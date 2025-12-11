/* biome-ignore-all lint/suspicious/noExplicitAny: <TODO> */
import { NetworkClient } from "../../NetworkClient.js";
import type { StrategyResult } from "../../strategies/strategiesTypes.js";
import type { StrategyConfig } from "../../strategies/requestStrategy.js";
import type {
  L2Block,
  BlockHeader,
  L2Tips,
  Tx,
  TxReceipt,
  IndexedTxEffect,
  TxValidationResult,
  PublicSimulationOutput,
  WorldStateSyncStatus,
  LeafIndexes,
  NullifierMembershipWitness,
  PublicDataWitness,
  MembershipWitness,
  PrivateLog,
  LogFilter,
  GetPublicLogsResponse,
  GetContractClassLogsResponse,
  TxScopedL2Log,
  ContractClassPublic,
  ContractInstanceWithAddress,
  NodeInfo,
  L1ContractAddresses,
  ProtocolContractAddresses,
  GasFees,
  ValidatorsStats,
  SingleValidatorStats,
  AllowedElement,
  AztecNodeAdminConfig,
  SlashPayloadRound,
  Offense,
  BlockNumberOrLatest,
} from "./AztecTypes.js";

/**
 * Aztec-specific network client with typed methods
 * Chain ID: 677868
 * Uses composition to integrate strategies with Aztec RPC methods
 *
 * NOTE: Aztec uses entirely network-specific RPC methods (node_*, nodeAdmin_*)
 * These are all considered network-specific methods.
 *
 * Documentation: https://docs.aztec.network/apis/aztec-node
 */
export class AztecClient extends NetworkClient {
  constructor(config: StrategyConfig) {
    super(config);
  }

  // ===== Block Queries =====

  async getBlockNumber(): Promise<StrategyResult<number>> {
    return this.execute<number>("node_getBlockNumber");
  }

  async getProvenBlockNumber(): Promise<StrategyResult<number>> {
    return this.execute<number>("node_getProvenBlockNumber");
  }

  async getL2Tips(): Promise<StrategyResult<L2Tips>> {
    return this.execute<L2Tips>("node_getL2Tips");
  }

  async getBlock(blockNumber: BlockNumberOrLatest): Promise<StrategyResult<L2Block | null>> {
    return this.execute<L2Block | null>("node_getBlock", [blockNumber]);
  }

  async getBlocks(from: number, limit: number): Promise<StrategyResult<L2Block[]>> {
    return this.execute<L2Block[]>("node_getBlocks", [from, limit]);
  }

  async getBlockHeader(
    blockNumber?: BlockNumberOrLatest,
  ): Promise<StrategyResult<BlockHeader | null>> {
    return this.execute<BlockHeader | null>(
      "node_getBlockHeader",
      blockNumber !== undefined ? [blockNumber] : [],
    );
  }

  // ===== Transaction Operations =====

  async sendTx(tx: Tx): Promise<StrategyResult<void>> {
    return this.execute<void>("node_sendTx", [tx]);
  }

  async getTxReceipt(txHash: string): Promise<StrategyResult<TxReceipt>> {
    return this.execute<TxReceipt>("node_getTxReceipt", [txHash]);
  }

  async getTxEffect(txHash: string): Promise<StrategyResult<IndexedTxEffect | null>> {
    return this.execute<IndexedTxEffect | null>("node_getTxEffect", [txHash]);
  }

  async getTxByHash(txHash: string): Promise<StrategyResult<Tx | null>> {
    return this.execute<Tx | null>("node_getTxByHash", [txHash]);
  }

  async getPendingTxs(limit?: number, after?: string): Promise<StrategyResult<Tx[]>> {
    const params: any[] = [];
    if (limit !== undefined) params.push(limit);
    if (after !== undefined) params.push(after);
    return this.execute<Tx[]>("node_getPendingTxs", params);
  }

  async getPendingTxCount(): Promise<StrategyResult<number>> {
    return this.execute<number>("node_getPendingTxCount");
  }

  async isValidTx(
    tx: Tx,
    options?: { isSimulation?: boolean; skipFeeEnforcement?: boolean },
  ): Promise<StrategyResult<TxValidationResult>> {
    return this.execute<TxValidationResult>("node_isValidTx", options ? [tx, options] : [tx]);
  }

  async simulatePublicCalls(
    tx: Tx,
    skipFeeEnforcement?: boolean,
  ): Promise<StrategyResult<PublicSimulationOutput>> {
    return this.execute<PublicSimulationOutput>(
      "node_simulatePublicCalls",
      skipFeeEnforcement !== undefined ? [tx, skipFeeEnforcement] : [tx],
    );
  }

  // ===== State Queries =====

  async getPublicStorageAt(
    blockNumber: BlockNumberOrLatest,
    contract: string,
    slot: string,
  ): Promise<StrategyResult<string>> {
    return this.execute<string>("node_getPublicStorageAt", [blockNumber, contract, slot]);
  }

  async getWorldStateSyncStatus(): Promise<StrategyResult<WorldStateSyncStatus>> {
    return this.execute<WorldStateSyncStatus>("node_getWorldStateSyncStatus");
  }

  // ===== Merkle Tree Queries =====

  async findLeavesIndexes(
    blockNumber: BlockNumberOrLatest,
    treeId: number,
    leafValues: string[],
  ): Promise<StrategyResult<LeafIndexes>> {
    return this.execute<LeafIndexes>("node_findLeavesIndexes", [blockNumber, treeId, leafValues]);
  }

  async getNullifierSiblingPath(
    blockNumber: BlockNumberOrLatest,
    leafIndex: string,
  ): Promise<StrategyResult<string[]>> {
    return this.execute<string[]>("node_getNullifierSiblingPath", [blockNumber, leafIndex]);
  }

  async getNoteHashSiblingPath(
    blockNumber: BlockNumberOrLatest,
    leafIndex: string,
  ): Promise<StrategyResult<string[]>> {
    return this.execute<string[]>("node_getNoteHashSiblingPath", [blockNumber, leafIndex]);
  }

  async getArchiveSiblingPath(
    blockNumber: BlockNumberOrLatest,
    leafIndex: string,
  ): Promise<StrategyResult<string[]>> {
    return this.execute<string[]>("node_getArchiveSiblingPath", [blockNumber, leafIndex]);
  }

  async getPublicDataSiblingPath(
    blockNumber: BlockNumberOrLatest,
    leafIndex: string,
  ): Promise<StrategyResult<string[]>> {
    return this.execute<string[]>("node_getPublicDataSiblingPath", [blockNumber, leafIndex]);
  }

  // ===== Membership / Witness Queries =====

  async getNullifierMembershipWitness(
    blockNumber: BlockNumberOrLatest,
    nullifier: string,
  ): Promise<StrategyResult<NullifierMembershipWitness | null>> {
    return this.execute<NullifierMembershipWitness | null>("node_getNullifierMembershipWitness", [
      blockNumber,
      nullifier,
    ]);
  }

  async getLowNullifierMembershipWitness(
    blockNumber: BlockNumberOrLatest,
    nullifier: string,
  ): Promise<StrategyResult<NullifierMembershipWitness | null>> {
    return this.execute<NullifierMembershipWitness | null>(
      "node_getLowNullifierMembershipWitness",
      [blockNumber, nullifier],
    );
  }

  async getPublicDataWitness(
    blockNumber: BlockNumberOrLatest,
    leafSlot: string,
  ): Promise<StrategyResult<PublicDataWitness | null>> {
    return this.execute<PublicDataWitness | null>("node_getPublicDataWitness", [
      blockNumber,
      leafSlot,
    ]);
  }

  async getArchiveMembershipWitness(
    blockNumber: BlockNumberOrLatest,
    archive: string,
  ): Promise<StrategyResult<MembershipWitness | null>> {
    return this.execute<MembershipWitness | null>("node_getArchiveMembershipWitness", [
      blockNumber,
      archive,
    ]);
  }

  async getNoteHashMembershipWitness(
    blockNumber: BlockNumberOrLatest,
    noteHash: string,
  ): Promise<StrategyResult<MembershipWitness | null>> {
    return this.execute<MembershipWitness | null>("node_getNoteHashMembershipWitness", [
      blockNumber,
      noteHash,
    ]);
  }

  // ===== L1 ↔ L2 Message Queries =====

  async getL1ToL2MessageMembershipWitness(
    blockNumber: BlockNumberOrLatest,
    l1ToL2Message: string,
  ): Promise<StrategyResult<[string, string[]] | null>> {
    return this.execute<[string, string[]] | null>("node_getL1ToL2MessageMembershipWitness", [
      blockNumber,
      l1ToL2Message,
    ]);
  }

  async getL1ToL2MessageBlock(l1ToL2Message: string): Promise<StrategyResult<number | null>> {
    return this.execute<number | null>("node_getL1ToL2MessageBlock", [l1ToL2Message]);
  }

  async isL1ToL2MessageSynced(l1ToL2Message: string): Promise<StrategyResult<boolean>> {
    return this.execute<boolean>("node_isL1ToL2MessageSynced", [l1ToL2Message]);
  }

  async getL2ToL1Messages(
    blockNumber: BlockNumberOrLatest,
  ): Promise<StrategyResult<string[][] | null>> {
    return this.execute<string[][] | null>("node_getL2ToL1Messages", [blockNumber]);
  }

  // ===== Log Queries =====

  async getPrivateLogs(from: number, limit: number): Promise<StrategyResult<PrivateLog[]>> {
    return this.execute<PrivateLog[]>("node_getPrivateLogs", [from, limit]);
  }

  async getPublicLogs(filter: LogFilter): Promise<StrategyResult<GetPublicLogsResponse>> {
    return this.execute<GetPublicLogsResponse>("node_getPublicLogs", [filter]);
  }

  async getContractClassLogs(
    filter: LogFilter,
  ): Promise<StrategyResult<GetContractClassLogsResponse>> {
    return this.execute<GetContractClassLogsResponse>("node_getContractClassLogs", [filter]);
  }

  async getLogsByTags(
    tags: string[],
    logsPerTag?: number,
  ): Promise<StrategyResult<TxScopedL2Log[][]>> {
    return this.execute<TxScopedL2Log[][]>(
      "node_getLogsByTags",
      logsPerTag !== undefined ? [tags, logsPerTag] : [tags],
    );
  }

  // ===== Contract Queries =====

  async getContractClass(id: string): Promise<StrategyResult<ContractClassPublic | null>> {
    return this.execute<ContractClassPublic | null>("node_getContractClass", [id]);
  }

  async getContract(address: string): Promise<StrategyResult<ContractInstanceWithAddress | null>> {
    return this.execute<ContractInstanceWithAddress | null>("node_getContract", [address]);
  }

  // ===== Node Information & Status =====

  async isReady(): Promise<StrategyResult<boolean>> {
    return this.execute<boolean>("node_isReady");
  }

  async getNodeInfo(): Promise<StrategyResult<NodeInfo>> {
    return this.execute<NodeInfo>("node_getNodeInfo");
  }

  async getNodeVersion(): Promise<StrategyResult<string>> {
    return this.execute<string>("node_getNodeVersion");
  }

  async getVersion(): Promise<StrategyResult<number>> {
    return this.execute<number>("node_getVersion");
  }

  async getChainId(): Promise<StrategyResult<number>> {
    return this.execute<number>("node_getChainId");
  }

  async getL1ContractAddresses(): Promise<StrategyResult<L1ContractAddresses>> {
    return this.execute<L1ContractAddresses>("node_getL1ContractAddresses");
  }

  async getProtocolContractAddresses(): Promise<StrategyResult<ProtocolContractAddresses>> {
    return this.execute<ProtocolContractAddresses>("node_getProtocolContractAddresses");
  }

  async getEncodedEnr(): Promise<StrategyResult<string | null>> {
    const result = await this.execute<string | null>("node_getEncodedEnr");
    return { ...result, data: result.data || null };
  }

  async getCurrentBaseFees(): Promise<StrategyResult<GasFees>> {
    return this.execute<GasFees>("node_getCurrentBaseFees");
  }

  // ===== Validator Queries =====

  async getValidatorsStats(): Promise<StrategyResult<ValidatorsStats>> {
    return this.execute<ValidatorsStats>("node_getValidatorsStats");
  }

  async getValidatorStats(
    validatorAddress: string,
    fromSlot?: string,
    toSlot?: string,
  ): Promise<StrategyResult<SingleValidatorStats | null>> {
    const params: any[] = [validatorAddress];
    if (fromSlot !== undefined) params.push(fromSlot);
    if (toSlot !== undefined) params.push(toSlot);
    return this.execute<SingleValidatorStats | null>("node_getValidatorStats", params);
  }

  // ===== Debug Operations =====

  async registerContractFunctionSignatures(
    functionSignatures: string[],
  ): Promise<StrategyResult<void>> {
    return this.execute<void>("node_registerContractFunctionSignatures", [functionSignatures]);
  }

  async getAllowedPublicSetup(): Promise<StrategyResult<AllowedElement[]>> {
    return this.execute<AllowedElement[]>("node_getAllowedPublicSetup");
  }

  // ===== Admin Configuration =====

  async getConfig(): Promise<StrategyResult<AztecNodeAdminConfig>> {
    return this.execute<AztecNodeAdminConfig>("nodeAdmin_getConfig");
  }

  async setConfig(config: Partial<AztecNodeAdminConfig>): Promise<StrategyResult<void>> {
    return this.execute<void>("nodeAdmin_setConfig", [config]);
  }

  // ===== Sync Control =====

  async pauseSync(): Promise<StrategyResult<void>> {
    return this.execute<void>("nodeAdmin_pauseSync");
  }

  async resumeSync(): Promise<StrategyResult<void>> {
    return this.execute<void>("nodeAdmin_resumeSync");
  }

  // ===== Rollback Operations =====

  async rollbackTo(targetBlockNumber: number, force?: boolean): Promise<StrategyResult<void>> {
    return this.execute<void>(
      "nodeAdmin_rollbackTo",
      force !== undefined ? [targetBlockNumber, force] : [targetBlockNumber],
    );
  }

  // ===== Snapshot Operations =====

  async startSnapshotUpload(location: string): Promise<StrategyResult<void>> {
    return this.execute<void>("nodeAdmin_startSnapshotUpload", [location]);
  }

  // ===== Slashing Operations =====

  async getSlashPayloads(): Promise<StrategyResult<SlashPayloadRound[]>> {
    return this.execute<SlashPayloadRound[]>("nodeAdmin_getSlashPayloads");
  }

  async getSlashOffenses(round: string | "all" | "current"): Promise<StrategyResult<Offense[]>> {
    return this.execute<Offense[]>("nodeAdmin_getSlashOffenses", [round]);
  }
}
