import Resmoke, { ActionDefinitionReturnType } from '../Resmoke/index';

export type TestCaseActionFn = (this: Resmoke) => ActionDefinitionReturnType;
export type TestCaseAction = TestCaseActionFn | Array<string | any[]>;

export interface ITestCaseDefinition {
    name: string;
    pre?: TestCaseAction;
    test?: TestCaseAction;
    post?: TestCaseAction;
}

export enum TEST_CASE_RUN_RESULT_STATUS {
    FAIL,
    SUCCESS,
}

export interface ITestCaseRunResult {
    name: string;
    status: TEST_CASE_RUN_RESULT_STATUS;
    errors: Error[];
}
