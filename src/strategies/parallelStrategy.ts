import type { RequestStrategy, StrategyResult, RPCProviderResponse, RPCMetadata } from "./strategiesTypes.js";
import { RpcClient } from "../RpcClient.js";

export class ParallelStrategy implements RequestStrategy {
  private rpcClients: RpcClient[]
  constructor(
    rpcClients: RpcClient[],
  ) {
    if (rpcClients.length === 0) {
      throw new Error("At least one RPC client must be provided");
    }
    this.rpcClients = rpcClients;
  }

  /**
   * Execute request in parallel across all RPC clients
   * Returns all responses with metadata including response times, hashes, and inconsistency detection
   */
  async execute<T>(method: string, params: any[]): Promise<StrategyResult<T>> {
    const timestamp = Date.now();

    // Create promises for all RPC clients
    const promises = this.rpcClients.map(async (rpcClient) => {
      const startTime = Date.now();
      try {
        const data = await rpcClient.call<T>(method, params);
        const responseTime = Date.now() - startTime;
        const hash = this.hashResponse(data);

        return {
          url: rpcClient.getUrl(),
          status: "success" as const,
          responseTime,
          data,
          hash,
        };
      } catch (error) {
        const responseTime = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : String(error);

        return {
          url: rpcClient.getUrl(),
          status: "error" as const,
          responseTime,
          error: errorMessage,
        };
      }
    });

    // Wait for all requests to settle
    const settledResults = await Promise.allSettled(promises);

    // Extract responses from settled promises
    const responses: RPCProviderResponse[] = settledResults.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        // Promise itself rejected (shouldn't happen since we catch errors inside)
        const rpcClient = this.rpcClients[index];
        return {
          url: rpcClient?.getUrl() || "unknown",
          status: "error" as const,
          responseTime: 0,
          error: result.reason instanceof Error ? result.reason.message : String(result.reason),
        };
      }
    });

    // Check if at least one request succeeded
    const hasSuccess = responses.some((r) => r.status === "success");

    // Detect inconsistencies by comparing hashes
    const hasInconsistencies = this.detectInconsistencies(responses);

    // Build metadata with ALL responses
    const metadata: RPCMetadata = {
      strategy: "parallel",
      timestamp,
      responses,
      hasInconsistencies,
    };

    if (hasSuccess) {
      // Return all responses in data field (type cast needed since data contains responses array)
      return {
        success: true,
        data: responses as any as T,
        metadata,
      };
    }

    // All requests failed
    return {
      success: false,
      errors: responses,
      metadata,
    };
  }

  /**
   * Generate a hash of the response for comparison
   * Uses a simple string-based hash for browser compatibility
   */
  private hashResponse(data: any): string {
    try {
      const normalized = JSON.stringify(data, Object.keys(data).sort());
      // Simple hash function for comparison (not cryptographic)
      let hash = 0;
      for (let i = 0; i < normalized.length; i++) {
        const char = normalized.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return hash.toString(36);
    } catch (error) {
      // If hashing fails, return empty string
      return "";
    }
  }

  /**
   * Detect inconsistencies by comparing response hashes
   */
  private detectInconsistencies(responses: RPCProviderResponse[]): boolean {
    const successfulResponses = responses.filter((r) => r.status === "success" && r.hash);

    if (successfulResponses.length <= 1) {
      // Need at least 2 successful responses to compare
      return false;
    }

    // Get the first hash as reference
    const referenceHash = successfulResponses[0]?.hash;

    // Check if all hashes match the reference
    return successfulResponses.some((r) => r.hash !== referenceHash);
  }

  getName(): string {
    return "parallel";
  }
}
