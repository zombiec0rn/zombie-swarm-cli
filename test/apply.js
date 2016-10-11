import test from 'ava'
import 'babel-register'
import bytes from 'bytes'
import zsf   from '@zombiec0rn/zombie-service-format'
import znf   from '@zombiec0rn/zombie-node-format'
import makePlan from '../plan'
import applyPlan from '../apply'
import * as utils from '../utils'

test('applyPlan', t => {
  let nodes = znf.random(10, {
    memory : bytes('10GB'),
    cpus : [
      { speed : 10000 }
    ]
  }) 
  let swarm = utils.readSwarmConfig('./zombie-swarm.yml')
  swarm.services = zsf.random(2).map(s => {
    s.memory = '500MB',
    s.cpu = 500
    return s
  })
  let plan = makePlan(nodes, swarm.services)
  let cmds = applyPlan(plan)
  t.true(cmds.length == swarm.services.length)
})

test('alwaysRemove', t => {
  let nodes = znf.random(10, {
    memory : bytes('10GB'),
    cpus : [
      { speed : 10000 }
    ]
  }) 
  let swarm = utils.readSwarmConfig('./zombie-swarm.yml')
  swarm.services = zsf.random(2).map(s => {
    s.memory = '500MB',
    s.cpu = 500
    return s
  })
  // Service 1 is already running - cmds.length should be 1
  nodes[0].services = [swarm.services[1]]
  let plan = makePlan(nodes, swarm.services)
  let cmds = applyPlan(plan)
  t.true(cmds.length == swarm.services.length-1)
  // Adding always-remove bumps cmds.lenght back up to 2
  cmds = applyPlan(plan, {'always-remove': true})
  t.true(cmds.length == swarm.services.length)
})
