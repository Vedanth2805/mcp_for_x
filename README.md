# MCP for X

An AI-powered **Model Context Protocol (MCP)** project that connects Gemini with custom tools to create smarter, real-time social content workflows.

## What it does
- Runs an MCP server over Streamable HTTP
- Exposes useful tools such as:
  - `addTwoNumbers`
  - `postTweet` (Gemini-assisted tweet generation + posting to X)
  - `getTrendingSearches` (Google Trends signals for India)
- Includes a client that connects to the MCP server and enables tool-driven conversations

## Why it’s interesting
This project blends **AI + MCP + live platform integrations** so you can move from an idea to a polished, trend-aware tweet with minimal effort.

## Project layout
- `server/` → MCP tools and server logic
- `client/` → Interactive Gemini + MCP client

---
Built for fast experimentation with MCP tool orchestration and AI-assisted content creation.
