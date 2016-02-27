import iproute from 'iproute'

let route = { 
  type: 'unicast',
  to: '224.0.0.0/4',
  scope: 'link'
}

export function add(args, callback) {
  route.dev = args.interface
  iproute.route.add(route, (err) => {
    if (err) console.log(err)
    if (typeof callback == 'function') callback()
  })
}

export function del(args, callback) {
  route.dev = args.interface
  iproute.route.delete(route, (err) => {
    if (err) console.log(err)
    if (typeof callback == 'function') callback()
  })
}
