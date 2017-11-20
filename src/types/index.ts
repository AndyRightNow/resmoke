import Resmoke, { ActionDefinitionReturnType } from '../Resmoke/index';

export interface ITestLifecycleHookOptions {
    actions: string[];
    /**
     * Always execute before 'actions'
     */
    exec: (this: Resmoke) => ActionDefinitionReturnType;
}

export interface ITestCaseDefinition {
    name: string;
    pre: ITestLifecycleHookOptions;
    test: (this: Resmoke) => ActionDefinitionReturnType;
    post: ITestLifecycleHookOptions;
}
