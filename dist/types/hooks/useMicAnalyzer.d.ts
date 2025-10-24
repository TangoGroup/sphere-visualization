export interface MicAnalyzerOptions {
    smoothingTimeConstant?: number;
    fftSize?: number;
}
export interface MicAnalyzer {
    volume: number;
    isActive: boolean;
    error?: string;
    start: () => Promise<void>;
    stop: () => void;
}
export declare function useMicAnalyzer(options?: MicAnalyzerOptions): MicAnalyzer;
//# sourceMappingURL=useMicAnalyzer.d.ts.map