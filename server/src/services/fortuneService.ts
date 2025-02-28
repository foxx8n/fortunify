import { FortuneRequest, FortuneResponse } from '../types/fortune';
import { constructSystemPrompt } from '../functions';
import { LLMService } from './llmService';

export class FortuneService {
  private llmService: LLMService;

  constructor(llmService: LLMService) {
    this.llmService = llmService;
  }

  async getFortune(request: FortuneRequest): Promise<FortuneResponse> {
    const { query, mode, language, sessionId } = request;

    // Get the system prompt using our new function
    const systemPrompt = constructSystemPrompt(mode, language);

    try {
      // Get response from LLM
      const response = await this.llmService.getCompletion({
        prompt: query,
        systemPrompt,
        temperature: 0.7,
        maxTokens: 150, // Keep responses concise
        stopSequences: ['User:', 'Human:', '\n\n'],
        sessionId
      });

      return {
        answer: response.trim(),
        mode,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error getting fortune:', error);
      throw new Error('Failed to get fortune telling response');
    }
  }
} 