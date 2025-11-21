// eslint.config.js
import reactPlugin from "eslint-plugin-react";
export default [
  {
    ignores: [
      "**/.next/**",
      "**/node_modules/**",
      "**/out/**",
      "**/build/**",
      "**/dist/**",
      "**/*.config.js",
      "**/coverage/**",
    ],
  },
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // 引号规则 - 使用双引号
      quotes: [
        "error",
        "double",
        {
          avoidEscape: true,
          allowTemplateLiterals: true,
        },
      ],

      // JSX 属性引号（保持双引号，与普通字符串一致）
      "jsx-quotes": ["error", "prefer-double"],

      // 分号规则
      semi: ["error", "always"],
      "no-unexpected-multiline": "error",
      "no-extra-semi": "error",

      // 代码格式
      indent: ["error", 2],
      "comma-dangle": ["error", "always-multiline"],
      "object-curly-spacing": ["error", "always"],

      // 最佳实践
      "prefer-const": "error",
    },
    plugins: {
      react: reactPlugin,
    },
  },
];
