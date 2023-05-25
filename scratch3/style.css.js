// Processed by Rollup
export default `
.scratchblocks-style-scratch3 {
  --sb3-label: #fff;
  --sb3-input-color-stroke: #fff;
  --sb3-input-fill: #fff;
  /* Blockly color: text */
  --sb3-literal: #575e75;

  /**
   * Primary, secondary, and tertiary colors are called
   * fill, alt, and stroke/dark (bool input) in the class names.
   * See https://github.com/scratchfoundation/scratch-blocks/blob/develop/core/colours.js
   * for color reference.
   * Upcoming quaternary color is unused when rendering a block; only the dropdown GUI.
   */
  --sb3-motion-primary: #4c97ff;
  --sb3-motion-secondary: #4280d7;
  --sb3-motion-tertiary: #3373cc;

  --sb3-looks-primary: #9966ff;
  --sb3-looks-secondary: #855cd6;
  --sb3-looks-tertiary: #774dcb;

  --sb3-sound-primary: #cf63cf;
  --sb3-sound-secondary: #c94fc9;
  --sb3-sound-tertiary: #bd42bd;

  --sb3-control-primary: #ffab19;
  --sb3-control-secondary: #ec9c13;
  --sb3-control-tertiary: #cf8b17;

  --sb3-events-primary: #ffbf00;
  --sb3-events-secondary: #e6ac00;
  --sb3-events-tertiary: #cc9900;

  --sb3-sensing-primary: #5cb1d6;
  --sb3-sensing-secondary: #47a8d1;
  --sb3-sensing-tertiary: #2e8eb8;

  --sb3-operators-primary: #59c059;
  --sb3-operators-secondary: #46b946;
  --sb3-operators-tertiary: #389438;

  --sb3-variables-primary: #ff8c1a;
  --sb3-variables-secondary: #ff8000;
  --sb3-variables-tertiary: #db6e00;

  --sb3-list-primary: #ff661a;
  --sb3-list-secondary: #ff5500;
  --sb3-list-tertiary: #e64d00;

  --sb3-custom-primary: #ff6680;
  --sb3-custom-secondary: #ff4d6a;
  --sb3-custom-tertiary: #ff3355;

  --sb3-extension-primary: #0fbd8c;
  --sb3-extension-secondary: #0da57a;
  --sb3-extension-tertiary: #0b8e69;

  /**
   * Custom color types. Not defined by Scratch.
   */
  --sb3-obsolete-primary: #ed4242;
  --sb3-obsolete-secondary: #db3333;
  --sb3-obsolete-tertiary: #ca2b2b;

  /* From early prototype colors */
  --sb3-grey-primary: #bfbfbf;
  --sb3-grey-secondary: #b2b2b2;
  --sb3-grey-tertiary: #909090;
}

.scratchblocks-style-scratch3-high-contrast {
  --sb3-label: #000;
  --sb3-input-color-stroke: #fff;
  --sb3-input-fill: #fff;
  --sb3-literal: #000;

  --sb3-motion-primary: #80b5ff;
  --sb3-motion-secondary: #b3d2ff;
  --sb3-motion-tertiary: #3373cc;

  --sb3-looks-primary: #ccb3ff;
  --sb3-looks-secondary: #ddccff;
  --sb3-looks-tertiary: #774dcb;

  --sb3-sound-primary: #e19de1;
  --sb3-sound-secondary: #ffb3ff;
  --sb3-sound-tertiary: #bd42bd;

  --sb3-control-primary: #ffbe4c;
  --sb3-control-secondary: #ffda99;
  --sb3-control-tertiary: #cf8b17;

  --sb3-events-primary: #ffd966;
  --sb3-events-secondary: #ffecb3;
  --sb3-events-tertiary: #cc9900;

  --sb3-sensing-primary: #85c4e0;
  --sb3-sensing-secondary: #aed8ea;
  --sb3-sensing-tertiary: #2e8eb8;

  --sb3-operators-primary: #7ece7e;
  --sb3-operators-secondary: #b5e3b5;
  --sb3-operators-tertiary: #389438;

  --sb3-variables-primary: #ffa54c;
  --sb3-variables-secondary: #ffcc99;
  --sb3-variables-tertiary: #db6e00;

  --sb3-list-primary: #ff9966;
  --sb3-list-secondary: #ffcab0;
  --sb3-list-tertiary: #e64d00;

  --sb3-custom-primary: #ff99aa;
  --sb3-custom-secondary: #ffccd5;
  --sb3-custom-tertiary: #e64d00;

  --sb3-extension-primary: #13ecaf;
  --sb3-extension-secondary: #75f0cd;
  --sb3-extension-tertiary: #0b8e69;

  /* Manually picked to be readable on black text */
  --sb3-obsolete-primary: #fc6666;
  --sb3-obsolete-secondary: #fcb0b0;
  --sb3-obsolete-tertiary: #d32121;

  --sb3-grey-primary: #bfbfbf;
  --sb3-grey-secondary: #b2b2b2;
  /* Changed to be AAA against #000000, was AA */
  --sb3-grey-tertiary: #959595;
}

.sb3-label {
  font: 500 12pt Helvetica Neue, Helvetica, sans-serif;
  fill: var(--sb3-label, #fff);
  word-spacing: +1pt;
}

/*
 * Note: we specify default just in case it uses
 * the internal API directly and does not set the classes.
 */

.sb3-motion {
  fill: var(--sb3-motion-primary, #4c97ff);
  stroke: var(--sb3-motion-tertiary, #3373cc);
}
.sb3-motion-alt {
  fill: var(--sb3-motion-secondary, #4280d7);
}
.sb3-motion-dark {
  fill: var(--sb3-motion-tertiary, #3373cc);
}
.sb3-looks {
  fill: var(--sb3-looks-primary, #9966ff);
  stroke: var(--sb3-looks-tertiary, #774dcb);
}
.sb3-looks-alt {
  fill: var(--sb3-looks-secondary, #855cd6);
}
.sb3-looks-dark {
  fill: var(--sb3-looks-tertiary, #774dcb);
}
.sb3-sound {
  fill: var(--sb3-sound-primary, #cf63cf);
  stroke: var(--sb3-sound-tertiary, #bd42bd);
}
.sb3-sound-alt {
  fill: var(--sb3-sound-secondary, #c94fc9);
}
.sb3-sound-dark {
  fill: var(--sb3-sound-tertiary, #bd42bd);
}
.sb3-control {
  fill: var(--sb3-control-primary, #ffab19);
  stroke: var(--sb3-control-tertiary, #cf8b17);
}
.sb3-control-alt {
  fill: var(--sb3-control-secondary, #ec9c13);
}
.sb3-control-dark {
  fill: var(--sb3-control-tertiary, #cf8b17);
}
.sb3-events {
  fill: var(--sb3-events-primary, #ffbf00);
  stroke: var(--sb3-events-tertiary, #cc9900);
}
.sb3-events-alt {
  fill: var(--sb3-events-secondary, #e6ac00);
}
.sb3-events-dark {
  fill: var(--sb3-events-tertiary, #cc9900);
}
.sb3-sensing {
  fill: var(--sb3-sensing-primary, #5cb1d6);
  stroke: var(--sb3-sensing-tertiary, #2e8eb8);
}
.sb3-sensing-alt {
  fill: var(--sb3-sensing-secondary, #47a8d1);
}
.sb3-sensing-dark {
  fill: var(--sb3-sensing-tertiary, #2e8eb8);
}
.sb3-operators {
  fill: var(--sb3-operators-primary, #59c059);
  stroke: var(--sb3-operators-tertiary, #389438);
}
.sb3-operators-alt {
  fill: var(--sb3-operators-secondary, #46b946);
}
.sb3-operators-dark {
  fill: var(--sb3-operators-tertiary, #389438);
}
.sb3-variables {
  fill: var(--sb3-variables-primary, #ff8c1a);
  stroke: var(--sb3-variables-tertiary, #db6e00);
}
.sb3-variables-alt {
  fill: var(--sb3-variables-secondary, #ff8000);
}
.sb3-variables-dark {
  fill: var(--sb3-variables-tertiary, #db6e00);
}
.sb3-list {
  fill: var(--sb3-list-primary, #ff661a);
  stroke: var(--sb3-list-tertiary, #e64d00);
}
.sb3-list-alt {
  fill: var(--sb3-list-secondary, #ff5500);
}
.sb3-list-dark {
  fill: var(--sb3-list-tertiary, #e64d00);
}
.sb3-custom {
  fill: var(--sb3-custom-primary, #ff6680);
  stroke: var(--sb3-custom-tertiary, #ff3355);
}
.sb3-custom-alt {
  fill: var(--sb3-custom-secondary, #ff4d6a);
}
.sb3-custom-dark {
  fill: var(--sb3-custom-tertiary, #ff3355);
}
.sb3-custom-arg {
  fill: var(--sb3-custom-primary, #ff6680);
  stroke: var(--sb3-custom-tertiary, #ff3355);
}

/* extension blocks, e.g. pen */
.sb3-extension {
  fill: var(--sb3-extension-primary, #0fbd8c);
  stroke: var(--sb3-extension-tertiary, #0b8e69);
}
.sb3-extension-alt {
  fill: var(--sb3-extension-secondary, #0da57a);
}
.sb3-extension-line {
  stroke: var(--sb3-extension-secondary, #0da57a);
}
.sb3-extension-dark {
  fill: var(--sb3-extension-tertiary, #0b8e69);
}

/* obsolete colors: chosen by hand, indicates invalid blocks */
.sb3-obsolete {
  fill: var(--sb3-obsolete-primary, #ed4242);
  stroke: var(--sb3-obsolete-tertiary, #ca2b2b);
}
.sb3-obsolete-alt {
  fill: var(--sb3-obsolete-secondary, #db3333);
}
.sb3-obsolete-dark {
  fill: var(--sb3-obsolete-tertiary, #ca2b2b);
}

/* grey: special color from the Scratch 3.0 design mockups */
.sb3-grey {
  fill: var(--sb3-grey-primary, #bfbfbf);
  stroke: var(--sb3-grey-tertiary, #909090);
}
.sb3-grey-alt {
  fill: var(--sb3-grey-secondary, #b2b2b2);
}
.sb3-grey-dark {
  fill: var(--sb3-grey-tertiary, #909090);
}

.sb3-input-color {
  stroke: var(--sb3-input-color-stroke, #fff);
}

.sb3-input-number,
.sb3-input-string {
  fill: var(--sb3-input-fill, #fff);
}
.sb3-literal-number,
.sb3-literal-string,
.sb3-literal-number-dropdown,
.sb3-literal-dropdown {
  word-spacing: 0;
}
.sb3-literal-number,
.sb3-literal-string {
  fill: var(--sb3-literal, #575e75);
}

/* Note: comment colors are different from Scratch. */

.sb3-comment {
  fill: #ffffa5;
  stroke: #d0d1d2;
  stroke-width: 1;
}
.sb3-comment-line {
  fill: #ffff80;
}
.sb3-comment-label {
  font: 400 12pt Helvetica Neue, Helvetica, sans-serif;
  fill: #000;
  word-spacing: 0;
}

.sb3-diff {
  fill: none;
  stroke: #000;
}
.sb3-diff-ins {
  stroke-width: 2px;
}
.sb3-diff-del {
  stroke-width: 3px;
}
`
