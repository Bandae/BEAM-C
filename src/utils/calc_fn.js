function round_to_2(num){
  return Math.round(num * 100) / 100;
}

export function find_number(nm_str, max=null){
  const nm_fin = Number(nm_str.replace(',', '.'))
  if (max === null ) return nm_fin
  if (nm_fin > max) return null
  return nm_fin
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
  if(pin === 0 && roll === 3 && fix === 0){
    return false
    // nie wiem czy tak moze byc w ogole
  }
  else if(pin === 1 && roll === 1 && fix === 0){
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
    fix.torque = -torque_sum
    fix.fx = -x_sum
    fix.fy = -y_sum
    return [fix]
  }
  else if(sup_type === "pin+roll"){
    let pin = supports.find(ob => ob.type === 'pin');
    let roll = supports.find(ob => ob.type === 'roll');

    for (const force of forces_ver){
      torque_sum += force.mag * (pin.n_length - force.n_length)
    }
    roll.fy = -(torque_sum / (pin.n_length - roll.n_length))
    pin.fx = -x_sum
    pin.fy = -(y_sum + roll.fy)
    return [pin, roll]
  }
}

export function calculate_beam(nodes){
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
        const hor = round_to_2(node.mag * Math.cos(node.angle / (180/Math.PI)))
        const ver = round_to_2(node.mag * Math.sin(node.angle / (180/Math.PI)))
        forces_hor.push({mag: hor, n_length:node.n_length});
        forces_ver.push({mag: ver, n_length:node.n_length});
        break;
    }
  }
  if (check_static(supports) === false) {
    alert("Belka statycznie niewyznaczalna.");
    return
  }
  supports = calc_statb_react(supports, forces_hor, forces_ver, torques);
  return supports
}
