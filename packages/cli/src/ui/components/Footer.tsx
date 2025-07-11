/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Box, Text } from 'ink';
import { Colors } from '../colors.js';
import {
  tildeifyPath,
  tokenLimit,
  getDailyUsageTracker,
} from '@google/gemini-cli-core';
import { ConsoleSummaryDisplay } from './ConsoleSummaryDisplay.js';
import process from 'node:process';
import { MemoryUsageDisplay } from './MemoryUsageDisplay.js';
import path from 'node:path';

// Create a more compact path display: ~/...directory-name
function getCompactPath(targetDir: string): string {
  const tildePath = tildeifyPath(targetDir);

  // If it's short enough, just return it
  if (tildePath.length <= 25) {
    return tildePath;
  }

  // Get the directory name (last part of path)
  const dirName = path.basename(targetDir);

  // If it starts with ~/, show ~/...dirName
  if (tildePath.startsWith('~/')) {
    return `~/...${dirName}`;
  }

  // Otherwise show root/...dirName
  const parts = tildePath.split(path.sep);
  if (parts.length > 2) {
    return `${parts[0]}/...${dirName}`;
  }

  return tildePath;
}

interface FooterProps {
  model: string;
  targetDir: string;
  branchName?: string;
  debugMode: boolean;
  debugMessage: string;
  corgiMode: boolean;
  errorCount: number;
  showErrorDetails: boolean;
  showMemoryUsage?: boolean;
  totalTokenCount: number;
  authType?: string; // Add auth type to display
}

export const Footer: React.FC<FooterProps> = ({
  model,
  targetDir,
  branchName,
  debugMode,
  debugMessage,
  corgiMode,
  errorCount,
  showErrorDetails,
  showMemoryUsage,
  totalTokenCount,
  authType,
}) => {
  const limit = tokenLimit(model);
  const percentage = totalTokenCount / limit;

  // Get daily usage stats (show for all auth types - everyone has daily limits)
  const dailyUsage = authType ? getDailyUsageTracker().getDailyUsage() : null;

  return (
    <Box marginTop={1} justifyContent="space-between" width="100%">
      <Box>
        <Text color={Colors.LightBlue}>
          {getCompactPath(targetDir)}
          {branchName && <Text color={Colors.Gray}> ({branchName}*)</Text>}
        </Text>
        {debugMode && (
          <Text color={Colors.AccentRed}>
            {' ' + (debugMessage || '--debug')}
          </Text>
        )}
      </Box>

      {/* Middle Section: Centered Sandbox Info */}
      <Box
        flexGrow={1}
        alignItems="center"
        justifyContent="center"
        display="flex"
      >
        {process.env.SANDBOX && process.env.SANDBOX !== 'sandbox-exec' ? (
          <Text color="green">
            {process.env.SANDBOX.replace(/^gemini-(?:cli-)?/, '')}
          </Text>
        ) : process.env.SANDBOX === 'sandbox-exec' ? (
          <Text color={Colors.AccentYellow}>
            MacOS Seatbelt{' '}
            <Text color={Colors.Gray}>({process.env.SEATBELT_PROFILE})</Text>
          </Text>
        ) : (
          <Text color={Colors.AccentRed}>
            no sandbox <Text color={Colors.Gray}>(see /docs)</Text>
          </Text>
        )}
      </Box>

      {/* Right Section: Gemini Label and Console Summary */}
      <Box alignItems="center">
        <Text color={Colors.AccentBlue}>
          {' '}
          {model}{' '}
          <Text color={Colors.Gray}>
            ({((1 - percentage) * 100).toFixed(0)}% context left)
          </Text>
          {authType && (
            <Text
              color={
                authType === 'gemini-api-key'
                  ? Colors.AccentRed
                  : Colors.AccentGreen
              }
            >
              {' '}
              [
              {authType === 'oauth-personal'
                ? 'OAuth'
                : authType === 'gemini-api-key'
                  ? 'API Key'
                  : authType === 'vertex-ai'
                    ? 'Vertex AI'
                    : authType}
              ]
            </Text>
          )}
          {dailyUsage && (
            <Text
              color={
                dailyUsage.isOverLimit
                  ? Colors.AccentRed
                  : dailyUsage.isNearLimit
                    ? Colors.AccentYellow
                    : Colors.Gray
              }
            >
              {' '}
              ({dailyUsage.callCount}/{dailyUsage.limit} calls)
            </Text>
          )}
        </Text>
        {corgiMode && (
          <Text>
            <Text color={Colors.Gray}>| </Text>
            <Text color={Colors.AccentRed}>▼</Text>
            <Text color={Colors.Foreground}>(´</Text>
            <Text color={Colors.AccentRed}>ᴥ</Text>
            <Text color={Colors.Foreground}>`)</Text>
            <Text color={Colors.AccentRed}>▼ </Text>
          </Text>
        )}
        {!showErrorDetails && errorCount > 0 && (
          <Box>
            <Text color={Colors.Gray}>| </Text>
            <ConsoleSummaryDisplay errorCount={errorCount} />
          </Box>
        )}
        {showMemoryUsage && <MemoryUsageDisplay />}
      </Box>
    </Box>
  );
};
