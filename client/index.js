import readline from "readline/promises";
import { GoogleGenAI } from "@google/genai";
import { config } from "dotenv";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";


config();

const chathistory= [];

let tools =[];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const mcpClient = new Client({
  name: "example-client",
  version: "1.0.0",
});

// ✅ FIX: pass string, not { url: ... }
const transport = new StreamableHTTPClientTransport("http://localhost:7777/mcp");

await mcpClient.connect(transport);

console.log("✅ Connected to MCP server");
// List available tools
// List available tools from MCP and convert to Gemini-compatible format
tools = (await mcpClient.listTools()).tools.map(tool => {
  return {
    name: tool.name,
    description: tool.description,
    parameters: {
      type: tool.inputSchema.type,
      properties: tool.inputSchema.properties,
      required: tool.inputSchema.required
    }
  };
});

await chatLoop();



// --- Chat loop with Gemini ---
async function chatLoop(toolCall) {
  if (toolCall) {
    chathistory.push({
      role:"model",
      parts: [
        {
          text: `calling tool ${toolCall.name}`,
          type: "text",
        }
      ]});


    const toolresponse = await mcpClient.callTool({
      name: toolCall.name,
      arguments: toolCall.args
    });
    

    // chathistory.push({
    //   role:"user",
    //   parts: [
    //     {
    //       text: "tool result is : " + toolresponse.content[0].text,
    //       type: "text",
    //     }
    //   ]});

    chathistory.push({
    role:"user",
    parts: toolresponse.content.map(c => ({
    text: c.text,
    type: c.type
    }))
});
  }else{

  const question = await rl.question("You: ");
  chathistory.push({
    role: "user",
    parts: [{ text: question, type: "text" }],
  });

}

const response = await ai.models.generateContent({
  model: "gemini-2.0-flash",
  contents: chathistory,
  config: {
  tools: [
    {
      functionDeclarations: tools,// Use tools fetched from MCP
    }
  ]
  }
});

  const functionCall = response.candidates[0].content.parts[0].functionCall;
  

  const modelresponse = response.candidates[0].content.parts[0].text;

  //console.log(response.candidates[0].content.parts[0]); - if you uncomment this, you can see the tool call response
  if (functionCall) {
    return chatLoop(functionCall)
  }


  chathistory.push({
    role: "model",
    parts: [{ text: modelresponse, type: "text" }],
  });

  console.log("AI:", modelresponse);

  chatLoop();
}


