import { Action } from 'redux'
import {
  IsUnknownOrNonInferrable,
  IfMaybeUndefined,
  IfVoid,
  IsAny
} from './tsHelpers'


export type PayloadAction<
  P = void,
  T extends string = string,
  M = never,
  E = never
> = {
  payload: P
  type: T
} & ([M] extends [never]
  ? {}
  : {
      meta: M
    }) &
  ([E] extends [never]
    ? {}
    : {
        error: E
      })

export type PrepareAction<P> =
  | ((...args: any[]) => { payload: P })
  | ((...args: any[]) => { payload: P; meta: any })
  | ((...args: any[]) => { payload: P; error: any })
  | ((...args: any[]) => { payload: P; meta: any; error: any })


export type _ActionCreatorWithPreparedPayload<
  PA extends PrepareAction<any> | void,
  T extends string = string
> = PA extends PrepareAction<infer P>
  ? ActionCreatorWithPreparedPayload<
      Parameters<PA>,
      P,
      T,
      ReturnType<PA> extends {
        error: infer E
      }
        ? E
        : never,
      ReturnType<PA> extends {
        meta: infer M
      }
        ? M
        : never
    >
  : void

interface BaseActionCreator<P, T extends string, M = never, E = never> {
  type: T
  match(action: Action<unknown>): action is PayloadAction<P, T, M, E>
}

export interface ActionCreatorWithPreparedPayload<
  Args extends unknown[],
  P,
  T extends string = string,
  E = never,
  M = never
> extends BaseActionCreator<P, T, M, E> {

  (...args: Args): PayloadAction<P, T, M, E>
}


export interface ActionCreatorWithOptionalPayload<P, T extends string = string>
  extends BaseActionCreator<P, T> {
  (payload?: undefined): PayloadAction<undefined, T>
  <PT extends Diff<P, undefined>>(payload?: PT): PayloadAction<PT, T>
}

export interface ActionCreatorWithoutPayload<T extends string = string>
  extends BaseActionCreator<undefined, T> {

  (): PayloadAction<undefined, T>
}

export interface ActionCreatorWithPayload<P, T extends string = string>
  extends BaseActionCreator<P, T> {
  <PT extends P>(payload: PT): PayloadAction<PT, T>
  (payload: P): PayloadAction<P, T>
}

export interface ActionCreatorWithNonInferrablePayload<
  T extends string = string
> extends BaseActionCreator<unknown, T> {
  <PT extends unknown>(payload: PT): PayloadAction<PT, T>
}

export type PayloadActionCreator<
  P = void,
  T extends string = string,
  PA extends PrepareAction<P> | void = void
> = IfPrepareActionMethodProvided<
  PA,
  _ActionCreatorWithPreparedPayload<PA, T>,
  // else
  IsAny<
    P,
    ActionCreatorWithPayload<any, T>,
    IsUnknownOrNonInferrable<
      P,
      ActionCreatorWithNonInferrablePayload<T>,
      // else
      IfVoid<
        P,
        ActionCreatorWithoutPayload<T>,
        // else
        IfMaybeUndefined<
          P,
          ActionCreatorWithOptionalPayload<P, T>,
          // else
          ActionCreatorWithPayload<P, T>
        >
      >
    >
  >
>

export function createAction<P = void, T extends string = string>(
  type: T
): PayloadActionCreator<P, T>

export function createAction<
  PA extends PrepareAction<any>,
  T extends string = string
>(
  type: T,
  prepareAction: PA
): PayloadActionCreator<ReturnType<PA>['payload'], T, PA>

export function createAction(type: string, prepareAction?: Function): any {
  function actionCreator(...args: any[]) {
    if (prepareAction) {
      let prepared = prepareAction(...args)
      if (!prepared) {
        throw new Error('prepareAction did not return an object')
      }

      return {
        type,
        payload: prepared.payload,
        ...('meta' in prepared && { meta: prepared.meta }),
        ...('error' in prepared && { error: prepared.error })
      }
    }
    return { type, payload: args[0] }
  }

  actionCreator.toString = () => `${type}`

  actionCreator.type = type

  actionCreator.match = (action: Action<unknown>): action is PayloadAction =>
    action.type === type

  return actionCreator
}

export function getType<T extends string>(
  actionCreator: PayloadActionCreator<any, T>
): T {
  return `${actionCreator}` as T
}

type Diff<T, U> = T extends U ? never : T

type IfPrepareActionMethodProvided<
  PA extends PrepareAction<any> | void,
  True,
  False
> = PA extends (...args: any[]) => any ? True : False
