export function round_num(num, dec){
  return Math.round(num * 10**dec) / 10**dec;
}

export function find_number(nm_str){
  const nm_fin = Number(nm_str.replace(',', '.'));
  return round_num(nm_fin, 2);
}

function check_static(nodes){
  let pin = 0
  let roll = 0
  let fix = 0

  for (const sup of nodes.filter(obj => obj.item === 'support')){
    switch(sup.type){
      case "pin":
        pin++
        break
      case "roll":
        roll++
        break
      case "fix":
        fix++
        break
    }
  }
  if(pin === 1 && roll === 1 && fix === 0 ||
    pin === 0 && roll === 0 && fix === 1){
    return true
  }
  else return false
}

function calc_statb_react(nodes){
  if(!check_static(nodes)) return false

  const forces = nodes.filter(obj => {return obj.fx || obj.fy})
  const torques = nodes.filter(obj => {return obj.torque})
  const cloads = nodes.filter(obj => {return obj.item === 'cload'})
  const x_sum = (forces.map(obj => obj.fx)).reduce((a, b) => a+b, 0)
  const y_sum = (forces.map(obj => obj.fy)).reduce((a, b) => a+b, 0) + (cloads.map(obj => obj.mag * (obj.end - obj.start))).reduce((a, b) => a+b, 0)
  let torque_sum = (torques.map(obj => obj.torque)).reduce((a, b) => a+b, 0)

  let fix = nodes.find(obj => obj.type === 'fix')
  if (fix){
    for (const force of forces){
      torque_sum += force.fy * (fix.n_length - force.n_length)
    }
    for (const load of cloads){
      torque_sum += -load.mag * (load.end - load.start) * (fix.n_length - load.n_length)
    }
    fix.torque = -round_num(torque_sum, 2)
    fix.fx = -round_num(x_sum, 2)
    fix.fy = -round_num(y_sum, 2)

    const index = nodes.findIndex(obj => obj.type === 'fix')
    nodes.splice(index, 1, fix)
  }
  else{
    let pin = nodes.find(obj => obj.type === 'pin')
    let roll = nodes.find(obj => obj.type === 'roll')

    for (const force of forces){
      torque_sum += force.fy * (pin.n_length - force.n_length)
    }
    for (const load of cloads){
      torque_sum += -load.mag * (load.end - load.start) * (pin.n_length - load.n_length)
    }
    roll.fy = -round_num((torque_sum / (pin.n_length - roll.n_length)), 2)
    pin.fx = -round_num(x_sum, 2)
    pin.fy = -round_num((y_sum + roll.fy), 2)

    const pin_index = nodes.findIndex(obj => obj.type === 'pin')
    const roll_index = nodes.findIndex(obj => obj.type === 'roll')
    nodes.splice(pin_index, 1, pin)
    nodes.splice(roll_index, 1, roll)
  }
  return nodes
}

function calc_force_graphs(nodes, beam_length){
  const nodes_copy = JSON.parse(JSON.stringify(nodes))
  const non_cload = nodes_copy.filter(obj => {return obj.item !== 'cload'})
  const cloads_beginning = nodes_copy.filter(obj => {return obj.item === 'cload'}).map(obj => {obj.n_length = obj.start; return obj})
  const cloads_end = JSON.parse(JSON.stringify(cloads_beginning)).map(obj => {obj.n_length = obj.end; return obj})
  let new_nodes = [...non_cload, ...cloads_beginning, ...cloads_end]

  let t_points = []
  let n_points = []
  const len0 = new_nodes.find(obj => {return obj.n_length === 0})
  if (!len0) {
    new_nodes.push({n_length: 0, fy: 0, fx: 0})
  }
  const lenmax = new_nodes.find(obj => {return obj.n_length === beam_length})
  if (!lenmax) {
    new_nodes.push({n_length: beam_length, fy: 0, fx: 0})
  }
  
  new_nodes.sort((a, b) => a.n_length - b.n_length);
  console.log(new_nodes)

  let t_force = 0;
  let n_force = 0;
  for(const elem of new_nodes){
    let add_t_force = 0;
    for(const inside of new_nodes.filter(obj => {return obj.item === 'cload' && obj.start < elem.n_length && obj.end > elem.n_length})){
      console.log(inside)
      add_t_force += (elem.n_length - inside.n_length) * inside.mag
    }

    if(!(elem.item === 'cload' && elem.n_length === elem.end)){
      t_points.push({x: elem.n_length, y: t_force + add_t_force})
    }

    n_points.push({x: elem.n_length, y: n_force})
    if(elem.fy){t_force += elem.fy}
    else if(elem.item === 'cload' && elem.n_length === elem.end){t_force += elem.mag * (elem.end - elem.start)}
    if(elem.fx){n_force += elem.fx}
    t_points.push({x: elem.n_length, y: t_force + add_t_force})
    n_points.push({x: elem.n_length, y: n_force})
  }
  return [t_points, n_points]
}

function calc_torque_graph(nodes, beam_length){
  let points = []
  const len0 = nodes.find(obj => {return obj.n_length === 0})
  if (!len0) {
    nodes.push({n_length: 0, fy: 0, torque: 0});
  }
  const lenmax = nodes.find(obj => {return obj.n_length === beam_length})
  if (!lenmax) {
    nodes.push({n_length: beam_length, fy: 0, torque: 0})
  }
  
  nodes.sort((a, b) => a.n_length - b.n_length)
  for(const elem of nodes){
    let torque = 0;
    for(const prev of nodes.filter(obj => {return obj.n_length < elem.n_length})){
      if(prev.fy){torque += ((elem.n_length - prev.n_length) * prev.fy)}
      if(prev.torque){torque += prev.torque}
    }
    if(elem.torque){points.push({x: elem.n_length, y: torque + elem.torque})}
    points.push({x: elem.n_length, y: torque})
  }
  return points
}

export function calculate_beam(main_nodes, beam_length){
  let nodes = JSON.parse(JSON.stringify(main_nodes));
  nodes = calc_statb_react(nodes);
  if(!nodes) return false
  const torque_graph_points = calc_torque_graph(nodes, beam_length)
  const force_graph_points = calc_force_graphs(nodes, beam_length)
  const supports = nodes.filter(obj => obj.item === 'support')
  return {'supports': supports, 'torque_graph_points': torque_graph_points, 't_force_graph_points': force_graph_points[0], 'n_force_graph_points': force_graph_points[1]}
}
