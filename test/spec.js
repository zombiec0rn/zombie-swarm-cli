import test from 'ava'
import 'babel-register'
import zsf from '@zombiec0rn/zombie-service-format'
import znf from '@zombiec0rn/zombie-node-format'
import makePlan from '../plan'
import * as utils from '../utils'

test('can read and validate a zombie-swarm.yml', t => {
  let swarm = utils.readSwarmConfig('./zombie-swarm.yml')
  t.true(swarm.services == utils.validateServices(swarm.services))
})

test('throws if invalid zombie-swarm.yml', t => {
  let swarm = utils.readSwarmConfig('./zombie-swarm.yml')
  delete swarm.services[0].id
  try {
    utils.validateServices(swarm.services)
    t.true(false)
  } catch(e) {
    t.true(true)
  }
})

test('can read and validate a nodes.json file', t => {
  let nodes = utils.readNodesConfig('./nodes.json')
  t.true(nodes == utils.validateNodes(nodes))
})

test('throws for an invalid nodes.json', t => {
  let nodes = utils.readNodesConfig('./nodes.json')
  delete nodes[0].hostname
  try {
    utils.validateNodes(nodes)
    t.true(false)
  } catch(e) {
    t.true(true)
  }

})

test('createPlan', t => {
  let nodes = znf.random(10) 
  let swarm = utils.readSwarmConfig('./zombie-swarm.yml')
  swarm.services = zsf.random(2).map(s => {
    s.memory = '500MB',
    s.cpu = 500
    return s
  })
  nodes[0].tags.push("yologateway")
  swarm.services[0] = ["yologateway"]
  let plan = makePlan(nodes, swarm)
  t.true(plan != undefined)
})
