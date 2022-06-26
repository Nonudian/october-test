import type { NextFunction, Request, Response } from 'express'
import { ErrorInstance } from './error'

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
export const catchAsync = (route: RouteCallback) => {
  /* Provides an async function... */
  return (req: Request, res: Response, next: NextFunction) =>
    /* ...that calls the given route... */
    route(req, res, next)
      /* ...and treats fulfillment (returns data)... */
      .then((data) => res.status(200).json(data))
      /* ...or rejection (calls error handler) */
      .catch((error: ErrorInstance) => next(error))
}
