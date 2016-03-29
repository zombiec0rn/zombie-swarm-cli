import test from 'ava'
import 'babel-register'
import bytes from 'bytes'
import zsf   from '@zombiec0rn/zombie-service-format'
import znf   from '@zombiec0rn/zombie-node-format'
import makePlan from '../plan'
import * as utils from '../utils'

test('createPlan', t => {
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
  nodes[0].tags.push("yologateway")
  swarm.services[0].placement = ["yologateway"]
  let plan = makePlan(nodes, swarm.services)
  t.true(plan.add.length == 2)
  let swarmserviceids = swarm.services.map(s => s.id)
  let planaddids = plan.add.map(s => s.id)
  swarmserviceids.forEach(id => {
    t.true(planaddids.indexOf(id) >= 0)
  })
  let taggedservice = plan.add.filter(s => {
    return s.id == swarm.services[0].id
  })[0]
  t.true(taggedservice.host.hostname == nodes[0].hostname)
  t.true(taggedservice.placement.indexOf('yologateway') >= 0)
  t.true(taggedservice.host.tags.indexOf('yologateway') >= 0)
})
