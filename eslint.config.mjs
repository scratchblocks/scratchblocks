import globals from "globals"
import babelParser from "@babel/eslint-parser"
import js from "@eslint/js"

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      parser: babelParser,
      ecmaVersion: 14,
      sourceType: "module",

      parserOptions: {
        requireConfigFile: false,
      },
    },

    rules: {
      curly: [2, "all"],
      "default-case": 2,
      "default-case-last": 2,
      "dot-notation": 2,

      eqeqeq: [
        2,
        "always",
        {
          null: "never",
        },
      ],

      "no-constant-condition": [
        2,
        {
          checkLoops: false,
        },
      ],

      "no-constant-binary-expression": 2,
      "no-duplicate-imports": 2,
      "no-else-return": 2,
      "no-lonely-if": 2,
      "no-loop-func": 2,

      "no-restricted-syntax": [
        2,
        {
          selector:
            'CallExpression > MemberExpression[property.name="join"] > ArrayExpression',
          message:
            "Do not call Array.join on newly constructed array; use template string instead",
        },
        {
          selector:
            'BinaryExpression[left.callee.property.name="indexOf"] > UnaryExpression[operator="-"][argument.value="1"]',
          message: "Use includes method instead of indexOf method",
        },
      ],

      "no-self-compare": 2,
      "no-sequences": 2,
      "no-unreachable-loop": 2,
      "no-unused-private-class-members": 2,

      "no-unused-vars": [
        2,
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],

      "no-useless-concat": 2,
      "no-var": 2,
      "prefer-arrow-callback": 2,
      "prefer-const": 2,
      "prefer-object-spread": 2,
      "prefer-rest-params": 2,
      "prefer-spread": 2,
      yoda: [2, "never"],
    },
  },
  {
    files: ["tests/*.js"],

    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
]
