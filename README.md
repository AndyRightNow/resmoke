<p>
    <img width="100%" src="./assets/logo.png">
</p>

<p align="center">
    <b><h1 align="center">Resmoke</h1></b>
    <!-- <p align="center"><a href="https://www.npmjs.com/package/resmoke"><img src="https://img.shields.io/npm/v/resmoke.svg?style=flat-square"></a></p> -->
    <div align="center">A test-case-based, action-based and in-browser front-end e2e test framework for single-page web applications.</div>
</p>

**Note:** The package is still in early development process.

# Introduction

Resmoke is a JavaScript front-end e2e test framework mainly for **single-page web applications**. It could also be used in testing complex UI components with popular JavaScript UI frameworks such as React or Vue. Note that this framework assumes that all external sevices such as servers are already mocked and can be controlled programmatically.

The goals of this framework are to

1. Unify and consolidate the style of writing front-end e2e tests with flat test-case definitions and the usage of actions, which makes the test code more maintainable.
2. Coordinate asynchronous and synchronous code in a easier way.
3. Make the connection and cooperation between the QA team and dev team easier.
4. Make your code more robust, which is also the goal of any tests.

# Installation

```bash
$ npm install resmoke@alpha --save-dev
```

or:

```bash
$ yarn add resmoke@alpha --dev
```

# Usage

The framework should be and is intended to be used with test runner frameworks such as [mocha](https://mochajs.org/), [jasmine](https://jasmine.github.io/) or [jest](https://facebook.github.io/jest/). However, it is also ok to use it as a standalone framework.

## 1. Usage With Test Runners (Use mocha as an example)

**ES2015:**

```js
import * as Resmoke from 'resmoke';

Resmoke.describe = describe;
Resmoke.it = it;

const resmoke = new Resmoke({
    timeout: 3000
});

resmoke.run([{
    name: 'This is case 1: The app should work as intended.',
    pre: [
        'setup',
        'some-other-setup'
    ],
    test() {
        // ...
    },
    post: [
        'clean-up',
        'some-other-clean-up'
    ]
}]);
```


## 2. Usage Without Test Runners

**ES2015:**

```js
import * as Resmoke from 'resmoke';

const resmoke = new Resmoke({
    timeout: 3000
});

resmoke
    .run([{
        name: 'This is case 1: The app should work as intended.',
        pre: [
            'setup',
            'some-other-setup'
        ],
        test() {
            // ...
        },
        post: [
            'clean-up',
            'some-other-clean-up'
        ]
    }])
    .then((results) => {
        // results is an array of test case results
    });
```
