module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es2021": true,
        "node": true
    },
    "globals": {
        "google": "writable",
        "dayjs": "writable"
    },
    "overrides": [
        {
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parserOptions": {
        "ecmaVersion": "latest"
    },
    "rules": {
        "no-unused-vars": "warn",
        "no-undef": "warn",
        "semi": "error"
    },
    "extends": "eslint:recommended"
};
