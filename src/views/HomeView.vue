<script setup>
import { ref } from 'vue'
import { calculate_beam, find_number } from '@/utils/calc_fn';
import Node from '@/components/Node.vue'

const nodes = ref([]);
const beam_length = ref();
const react_results = ref([]);

function add_node(event){
  const passed_length = find_number(event.target.elements.n_length.value, beam_length.value);
  const same_nodes = nodes.value.filter(obj => obj.n_length === passed_length);
  if (passed_length === null) {
    //jakis alert albo cos ze musi byc dobrze
    return
  }
  if (same_nodes.length == 0){
    nodes.value.push({item:"empty", n_length:passed_length});
  }
}
function update_nodes(index, n_length, data){
  data.n_length = n_length;
  nodes.value[index] = data;
}
function set_beam_length(event){
  const passed_length = find_number(event.target.elements.beam_length.value);
  if (passed_length === null) {
    //jakis alert albo cos ze musi byc dobrze
    return
  }
  beam_length.value = passed_length;
}
function click_calc(){
  react_results.value = calculate_beam(nodes.value);
  if (!react_results.value) return false;
}
</script>

<template>
  <form class="set-beam-length-container" @submit.prevent="set_beam_length" v-if="!beam_length">
    <label>Set the length of the beam [m]</label>
    <input type="text" pattern="^[\d]*([.,]?[\d]+|[\d])$" name="beam_length" required>
    <button type="submit">Accept</button>
  </form>
  <div class="beam-length-container" v-else>
    <h3>Beam length: {{ beam_length }}m</h3>
  </div>
  <main v-if="beam_length">
    <div class="beam-container">
      <div class="beam">
        <Node v-for="[index, node] in nodes.entries()" :node_number="index" :n_length="node.n_length" :beam_length="beam_length" @node_change="(i, l, data) => update_nodes(i, l, data)" @node_delete="(i) => nodes.splice(i, 1)"/>
      </div>
    </div>
    <form class="add-node-container" @submit.prevent="add_node">
      <p>Add a new node</p>
      <hr>
      <div>
        <label>Distance from left end of beam (from x=0)</label>
        <input type="text" inputmode="numeric" pattern="^[\d]*([.,]?[\d]+|[\d])$" name="n_length" required>
        <button type="submit">Add node</button>
      </div>
    </form>
    <button @click="click_calc">Calculate</button>
    <div class="results-container" v-if="react_results">
      <div class="react-res-container">
        <div v-for="res of react_results">
          <p>Support: {{ res.type }}</p>
          <p>Length: {{ res.n_length }}</p>
          <hr>
          <p v-if="res.fx">Fx = {{ res.fx }}N</p>
          <p v-if="res.fy">Fy = {{ res.fy }}N</p>
          <p v-if="res.torque">M = {{ res.torque }}Nm</p>
        </div>
      </div>
    </div>
  </main>
</template>

<style>
.beam {
  position: relative;
  height: 8rem;
  width: 90%;
}

.beam-container {
  border: 1px solid #dfdfdf;
  border-radius: 10px;
  display: flex;
  justify-content: center;
}

.beam::before {
  border-top: 5px solid black;
  content: "";
  margin: 0 auto;
  position: absolute;
  inset: 48% 0 0 0;
}

.add-node-container{
  border: 1px solid #dfdfdf;
  padding: 0 1rem 1rem 1rem;
  margin-top: 1rem;
  border-radius: 10px;
  width: 50%;
}

.add-node-container div{
  display: flex;
  align-items: center;
}

.add-node-container input{
  margin-left: auto;
  margin-right: 1em;
}

.add-node-container p{
  font-size: 1.5rem;
}

.set-beam-length-container {
  border: 1px solid #dfdfdf;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 10px;
  width: 50%;
  display: flex;
  align-items: center;
}

.beam-length-container {
  border: 1px solid #dfdfdf;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 10px;
  width: fit-content;
}

.set-beam-length-container input {
  margin-left: auto;
  margin-right: 1em;
}

.set-beam-length-container p {
  font-size: 1.5rem;
}

hr {
  border: none;
  border: 1px solid #dfdfdf;
  margin-bottom: 0.5rem;
}

.react-res-container{
  display: flex;
  margin-top: 2rem;
}

.react-res-container > *{
  border: 1px solid #dfdfdf;
  border-radius: 10px;
  margin-right: 1rem;
  padding: 1rem;
}
</style>
