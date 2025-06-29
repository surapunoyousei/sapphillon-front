import {
  StatusResponse,
  WorkflowResponse,
  SearchResponse,
  WebResponse,
  TxtResponse,
  LLMResponse,
} from "@/types/requests.ts";

const MAIN_API_BASE_URL = "/api/main";
const TOOLS_API_BASE_URL = "/api/tools";

export class MainAPI {
  static async getStatus(): Promise<StatusResponse> {
    console.log(`[MainAPI] GET ${MAIN_API_BASE_URL}/status`);
    const response = await fetch(`${MAIN_API_BASE_URL}/status`);
    console.log(`[MainAPI] Response status: ${response.status}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`[MainAPI] Response data:`, data);
    return data;
  }

  static async executeWorkflow(goal: string): Promise<WorkflowResponse> {
    console.log(`[MainAPI] POST ${MAIN_API_BASE_URL}/workflow`);
    console.log(`[MainAPI] Request body:`, { goal });

    const response = await fetch(`${MAIN_API_BASE_URL}/workflow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ goal }),
    });

    console.log(`[MainAPI] Response status: ${response.status}`);
    const data = await response.json();
    console.log(`[MainAPI] Response data:`, data);

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    if (data.output) {
      try {
        console.log(
          `[MainAPI] Base64エンコードされたoutputの長さ: ${data.output.length}`
        );
        data.output = atob(data.output);
        console.log(`[MainAPI] デコードされたoutput:`, data.output);
      } catch (e) {
        console.error("Base64デコードエラー:", e);
        console.log("生のoutput:", data.output);
        // デコードに失敗した場合は生データをそのまま使用
      }
    }

    return data;
  }
}

export class ToolsAPI {
  static async getStatus(): Promise<StatusResponse> {
    console.log(`[ToolsAPI] GET ${TOOLS_API_BASE_URL}/status`);
    const response = await fetch(`${TOOLS_API_BASE_URL}/status`);
    console.log(`[ToolsAPI] Response status: ${response.status}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`[ToolsAPI] Response data:`, data);
    return data;
  }

  static async search(query: string): Promise<SearchResponse> {
    const encodedQuery = encodeURIComponent(query);
    const url = `${TOOLS_API_BASE_URL}/search/${encodedQuery}`;
    console.log(`[ToolsAPI] GET ${url}`);
    console.log(`[ToolsAPI] Search query: "${query}"`);

    const response = await fetch(url);
    console.log(`[ToolsAPI] Response status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[ToolsAPI] Response data:`, data);
    return data;
  }

  static async getWebContent(url: string): Promise<WebResponse> {
    const encodedUrl = encodeURIComponent(url);
    const apiUrl = `${TOOLS_API_BASE_URL}/web/${encodedUrl}`;
    console.log(`[ToolsAPI] GET ${apiUrl}`);
    console.log(`[ToolsAPI] Web URL: "${url}"`);

    const response = await fetch(apiUrl);
    console.log(`[ToolsAPI] Response status: ${response.status}`);

    const data = await response.json();
    console.log(`[ToolsAPI] Response data:`, data);

    if (!response.ok && response.status !== 500) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return data;
  }

  static async saveText(text: string): Promise<TxtResponse> {
    console.log(`[ToolsAPI] POST ${TOOLS_API_BASE_URL}/txt`);
    console.log(`[ToolsAPI] Text length: ${text.length} characters`);

    const response = await fetch(`${TOOLS_API_BASE_URL}/txt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    console.log(`[ToolsAPI] Response status: ${response.status}`);
    const data = await response.json();
    console.log(`[ToolsAPI] Response data:`, data);

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  static async callLLM(text: string): Promise<LLMResponse> {
    console.log(`[ToolsAPI] POST ${TOOLS_API_BASE_URL}/llm`);
    console.log(`[ToolsAPI] LLM input text length: ${text.length} characters`);

    const response = await fetch(`${TOOLS_API_BASE_URL}/llm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    console.log(`[ToolsAPI] Response status: ${response.status}`);
    const data = await response.json();
    console.log(`[ToolsAPI] Response data:`, data);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return data;
  }
}

export class APIClient {
  static main = MainAPI;
  static tools = ToolsAPI;

  static async checkAllStatus(): Promise<{
    main: StatusResponse;
    tools: StatusResponse;
  }> {
    const [mainStatus, toolsStatus] = await Promise.all([
      MainAPI.getStatus(),
      ToolsAPI.getStatus(),
    ]);

    return {
      main: mainStatus,
      tools: toolsStatus,
    };
  }
}

export default APIClient;
