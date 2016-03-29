import test from 'ava'
import 'babel-register'
import bytes from 'bytes'
import zsf   from '@zombiec0rn/zombie-service-format'
import znf   from '@zombiec0rn/zombie-node-format'
import zdiff from '@zombiec0rn/zombie-service-diff'
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

test('detectDuplicateFingerprints', t => {
  let s1 = zsf.random(2)
  let services = [].concat(s1,s1,zsf.random(5))
  services.forEach(s => {
    s.fingerprint = zdiff.fingerprint(s)
  })
  let duplicates = utils.detectDuplicateFingerprints(services)
  t.true(duplicates.length == 2)
  let s1_fingerprints = s1.map(s => s.fingerprint)
  duplicates.forEach(d => {
    t.true(s1_fingerprints.indexOf(d) >= 0)
  })
})

test('extractServices', t => {
  let services = zsf.random(5)
  let node = znf.random(1)[0]
  services.forEach(s => {
    s.env.push(`ZOMBIE_SWARM_FINGERPRINT=${zdiff.fingerprint(s)}`)
  })
  node.services = services
  let extracted = utils.extractServices(node)
  t.true(extracted.length == 5)
  extracted.forEach(s => {
    t.true(s.fingerprint != undefined)
  })
})
