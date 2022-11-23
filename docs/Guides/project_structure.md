---
name: Project structure
---

# Project structure

The project is built around using the Parcel web bundler as a sort of static site generator. In general, we strive
to do as much of the work statically as possible, in order to reduce the amount of client side code that we introduce.
Obviously some components such as the stregsystem component are inherently tied to dynamic information and as such
makes heavy use of runtime page rendering.

A key thing to note about the project is that it does not consist of a server component (and never will). Things are
either done statically or on the client side.

Overview of the project repository structure.

```
# Utility and other
/.github        # GitHub actions
/util           # Various utility/helper scripts
/extern         # External projects
/docs           # Documentation files

# Core application
/components     # Resuseable components for the frontend
/media          # Other static assets for the web app (mainly images)
/pages          # The actual pages that make up the app
/scripts        # Scripts that implement the appication logic
/styles         # SCSS styles for the app pages/components
```

## Project root (`/`)

The project is reserved mainly for configuration files for the various tools that we use.


## Pages (`/pages`)

The pages directory contains the pug templates from which the HTML pages for the application are generated.
Note that the structure of this directory is directly reflected in the url of the web app, this should
be kept in mind when adding files to the directory.

## Utility (`/util`)

This is a folder that is used for a bit of everything. Currently, primarily used for build scripts of various types,
but may be used for anything that is not part of the core application logic.

## External projects (`/extern`)

External projects are dependencies that are especially tedious to include in the typical manner (read NPM).
One such example is the documentation extractor that we use when generating documentation, it is a fork
of the `@ts-docs/ts-extractor` NPM package that is used exclusively for fappen, but is kept in a separate repo
to make it easier to track upstream changes.
