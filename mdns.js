import _mdns   from 'multicast-dns'
import address from 'network-address'

export default function(args) {
  let ip = address(args.interface)
  let mdns = _mdns({
    interface: ip 
  })
  return mdns
}

export function bindZwarmResponse(mdns) {
  mdns.on('response', (res) => {
    let swarmAnswers = res.answers.reduce((found, answer) => {
      if (answer.name == 'zombie-swarm') found = res.answers
      return found
    }, null)
    if (!swarmAnswers) return
    console.log('answers', swarmAnswers)
  })
}

export function query(mdns) {
  mdns.query({
    questions: [{
      name : 'zombie-swarm',
      type : 'A'
    }]
  })
}
