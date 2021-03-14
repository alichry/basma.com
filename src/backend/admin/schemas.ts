import { string, object, SchemaOf } from 'yup';
import { AdminLogin, AdminRegister } from './types';

export const adminLoginSchema: SchemaOf<AdminLogin> = object().shape({
  username: string().required(),
  password: string().required()
});

export const adminRegisterSchema: SchemaOf<AdminRegister> = adminLoginSchema;