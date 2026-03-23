/** @type {import('stylelint').Config} */
export default {
  extends: ["stylelint-config-standard", "stylelint-config-css-modules"],
  rules: {
    "selector-class-pattern": null,
    "custom-property-pattern": null,
    "import-notation": "string",
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: ["tailwind", "theme", "apply", "variants", "responsive", "screen", "layer"],
      },
    ],
    "no-descending-specificity": null,
    "color-function-notation": null,
    "alpha-value-notation": null,
    "property-no-vendor-prefix": null,
    "media-feature-range-notation": null,
    "value-keyword-case": null,
    "declaration-block-no-redundant-longhand-properties": null,
    "keyframes-name-pattern": null,
  },
};
