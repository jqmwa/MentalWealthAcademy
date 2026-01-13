/**
 * Eliza Cloud API Client
 * Handles communication with Eliza Cloud API for chat completions and TTS
 */

interface ElizaChatMessage {
  role: 'user' | 'assistant' | 'system';
  parts: Array<{
    type: 'text';
    text: string;
  }>;
}

interface ElizaChatRequest {
  messages: ElizaChatMessage[];
  id?: string; // Model ID (optional, defaults to gpt-4o)
}

interface ElizaChatResponse {
  choices?: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
  error?: {
    message: string;
  };
}

interface ElizaTTSRequest {
  text: string;
  voiceId?: string;
  modelId?: 'eleven_flash_v2_5' | 'eleven_turbo_v2_5' | 'eleven_multilingual_v2' | 'eleven_monolingual_v1';
}

class ElizaAPIClient {
  private baseUrl: string;
  private apiKey: string | null;

  constructor() {
    // Default to localhost for development, can be overridden with env var
    let baseUrl = process.env.ELIZA_API_BASE_URL || 'http://localhost:3000';
    
    // Remove trailing slashes and /api/v1 if present (the path is added in the methods)
    baseUrl = baseUrl.replace(/\/+$/, ''); // Remove trailing slashes
    baseUrl = baseUrl.replace(/\/api\/v1$/, ''); // Remove /api/v1 if present
    
    this.baseUrl = baseUrl;
    this.apiKey = process.env.ELIZA_API_KEY || null;
  }

