// FIX: Removed a circular self-import of the 'Speaker' enum. The enum is defined in this file and should not be imported from itself.
export enum Speaker {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system',
}

export interface TranscriptionMessage {
  id: string;
  speaker: Speaker;
  text: string;
  isFinal: boolean;
  translatedText?: string;
  targetLanguage?: string;
}

export interface UserProfile {
  name: string;
  avatarUrl: string;
}

export type ActivePanel = 'transcription' | 'participants' | 'whiteboard' | 'none';