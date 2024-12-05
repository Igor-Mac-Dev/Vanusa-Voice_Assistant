export type mainPhases =
   | 'start'
   | 'idle'
   | 'record'
   | 'wait'
   | 'abortWait'
   | 'turnoff';

export type subPhases = 'compositeRecord' | 'stt' | 'tts' | 'cmd' | null;
