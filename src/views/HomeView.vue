<script setup>
import { ref } from 'vue'
import Node from '@/components/Node.vue'

const nodes = ref([{item: "support", type:"fix", length:0}, {item: "force", angle:90, mag:200, length:1}, {item: "support", type:"roll", length:2}]);

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
function add_node(){
  if (nodes.value.length < 10){
    nodes.value.push({item:"empty"});
  }
}
function delete_node(){
  if (nodes.value.length > 2){
    nodes.value.pop();
  }
}
function ch_node_amount(event){
  const val = event.target.elements.node_amount.value;
  const current = nodes.value.length
  if (current == val) {return}
  else if (val < current) {
    for (let x=0; x<(current-val); x++){
      delete_node()
    }
  }
  else {
    for (let x=0; x<(val-current); x++){
      add_node()
    }
  }
}
function update_nodes(index, length, data){
  data.length = length;
  nodes.value[index] = data;
}
function calculate_beam(){
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
  // obliczanie reakcji, po x, y
  if (check_static(supports) === false) {
    alert("Belka statycznie niewyznaczalna.");
    return
  }
  const x_sum = (forces_ver.map(el => el.mag)).reduce((a, b) => a+b, 0);
  const y_sum = (forces_hor.map(el => el.mag)).reduce((a, b) => a+b, 0);
  // sig M
}
</script>

<template>
  <main>
    <div class="beam">
      <Node v-for="[index, node] in nodes.entries()" :node_number="index" @node_change="(i, l, data) => update_nodes(i, l, data)"/>
    </div>
    <div class="node-amount-container">
      <button class="add" @click="add_node">Add note</button>
      <button class="delete" @click="delete_node">Delete node</button>
      <form @submit.prevent="ch_node_amount">
        <p>Number of nodes:</p>
        <input type="number" name="node_amount" id="node-amount" min="2" max="10">
        <button type="submit">Accept</button>
      </form>
    </div>
    <button @click="calculate_beam">Calculate</button>
  </main>
</template>

<style>
.beam {
  position: relative;
  border: 1px solid #dfdfdf;
  border-radius: 10px;
  height: 5rem;
  display: flex;
  justify-content: space-between;
}

.beam::before {
  border-top: 5px solid black;
  content: "";
  margin: 0 auto;
  position: absolute;
  inset: 48% 0 0 0;
  width: 90%;
}

.node-amount-container{
  display: flex;
}

</style>
