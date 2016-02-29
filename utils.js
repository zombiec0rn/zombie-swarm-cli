let request = require('request')
let route = require('./route')
let async = require('async')
let _mdns = require('./mdns')

export function initCmd(args) {
  global.args = args
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
