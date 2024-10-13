export default function rhinoHandler(cmd: {
    intent: string;
    [slot: string]: string;
}, composite: boolean): void;
