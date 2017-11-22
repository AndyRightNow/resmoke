import constants from './../../constants';

export const testCaseDefinitionSchema = {
    type: 'object',
    properties: {
        name: {
            type: 'string',
            minLength: 1,
        },
        pre: {
            $ref: constants.SCHEMA_ID.TEST_CASE_ACTION,
        },
        post: {
            $ref: constants.SCHEMA_ID.TEST_CASE_ACTION,
        },
        test: {
            $ref: constants.SCHEMA_ID.TEST_CASE_ACTION,
        },
    },
    required: ['name'],
};

export const testCaseActionSchema = {
    $id: constants.SCHEMA_ID.TEST_CASE_ACTION,
    objectTypes: ['array', 'function'],
    items: {
        type: ['string', 'array'],
    },
};
