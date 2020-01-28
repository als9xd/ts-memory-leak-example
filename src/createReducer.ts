import createNextState, { Draft } from 'immer'
import { AnyAction, Action, Reducer } from 'redux'
import {
  executeReducerBuilderCallback,
  ActionReducerMapBuilder
} from './mapBuilders'

export type Actions<T extends keyof any = string> = Record<T, Action>

export type CaseReducer<S = any, A extends Action = AnyAction> = (
  state: Draft<S>,
  action: A
) => S | void
export type CaseReducers<S, AS extends Actions> = {
  [T in keyof AS]: AS[T] extends Action ? CaseReducer<S, AS[T]> : void
}

export function createReducer<
  S,
  CR extends CaseReducers<S, any> = CaseReducers<S, any>
>(initialState: S, actionsMap: CR): Reducer<S>
export function createReducer<S>(
  initialState: S,
  builderCallback: (builder: ActionReducerMapBuilder<S>) => void
): Reducer<S>

export function createReducer<S>(
  initialState: S,
  mapOrBuilderCallback:
    | CaseReducers<S, any>
    | ((builder: ActionReducerMapBuilder<S>) => void)
): Reducer<S> {
  let actionsMap =
    typeof mapOrBuilderCallback === 'function'
      ? executeReducerBuilderCallback(mapOrBuilderCallback)
      : mapOrBuilderCallback

  return function(state = initialState, action): S {
    return createNextState(state, (draft: Draft<S>) => {
      const caseReducer = actionsMap[action.type]
      return caseReducer ? caseReducer(draft, action) : undefined
    })
  }
}
