import { AxiosError } from 'axios'
import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

/**
 * Error handler that handles payload and internal errors.
 *
 * @returns the json response with error information.
 */
export const error = (
  err: Error | ZodError | AxiosError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ZodError)
    return res.status(400).json({ error: 'Payload error!', stack: err.issues })

  if (err instanceof AxiosError)
    return res
      .status(err.response?.status ?? 500)
      .json({ error: 'Axios error!', stack: err })

  return res.status(500).json({
    error: 'Unhandled internal server error!',
    message: err.message,
  })
}

/**
 * Error wrapper, that helps catching asynchronous error that ExpressJS v4 cannot handle.
 * This is also an alternative of numerous and ambiguous try catch structures.
 *
 * @param callback - The request callback to fulfill of reject.
 */
export const catchAsync = (
  callback: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<unknown>
) => {
  return (req: Request, res: Response, next: NextFunction) =>
    callback(req, res, next)
      .then((data) => res.status(200).json(data))
      .catch((error) => next(error))
}
