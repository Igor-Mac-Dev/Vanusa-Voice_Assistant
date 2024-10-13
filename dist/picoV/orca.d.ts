export default class OrcaTts {
    private config;
    private orca;
    private wavBuffer;
    private orcaInit;
    generateAudio(text: string, usecase: 1 | 2): Promise<void>;
    private orcaRelease;
}
