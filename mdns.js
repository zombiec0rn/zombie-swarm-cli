import _mdns   from 'multicast-dns'
import address from 'network-address'

export default function(args) {
  let ip = address(args.interface)
  let mdns = _mdns({
    interface: ip 
  })
  return mdns
}

export function onResponse(mdns, callback, timer) {
  let answers = []
  mdns.on('response', (res) => {
    let swarmAnswers = res.answers.reduce((found, answer) => {
      if (answer.name.endsWith('zombie-swarm')) found = res.answers
      return found
    }, null)
    if (swarmAnswers) answers = answers.concat(swarmAnswers)
  })
  setTimeout(() => {
    callback(answers)
  }, timer)
}

export function query(mdns) {
  mdns.query({
    questions: [{
      name : 'zombie-swarm',
      type : 'A'
    }]
  })
}
