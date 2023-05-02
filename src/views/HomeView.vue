<script setup>
import { ref } from 'vue'
import Node from '@/components/Node.vue'

const nodes = ref([{item: "support", type:"fix"}, {item: "force", angle:90, magn:200}, {item: "support", type:"rail"}]);

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
</script>

<template>
  <main>
    <div class="beam">
      <Node v-for="node in nodes"/>
    </div>
    <div class="node-amount">
      <button class="add" @click="add_node">Add note</button>
      <button class="delete" @click="delete_node">delete node</button>
      <!-- input na numerki ile ich jest i zeby sie dalo zmieniac v bind -->
    </div>
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

</style>
