function round_to_2(num){
  return Math.round(num * 100) / 100;
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
  if((pin === 0 && roll === 3 && fix === 0)||
  (pin === 1 && roll === 1 && fix === 0)||
  (pin === 0 && roll === 0 && fix === 1))
  {return true}
  else {return false}
}

export function calculate_beam(){
  let supports = []
  let forces_hor = []
  let forces_ver = []
  let torques = []

  for (const node of nodes.value) {
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
        forces_hor.push({mag: hor, length:node.length});
        forces_ver.push({mag: ver, length:node.length});
        break;
    }
  }
  if (check_static(supports) === false) {
    alert("Belka statycznie niewyznaczalna.");
    return
  }
  const x_sum = (forces_ver.map(el => el.mag)).reduce((a, b) => a+b, 0);
  const y_sum = (forces_hor.map(el => el.mag)).reduce((a, b) => a+b, 0);
}