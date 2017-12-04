import capitalize = require('lodash/capitalize');
import isObjectLike = require('lodash/isObjectLike');
import cloneDeep = require('lodash/cloneDeep');
import { noop } from './index';
import * as Ajv from 'ajv';
import { Ajv as AjvType, ErrorObject } from 'ajv';
import { testCaseActionSchema, testCaseDefinitionSchema } from '../types/schemas/index';
import constants from './../constants';

let validationDebug: any;
if (!PRODUCTION) {
    validationDebug = require('debug')(require('./debug').getDebugName('validation'));
}

type ValidationType = 'argument' | 'property';
type PartialErrorObject = Pick<ErrorObject, 'keyword' | 'message' | 'params' | 'dataPath'>;

function getValueType<T>(val: T): string {
    return (Object.prototype.toString.call(val) as string).match(/\[object (.*?)\]/)[1];
}

function getValidationError(
    type: ValidationType,
    name: string,
    expectedType: string,
    valueType: string,
) {
    return new Error(
        `${capitalize(type)} Error: Expect the ${type} ${name} ` +
            `to be '${expectedType}', instead '${valueType}' is received.`,
    );
}

function validate<T>(
    validationType: ValidationType,
    value: T,
    name: string,
    type: string,
    allowUndefined = false,
    callback?: (valueType: string, expectedType: string, result: boolean) => void,
): void {
    const valueType = getValueType(value);
    const expectedType = capitalize(type);

    const boundCallback = (callback && callback.bind(null, valueType, expectedType)) || noop;

    if ((allowUndefined && typeof value === 'undefined') || valueType === expectedType) {
        boundCallback(true);
    } else {
        boundCallback(false);
        throw getValidationError(validationType, name, expectedType, valueType);
    }
}

function getValidationErrorObject(
    keyword: string,
    dataPath: string,
    positive: boolean = true,
    type: string = keyword,
    params: any[] = [],
): PartialErrorObject {
    return {
        keyword,
        message: `should${positive ? '' : ' NOT'} be ${type}`,
        dataPath,
        params,
    };
}

export interface IObjectValidationSchema {
    validator: () => void;
    props: { [key: string]: IObjectValidationSchema };
}

export function validateArg<T>(
    name: string,
    value: T,
    type: string,
    pos: number,
    allowUndefined = false,
): void {
    validate('argument', value, `${name} at index ${pos}`, type, allowUndefined);
}

function setupValidation(): AjvType {
    const ajvInst = new Ajv({
        allErrors: true,
    });

    ajvInst.addKeyword('objectTypes', {
        validate: function objectTypesValidationFn(
            schema: string[],
            data: any,
            parentSchema: any,
            dataPath: string,
        ) {
            const name =
                schema.length > 1
                    ? schema.slice(0, schema.length - 1).join(', ') +
                      ` or ${schema[schema.length - 1]} if is an object`
                    : schema[0];
            const fn = objectTypesValidationFn as typeof objectTypesValidationFn & {
                errors: PartialErrorObject[];
            };
            const error = getValidationErrorObject('objectTypes', dataPath, true, name);

            fn.errors = fn.errors || [];

            if (!PRODUCTION) {
                validationDebug(
                    `Validating ${dataPath} ${
                        data
                    } with the keyword objectTypes using the schemas ${schema}`,
                );
            }
            if (Array.isArray(data) || isObjectLike(data) || typeof data === 'function') {
                let isSuccessful = false;

                for (const s of schema) {
                    if (s === 'array') {
                        if (Array.isArray(data)) {
                            const newParentSchema = cloneDeep(parentSchema);
                            delete newParentSchema.objectTypes;
                            newParentSchema.type = 'array';
                            const arrayValidate = ajvInst.compile(newParentSchema);

                            if (arrayValidate(data)) {
                                isSuccessful = true;
                                break;
                            } else {
                                fn.errors = fn.errors.concat(arrayValidate.errors || []);
                            }
                        }
                    } else if (/^[A-Z]/.test(s)) {
                        const Ctor: () => void = new Function(`return ${s}`)();

                        if (data instanceof Ctor) {
                            isSuccessful = true;
                            break;
                        }
                    } else if (typeof data === s) {
                        isSuccessful = true;
                        break;
                    }
                }

                if (!isSuccessful) {
                    fn.errors.push(error);
                    return false;
                }
            }

            return true;
        },
    });

    ajvInst.addSchema(testCaseActionSchema, constants.SCHEMA_ID.TEST_CASE_ACTION);
    ajvInst.addSchema(testCaseDefinitionSchema, constants.SCHEMA_ID.TEST_CASE_DEFINITION);

    return ajvInst;
}

export const ajv: AjvType = setupValidation();
