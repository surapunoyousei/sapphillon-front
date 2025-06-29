// レスポンスの型定義
export interface StatusResponse {
  status: string;
}

export interface WorkflowResponse {
  status: "success" | "failed";
  output?: string;
  error?: string;
  llm_response?: string;
}

export interface SearchResponse {
  urls: string[];
}

export interface WebResponse {
  url: string;
  status: "success" | "error";
  markdown?: string;
  message?: string;
  type?: string;
}

export interface TxtResponse {
  status: "success" | "error";
  message: string;
}

export interface LLMResponse {
  output: string;
}
