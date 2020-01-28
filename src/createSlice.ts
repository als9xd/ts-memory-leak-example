import { Reducer } from 'redux'
import {
  createAction,
  PayloadAction,
  PayloadActionCreator,
  PrepareAction,
  ActionCreatorWithoutPayload,
  _ActionCreatorWithPreparedPayload
} from './createAction'
import { createReducer, CaseReducers, CaseReducer } from './createReducer'
import {
  ActionReducerMapBuilder,
  executeReducerBuilderCallback
} from './mapBuilders'

export type SliceActionCreator<P> = PayloadActionCreator<P>

export interface Slice<
  State = any,
  CaseReducers extends SliceCaseReducers<State> = SliceCaseReducers<State>
> {

  name: string

  reducer: Reducer<State>

  actions: CaseReducerActions<CaseReducers>

  caseReducers: SliceDefinedCaseReducers<CaseReducers>
}

export interface CreateSliceOptions<
  State = any,
  CR extends SliceCaseReducers<State> = SliceCaseReducers<State>
> {

  name: string

  initialState: State

  reducers: ValidateSliceCaseReducers<State, CR>

  extraReducers?:
    | CaseReducers<NoInfer<State>, any>
    | ((builder: ActionReducerMapBuilder<NoInfer<State>>) => void)
}

export type CaseReducerWithPrepare<State, Action extends PayloadAction> = {
  reducer: CaseReducer<State, Action>
  prepare: PrepareAction<Action['payload']>
}


export type SliceCaseReducers<State> = {
  [K: string]:
    | CaseReducer<State, PayloadAction<any>>
    | CaseReducerWithPrepare<State, PayloadAction<any>>
}

export type CaseReducerActions<CaseReducers extends SliceCaseReducers<any>> = {
  [Type in keyof CaseReducers]: CaseReducers[Type] extends { prepare: any }
    ? ActionCreatorForCaseReducerWithPrepare<CaseReducers[Type]>
    : ActionCreatorForCaseReducer<CaseReducers[Type]>
}


type ActionCreatorForCaseReducerWithPrepare<
  CR extends { prepare: any }
> = _ActionCreatorWithPreparedPayload<CR['prepare'], string>


type ActionCreatorForCaseReducer<CR> = CR extends (
  state: any,
  action: infer Action
) => any
  ? Action extends { payload: infer P }
    ? PayloadActionCreator<P>
    : ActionCreatorWithoutPayload
  : ActionCreatorWithoutPayload


type SliceDefinedCaseReducers<CaseReducers extends SliceCaseReducers<any>> = {
  [Type in keyof CaseReducers]: CaseReducers[Type] extends {
    reducer: infer Reducer
  }
    ? Reducer
    : CaseReducers[Type]
}


type NoInfer<T> = [T][T extends any ? 0 : never]

export type ValidateSliceCaseReducers<
  S,
  ACR extends SliceCaseReducers<S>
> = ACR &
  {
    [P in keyof ACR]: ACR[P] extends {
      reducer(s: S, action?: { payload: infer O }): any
    }
      ? {
          prepare(...a: never[]): { payload: O }
        }
      : {}
  }


export function createSlice<
  State,
  CaseReducers extends SliceCaseReducers<State>
>(
  options: CreateSliceOptions<State, CaseReducers>
): Slice<State, CaseReducers> {
  return null as any;
}
