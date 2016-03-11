import fs      from 'fs'
import request from 'request'
import async   from 'async'
import yaml    from 'js-yaml'
import assign  from 'object.assign'
import zsf     from '@zombiec0rn/zombie-service-format'
import * as route from './route'
import * as mdns from './mdns'

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

export function readConfigFileRaw(args) {
  try {
    return yaml.safeLoad(fs.readFileSync(args.file))
  } catch(e) {
    throw e
    process.exit(1)
  }
}

export function formatConfigFile(config) {
  let defaultServiceConfig = config.services.default || {}
  config.services = Object.keys(config.services)
    .filter(k => k != 'default')
    .map(k => {
      let serviceConfig = config.services[k]
      serviceConfig.id = k
      return assign({}, config.services[k], defaultServiceConfig)
    })
  return config
}

export function readConfigFile(args) {
  let raw = readConfigFileRaw(args)
  let formatted = formatConfigFile(raw)
  return formatted
}

export function validateServices(services) {
  return zsf.validate(services)
}

export function querySwarmNodes(callback, args, queryTime) {
  queryTime = queryTime || 5000
  let _mdns = mdns.default(args)
  mdns.onResponse(_mdns, (answers) => {
    async.map(answers, (a, cb) => {
      request(`http://${a.data}:8901`, (err, res, body) => {
        if (res.statusCode != 200) return cb(err, a)
        let info = JSON.parse(body)
        info.ip = a.data
        cb(err, info)
      })
    }, (err, res) => {
      _mdns.destroy()
      callback(err, res)
    })
  }, queryTime)
  mdns.query(_mdns)
}
