import type { IRoute, NextFunction, Request, Response } from 'express'
import { Router } from 'express'
import type { z } from 'zod'
import type { ErrorInstance } from '../handlers/error'

type RouteCallback<U extends z.AnyZodObject> = (
  input: z.infer<U>,
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>

/**
 * Asynchronous route wrapper that helps catching async error not handled by Express v4.
 * @param route - The async route callback to fulfill of reject.
 * @remarks This is an alternative of numerous and ambiguous try catch structures, as well.
 * @remarks It also handles payload validation internally.
 */
const catchAsync = <U extends z.AnyZodObject>(
  validation: U,
  route: RouteCallback<U>
) => {
  /* Provides a new async function... */
  return (req: Request, res: Response, next: NextFunction) =>
    /* ...that calls the given route process... */
    /* ...after checking that payload is correct, of course... */
    route(validation.strict().parse(req.body), req, res, next)
      /* ...and treats fulfillment (returns data)... */
      .then((data) => res.status(200).json(data))
      /* ...or rejection (calls error handler) */
      .catch((error: ErrorInstance) => next(error))
}

/* Config params for route registration */
interface RouteRegistration<T extends string, U extends z.AnyZodObject> {
  prefix: /* path beginning with '/' */ `/${T}`
  method: /* RESTful HTTP methods */ keyof Pick<
    IRoute,
    'get' | 'post' | 'put' | 'delete' | 'patch'
  >
  validation: /* payload validation schema */ U
  callback: /* async route callback */ RouteCallback<U>
}

/* Array with at least one value */
type NonEmptyArray<T> = [T, ...Array<T>]

/**
 * Register all routes from the given configuration list.
 * @param configs - The non-empty list of {@link RouteRegistration}s.
 * @returns The router instance exported for the setup (`app.use(routes)`).
 */
export const registerRoutes = <T extends string, U extends z.AnyZodObject>(
  ...configs: NonEmptyArray<RouteRegistration<T, U>>
) => {
  /* Init a new router */
  const router = Router()

  /* Connect routes to this router */
  configs.forEach(({ prefix, method, validation, callback }) => {
    router[method](prefix, catchAsync(validation, callback))
  })

  /* Provide router */
  return router
}
