import test from 'ava'
import 'babel-register'
import zsf from '@zombiec0rn/zombie-service-format'
import znf from '@zombiec0rn/zombie-node-format'
import * as utils from '../utils'

test('can read and validate a zombie-swarm.yml', t => {
  let swarm = utils.readConfigFile({file:'./zombie-swarm.yml'})
  t.true(swarm.services == utils.validateServices(swarm.services))
})

test('throws if invalid zombie-swarm.yml', t => {
  let swarm = utils.readConfigFile({file:'./zombie-swarm.yml'})
  delete swarm.services[0].id
  try {
    utils.validateServices(swarm.services)
    t.true(false)
  } catch(e) {
    t.true(true)
  }
})

// test parse zombie-swarm -> valid zsf
// test parse nodes.json -> valid znf

//test('createPlan', t => {
//  let plan = config.createPlan(swarmstat, nodes)
//  console.log(plan)
//  t.true(plan != undefined)
//})
