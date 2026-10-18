import { useState } from 'react'
import { ExternalLink, RotateCcw } from 'lucide-react'
import { useSpectralRules } from '../../hooks'
import type { ISpectralCatalogRule } from '../../types'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Checkbox, TextInput } from '../ui/Field'
import { Icon } from '../ui/Icon'
import { Notice } from '../ui/Notice'
import { SeverityBadge } from '../ui/SeverityBadge'
import { FOCUS_RING } from '../ui/classes'
import type { EvaluationFormState } from './formState'

function matchesSearch(rule: ISpectralCatalogRule, term: string): boolean {
  if (!term) return true
  return (
    rule.name.toLowerCase().includes(term) ||
    (rule.description?.toLowerCase().includes(term) ?? false)
  )
}

interface RuleRowProps {
  rule: ISpectralCatalogRule
  enabled: boolean
  onToggle: (enabled: boolean) => void
}

function RuleRow({ rule, enabled, onToggle }: RuleRowProps) {
  const inputId = `rule-${rule.name}`
  const descriptionId = `${inputId}-description`

  return (
    <li className="flex items-start gap-3 border-b border-border px-3 py-2.5 last:border-b-0">
      <Checkbox
        id={inputId}
        checked={enabled}
        onChange={onToggle}
        aria-describedby={rule.description ? descriptionId : undefined}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor={inputId}
            className="cursor-pointer font-mono text-sm font-medium break-all text-ink"
          >
            {rule.name}
          </label>
          <SeverityBadge severity={rule.severity} />
          {enabled !== rule.enabledByDefault ? <Badge tone="accent">Alterada</Badge> : null}
        </div>
        {rule.description ? (
          <p id={descriptionId} lang="en" className="text-sm text-ink-secondary">
            {rule.description}
          </p>
        ) : null}
        <p className="flex flex-wrap gap-x-2 text-xs text-ink-muted">
          <span className="font-mono">OpenAPI {rule.oasVersions.join(' · ')}</span>
          <span>Padrão: {rule.enabledByDefault ? 'ligada' : 'desligada'}</span>
          {rule.documentationUrl ? (
            <a
              href={rule.documentationUrl}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-1 rounded-sm text-accent-ink underline underline-offset-2 max-lg:-my-3.5 max-lg:py-3.5 ${FOCUS_RING}`}
            >
              Documentação
              <Icon icon={ExternalLink} size={12} />
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
          ) : null}
        </p>
      </div>
    </li>
  )
}

interface RuleCatalogFieldsProps {
  form: EvaluationFormState
  onChange: (patch: Partial<EvaluationFormState>) => void
}

export function RuleCatalogFields({ form, onChange }: RuleCatalogFieldsProps) {
  const { rules, isLoading, error } = useSpectralRules()
  const [search, setSearch] = useState('')

  const isEnabled = (rule: ISpectralCatalogRule) =>
    form.rulesConfig[rule.name] ?? rule.enabledByDefault

  const toggleRule = (rule: ISpectralCatalogRule, enabled: boolean) => {
    const next = { ...form.rulesConfig }
    if (enabled === rule.enabledByDefault) {
      delete next[rule.name]
    } else {
      next[rule.name] = enabled
    }
    onChange({ rulesConfig: next })
  }

  const term = search.trim().toLowerCase()
  const visible = (rules ?? []).filter((rule) => matchesSearch(rule, term))

  return (
    <fieldset className="flex min-w-0 flex-col gap-3">
      <legend className="mb-1 font-medium text-ink">Regras do Spectral</legend>
      <p className="text-ink-secondary">
        Por padrão roda o conjunto recomendado. Regra de outra versão do OpenAPI é ignorada na
        avaliação, mesmo ligada.
      </p>
      {isLoading ? <Notice busy title="Carregando o catálogo de regras." /> : null}
      {error ? (
        <Notice tone="error" title="Não foi possível carregar o catálogo de regras.">
          {error} As regras padrão continuam valendo.
        </Notice>
      ) : null}
      {rules ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <TextInput
              type="search"
              mono
              aria-label="Buscar regra"
              placeholder="operation-tags"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.ctrlKey && !event.metaKey) {
                  event.preventDefault()
                }
              }}
              className="min-w-40 flex-1"
            />
            <Badge mono>
              {rules.filter(isEnabled).length} de {rules.length} ligadas
            </Badge>
            <Button
              variant="ghost"
              icon={RotateCcw}
              disabled={Object.keys(form.rulesConfig).length === 0}
              onClick={() => onChange({ rulesConfig: {}, ruleSetId: '' })}
            >
              Restaurar padrões
            </Button>
          </div>
          {visible.length > 0 ? (
            <ul className="max-h-96 overflow-y-auto rounded-md border border-border bg-well [scrollbar-color:var(--border-hover)_transparent] [scrollbar-width:thin]">
              {visible.map((rule) => (
                <RuleRow
                  key={rule.name}
                  rule={rule}
                  enabled={isEnabled(rule)}
                  onToggle={(enabled) => toggleRule(rule, enabled)}
                />
              ))}
            </ul>
          ) : (
            <p className="text-ink-secondary">Nenhuma regra corresponde à busca.</p>
          )}
        </>
      ) : null}
    </fieldset>
  )
}
