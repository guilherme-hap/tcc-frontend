import type { HttpMethod, ISpecOperation } from '../../types'
import { createTargetDraft, type TargetDraft } from './formState'

const UNTAGGED = 'Sem tag'

export interface OperationGroup {
  tag: string
  operations: ISpecOperation[]
}

function sameOperation(method: HttpMethod, path: string, operation: ISpecOperation): boolean {
  return operation.method === method && operation.path === path
}

export function findOperation(
  operations: ISpecOperation[] | undefined,
  target: TargetDraft,
): ISpecOperation | undefined {
  const path = target.path.trim()
  return operations?.find((operation) => sameOperation(target.method, path, operation))
}

export function isTargetOf(target: TargetDraft, operation: ISpecOperation): boolean {
  return sameOperation(target.method, target.path.trim(), operation)
}

function isBlankTarget(target: TargetDraft): boolean {
  return (
    !target.path.trim() &&
    !target.payload.trim() &&
    Object.values(target.pathParams).every((value) => !value.trim())
  )
}

export function addOperation(targets: TargetDraft[], operation: ISpecOperation): TargetDraft[] {
  const added = { ...createTargetDraft(), method: operation.method, path: operation.path }
  const kept = targets.filter((target) => !isBlankTarget(target))
  return [...kept, added]
}

export function removeOperation(targets: TargetDraft[], operation: ISpecOperation): TargetDraft[] {
  const kept = targets.filter((target) => !isTargetOf(target, operation))
  return kept.length > 0 ? kept : [createTargetDraft()]
}

export function countFilledTargets(targets: TargetDraft[]): number {
  return targets.filter((target) => !isBlankTarget(target)).length
}

export function groupByTag(operations: ISpecOperation[]): OperationGroup[] {
  const groups = new Map<string, ISpecOperation[]>()
  for (const operation of operations) {
    const tag = operation.tags[0] ?? UNTAGGED
    groups.set(tag, [...(groups.get(tag) ?? []), operation])
  }
  return Array.from(groups, ([tag, items]) => ({ tag, operations: items }))
}

export function matchesOperation(operation: ISpecOperation, term: string): boolean {
  if (!term) return true
  return [operation.path, operation.summary, operation.operationId].some(
    (value) => value?.toLowerCase().includes(term) ?? false,
  )
}
