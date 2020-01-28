import { Middleware } from 'redux'

export type IsAny<T, True, False = never> =
  true | false extends (T extends never ? true : false) ? True : False
export type IsUnknown<T, True, False = never> = unknown extends T
  ? IsAny<T, False, True>
  : False

export type IfMaybeUndefined<P, True, False> = [undefined] extends [P]
  ? True
  : False

export type IfVoid<P, True, False> = [void] extends [P] ? True : False

/**
 * @internal
 */
export type IsEmptyObj<T, True, False = never> = T extends any
  ? keyof T extends never
    ? IsUnknown<T, False, IfMaybeUndefined<T, False, IfVoid<T, False, True>>>
    : False
  : never

export type AtLeastTS35<True, False> = [True, False][IsUnknown<
  ReturnType<<T>() => T>,
  0,
  1
>]

export type IsUnknownOrNonInferrable<T, True, False> = AtLeastTS35<
  IsUnknown<T, True, False>,
  IsEmptyObj<T, True, IsUnknown<T, True, False>>
>

export type DispatchForMiddlewares<M> = M extends ReadonlyArray<any>
  ? UnionToIntersection<
      M[number] extends infer MiddlewareValues
        ? MiddlewareValues extends Middleware<infer DispatchExt, any, any>
          ? DispatchExt extends Function
            ? DispatchExt
            : never
          : never
        : never
    >
  : never

type UnionToIntersection<U> = (U extends any
  ? (k: U) => void
  : never) extends ((k: infer I) => void)
  ? I
  : never
