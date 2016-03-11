import test from 'ava'
import 'babel-register'
let config = require('../config')

let swarmstat = config.readConfigFile({file:'./zombie-swarm.yml'})
let nodes = [
  {
    hostname: 'asbjornenge-gw',
    tags: [
      'gateway',
      'google'
    ]
  },
  {
    hostname: 'asbjornenge-node-1',
    tags: [
      'google'
    ]
  }
]

// test parse zombie-swarm -> valid zsf
// test createPlan

test('createPlan', t => {
  let plan = config.createPlan(swarmstat, nodes)
  console.log(plan)
  t.true(plan != undefined)
})
