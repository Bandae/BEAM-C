<script setup>
import { ref } from 'vue';
const props = defineProps({ node_number: Number, n_length: Number, beam_length: Number});
const emit = defineEmits(['node_change', 'node_delete'])

const is_open = ref(false);
const menu_open = ref(0);
const node_data = ref({item: "empty", n_length:props.n_length});

function add_beam_elem(event, item){
  switch(item){
    case 0:
      node_data.value = {item: "support", type:event.target.elements.support_type.value}
      break;
    case 1:
      const data = event.target.elements;
      node_data.value = {item: "force", angle: data.angle.value, mag:data.mag.value}
      break;
    case 2:
      node_data.value = {item: "torque", mag:event.target.elements.mag.value}
      break;
  }
  emit('node_change', props.node_number, props.n_length, node_data.value);
  is_open.value = false
}
function clear_beam_elem(){
  emit('node_change', props.node_number, props.n_length, {item:"empty"})
}
function delete_node(){
  emit('node_delete', props.node_number)
  is_open.value = false
}
// narazie zrobie ze w kazdym miejscu jest tylko jena rzecz, sila albo moment albo podpora, ale potem trzeba zmienic

</script>

<template>
<button class="node" :style="`--left: ${props.n_length/props.beam_length*100}%`" @click="is_open = !is_open">aa</button>

<Teleport to="body">
  <div v-if="is_open" class="popup-background">
    <div class="popup">
      <div class="item-type-container">
        <button @click="menu_open = 0">Podpora</button>
        <button @click="menu_open = 1">Siła</button>
        <button @click="menu_open = 2">Moment</button>
        <button @click="clear_beam_elem">Clear</button>
      </div>
      <div class="options-container">
        <form @submit.prevent="add_beam_elem($event, 0)" v-if="menu_open == 0">
          <div class="support-type-container">
            <input type="radio" id="fix" name="support_type" value="fix">
            <label for="fix">Fix</label>
            <input type="radio" id="roll" name="support_type" value="roll">
            <label for="roll">roll</label>
            <input type="radio" id="pin" name="support_type" value="pin">
            <label for="pin">pin</label>
          </div>
          <button type="submit">Accept</button>
        </form>

        <form @submit.prevent="add_beam_elem($event, 1)" v-if="menu_open == 1">
          <label>Angle in deg</label>
          <input type="number" name="angle">
          <label>Magnitude</label>
          <input type="number" name="mag">
          <button type="submit">Accept</button>
        </form>

        <form @submit.prevent="add_beam_elem($event, 2)" v-if="menu_open == 2">
          <label>Magnitude</label>
          <input type="number" name="mag">
          <button type="submit">Accept</button>
        </form>
      </div>
      <button @click="delete_node">Delete node</button>
      <button @click="is_open = !is_open">close</button>
    </div>
  </div>
</Teleport>
</template>

<style scoped>
.popup{
  position: absolute;
  z-index: 1000;
  top: 20%;
  left: 15%;
  border-radius: 10px;
  background-color: white;
  padding: 20px;
  width: 70%;
}

.popup *{
  margin-bottom: 0.5rem;
}

.node {
  /* zrobic tu pulsujace kolka jasnoniebieskie jesli jest empty*/
  position: absolute;
  --left: 0%;
  left: calc(var(--left) - 15px);
  top: calc(50% - 15px);
  width: 30px;
  height: 30px;
  background-color: blue;
  border: none;
  border-radius: 50%;
  z-index: 10;
  text-align: center;
  margin-top: auto;
  margin-bottom: auto;
}

.popup-background{
  position: fixed;
  background-color: rgba(0,0,0,0.4);
  width: 100vw;
  height: 100vh;
  z-index: 999;
  top: 0;
}

.length-box{
  display: flex;
  flex-direction: row;
  align-items: center;
}

.length-box input{
  margin-left: auto;
  width: 4em;
}

.length-box button{
  padding: 0.3rem;
  margin-left: 0.5rem;
}

.options-container form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.options-container form *{
  width: 50%;
}

.options-container form button{
  margin-top: 10px;
}

.options-container form input {
  margin-bottom: 10px;
}
</style>