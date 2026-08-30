import type { EvaluationType, EvaluationStatus, IFailedPillar, IAutocannonResult } from './evaluation';
import type { ISpectralItemResponse } from './spectral';

export interface EvaluationRecord {
    id: string;
    swaggerUrl: string;
    baseUrl: string | null;
    evaluationType: EvaluationType;
    status: EvaluationStatus;
    spectralResult: ISpectralItemResponse[] | null;
    autocannonResult: IAutocannonResult | null;
    securityResult: unknown | null;
    finalScore: number | null;
    failedPillars: IFailedPillar[] | null;
    errorMessage: string | null;
    createdAt: string;
    updatedAt: string;
}