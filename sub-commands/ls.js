let route = require('../route')

let cmd = {
  name: 'ls',
  usage: 'Usage: zombie-swarm ls [OPTIONS]',
  options: [],
  command: function(args) {
    global.args = args
    route.add(args)
    console.log('lsing')
  }
}

export { cmd as default }
