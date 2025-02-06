export interface config {
   LANGUAGE: 'en' | 'pt';
   AUTO_START: boolean;
   BURST_MODE: boolean;
   PPN: string;
   PPN_WW: string[];
   PPN_CANCEL: string[];
   PPN_REPEAT: string[];
   OAI_KEY: string;
   PV_KEY: string;
   CHEETAH: string;
   CHEETAH_AVAILABLE: boolean;
   LEOPARD: string;
   LEOPARD_AVAILABLE: boolean;
   ORCA_AVAILABLE: boolean;
   RECORD_TIME: number;
   FRAME_LENGHT: number;
   SAMPLE_RATE: number;
   SELECTED_DEVICE: number | undefined;
   SENSITIVITYWW: number;
   SENSITIVITYCMD: number;
   COBRA_LENGHT: number;
   OAI_MODEL:
      | 'gpt-4o'
      | 'gpt-3.5-turbo'
      | 'gpt-4o mini'
      | 'gpt-4-turbo'
      | 'o1-preview'
      | 'o1-mini';
   OAI_ASSIST_DEFINITION: string;
   OAI_ASSIST_USER_DEFINITION: string;
   OAI_HISTORY_LENGTH: number;
   OAI_TEMPERATURE: number;
   OAI_MAX_TOKENS: number;
   STT_ENGINE: 'Picovoice' | 'Whisper';
   TTS_ENGINE: 'Picovoice' | 'OpenAI' | 'Google';
}
