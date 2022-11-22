---
name: Setup  
order: 1
---

# Setup

The project relies on several tools to build the application, most of which are managed through NPM
there are however some tools that need extra attention to get setup. This document will cover how 
to get the entire project setup and which parts are needed for each application component.

|>[note] Directory paths mentioned in this document are given relative to the project root. Meaning `/scripts` refers to scripts folder at the root of the repository, not one at the root of your file-system.

|> Due to a conflict in typescript version between the application and one of its dependencies, the `--force` option must always be included when running `npm install` or `npm i`.

## Base application

The base application refers to all the core components that don't rely on external services.
This basically just excludes the stregsystem module. While we consider the songbook part of the
base application, the build instructions are separated since it is in most cases preferred to
use the prebuilt files.

### Requirements

 - A Node.js / NPM installation. Any recent version should work. It is known to work with v17.
 - Prebuilt songbook files. (These will be available with each application release on GitHub).
 - A local copy of the project (Use `git clone` to get one if you haven't already).

### Setup procedure

First you will want to extract the prebuilt songbook files into the `/pages/songbook` directory.
Once this has been done you can run the following from the root folder of the project:

```bash
npm i --force
npm start     # Start a development server
```

## Stregsystem

The stregystem module is built upon the stregsystem API. For this reason you will want a
local stregsystem instance running if you intend to do development on this module.

### Requirements

|>[note] Listed requirements are in addition to those of the base application.

- A stregsystem instance with the stregsystem API available.
  You will want to have persistent test-data enabled for optimal performance. 
  - Refer to [stregsystemet/#320](https://github.com/f-klubben/stregsystemet/pull/320)
    for more info in regard to availability of the API.
  - Refer to [stregsystemet](https://github.com/f-klubben/stregsystemet) for more info
    on setting up a local instance.

### Setup procedure

As current stregsystem versions do not allow CORS requests you will want to run a proxy
that enables this. The easiest way to do this is by running `npm run cors-proxy`.

Additionally, you will want to make sure that you have the `FA_DEV_API_URL` environment variable
set correctly. It should be pointing to the `http://stregsystems-host/api` endpoint which, if using
the default cors-proxy and stregsystem settings will be `http://localhost:8080/http://localhost:8000/api`.
(Note that while it is used as an example, if you are using the default configuration you do not need to set anything).

## Songbook

The songbook is built from the [f-klubben/sangbog](https://github.com/f-klubben/sangbog) repository written
in LaTeX, for this reason it needs to modified quite a bit before it is ready for use in the app.

### Requirements

- Python3.x
- Pandoc - it has to be a fairly recent version. > 2.19 is known to work. 2.5 does not work.

### Setup procedure

From the project root, run the following:

```bash
git clone git@github.com:f-klubben/sangbog.git
python util/build_songs.py
```


## Documentation

The documentation is built using [ts-docs](https://github.com/ts-docs/ts-docs) with a custom extractor.
The custom extractor is kept as a dependency in `/extern/ts-extractor-singlefile-modules`.

### Setup procedure

First run the `setup-doc-extractor` script from the project root. 

```bash
npm run setup-doc-extractor
```

If you have previously run `npm install` or `npm i` you will then have to run:

```bash
npm run reload-doc-extractor
```

If you are modifying the extractor this is also the command that you should run to update
the installed version. If you have yet to run `npm install` do `npm i --force`.

The documentation is built by running:

```bash
npm run build-docs
```

