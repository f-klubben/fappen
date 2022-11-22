---
name: Style Guide
---

# Style Guide

This document outlines the guidelines for how to style your code,
as well as how you should style visual elements in the application.

## JavaScript/TypeScript

For JS/TS code we have a strict guideline that is enforced by EsLint.
As such, in this document, we will only outline things that are not
covered by the linter configuration.

The linter can be run by running `npx eslint <path/to/file1.ts> <path/to/file2.ts>`
from the root folder of the project. Additionally, you may pass the `--fix` option
to the command, which will make eslint fix many issues automatically.

Additional guidelines:

 - Generally it is preferred for variable and function names to specified
   in `snake_case`.
 - The names of types must always be written in `PascalCase`.
 - When using `@ts-ignore` it is expected that you follow it up with the reason
   for using ignoring. Example:
   ```ts
   // @ts-ignore - the analyzer does not know how to deal with `bundle-text` imports
   import access_failure_msg from 'bundle-text:../components/stregsystem/access_failure.pug';
   ```
  - It is preferred to `export` at the declaration site of individual constructs rather
    than export everything at the end of the file.

## Visual components

Generally we try to style components is such a way that they match the spirit
of the original stregsystem, however due to the focus on the mobile platform 
we do occasionally have to deviate from this.

A useful rule of thumb:
> Everything is styled like it's a table! Except tables!

