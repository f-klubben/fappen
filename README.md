
# Fappen

Fappen is an app that strives to connect the various F-Klub services/systems in a single mobile package.

## Project Environment  
  
To set up a development environment for the project you will need the following setup on your system:  
  
 - Node.JS (Any semi recent version should work - has been tested to work with V17)  
 - A local [stregsystem](https://github.com/f-klubben/stregsystemet) setup. Since the app depends on the API you will need a vesion with that implemented (see [stregsystem/#320](https://github.com/f-klubben/stregsystemet/pull/320)).  
  
Running the project:  
  
```bash  
npm i --force   # Installs dependencies  
npm start       # Builds the project and starts a local server  
```  
  
To just build the project run `npm run build`.

## Generating documentation

For more information on building and developing the project build and read the documentation.
This can be done as follows:

```bash
npm run setup-doc-extractor
npm i --force

# this last command is only needed if you have previous run `npm i`
npm run reload-doc-extractor
```

Some parts of the documentation can also be accessed without building it by navigating to the
`docs/Guides` folder on the GitHub website or in a markdown reader
(although they are not guaranteed to render correctly).