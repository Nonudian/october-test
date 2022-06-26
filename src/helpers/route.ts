import type { IRoute, NextFunction, Request, Response } from 'express'
import { Router } from 'express'
import type { ErrorInstance } from '../handlers/error'

type RouteCallback = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>

/**
 * Asynchronous route wrapper that helps catching asyn error not handled by Express v4.
 * This is an alternative of numerous and ambiguous try catch structures, as well.
 * @param route - The async route callback to fulfill of reject.
 */
const catchAsync = (route: RouteCallback) => {
  /* Provides an async function... */
  return (req: Request, res: Response, next: NextFunction) =>
    /* ...that calls the given route... */
    route(req, res, next)
      /* ...and treats fulfillment (returns data)... */
      .then((data) => res.status(200).json(data))
      /* ...or rejection (calls error handler) */
      .catch((error: ErrorInstance) => next(error))
}

/* Config params for route registration */
interface RouteRegistration<T extends string> {
  prefix: /* path beginning with '/' */ `/${T}`
  method: /* RESTful HTTP methods */ keyof Pick<
    IRoute,
    'get' | 'post' | 'put' | 'delete' | 'patch'
  >
  callback: /* async route callback */ RouteCallback
}

/* Array with at least one value */
type NonEmptyArray<T> = [T, ...Array<T>]

/**
 * Register all routes from the given configuration list.
 * @param configs - The non-empty list of {@link RouteRegistration}.
 * @returns The router instance exported for the setup (`app.use(routes)`).
 */
export const registerRoutes = <T extends string>(
  ...configs: NonEmptyArray<RouteRegistration<T>>
) => {
  /* Init a new router */
  const router = Router()

  /* Connect routes to this router */
  configs.forEach(({ prefix, method, callback }) => {
    router[method](prefix, catchAsync(callback))
  })

  /* Provide router */
  return router
}
