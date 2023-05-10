<script setup>
import { ref } from 'vue'
import { calculate_beam } from '../utils/calc_fn';
import Node from '@/components/Node.vue'

// wszedzie gdzie parseInt jest
// zmienic na text i sprawdzac, zeby sie dalo po przecinku liczby dawac

const nodes = ref([]);
const beam_length = ref()

function add_node(event){
  const passed_length = parseInt(event.target.elements.n_length.value)
  const same_nodes = nodes.value.filter(obj => obj.n_length === passed_length)
  if (nodes.value.length < 10 && same_nodes.length == 0){
    nodes.value.push({item:"empty", n_length:passed_length});
  }
}
function update_nodes(index, n_length, data){
  data.n_length = n_length;
  nodes.value[index] = data;
}
function set_beam_length(event){
  beam_length.value = parseInt(event.target.elements.beam_length.value)
}
</script>

<template>
  <form class="set-beam-length-container" @submit.prevent="set_beam_length" v-if="!beam_length">
    <label>Set the length of the beam [m]</label>
    <input type="number" name="beam_length" min="0" max="10" required>
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
        <input type="number" name="n_length" min="0" :max="beam_length" required>
        <button type="submit">Add node</button>
      </div>
    </form>
    <button @click="calculate_beam">Calculate</button>
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
  margin-bottom: 1rem;
}
</style>
