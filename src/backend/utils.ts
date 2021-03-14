import { Response } from 'express';
import { ValidationError } from 'yup';
import { EntityNotFoundError, DuplicateIdentifierError } from './errors';

export const handleException = (res: Response, err: ValidationError | DuplicateIdentifierError | EntityNotFoundError | Error): void => {
  if (err instanceof ValidationError) {
    res.status(400);
    res.json({
      message: "Malformed request",
      errors: err.errors
    });
    return;
  }
  if (err instanceof EntityNotFoundError || err instanceof DuplicateIdentifierError) {
    res.status(400);
    res.json({
      message: err.message
    });
    return;
  }
  res.status(500);
  console.error(err);
  let message = "An internal server occurred while processing your request";
  if (process.env.NODE_ENV === "development") {
    message += ": " + err.message;
  } 
  res.json({
    message
  });
}