import type {
  EvaluationStatus,
  EvaluationType,
  PillarName,
  SecurityCheckStatus,
  SecurityLayer,
  Severity,
} from '../types'

export const TYPE_LABELS: Record<EvaluationType, string> = {
  full: 'Completa',
  contract: 'Contrato',
  performance: 'Desempenho',
  security: 'Segurança',
}

export const TYPE_ORDER: EvaluationType[] = ['full', 'contract', 'performance', 'security']

export const TYPE_TITLES: Record<EvaluationType, string> = {
  full: 'Avaliação completa',
  contract: 'Avaliação de contrato',
  performance: 'Avaliação de desempenho',
  security: 'Avaliação de segurança',
}

export const TYPE_DESCRIPTIONS: Record<EvaluationType, string> = {
  full: 'Os três pilares, com nota final ponderada.',
  contract: 'Análise estática da especificação OpenAPI.',
  performance: 'Teste de carga nos endpoints escolhidos.',
  security: 'Transporte e cabeçalhos HTTP da URL base.',
}

export const TYPE_SUMMARIES: Record<EvaluationType, string> = {
  full: 'Contrato e segurança rodam em paralelo; o teste de carga vem depois. A nota final pondera os três pilares.',
  contract:
    'Análise estática da especificação com as regras do Spectral. Cada regra violada pesa uma vez, conforme a severidade.',
  performance:
    'Teste de carga com o Autocannon, um endpoint por vez. A nota de cada endpoint é o Apdex, de 0 a 100.',
  security:
    'Oito verificações de transporte e de cabeçalhos HTTP na URL base, em quatro camadas com pesos próprios.',
}

export const TYPE_INPUTS: Record<EvaluationType, string> = {
  full: 'Especificação e de 1 a 20 endpoints; URL base opcional',
  contract: 'Só a especificação OpenAPI',
  performance: 'Especificação e de 1 a 20 endpoints; URL base opcional',
  security: 'Especificação; URL base opcional',
}

export const PILLAR_LABELS: Record<PillarName, string> = {
  contract: 'Contrato',
  performance: 'Desempenho',
  security: 'Segurança',
}

export const PILLARS_BY_TYPE: Record<EvaluationType, PillarName[]> = {
  full: ['contract', 'performance', 'security'],
  contract: ['contract'],
  performance: ['performance'],
  security: ['security'],
}

export const EXECUTION_STEPS: Record<EvaluationType, string[]> = {
  full: ['Contrato e segurança, em paralelo.', 'Desempenho, um endpoint por vez.'],
  contract: ['Contrato: análise da especificação com o Spectral.'],
  performance: ['Desempenho, um endpoint por vez.'],
  security: ['Segurança: transporte e cabeçalhos da URL base.'],
}

export const STATUS_LABELS: Record<EvaluationStatus, string> = {
  PENDING: 'Na fila',
  RUNNING: 'Em execução',
  COMPLETED: 'Concluída',
  PARTIAL: 'Parcial',
  FAILED: 'Falhou',
}

export const SEVERITY_LABELS: Record<Severity, string> = {
  Error: 'Erro',
  Warning: 'Aviso',
  Info: 'Informação',
  Hint: 'Dica',
  Unknown: 'Desconhecida',
}

export const SEVERITY_ORDER: Severity[] = ['Error', 'Warning', 'Info', 'Hint', 'Unknown']

export const LAYER_LABELS: Record<SecurityLayer, string> = {
  transport: 'Transporte',
  access: 'Controle de acesso entre origens',
  content: 'Proteção de conteúdo',
  leakage: 'Vazamento de informação',
}

export const LAYER_SHORT_LABELS: Record<SecurityLayer, string> = {
  transport: 'Transporte',
  access: 'Acesso',
  content: 'Conteúdo',
  leakage: 'Vazamento',
}

export const LAYER_ORDER: SecurityLayer[] = ['transport', 'access', 'content', 'leakage']

export const CHECK_STATUS_LABELS: Record<SecurityCheckStatus, string> = {
  pass: 'Atendida',
  warning: 'Parcial',
  missing: 'Ausente',
  error: 'Não atendida',
}

export const CHECK_STATUS_ORDER: SecurityCheckStatus[] = ['pass', 'warning', 'missing', 'error']
