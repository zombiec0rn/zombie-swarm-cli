let prettyjson = require('prettyjson')
let request = require('request')
let async = require('async')
let route = require('../route')
let _mdns = require('../mdns')

let cmd = {
  name: 'ls',
  usage: 'Usage: zombie-swarm ls [OPTIONS]',
  options: [],
  command: function(args) {
    global.args = args
    route.add(args)
    let mdns = _mdns.default(args)
    _mdns.onResponse(mdns, (answers) => {
      async.map(answers, (a, callback) => {
        request(`http://${a.data}:8901`, (err, res, body) => {
          if (res.statusCode != 200) return callback(err, a)
          let info = JSON.parse(body)
          info.ip = a.data
          callback(err, info)
        })
      }, (err, res) => {
        if (err) throw err
        console.log(prettyjson.render(res))
        mdns.destroy()
        process.exit()
      })
    }, 5000)
    _mdns.query(mdns)
    console.log('Querying for swarm nodes...') 
  }
}

export { cmd as default }
