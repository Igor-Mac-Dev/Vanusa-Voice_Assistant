export type mainPhases =
   | 'start'
   | 'pause'
   | 'idle'
   | 'record'
   | 'compositeRecord'
   | 'wait'
   | 'abortWait'
   | 'turnoff';

export type subPhases = 'stt' | 'tts' | 'cmd' | 'speaking' | null;

export type command = { intent: string; slots?: { [key: string]: string } };

export type record =
   | { message: string; recC: Int16Array[]; recL: Int16Array }
   | string;

export type oaiModel =
   | 'gpt-4o'
   | 'gpt-3.5-turbo'
   | 'gpt-4o mini'
   | 'gpt-4-turbo'
   | 'o1-preview'
   | 'o1-mini';

export type BaseConf = [
   string?,
   boolean?,
   boolean?,
   number?,
   number?,
   number?,
   number?,
   number?,
   string?,
   string?,
   string?,
   string?,
   string?,
   number?,
   number?,
   number?,
   string?,
];
