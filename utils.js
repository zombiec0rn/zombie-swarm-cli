import fs      from 'fs'
import request from 'request'
import async   from 'async'
import yaml    from 'js-yaml'
import assign  from 'object.assign'
import zsf     from '@zombiec0rn/zombie-service-format'
import znf     from '@zombiec0rn/zombie-node-format'
import Ora     from 'ora'
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

export function assignZombieRC(args) {
  let rc = {}
  try {
    rc = yaml.safeLoad(fs.readFileSync('.zombierc'))
  } catch(e) {
    if (e.code != 'ENOENT') throw e
  }
  assign(rc, args) // Overwrite passed args
  assign(args, rc) // Assign non-overwritten to args
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

export function readSwarmConfigRaw(path) {
  try {
    return yaml.safeLoad(fs.readFileSync(path))
  } catch(e) {
    throw e
    process.exit(1)
  }
}

export function formatSwarmConfig(config) {
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

export function readSwarmConfig(path) {
  let raw = readSwarmConfigRaw(path)
  let formatted = formatSwarmConfig(raw)
  return formatted
}

export function validateServices(services) {
  services.forEach(s => {
    // TODO: Move to scheduler.validateServices !?
    // scheduler needs to export validateServices & validateNodes ??
    if (!s.memory) throw new Error(`Missing memory - ${s.id}`)
    if (!s.cpu || typeof s.cpu != 'number') throw new Error(`Missing cpu - ${s.id}`)
  })
  return zsf.validate(services)
}

export function readNodesConfig(path) {
  return JSON.parse(fs.readFileSync(path))
}

export function validateNodes(nodes) {
  return znf.validate(nodes)
}

export function querySwarmNodes(callback, args, queryTime) {
  queryTime = queryTime || 5000
  let _mdns = mdns.default(args)
  let spinner = new Ora({ text: `Looking for swarm nodes on ${args.interface}...` }) 
  spinner.start()
  mdns.onResponse(_mdns, (answers) => {
    async.map(answers, (a, cb) => {
      request(`http://${a.data}:8901`, (err, res, body) => {
        if (res.statusCode != 200) return cb(err, a)
        let info = JSON.parse(body)
        info.ip = a.data
        cb(err, info)
      })
    }, (err, nodes) => {
      _mdns.destroy()
      spinner.stop()
      if (err) {
        console.error(err)
        process.exit(1)
      }
      if (args.swarm) {
        nodes = nodes.filter(n => n.swarm == args.swarm)
      }
      if (nodes.length == 0) {
        console.log(`No swarm nodes found on ${args.interface} ¯\_(ツ)_/¯`)
        process.exit(0)
      }
      callback(nodes)
    })
  }, queryTime)
  mdns.query(_mdns)
}

export function detectDuplicateFingerprints(services) {
  return services
    .filter(s => s.fingerprint)
    .map(s => s.fingerprint)
    .filter((fp, i, arr) => {
      let arrIndex = arr.indexOf(fp)
      return arrIndex >= 0 && arrIndex != i
    })
}

export function extractFingerprint(service) {
  let fingerprint
  if (service.env) {
    service.env.forEach(e => {
      if (e.indexOf('ZOMBIE_SWARM_FINGERPRINT') == 0) {
        fingerprint = e.split('=')[1]
      }
    })
  }
  return fingerprint
}

export function extractServices(node) {
  return (node.services || []).map(s => {
    s.host = node
    s.fingerprint = extractFingerprint(s)
    return s
  })
}
