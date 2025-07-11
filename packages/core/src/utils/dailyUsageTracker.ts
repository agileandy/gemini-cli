/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface DailyUsage {
  date: string; // YYYY-MM-DD format
  callCount: number;
  lastUpdated: number; // timestamp
}

const USAGE_FILE_NAME = 'daily-usage.json';
const FREE_TIER_DAILY_LIMIT = 100;

export class DailyUsageTracker {
  private usageFilePath: string;
  private currentUsage: DailyUsage;

  constructor() {
    // Store usage file in .gemini directory in home folder
    const geminiDir = path.join(os.homedir(), '.gemini');
    if (!fs.existsSync(geminiDir)) {
      fs.mkdirSync(geminiDir, { recursive: true });
    }
    this.usageFilePath = path.join(geminiDir, USAGE_FILE_NAME);
    this.currentUsage = this.loadUsage();
  }

  private loadUsage(): DailyUsage {
    try {
      if (fs.existsSync(this.usageFilePath)) {
        const data = fs.readFileSync(this.usageFilePath, 'utf8');
        const usage = JSON.parse(data) as DailyUsage;

        // Check if it's a new day
        const today = this.getTodayString();
        if (usage.date !== today) {
          // Reset counter for new day
          return {
            date: today,
            callCount: 0,
            lastUpdated: Date.now(),
          };
        }

        return usage;
      }
    } catch (_error) {
      // If file doesn't exist or is corrupted, start fresh
    }

    return {
      date: this.getTodayString(),
      callCount: 0,
      lastUpdated: Date.now(),
    };
  }

  private saveUsage(): void {
    try {
      this.currentUsage.lastUpdated = Date.now();
      fs.writeFileSync(
        this.usageFilePath,
        JSON.stringify(this.currentUsage, null, 2),
      );
    } catch (_error) {
      // Silently fail if we can't save - don't break the app
      console.warn('Failed to save daily usage tracking:', error);
    }
  }

  private getTodayString(): string {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  }

  /**
   * Increment the daily call counter
   */
  public incrementCallCount(): void {
    const today = this.getTodayString();

    // Reset if it's a new day
    if (this.currentUsage.date !== today) {
      this.currentUsage = {
        date: today,
        callCount: 0,
        lastUpdated: Date.now(),
      };
    }

    this.currentUsage.callCount++;
    this.saveUsage();
  }

  /**
   * Get current daily usage stats
   */
  public getDailyUsage(): {
    callCount: number;
    limit: number;
    percentage: number;
    remaining: number;
    isNearLimit: boolean;
    isOverLimit: boolean;
  } {
    const today = this.getTodayString();

    // Reset if it's a new day
    if (this.currentUsage.date !== today) {
      this.currentUsage = {
        date: today,
        callCount: 0,
        lastUpdated: Date.now(),
      };
    }

    const callCount = this.currentUsage.callCount;
    const remaining = Math.max(0, FREE_TIER_DAILY_LIMIT - callCount);
    const percentage = (callCount / FREE_TIER_DAILY_LIMIT) * 100;

    return {
      callCount,
      limit: FREE_TIER_DAILY_LIMIT,
      percentage,
      remaining,
      isNearLimit: percentage >= 80, // Warn at 80%
      isOverLimit: callCount >= FREE_TIER_DAILY_LIMIT,
    };
  }

  /**
   * Reset the daily counter (for testing or manual reset)
   */
  public resetDailyCount(): void {
    this.currentUsage = {
      date: this.getTodayString(),
      callCount: 0,
      lastUpdated: Date.now(),
    };
    this.saveUsage();
  }
}

// Global instance
let globalTracker: DailyUsageTracker | null = null;

export function getDailyUsageTracker(): DailyUsageTracker {
  if (!globalTracker) {
    globalTracker = new DailyUsageTracker();
  }
  return globalTracker;
}
