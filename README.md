# Enhanced Gemini CLI

A significantly improved fork of Google's Gemini CLI with better model persistence and usage transparency.

## Why This Fork Exists

The original Gemini CLI has a major flaw: it gives up on the superior **Gemini 2.5 Pro** model too quickly and falls back to the much weaker **Flash** model at the first sign of trouble. This fork fixes that problem and adds essential usage tracking.

## Key Improvements

### Patient Failover System

**Problem**: Original CLI switched to Flash model after just 2 rate limit errors and 2-second timeouts.  
**Solution**: Made the CLI **much more persistent** in staying on Pro:

- **8 consecutive 429 errors** needed before fallback (vs 2)
- **15 retry attempts** instead of 5
- **10-second timeouts** instead of 2 seconds
- **60-second max delays** between retries

**Result**: CLI now tries for several minutes to stay on Pro instead of giving up after 15 seconds.

### Daily Usage Counter

**Problem**: No visibility into API usage, leading to unexpected hits of the 100 calls/day limit.  
**Solution**: Smart usage tracking with visual warnings:

- **Real-time counter** in footer: `gemini-2.5-pro [API Key] (42/100 calls)`
- **Color-coded warnings**: Gray → Yellow (80%+) → Red (100%+)
- **Only tracks billable usage** (API Key/Vertex AI, not free OAuth)
- **Resets daily** automatically

### Auth Method Transparency

**Problem**: Unclear which auth method is active, leading to unexpected billing.  
**Solution**: Clear visual indicators:

- **Red `[API Key]`** = You're being billed
- **Green `[OAuth]`** = Free usage
- **Green `[Vertex AI]`** = Vertex AI billing

## Installation & Usage

### Quick Start

```bash
git clone https://github.com/agileandy/gemini-cli.git
cd gemini-cli
npm install
npm run build
npm start
```

### Setup

1. Get an API key from [Google AI Studio](https://aistudio.google.com/apikey)
2. Set your API key: `export GEMINI_API_KEY="your-api-key-here"`
3. Run: `gemini`

### Key Features

- **Interactive Chat** with Gemini AI models
- **File Context** - automatically include relevant files
- **Tool Integration** - file operations, web search, shell commands
- **MCP Server Support** - extend with custom tools
- **Memory System** - persistent context across sessions

## Why These Changes Matter

### Before (Original):

- Constant frustration with Flash model limitations
- Unexpected billing when thinking you're using OAuth
- Hitting 100-call limit without warning
- Premature fallback from Pro to Flash

### After (This Fork):

- **Stays on Pro model much longer** - no more premature Flash fallbacks
- **Always know your auth status** - red for billed, green for free
- **Never hit usage limits unexpectedly** - clear counter with warnings
- **Latest bug fixes** - up to date with official releases

## Documentation

- [Authentication Setup](./docs/cli/authentication.md)
- [Configuration Guide](./docs/cli/configuration.md)
- [Tools Overview](./docs/tools/index.md)
- [MCP Server Integration](./docs/tools/mcp-server.md)

## Based On

This fork is based on the official [Google Gemini CLI](https://github.com/google-gemini/gemini-cli) v0.1.9, with significant improvements to model persistence and usage transparency.

## License

Apache License 2.0 - see the [LICENSE](./LICENSE) file for details.
