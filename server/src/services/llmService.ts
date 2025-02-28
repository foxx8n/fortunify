interface CompletionRequest {
  prompt: string;
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
  sessionId?: string;
}

interface CompletionResponse {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class LLMService {
  private apiKey: string;
  private apiEndpoint: string;

  constructor(apiKey: string, apiEndpoint: string) {
    this.apiKey = apiKey;
    this.apiEndpoint = apiEndpoint;
  }

  async getCompletion(request: CompletionRequest): Promise<string> {
    const {
      prompt,
      systemPrompt,
      temperature = 0.7,
      maxTokens = 150,
      stopSequences = [],
      sessionId
    } = request;

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature,
          max_tokens: maxTokens,
          stop: stopSequences,
          session_id: sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json() as CompletionResponse;
      return data.text;
    } catch (error) {
      console.error('Error getting completion:', error);
      throw new Error('Failed to get completion from LLM service');
    }
  }
} 