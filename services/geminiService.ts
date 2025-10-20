import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Speaker, TranscriptionMessage } from '../types';
import { createBlob, decode, decodeAudioData } from '../utils/audioUtils';

type ConnectionStateCallback = (state: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
type AddMessageCallback = (message: Omit<TranscriptionMessage, 'id'>) => void;
type AiThinkingCallback = (isThinking: boolean) => void;
type AiSpeakingCallback = (isSpeaking: boolean) => void;

export class GeminiService {
  private ai: GoogleGenAI;
  private sessionPromise: Promise<any> | null = null;
  private session: any | null = null;
  
  private addMessage: AddMessageCallback;
  private setConnectionState: ConnectionStateCallback;
  private setAiThinking: AiThinkingCallback;
  private setAiSpeaking: AiSpeakingCallback;
  
  private isMuted = false;
  private micStream: MediaStream | null = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  
  private outputNode: GainNode | null = null;
  private nextStartTime = 0;
  private audioSources = new Set<AudioBufferSourceNode>();
  private aiSpeakingTimeout: number | null = null;


  constructor(
    addMessage: AddMessageCallback, 
    setConnectionState: ConnectionStateCallback, 
    setAiThinking: AiThinkingCallback,
    setAiSpeaking: AiSpeakingCallback,
  ) {
    if (!process.env.API_KEY) {
      setConnectionState('error');
      addMessage({
        speaker: Speaker.SYSTEM,
        text: 'API_KEY environment variable not set. Please configure it to use the application.',
        isFinal: true
      });
      throw new Error("API_KEY environment variable not set");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    this.addMessage = addMessage;
    this.setConnectionState = setConnectionState;
    this.setAiThinking = setAiThinking;
    this.setAiSpeaking = setAiSpeaking;
  }

  public async startSession(): Promise<void> {
    this.setConnectionState('connecting');
    try {
      this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      this.outputNode = this.outputAudioContext.createGain();
      this.outputNode.connect(this.outputAudioContext.destination);

      this.sessionPromise = this.ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => this.handleSessionOpen(),
          onmessage: (message: LiveServerMessage) => this.handleSessionMessage(message),
          onerror: (e: ErrorEvent) => this.handleSessionError(e),
          onclose: (e: CloseEvent) => this.handleSessionClose(e),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: 'You are a helpful meeting assistant. Keep your responses concise and to the point.',
        },
      });

      this.session = await this.sessionPromise;
      this.setConnectionState('connected');
      this.addMessage({
        speaker: Speaker.SYSTEM,
        text: 'Connected to Gemini. You can start speaking.',
        isFinal: true
      });
    } catch (error) {
      console.error("Failed to start Gemini session:", error);
      this.setConnectionState('error');
      throw error;
    }
  }

  private async handleSessionOpen(): Promise<void> {
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      this.mediaStreamSource = this.inputAudioContext.createMediaStreamSource(this.micStream);
      this.scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

      this.scriptProcessor.onaudioprocess = (audioProcessingEvent: AudioProcessingEvent) => {
        if (this.isMuted) return;
        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
        const pcmBlob = createBlob(inputData);
        this.sessionPromise?.then((session) => {
          session.sendRealtimeInput({ media: pcmBlob });
        });
      };
      
      this.mediaStreamSource.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.inputAudioContext.destination);

    } catch (error) {
      console.error("Microphone access failed:", error);
      this.addMessage({
        speaker: Speaker.SYSTEM,
        text: 'Could not access microphone. Please check browser permissions.',
        isFinal: true
      });
      this.setConnectionState('error');
    }
  }

  private async handleSessionMessage(message: LiveServerMessage): Promise<void> {
    if (message.serverContent?.inputTranscription) {
      const { text, isFinal } = message.serverContent.inputTranscription;
      this.addMessage({ speaker: Speaker.USER, text, isFinal });
       if (isFinal && text.trim().length > 0) {
            this.setAiThinking(true);
        }
    }
    
    if (message.serverContent?.outputTranscription) {
      this.setAiThinking(false);
      const { text, isFinal } = message.serverContent.outputTranscription;
      this.addMessage({ speaker: Speaker.MODEL, text, isFinal });
    }

    const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
    if (base64EncodedAudioString && this.outputAudioContext && this.outputNode) {
      this.setAiSpeaking(true);
      if (this.aiSpeakingTimeout) clearTimeout(this.aiSpeakingTimeout);
      this.aiSpeakingTimeout = window.setTimeout(() => {
          this.setAiSpeaking(false);
      }, 500); // 500ms of silence indicates end of AI speech

      // FIX: Resume audio context if suspended to comply with browser autoplay policies.
      if (this.outputAudioContext.state === 'suspended') {
        this.outputAudioContext.resume().catch(err => console.error("Output AudioContext resume failed:", err));
      }
      try {
        this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
        const audioBuffer = await decodeAudioData(
          decode(base64EncodedAudioString),
          this.outputAudioContext,
          24000,
          1,
        );
        const source = this.outputAudioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.outputNode);
        source.addEventListener('ended', () => {
          this.audioSources.delete(source);
        });

        source.start(this.nextStartTime);
        this.nextStartTime += audioBuffer.duration;
        this.audioSources.add(source);
      } catch (error) {
          console.error("Failed to decode or play audio:", error);
      }
    }
    
    const interrupted = message.serverContent?.interrupted;
    if (interrupted) {
      for (const source of this.audioSources.values()) {
        source.stop();
        this.audioSources.delete(source);
      }
      this.nextStartTime = 0;
      this.setAiSpeaking(false);
      if (this.aiSpeakingTimeout) clearTimeout(this.aiSpeakingTimeout);
    }
  }

  private handleSessionError(e: ErrorEvent): void {
    console.error("Gemini session error:", e);
    this.setConnectionState('error');
    this.addMessage({
      speaker: Speaker.SYSTEM,
      text: 'A connection error occurred with the AI service.',
      isFinal: true
    });
    this.closeSession();
  }

  private handleSessionClose(e: CloseEvent): void {
    console.log("Gemini session closed:", e);
    if (this.setConnectionState) {
        this.setConnectionState('disconnected');
    }
    this.cleanupAudio();
  }

  public closeSession(): void {
    this.session?.close();
    this.session = null;
    this.sessionPromise = null;
    this.cleanupAudio();
  }

  private cleanupAudio(): void {
    if (this.aiSpeakingTimeout) clearTimeout(this.aiSpeakingTimeout);
    this.setAiSpeaking(false);

    this.micStream?.getTracks().forEach(track => track.stop());
    this.micStream = null;

    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor.onaudioprocess = null;
      this.scriptProcessor = null;
    }

    this.mediaStreamSource?.disconnect();
    this.mediaStreamSource = null;

    if (this.inputAudioContext?.state !== 'closed') {
      this.inputAudioContext?.close().catch(console.error);
    }
    this.inputAudioContext = null;

    if (this.outputAudioContext?.state !== 'closed') {
      this.outputAudioContext?.close().catch(console.error);
    }
    this.outputAudioContext = null;

    for (const source of this.audioSources.values()) {
        source.stop();
    }
    this.audioSources.clear();
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
  }
}