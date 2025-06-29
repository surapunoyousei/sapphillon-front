import {
  StatusResponse,
  WorkflowResponse,
  SearchResponse,
  WebResponse,
  TxtResponse,
  LLMResponse,
} from "@/types/requests.ts";

const MAIN_API_BASE_URL = "http://localhost:5001";
const TOOLS_API_BASE_URL = "http://localhost:5000";

export class MainAPI {
  static async getStatus(): Promise<StatusResponse> {
    const response = await fetch(`${MAIN_API_BASE_URL}/status`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  static async executeWorkflow(goal: string): Promise<WorkflowResponse> {
    const response = await fetch(`${MAIN_API_BASE_URL}/workflow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ goal }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    if (data.output) {
      data.output = atob(data.output);
    }

    return data;
  }
}

export class ToolsAPI {
  static async getStatus(): Promise<StatusResponse> {
    const response = await fetch(`${TOOLS_API_BASE_URL}/status`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  static async search(query: string): Promise<SearchResponse> {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `${TOOLS_API_BASE_URL}/search/${encodedQuery}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async getWebContent(url: string): Promise<WebResponse> {
    const encodedUrl = encodeURIComponent(url);
    const response = await fetch(`${TOOLS_API_BASE_URL}/web/${encodedUrl}`);

    const data = await response.json();

    if (!response.ok && response.status !== 500) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return data;
  }

  static async saveText(text: string): Promise<TxtResponse> {
    const response = await fetch(`${TOOLS_API_BASE_URL}/txt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  static async callLLM(text: string): Promise<LLMResponse> {
    const response = await fetch(`${TOOLS_API_BASE_URL}/llm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();

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
