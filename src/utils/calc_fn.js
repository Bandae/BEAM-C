function round_num(num, dec){
  return Math.round(num * 10**dec) / 10**dec;
}

export function find_number(nm_str, max=null){
  const nm_fin = Number(nm_str.replace(',', '.'))
  if (max === null ) return round_num(nm_fin, 2)
  if (nm_fin > max) return null
  return round_num(nm_fin, 2)
}

function check_static(supports){
  let pin = 0;
  let roll = 0;
  let fix = 0;

  for (const sup of supports){
    switch(sup.type){
      case "pin":
        pin++;
        break;
      case "roll":
        roll++;
        break;
      case "fix":
        fix++;
        break;
    }
  }
  if(pin === 1 && roll === 1 && fix === 0){
    return "pin+roll"
  }
  else if(pin === 0 && roll === 0 && fix === 1){
    return "fix"
  }
  else {return false}
}

function calc_statb_react(supports, forces_hor, forces_ver, torques){
  const sup_type = check_static(supports)
  const x_sum = (forces_hor.map(el => el.mag)).reduce((a, b) => a+b, 0);
  const y_sum = (forces_ver.map(el => el.mag)).reduce((a, b) => a+b, 0);
  let torque_sum = (torques.map(el => el.mag)).reduce((a, b) => a+b, 0);

  if (sup_type === "fix"){
    let fix = supports[0]

    for (const force of forces_ver){
      torque_sum += force.mag * (fix.n_length - force.n_length)
    }
    fix.torque = -round_num(torque_sum, 2);
    fix.fx = -round_num(x_sum, 2);
    fix.fy = -round_num(y_sum, 2);
    return [fix]
  }
  else if(sup_type === "pin+roll"){
    let pin = supports.find(ob => ob.type === 'pin');
    let roll = supports.find(ob => ob.type === 'roll');

    for (const force of forces_ver){
      torque_sum += force.mag * (pin.n_length - force.n_length)
    }
    roll.fy = -round_num((torque_sum / (pin.n_length - roll.n_length)), 2);
    pin.fx = -round_num(x_sum, 2);
    pin.fy = -round_num((y_sum + roll.fy), 2)
    return [pin, roll]
  }
}

function calc_torque_graph(supports, forces_ver, torques, beam_length){
  let points = []
  let elements = [...supports, ...forces_ver, ...torques];
  const len0 = elements.find(obj => {return obj.n_length === 0});
  if (!len0) {
    elements.push({n_length: 0});
  }
  const lenmax = elements.find(obj => {return obj.n_length === beam_length});
  if (!lenmax) {
    elements.push({n_length: beam_length});
  }
  
  elements.sort((a, b) => a.n_length - b.n_length);
  for(const elem of elements){
    let torque = 0;
    for(const prev of elements.filter(obj => {return obj.n_length < elem.n_length})){
      if(prev.fy){torque += ((elem.n_length - prev.n_length) * prev.fy)}
      else if(prev.item == 'force'){torque += ((elem.n_length - prev.n_length) * prev.mag)}

      if(prev.torque){torque += prev.torque}
      else if(prev.item == 'torque'){torque += prev.mag}
    }
    if(elem.torque){points.push({x: elem.n_length, y: torque + elem.torque})}
    else if(elem.item == 'torque'){points.push({x: elem.n_length, y: torque + elem.mag})}
    points.push({x: elem.n_length, y: torque})
  }
  return points
}

export function calculate_beam(nodes, beam_length){
  let supports = []
  let forces_hor = []
  let forces_ver = []
  let torques = []

  for (const node of nodes) {
    switch(node.item){
      case "support":
        supports.push(node)
        break;
      case "torque":
        torques.push(node)
        break;
      case "force":
        const hor = round_num(node.mag * Math.cos(node.angle / (180/Math.PI)), 2)
        const ver = round_num(node.mag * Math.sin(node.angle / (180/Math.PI)), 2)
        forces_hor.push({item: 'force', mag: hor, n_length:node.n_length});
        forces_ver.push({item: 'force', mag: ver, n_length:node.n_length});
        break;
    }
  }
  if (check_static(supports) === false) {
    alert("Beam statically indeterminate.");
    return
  }
  supports = calc_statb_react(supports, forces_hor, forces_ver, torques);
  const torque_graph_points = calc_torque_graph(supports, forces_ver, torques, beam_length)
  // liczenie punktow dla wykresów momentu, sil tnacych, sil normalnych, kazda w funkcji moze.
  return {'supports': supports, 'torque_graph_points': torque_graph_points}
}