  /**
   * Get authorization headers
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  /**
   * Chat completion using Eliza API
   * Uses Vercel AI SDK format with role and parts
   */
  async chat(request: ElizaChatRequest): Promise<string> {
    try {
      const url = `${this.baseUrl}/api/v1/chat`;
      console.log('Calling Eliza API:', { url, hasApiKey: !!this.apiKey, modelId: request.id || 'gpt-4o' });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          messages: request.messages,
          id: request.id || 'gpt-4o',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || response.statusText };
        }
        console.error('Eliza API error response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          url,
          hasApiKey: !!this.apiKey,
        });
        
        // Provide specific error messages for common issues
        if (response.status === 401) {
          if (!this.apiKey) {
            throw new Error('Eliza API key is missing. Please set ELIZA_API_KEY in your environment variables.');
          } else {
            throw new Error('Eliza API key is invalid or expired. Please check your ELIZA_API_KEY configuration.');
          }
        }
        
        throw new Error(errorData.error?.message || errorData.message || `Eliza API error: ${response.status} ${response.statusText}`);
      }

      let data: ElizaChatResponse;
      try {
        const responseText = await response.text();
        console.log('Eliza API raw response:', { 
          status: response.status, 
          statusText: response.statusText,
          responseLength: responseText.length,
          responsePreview: responseText.substring(0, 200),
        });
        
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse Eliza API response as JSON:', {
            error: parseError,
            responseText: responseText.substring(0, 500),
          });
          throw new Error(`Eliza API returned invalid JSON: ${responseText.substring(0, 100)}`);
        }
      } catch (jsonError: any) {
        if (jsonError.message?.includes('invalid JSON')) {
          throw jsonError;
        }
        throw new Error(`Failed to read Eliza API response: ${jsonError.message}`);
      }
      
      console.log('Eliza API parsed response:', { 
        hasChoices: !!data.choices, 
        choicesLength: data.choices?.length,
        hasError: !!data.error,
        errorMessage: data.error?.message,
      });
      
      // Check for error in response
      if (data.error) {
        console.error('Eliza API returned error:', data.error);
        throw new Error(data.error.message || 'Eliza API returned an error');
      }
      
      // Handle different response formats
      if (data.choices && data.choices.length > 0) {
        const content = data.choices[0].message.content || '';
        console.log('Extracted content length:', content.length);
        if (!content) {
          console.error('Eliza API returned empty content in choices:', data.choices[0]);
          throw new Error('Eliza API returned empty content');
        }
        return content;
      }

      // Fallback: try to extract text from response
      const text = (data as any).text || (data as any).content || '';
      if (text) {
        console.log('Using fallback text, length:', text.length);
        return text;
      }

      console.error('No content found in Eliza API response:', JSON.stringify(data, null, 2));
      throw new Error('No response content from Eliza API');
    } catch (error: any) {
      // Handle fetch errors specifically
      if (error.message?.includes('fetch') || error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
        const connectionError = new Error(`Unable to connect to Eliza API at ${this.baseUrl}. Please ensure Eliza Cloud API is running or check your ELIZA_API_BASE_URL configuration.`);
        console.error('Eliza API connection error:', {
          message: connectionError.message,
          baseUrl: this.baseUrl,
          hasApiKey: !!this.apiKey,
          originalError: error.message,
        });
        throw connectionError;
      }
      
      console.error('Eliza API chat error:', {
        message: error.message,
        stack: error.stack,
        baseUrl: this.baseUrl,
        hasApiKey: !!this.apiKey,
        errorCode: error.code,
      });
      throw error;
    }
  }

  /**
   * Text-to-Speech using Eliza API (ElevenLabs)
   * Returns audio blob URL (for client-side) or base64 data URL (for server-side)
   */
  async textToSpeech(request: ElizaTTSRequest, returnBase64: boolean = false): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/elevenlabs/tts`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          text: request.text,
          voiceId: request.voiceId,
          modelId: request.modelId || 'eleven_flash_v2_5',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Eliza TTS API error: ${response.statusText}`);
      }

      // TTS returns audio/mpeg stream
      const audioBlob = await response.blob();
      
      if (returnBase64) {
        // For server-side: convert to base64 data URL
        const arrayBuffer = await audioBlob.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        return `data:audio/mpeg;base64,${base64}`;
      } else {
        // For client-side: create object URL
        const audioUrl = URL.createObjectURL(audioBlob);
        return audioUrl;
      }
    } catch (error) {
      console.error('Eliza TTS API error:', error);
      throw error;
    }
  }

  /**
   * Generate Azura's voice response for a proposal
   * Combines chat completion with TTS
   */
  async generateProposalVoiceResponse(
    proposalTitle: string,
    proposalContent: string,
    azuraPersonality: any
  ): Promise<{ text: string; audioUrl: string }> {
    // Create system prompt from Azura's personality
    const systemPrompt = this.buildAzuraSystemPrompt(azuraPersonality);
    
    // Create user message
    const userMessage = `Review this proposal and provide a brief, thoughtful response (2-3 sentences):

**Title:** ${proposalTitle}

**Proposal:**
${proposalContent.substring(0, 1000)}${proposalContent.length > 1000 ? '...' : ''}`;

    // Get text response from Azura
    const messages: ElizaChatMessage[] = [
      {
        role: 'system',
        parts: [{ type: 'text', text: systemPrompt }],
      },
      {
        role: 'user',
        parts: [{ type: 'text', text: userMessage }],
      },
    ];

    const textResponse = await this.chat({ messages });

    // Generate voice from text (server-side, return base64)
    const audioUrl = await this.textToSpeech({
      text: textResponse,
      modelId: 'eleven_flash_v2_5',
      // voiceId can be set if you have a cloned Azura voice
    }, true); // Return base64 for server-side use

    return {
      text: textResponse,
      audioUrl,
    };
  }

  /**
   * Build system prompt from Azura's personality JSON
   */
  private buildAzuraSystemPrompt(personality: any): string {
    const basePrompt = personality.system || '';
    const style = personality.style?.chat?.[0] || '';
    const bio = personality.bio || '';

    return `${basePrompt}

${bio}

Communication style: ${style}

Keep responses concise, light, and airy. When reviewing proposals, be thoughtful but brief.`;
  }
}

// Export singleton instance
export const elizaAPI = new ElizaAPIClient();

// Export types
export type { ElizaChatMessage, ElizaChatRequest, ElizaTTSRequest };
