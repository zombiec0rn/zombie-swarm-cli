let request = require('request')
let route = require('./route')
let async = require('async')
let _mdns = require('./mdns')

// NOTE:
// `initCmd` needs to be called whenever mdns is involved.
// It creates a `route` for mdns packets -> interface
// and hooks up listeners to remove this route when app exits. 
export function initCmd(args) {
  // Prevent app from closing immediately
  process.stdin.resume()
  // exitHandler
  function exitHandler(err) {
    route.del(args, () => {
      console.error(err)
      process.exit()
    })
  }

  // Call exitHandler on exit
  process.on('exit', exitHandler)
  process.on('SIGINT', exitHandler)
  process.on('uncaughtException', exitHandler)

  // Add route
  route.add(args)
}

let defaultOptions = [
  {
    name: 'interface',
    help: 'Which interface to use (required)'
  }
]
export { defaultOptions }

export function validateArgs(args) {
  if (!args.interface) {
    console.log('Missing required argument `interface`. Exiting...')
    process.exit(1)
  }
}

export function readConfigFile(args) {
  try {
    return yaml.safeLoad(fs.readFileSync(args.file))
  } catch(e) {
    throw e
    process.exit(1)
  }
}

export function querySwarmNodes(callback, args, queryTime) {
  queryTime = queryTime || 5000
  let mdns = _mdns.default(args)
  _mdns.onResponse(mdns, (answers) => {
    async.map(answers, (a, cb) => {
      request(`http://${a.data}:8901`, (err, res, body) => {
        if (res.statusCode != 200) return cb(err, a)
        let info = JSON.parse(body)
        info.ip = a.data
        cb(err, info)
      })
    }, (err, res) => {
      mdns.destroy()
      callback(err, res)
    })
  }, queryTime)
  _mdns.query(mdns)
}
