import { string, object, SchemaOf } from 'yup';
import { UserRegistrationInformation } from './types';

export const userRegistrationSchema: SchemaOf<UserRegistrationInformation> = object({
  firstname: string().required(),
  lastname: string().required(),
  email: string().email().required(),
  password: string().required().min(12).max(32),
  img: string().optional().nullable()
});