'use client';

interface ChunkRetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

class ChunkRetryService {
  private retryCount = 0;
  private isRetrying = false;
  private currentTimeout?: NodeJS.Timeout;
  private config: ChunkRetryConfig = {
    maxRetries: 5,
    baseDelay: 2000,
    maxDelay: 30000,
    backoffMultiplier: 1.5,
  };

  private getRetryKey(): string {
    return 'chunk-retry-count';
  }

  private getRetryCount(): number {
    if (typeof window === 'undefined') return 0;
    return parseInt(sessionStorage.getItem(this.getRetryKey()) || '0', 10);
  }

  private setRetryCount(count: number): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(this.getRetryKey(), count.toString());
  }

  private clearRetryCount(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(this.getRetryKey());
  }

  private calculateDelay(): number {
    const retryCount = this.getRetryCount();
    const delay = this.config.baseDelay * Math.pow(this.config.backoffMultiplier, retryCount);
    return Math.min(delay, this.config.maxDelay);
  }

  private isChunkError(error: Error | any): boolean {
    if (!error) return false;
    
    const message = error.message || '';
    const name = error.name || '';
    
    return (
      message.includes('Loading chunk') ||
      message.includes('ChunkLoadError') ||
      name === 'ChunkLoadError' ||
      message.includes('Loading CSS chunk') ||
      message.includes('Loading JS chunk')
    );
  }

  public handleChunkError(error: Error | any): boolean {
    if (!this.isChunkError(error)) {
      return false;
    }

    if (this.isRetrying) {
      console.warn('Chunk retry already in progress, ignoring duplicate error');
      return true;
    }

    const retryCount = this.getRetryCount();
    
    if (retryCount >= this.config.maxRetries) {
      console.error('Max chunk retry attempts reached, giving up');
      this.clearRetryCount();
      // Show user-friendly error message
      this.showChunkErrorFallback();
      return true;
    }

    this.isRetrying = true;
    this.setRetryCount(retryCount + 1);
    
    const delay = this.calculateDelay();
    console.warn(`Chunk loading error detected (attempt ${retryCount + 1}/${this.config.maxRetries}), retrying in ${delay}ms...`, error);

    // Show loading indicator during retry
    this.showRetryIndicator(retryCount + 1, this.config.maxRetries);

    // Use a more reliable retry mechanism
    const retryTimeout = setTimeout(() => {
      this.isRetrying = false;
      // Clear any existing retry indicators
      this.clearRetryIndicator();
      
      // Use a more reliable reload method
      try {
        window.location.href = window.location.href;
      } catch (err) {
        window.location.reload();
      }
    }, delay);

    // Store timeout for potential cleanup
    this.currentTimeout = retryTimeout;

    return true;
  }

  private showRetryIndicator(attempt: number, maxAttempts: number): void {
    if (typeof window === 'undefined') return;
    
    // Create or update retry indicator
    let indicator = document.getElementById('chunk-retry-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'chunk-retry-indicator';
      indicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #3b82f6;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        max-width: 300px;
      `;
      document.body.appendChild(indicator);
    }
    
    indicator.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 16px; height: 16px; border: 2px solid #ffffff40; border-top: 2px solid #ffffff; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <span>Retrying... (${attempt}/${maxAttempts})</span>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
  }

  private clearRetryIndicator(): void {
    if (typeof window === 'undefined') return;
    const indicator = document.getElementById('chunk-retry-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  private showChunkErrorFallback(): void {
    if (typeof window === 'undefined') return;
    
    const fallback = document.createElement('div');
    fallback.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
    `;
    
    fallback.innerHTML = `
      <div style="text-align: center; max-width: 400px; padding: 20px;">
        <h2 style="color: #1f2937; margin-bottom: 16px; font-size: 24px;">Loading Error</h2>
        <p style="color: #6b7280; margin-bottom: 24px; line-height: 1.5;">
          We're having trouble loading the application. This might be due to a network issue or browser cache problem.
        </p>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button onclick="window.location.reload()" style="
            background: #3b82f6;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
          ">Reload Page</button>
          <button onclick="window.location.href = '/'" style="
            background: #6b7280;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
          ">Go Home</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(fallback);
  }

  public reset(): void {
    this.isRetrying = false;
    this.clearRetryCount();
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = undefined;
    }
  }

  public updateConfig(newConfig: Partial<ChunkRetryConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Create singleton instance
export const chunkRetryService = new ChunkRetryService();

// Export utility functions
export const handleChunkError = (error: Error | any): boolean => {
  try {
    return chunkRetryService.handleChunkError(error);
  } catch (err) {
    console.warn('Error in handleChunkError:', err);
    return false;
  }
};

export const resetChunkRetry = (): void => {
  try {
    chunkRetryService.reset();
  } catch (err) {
    console.warn('Error in resetChunkRetry:', err);
  }
};

export const updateChunkRetryConfig = (config: Partial<ChunkRetryConfig>): void => {
  try {
    chunkRetryService.updateConfig(config);
  } catch (err) {
    console.warn('Error in updateChunkRetryConfig:', err);
  }
};
