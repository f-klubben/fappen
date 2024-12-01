
# Fappen

Fappen is an app that strives to connect the various F-Klub services/systems in a single mobile package.

## Project Environment  
  
To set up a development environment for the project you will need the following setup on your system:  
  
 - Node.JS (Any semi recent version should work - has been tested to work with V17)  
 - A local [stregsystem](https://github.com/f-klubben/stregsystemet) setup. Since the app depends on the API you will need with that implemented (see [stregsystem/#320](https://github.com/f-klubben/stregsystemet/pull/320)).  
  
Running the project:  
  
```bash  
npm install     # Installs dependencies  
npm start       # Builds the project and starts a local server  
```

## Build

To simply build locally, just run `npm run build`.

### Generate release
The following guide is for generating a release on Ubuntu 22.

#### Prerequisites
- Node (>= v17)
- Python (>= 3.10.x)
- An Internet connection (>= Dial-up)
- Possibly: `coreutils` for Node

#### Steps
1. `npm install`
2. `python3 util/build_songs.py`
3. `./setup build live -p release`

#### Troubleshooting
Generally, try to do things twice.

##### `Error: Unable to deserialize cloned data due to invalid or unsupported version.`

Solution: Try clear parcel cache: `rm -rf .parcel-cache/`
