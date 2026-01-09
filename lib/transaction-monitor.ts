import { sqlQuery } from './db';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

/**
 * Transaction Monitor
 * Monitors pending blockchain transactions and updates database when confirmed
 */

interface PendingTransaction {
  id: string;
  proposal_id: string;
  transaction_hash: string;
  created_at: string;
}

class TransactionMonitor {
  private static instance: TransactionMonitor;
  private monitoring = false;
  private checkInterval = 10000; // 10 seconds
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private publicClient: any;

  private constructor() {
    // Create public client for Base network
    // Type assertion needed due to viem type complexity with getBlock return types
    this.publicClient = createPublicClient({
      chain: base,
      transport: http(
        process.env.NEXT_PUBLIC_ALCHEMY_ID
          ? `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
          : undefined
      ),
    }) as any;
  }

  public static getInstance(): TransactionMonitor {
    if (!TransactionMonitor.instance) {
      TransactionMonitor.instance = new TransactionMonitor();
    }
    return TransactionMonitor.instance;
  }

  /**
   * Start monitoring pending transactions
   */
  public async start(): Promise<void> {
    if (this.monitoring) {
      console.log('Transaction monitor already running');
      return;
    }

    this.monitoring = true;
    console.log('🔍 Starting transaction monitor...');
    
    // Run initial check
    await this.checkPendingTransactions();

    // Set up interval for continuous monitoring
    setInterval(async () => {
      if (this.monitoring) {
        await this.checkPendingTransactions();
      }
    }, this.checkInterval);
  }

  /**
   * Stop monitoring
   */
  public stop(): void {
    this.monitoring = false;
    console.log('⏸️  Transaction monitor stopped');
  }

  /**
   * Check all pending transactions
   */
  private async checkPendingTransactions(): Promise<void> {
    try {
      // Fetch all pending transactions
      const pendingTxs = await sqlQuery<PendingTransaction[]>(
        `SELECT id, proposal_id, transaction_hash, created_at
         FROM proposal_transactions
         WHERE transaction_status = 'pending'
         ORDER BY created_at ASC`
      );

      if (pendingTxs.length === 0) {
        return;
      }

      console.log(`Checking ${pendingTxs.length} pending transaction(s)...`);

      // Check each transaction
      for (const tx of pendingTxs) {
        await this.checkTransaction(tx);
      }
    } catch (error) {
      console.error('Error checking pending transactions:', error);
    }
  }

  /**
   * Check individual transaction status
   */
  private async checkTransaction(tx: PendingTransaction): Promise<void> {
    try {
      // Get transaction receipt
      const receipt = await this.publicClient.getTransactionReceipt({
        hash: tx.transaction_hash as `0x${string}`,
      });

      if (!receipt) {
        // Transaction not yet mined, check if it's been too long
        const createdAt = new Date(tx.created_at);
        const now = new Date();
        const minutesElapsed = (now.getTime() - createdAt.getTime()) / 60000;

        if (minutesElapsed > 30) {
          // Transaction pending for > 30 minutes, mark as failed
          console.warn(`Transaction ${tx.transaction_hash} pending for ${minutesElapsed.toFixed(1)} minutes, marking as failed`);
          await this.markTransactionFailed(tx.id, 'Transaction timeout');
        }
        return;
      }

      // Transaction mined, check status
      if (receipt.status === 'success') {
        console.log(`✅ Transaction ${tx.transaction_hash} confirmed successfully`);
        await this.markTransactionConfirmed(tx.id, receipt.gasUsed.toString());
      } else {
        console.error(`❌ Transaction ${tx.transaction_hash} failed on-chain`);
        await this.markTransactionFailed(tx.id, 'Transaction reverted');
      }
    } catch (error: any) {
      // Transaction not found yet, or RPC error
      if (error.message?.includes('not found')) {
        // Transaction not yet mined, this is normal
        return;
      }

      console.error(`Error checking transaction ${tx.transaction_hash}:`, error);
    }
  }

  /**
   * Mark transaction as confirmed
   */
  private async markTransactionConfirmed(
    transactionId: string,
    gasUsed: string
  ): Promise<void> {
    try {
      await sqlQuery(
        `UPDATE proposal_transactions
         SET transaction_status = 'confirmed',
             gas_used = :gasUsed,
             confirmed_at = CURRENT_TIMESTAMP
         WHERE id = :transactionId`,
        { transactionId, gasUsed }
      );

      // Get proposal ID to update proposal status
      const txData = await sqlQuery<Array<{ proposal_id: string }>>(
        `SELECT proposal_id FROM proposal_transactions WHERE id = :transactionId LIMIT 1`,
        { transactionId }
      );

      if (txData.length > 0) {
        // Proposal is now fully active (on-chain)
        await sqlQuery(
          `UPDATE proposals
           SET status = 'active',
               updated_at = CURRENT_TIMESTAMP
           WHERE id = :proposalId`,
          { proposalId: txData[0].proposal_id }
        );

        console.log(`Proposal ${txData[0].proposal_id} is now active on-chain`);
      }
    } catch (error) {
      console.error('Error marking transaction as confirmed:', error);
    }
  }

  /**
   * Mark transaction as failed
   */
  private async markTransactionFailed(
    transactionId: string,
    reason: string
  ): Promise<void> {
    try {
      await sqlQuery(
        `UPDATE proposal_transactions
         SET transaction_status = 'failed',
             confirmed_at = CURRENT_TIMESTAMP
         WHERE id = :transactionId`,
        { transactionId }
      );

      // Get proposal ID to update proposal status
      const txData = await sqlQuery<Array<{ proposal_id: string }>>(
        `SELECT proposal_id FROM proposal_transactions WHERE id = :transactionId LIMIT 1`,
        { transactionId }
      );

      if (txData.length > 0) {
        // Revert proposal to approved status (can be retried)
        await sqlQuery(
          `UPDATE proposals
           SET status = 'approved',
               updated_at = CURRENT_TIMESTAMP
           WHERE id = :proposalId`,
          { proposalId: txData[0].proposal_id }
        );

        console.log(`Proposal ${txData[0].proposal_id} transaction failed: ${reason}`);
      }
    } catch (error) {
      console.error('Error marking transaction as failed:', error);
    }
  }

  /**
   * Manually check a specific transaction
   */
  public async checkTransactionStatus(txHash: string): Promise<{
    status: 'pending' | 'confirmed' | 'failed';
    gasUsed?: string;
  }> {
    try {
      const receipt = await this.publicClient.getTransactionReceipt({
        hash: txHash as `0x${string}`,
      });

      if (!receipt) {
        return { status: 'pending' };
      }

      if (receipt.status === 'success') {
        return {
          status: 'confirmed',
          gasUsed: receipt.gasUsed.toString(),
        };
      } else {
        return { status: 'failed' };
      }
    } catch (error) {
      return { status: 'pending' };
    }
  }
}

// Export singleton instance
export const transactionMonitor = TransactionMonitor.getInstance();

// Auto-start monitor in production
if (process.env.NODE_ENV === 'production') {
  transactionMonitor.start().catch(console.error);
}
