import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Bookmark, Trash2 } from 'lucide-react'
import { CUSTOM_RULES_KEY, useCustomRules } from '../../hooks'
import { createCustomRule, deleteCustomRule, updateCustomRule } from '../../services'
import { Button } from '../ui/Button'
import { ConfirmBar } from '../ui/ConfirmBar'
import { TextField } from '../ui/Field'
import { Listbox } from '../ui/Listbox'
import { applyRuleSet, buildRuleSet } from './accountState'
import type { EvaluationFormState } from './formState'

const NONE = ''

interface RuleSetFieldsProps {
  form: EvaluationFormState
  onChange: (patch: Partial<EvaluationFormState>) => void
}

export function RuleSetFields({ form, onChange }: RuleSetFieldsProps) {
  const queryClient = useQueryClient()
  const removeRef = useRef<HTMLButtonElement>(null)
  const { ruleSets, error: loadError } = useCustomRules()
  const [naming, setNaming] = useState(false)
  const [name, setName] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const refresh = () => queryClient.invalidateQueries({ queryKey: [CUSTOM_RULES_KEY] })

  const createMutation = useMutation({
    mutationFn: createCustomRule,
    onSuccess: async (created) => {
      await refresh()
      onChange({ ruleSetId: created.id })
      setNaming(false)
      setName('')
      setFeedback(`Conjunto "${created.name}" salvo.`)
    },
  })
  const updateMutation = useMutation({
    mutationFn: updateCustomRule,
    onSuccess: async (updated) => {
      await refresh()
      setFeedback(`Conjunto "${updated.name}" atualizado.`)
    },
  })
  const deleteMutation = useMutation({
    mutationFn: deleteCustomRule,
    onSuccess: async () => {
      await refresh()
      onChange({ ruleSetId: NONE })
      setConfirming(false)
    },
  })

  const selected = ruleSets?.find((ruleSet) => ruleSet.id === form.ruleSetId) ?? null
  const failure = createMutation.error ?? updateMutation.error ?? deleteMutation.error
  const message = problem ?? loadError ?? (confirming ? null : (failure?.message ?? null))

  const begin = () => {
    createMutation.reset()
    updateMutation.reset()
    deleteMutation.reset()
    setProblem(null)
    setFeedback(null)
  }

  const save = (targetId: string | null) => {
    begin()
    const built = buildRuleSet(form)
    const trimmed = name.trim()

    if (targetId === null && !trimmed) {
      setProblem('Informe o nome do conjunto.')
    } else if (!built.ok) {
      setProblem(`Pesos por severidade: ${built.error}`)
    } else if (targetId === null) {
      createMutation.mutate({
        name: trimmed,
        rulesConfig: built.rulesConfig,
        severityWeights: built.severityWeights,
      })
    } else {
      updateMutation.mutate({
        id: targetId,
        changes: { rulesConfig: built.rulesConfig, severityWeights: built.severityWeights },
      })
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-md border border-border bg-well px-4 py-3">
      <div className="flex flex-wrap items-end gap-3">
        <Listbox
          label="Conjunto de regras salvo"
          options={[
            { value: NONE, label: 'Nenhum conjunto' },
            ...(ruleSets ?? []).map((ruleSet) => ({ value: ruleSet.id, label: ruleSet.name })),
          ]}
          value={selected?.id ?? NONE}
          onChange={(id) => {
            begin()
            setConfirming(false)
            onChange(applyRuleSet(form, ruleSets?.find((ruleSet) => ruleSet.id === id) ?? null))
          }}
          className="max-w-90 flex-[1_1_15rem]"
        />
        <div className="flex flex-wrap gap-2">
          {selected ? (
            <Button loading={updateMutation.isPending} onClick={() => save(selected.id)}>
              Atualizar conjunto
            </Button>
          ) : null}
          <Button
            icon={Bookmark}
            aria-expanded={naming}
            onClick={() => {
              begin()
              setNaming((current) => !current)
            }}
          >
            Salvar como novo conjunto
          </Button>
          {selected ? (
            <Button
              ref={removeRef}
              variant="ghost"
              icon={Trash2}
              onClick={() => {
                begin()
                setConfirming(true)
              }}
            >
              Excluir conjunto
            </Button>
          ) : null}
        </div>
      </div>
      {naming ? (
        <div className="flex flex-wrap items-end gap-3">
          <div className="max-w-90 min-w-0 flex-[1_1_15rem]">
            <TextField
              id="rule-set-name"
              label="Nome do conjunto"
              placeholder="API pública"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== 'Enter' || event.ctrlKey || event.metaKey) return
                event.preventDefault()
                save(null)
              }}
            />
          </div>
          <Button variant="primary" loading={createMutation.isPending} onClick={() => save(null)}>
            Salvar conjunto
          </Button>
        </div>
      ) : null}
      {confirming && selected ? (
        <ConfirmBar
          title={`Excluir o conjunto "${selected.name}"?`}
          description="A exclusão não pode ser desfeita. A configuração atual do formulário continua como está."
          confirmLabel="Excluir conjunto"
          pending={deleteMutation.isPending}
          error={deleteMutation.error?.message}
          className="rounded-md border"
          onConfirm={() => deleteMutation.mutate(selected.id)}
          onCancel={() => {
            setConfirming(false)
            removeRef.current?.focus()
          }}
        />
      ) : null}
      {message ? (
        <p role="alert" className="text-error">
          {message}
        </p>
      ) : feedback ? (
        <p role="status" className="text-success">
          {feedback}
        </p>
      ) : null}
      <p className="text-ink-secondary">
        Um conjunto guarda as regras alteradas e os pesos por severidade. Escolher um conjunto
        substitui a configuração abaixo.
      </p>
    </div>
  )
}
