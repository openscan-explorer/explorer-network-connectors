import assert from "node:assert";

/**
 * Validates if a value is a valid hex string (starts with 0x and contains only hex characters)
 */
export function isHexString(value: string): boolean {
  return typeof value === "string" && /^0x[0-9a-fA-F]*$/.test(value);
}

/**
 * Validates if a value is a valid Ethereum address (0x followed by 40 hex characters)
 */
export function isAddress(value: string): boolean {
  return typeof value === "string" && /^0x[0-9a-fA-F]{40}$/.test(value);
}

/**
 * Validates that an object exists and optionally has required fields
 * @param obj - The object to validate
 * @param requiredFields - Optional array of field names that must exist in the object
 */
export function validateObject(obj: any, requiredFields?: string[]): void {
  assert.ok(obj !== null && obj !== undefined, "Result should not be null or undefined");
  assert.strictEqual(typeof obj, "object", "Result should be an object");
  if (requiredFields) {
    for (const field of requiredFields) {
      assert.ok(field in obj, `Object should have field '${field}'`);
    }
  }
}

/**
 * Validates a successful result from an RPC call
 * @param result - The result object to validate
 * @param dataType - Optional expected type of result.data ('string', 'number', 'object', etc.)
 */
export function validateSuccessResult(result: any, dataType?: string): void {
  assert.strictEqual(result.success, true, "Should succeed");
  assert.ok(result.data !== undefined && result.data !== null, "Should have data");
  if (dataType) {
    assert.strictEqual(typeof result.data, dataType, `Data should be ${dataType}`);
  }
}

/**
 * Validates a failed result from an RPC call
 */
export function validateFailureResult(result: any): void {
  assert.strictEqual(result.success, false, "Should fail");
  assert.ok(result.errors, "Should have errors");
}

/**
 * Validates a block object has required fields and correct formats
 * @param block - The block object to validate
 * @param validateHexFields - Whether to validate that numeric fields are hex strings (default: true)
 */
export function validateBlock(block: any, validateHexFields = true): void {
  validateObject(block, [
    "number",
    "hash",
    "parentHash",
    "transactions",
    "gasLimit",
    "gasUsed",
    "timestamp",
  ]);

  if (validateHexFields) {
    assert.ok(isHexString(block.number), "Block number should be hex");
    assert.ok(isHexString(block.hash), "Block hash should be hex");
    assert.ok(isHexString(block.gasLimit), "gasLimit should be hex");
    assert.ok(isHexString(block.gasUsed), "gasUsed should be hex");
    assert.ok(isHexString(block.timestamp), "timestamp should be hex");
  }

  assert.ok(Array.isArray(block.transactions), "Transactions should be array");
}

/**
 * Validates a transaction object has required fields and correct formats
 */
export function validateTransaction(tx: any): void {
  validateObject(tx, ["hash", "from", "to", "value", "gas", "gasPrice"]);
  assert.ok(isHexString(tx.hash), "Transaction hash should be hex");
  assert.ok(isAddress(tx.from), "From should be address");
}

/**
 * Validates a transaction receipt object has required fields and correct formats
 */
export function validateTransactionReceipt(receipt: any): void {
  validateObject(receipt, ["transactionHash", "blockNumber", "blockHash", "gasUsed", "status"]);
  assert.ok(isHexString(receipt.blockNumber), "Block number should be hex");
  assert.ok(Array.isArray(receipt.logs), "Should have logs array");
}

/**
 * Validates a log object has required fields and correct formats
 */
export function validateLog(log: any): void {
  validateObject(log, ["address", "topics", "data", "blockNumber", "transactionHash"]);
  assert.ok(isAddress(log.address), "Log address should be valid");
  assert.ok(Array.isArray(log.topics), "Topics should be array");
}

/**
 * Validates parallel strategy metadata
 */
export function validateParallelMetadata(result: any, minResponses = 1): void {
  assert.ok(result.metadata, "Should have metadata");
  assert.strictEqual(result.metadata.strategy, "parallel", "Should be parallel strategy");
  assert.ok(Array.isArray(result.metadata.responses), "Should have responses array");
  assert.ok(
    result.metadata.responses.length >= minResponses,
    `Should have at least ${minResponses} response(s)`,
  );
  assert.strictEqual(
    typeof result.metadata.hasInconsistencies,
    "boolean",
    "Should have inconsistencies flag",
  );
}

/**
 * Validates individual response details in parallel strategy results
 */
export function validateResponseDetails(responses: any[]): void {
  for (const response of responses) {
    assert.ok(response.url, "Response should have URL");
    assert.ok(
      response.status === "success" || response.status === "error",
      "Response should have valid status",
    );
    assert.ok(typeof response.responseTime === "number", "Response should have response time");

    if (response.status === "success") {
      assert.ok(response.data !== undefined, "Successful response should have data");
      assert.ok(response.hash, "Successful response should have hash");
    } else {
      assert.ok(response.error, "Failed response should have error");
    }
  }
}

/**
 * Validates fee history object
 */
export function validateFeeHistory(feeHistory: any): void {
  validateObject(feeHistory, ["baseFeePerGas", "gasUsedRatio"]);
  assert.ok(Array.isArray(feeHistory.baseFeePerGas), "baseFeePerGas should be array");
  assert.ok(Array.isArray(feeHistory.gasUsedRatio), "gasUsedRatio should be array");
}
