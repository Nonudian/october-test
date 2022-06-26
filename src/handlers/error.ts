import { AxiosError } from 'axios'
import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

export type ErrorInstance =
  | Error /* internal */
  | ZodError /* payload */
  | AxiosError /* request */

/**
 * Error handler that treats several error instants.
 * @returns the JSON response with according status code and error information.
 */
export const error = (
  err: ErrorInstance,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ZodError)
    return res
      .status(400)
      .json({ error: '🛑 Payload error!', stack: err.issues })

  if (err instanceof AxiosError)
    return res
      .status(err.response?.status ?? 500)
      .json({ error: '⛔ Axios error!', stack: err })

  return res.status(500).json({
    error: '🔥 Caught but unhandled internal server error!',
    message: err.message,
  })
}
