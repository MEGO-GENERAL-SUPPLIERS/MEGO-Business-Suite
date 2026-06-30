// src/middleware/validation.ts
import { validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

/*
* Request validation middelware
* Usage: router.post('/users', validate([body('email').isEmail()]), validationHandler, createUser)
*/
export const validationHandler = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if(!errors.isEmpty()){
    return res.status(400).json({
      success: false,
      data: {
        error: 'Validation failed',
        message: errors.array().map((err: any) => ({
          field: err.param,
          message: err.msg
        }))
      }
    });
  }

  next();
};

/*
 * Helper to create validation chains
 */
export const validate = (validations: ValidationChain[]) => {
  return validations;
}