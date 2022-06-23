import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

/**
 * Error handler that handles payload and internal errors.
 *
 * @returns the json response with error information.
 */
export const error = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ZodError) {
    return res
      .status(400)
      .json({ error: 'Payload error!', message: err.issues })
  }

  return res.status(500).json({ error: 'Unhandled internal server error!' })
}
