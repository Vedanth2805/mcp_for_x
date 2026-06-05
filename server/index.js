import express from "express";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { createpost} from './mcp.tool.js';
import {GoogleGenerativeAI} from "@google/generative-ai"
import { getTrendingNowIndia }  from "./test.js"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const app = express();
app.use(express.json());



// Create MCP server (only once)
const server = new McpServer({
  name: "example-server",
  version: "1.0.0",
});

// ✅ Register a tool (latest style)
server.registerTool(
  "addTwoNumbers",
  {
    title: "Add Two Numbers",
    description: "Takes two numbers and returns their sum",
    inputSchema: { a: z.number(), b: z.number() },
  },
  async ({ a, b }) => ({
    content: [
      {
        type: "text",
        text: `The sum of ${a} and ${b} is ${a + b}`,
      },
    ],
  })
);

// Register Twitter posting tool
server.registerTool(
  "postTweet",
  {
    title: "Create post on twitter",
    description: "creates a post on x elaborate using gemini",
    inputSchema: { status: z.string() },
  },
  async ({ status }) => {

    const prompt = `Create a concise and engaging tweet about: ${status}. Keep it under 280 characters.`;
    const result = await model.generateContent(prompt);
    const tweetText = result.response.text();
    console.log("Generated Tweet Text:", tweetText);

    const response = await createpost(tweetText); // call your function
    return {
      content: [
        {
          type: "text",
          text: `Tweet posted: ${tweetText}\n ${response}`, // or JSON.stringify(response) if it's an object
        },
      ],
    };
  }
);


server.registerTool(
  "getTrendingSearches",
  {
    title: "Get trending searches",
    description: "Fetches trending search queries from Google Trends (random category each time)",
    inputSchema: undefined, // ❌ no input needed, geo is hardcoded
  },
  async () => {
    try {
      // Always default to India
      const result = await getTrendingNowIndia();

      return {
        content: result?.content ?? [
          { type: "text", text: "⚠️ No trending searches available right now." },
        ],
      };
    } catch (err) {
      console.error("Error fetching trends:", err);
      return {
        content: [
          { type: "text", text: "❌ Failed to fetch trending searches." },
        ],
      };
    }
  }
);






// Keep track of sessions/transports
const transports= {};

// Handle POST requests (client → server)
app.post("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  let transport;

  if (sessionId && transports[sessionId]) {
    // Reuse existing session
    transport = transports[sessionId];
  } else if (!sessionId && isInitializeRequest(req.body)) {
    // Create a new session
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sid) => {
        transports[sid] = transport;
      },
      // Recommended for local dev
      // enableDnsRebindingProtection: true,
      // allowedHosts: ["127.0.0.1"],
    });

    // Cleanup when connection closes
    transport.onclose = () => {
      if (transport.sessionId) delete transports[transport.sessionId];
    };

    // Connect transport to MCP server
    await server.connect(transport);
  } else {
    res.status(400).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Bad Request: No valid session ID" },
      id: null,
    });
    return;
  }

  // Forward request to MCP transport
  await transport.handleRequest(req, res, req.body);
});

// GET: server → client streaming (SSE-like behavior)
app.get("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send("Invalid or missing session ID");
    return;
  }
  const transport = transports[sessionId];
  await transport.handleRequest(req, res);
});

// DELETE: cleanup session
app.delete("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  if (sessionId && transports[sessionId]) {
    delete transports[sessionId];
    res.status(200).send("Session closed");
  } else {
    res.status(400).send("Invalid session ID");
  }
});

app.listen(7777, () => {
  console.log("🚀 MCP Streamable HTTP server running on http://localhost:7777/mcp");
});
