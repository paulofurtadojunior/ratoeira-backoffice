import { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Schema, ValidationError } from 'yup';
import { ApiResult } from '../models/api-result';

type TProperty = 'body' | 'header' | 'params' | 'query';

type TGetSchema = <T>(schema: Schema<T>) => Schema<T>;

type TAllSchemas = Record<TProperty, Schema<any>>

type TGetAllSchemas = (getSchema: TGetSchema) => Partial<TAllSchemas>;

type TValidation = (getAllSchemas: TGetAllSchemas) => RequestHandler;


export const validation: TValidation = (getAllSchemas) => async (req, res, next) => {

    const schemas = getAllSchemas((schema) => schema);

    const errorsResult: Record<string, Record<string, string>> = {};

    Object.entries(schemas).forEach(([key, schema]) => {
        try {
            schema.validateSync(req[key as TProperty], { abortEarly: false });
        } catch (err) {

            const yupError = err as ValidationError;
            const errors: Record<string, string> = {};

            yupError.inner.map(erro => {
                if (erro.path === undefined) return;
                errors[erro.path] = erro.message;
            });

            errorsResult[key] = errors;
        }
    });


    const apiResult: ApiResult = {
        data: {},
        errors: errorsResult,
        message: 'Falha',
        success: false
    };


    if (Object.entries(errorsResult).length === 0) {
        return next();
    } else {
        return res.status(StatusCodes.BAD_REQUEST).json(apiResult);
    }



};