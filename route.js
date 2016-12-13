import iproute from 'iproute'
var exec = require('child_process').exec

let route = { 
  type: 'unicast',
  to: '224.0.0.0/4',
  scope: 'link'
}

export function add(args, callback) {
  route.dev = args.interface
  if (process.platform == 'darwin') {
    exec(`sudo route -nv add -net ${route.to} -interface ${route.dev}`, function(err, stdout, stderr) {
      if (err) console.log(err) 
      if (typeof callback == 'function') callback()
    })
    return
  }
  iproute.route.add(route, (err) => {
    if (err) console.log(err)
    if (typeof callback == 'function') callback()
  })
}

export function del(args, callback) {
  route.dev = args.interface
  if (process.platform == 'darwin') {
    exec(`sudo route -v delete -inet ${route.to} -interface ${route.dev}`, function(err, stdout, stderr) {
      if (err) console.log(err) 
      if (typeof callback == 'function') callback()
    })
    return
  }
  iproute.route.delete(route, (err) => {
    if (err) console.log(err)
    if (typeof callback == 'function') callback()
  })
}
