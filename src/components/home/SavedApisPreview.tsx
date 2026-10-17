import { ArrowRight, Play } from 'lucide-react'
import { useSavedApis } from '../../hooks'
import { SAVED_APIS_PATH, savedApiEvaluationPath } from '../../utils/routes'
import { Block } from '../ui/Block'
import { LinkButton } from '../ui/LinkButton'
import { Notice } from '../ui/Notice'
import { TextLink } from '../ui/TextLink'

const PREVIEW_LIMIT = 3

export function SavedApisPreview() {
  const { apis, isLoading, error } = useSavedApis()

  return (
    <Block
      title="APIs salvas"
      flush
      aside={
        <TextLink to={SAVED_APIS_PATH} trailingIcon={ArrowRight}>
          Gerenciar
        </TextLink>
      }
    >
      {isLoading ? (
        <div role="status" aria-label="Carregando APIs salvas" className="flex flex-col gap-3 p-4">
          {Array.from({ length: PREVIEW_LIMIT }, (_, index) => (
            <div
              key={index}
              className="h-10 animate-pulse rounded-md bg-surface-raised motion-reduce:animate-none"
            />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 pt-0">
          <Notice tone="error" title="Não foi possível carregar as APIs salvas.">
            {error}
          </Notice>
        </div>
      ) : apis && apis.length > 0 ? (
        <ul className="flex flex-1 flex-col">
          {apis.slice(0, PREVIEW_LIMIT).map((api) => (
            <li
              key={api.id}
              className="flex flex-auto items-center gap-3 border-t border-border px-4 py-3"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate font-medium text-ink">{api.name}</span>
                <span className="truncate font-mono text-xs text-ink-secondary">
                  {api.openApiUrl}
                </span>
              </div>
              <LinkButton
                to={savedApiEvaluationPath(api.id)}
                icon={Play}
                label={`Avaliar ${api.name}`}
                className="shrink-0"
              >
                Avaliar
              </LinkButton>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-start gap-3 px-4 pb-4">
          <p className="text-ink-secondary">
            Nenhuma API salva. Salve uma para não redigitar a especificação a cada avaliação.
          </p>
          <LinkButton to={SAVED_APIS_PATH}>Salvar API</LinkButton>
        </div>
      )}
    </Block>
  )
}
