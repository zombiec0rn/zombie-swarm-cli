let prettyjson = require('prettyjson')
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
      console.log(prettyjson.render(answers))
      mdns.destroy()
      process.exit()
    }, 5000)
    _mdns.query(mdns)
    console.log('Querying for swarm nodes...') 
  }
}

export { cmd as default }
