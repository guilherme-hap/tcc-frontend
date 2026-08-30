export type SpectralSeverity = 'Error' | 'Warning' | 'Info' | 'Hint' | 'Unknown';

export interface ISpectralItemResponse {
    endpoint: string;
    method: string;
    rule: string | number;
    message: string;
    severity: SpectralSeverity;
}