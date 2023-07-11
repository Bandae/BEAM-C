<script setup>
import { ref } from 'vue'
import { calculate_beam, find_number } from '@/utils/calc_fn';
import Node from '@/components/Node.vue'

import Chart from 'chart.js/auto'

const nodes = ref([]);
const beam_length = ref();
const react_results = ref([]);
const errors = ref([]);
let torque_chart = null;
let t_force_chart = null;
let n_force_chart = null;

function add_node(event){
  errors.value = []
  const passed_length = find_number(event.target.elements.n_length.value, beam_length.value);
  const same_nodes = nodes.value.filter(obj => obj.n_length === passed_length);
  if (passed_length === null) {
    errors.value.push('too_long')
    return
  }
  if (same_nodes.length == 0){
    nodes.value.push({item:"empty", n_length:passed_length});
  }
  else {
    errors.value.push('n_exists')
  }
}
function update_nodes(n_length, data){
  react_results.value = []
  data.n_length = n_length;
  const node_index = nodes.value.findIndex(ob => ob.n_length === n_length);
  nodes.value[node_index] = data;
}
function delete_node(l){
  react_results.value = []
  const copy = nodes.value;
  nodes.value = [];
  for (const item of copy){
    if (item.n_length !== l){
      nodes.value.push(item);
    }
  }
}
function set_beam_length(event){
  beam_length.value = find_number(event.target.elements.beam_length.value);
}
function click_calc(){
  const results = calculate_beam(nodes.value, beam_length.value);
  react_results.value = results.supports;
  if (!react_results.value) return false;

  const torque_data = results.torque_graph_points;
  if(torque_chart){
    torque_chart.data.datasets[0].data = torque_data
    torque_chart.update()
  }
  else{
    torque_chart = new Chart("torqueGraph", {
      type: "line",
      data: {
        datasets: [{
          data: torque_data,
        }]
      },
      options:{
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'x[m]'
            },
            type: 'linear',
          },
          y: {
            title: {
              display: true,
              text: 'M[Nm]'
            },
          },
        }
      },
    });
  }

  const t_force_data = results.t_force_graph_points;
  if(t_force_chart){
    t_force_chart.data.datasets[0].data = t_force_data
    t_force_chart.update()
  }
  else{
    t_force_chart = new Chart("tForceGraph", {
      type: "line",
      data: {
        datasets: [{
          data: t_force_data,
        }]
      },
      options:{
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'x[m]'
            },
            type: 'linear',
          },
          y: {
            title: {
              display: true,
              text: 'T[N]'
            },
          },
        }
      },
    });
  }

  const n_force_data = results.n_force_graph_points;
  if(n_force_chart){
    n_force_chart.data.datasets[0].data = n_force_data
    n_force_chart.update()
  }
  else{
    n_force_chart = new Chart("nForceGraph", {
      type: "line",
      data: {
        datasets: [{
          data: n_force_data,
        }]
      },
      options:{
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'x[m]'
            },
            type: 'linear',
          },
          y: {
            title: {
              display: true,
              text: 'N[N]'
            },
          },
        }
      },
    });
  }
}
</script>

<template>
  <form class="set-beam-length-container" @submit.prevent="set_beam_length" v-if="!beam_length" autocomplete="off">
    <p class="container-heading">Set the length of the beam [m]</p>
    <div>
      <input type="text" inputmode="decimal" pattern="^[\d]*([.,]?[\d]+|[\d])$" name="beam_length" required>
      <button type="submit">Accept</button>
    </div>
  </form>
  <div class="beam-length-container" v-else>
    <p class="container-heading">Beam length: {{ beam_length }}m</p>
  </div>
  <main v-if="beam_length">
    <div class="beam-container">
      <div class="beam">
        <Node v-for="node of nodes" :key="node.n_length" :n_length="node.n_length" :beam_length="beam_length" @node_change="(l, data) => update_nodes(l, data)" @node_delete="(l) => delete_node(l)"/>
      </div>
    </div>
    <form class="add-node-container" @submit.prevent="add_node" autocomplete="off">
      <p class="container-heading">Add a new node</p>
      <hr>
      <div>
        <label>Distance from left end of beam (from x=0)</label>
        <div>
          <input type="text" inputmode="decimal" pattern="^[\d]*([.,]?[\d]+|[\d])$" name="n_length" required>
          <button type="submit">Add node</button>
        </div>
      </div>
      <div v-if="errors.includes('too_long')" class="error-container">
        <p>Please pass a distance shorter or equal to the length of the beam.</p>
      </div>
      <div v-if="errors.includes('n_exists')" class="error-container">
        <p>Please pass a distance other than that of an existing node.</p>
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
      <div class="graphs-container">
        <div class="t-force-graph-container">
          <canvas id="tForceGraph"></canvas>
        </div>
        <div class="n-force-graph-container">
          <canvas id="nForceGraph"></canvas>
        </div>
        <div class="torque-graph-container">
          <canvas id="torqueGraph"></canvas>
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
  border: 1px solid var(--clr-border);
  background-color: var(--clr-white);
  border-radius: 1em;
  display: flex;
  justify-content: center;
}

@media screen and (max-width: 550px) {
  .beam-container {
    border: none;
    width: 95%;
  }
}

.beam::before {
  border-top: 5px solid var(--clr-black);
  content: "";
  margin: 0 auto;
  position: absolute;
  inset: 48% 0 0 0;
}

.add-node-container {
  border: 1px solid var(--clr-border);
  padding: 0 1em 1em 1em;
  margin-top: 1em;
  border-radius: 1em;
}

@media screen and (min-width: 550px) {
  .add-node-container {
    width: 50%;
  }
}

.add-node-container > div {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.add-node-container > div > div {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.add-node-container input {
  margin-left: auto;
  margin-right: 1em;
}

.add-node-container label {
  margin-bottom: 0.5em;
  margin-right: 3em;
}

.set-beam-length-container {
  border: 1px solid var(--clr-border);
  padding: 1em;
  margin-bottom: 1em;
  border-radius: 1em;
  width: 50%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
@media screen and (max-width: 700px) {
  .set-beam-length-container {
    width: auto;
  }
}

.set-beam-length-container > div {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.beam-length-container {
  border: 1px solid var(--clr-border);
  padding: 1em;
  margin-bottom: 1em;
  border-radius: 1em;
  width: fit-content;
}

.set-beam-length-container input {
  margin-left: auto;
  margin-right: 1em;
}

hr {
  border: none;
  border: 1px solid var(--clr-border);
  margin-bottom: 0.5em;
}

.react-res-container {
  display: flex;
  flex-wrap: wrap;
  margin-top: 2em;
}

.react-res-container > * {
  border: 1px solid var(--clr-border);
  border-radius: 1em;
  margin-right: 1em;
  margin-bottom: 1em;
  padding: 1em;
}

.error-container {
  color: var(--clr-red);
  padding: 0.5em;
}

main > button {
  margin-top: 1em;
}
</style>
