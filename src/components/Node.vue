<script setup>
import { ref } from 'vue';
import { find_number } from '@/utils/calc_fn';
const props = defineProps({ n_length: Number, beam_length: Number});
const emit = defineEmits(['node_change', 'node_delete'])

const is_open = ref(false);
const menu_open = ref(0);
const node_data = ref({item: "empty", n_length: props.n_length});

function add_beam_elem(event, item){
  switch(item){
    case 0:
      node_data.value = {item: "support", type:event.target.elements.support_type.value}
      break;
    case 1:
      const data = event.target.elements;
      const angle = find_number(data.angle.value)
      const mag_f = find_number(data.mag.value)
      node_data.value = {item: "force", angle: angle, mag: mag_f}
      break;
    case 2:
      const sign = event.target.elements.torque_dir.value
      const mag_t = find_number(sign + event.target.elements.mag.value)
      node_data.value = {item: "torque", mag: mag_t}
      break;
  }
  is_open.value = false
  emit('node_change', props.n_length, node_data.value);
}
function clear_beam_elem(){
  node_data.value = {item: "empty"}
  emit('node_change', props.n_length, {item:"empty"})
}
function delete_node(){
  emit('node_delete', props.n_length)
  is_open.value = false
}
</script>

<template>
<button class="node" :style="`--left: ${props.n_length/props.beam_length*100}%`" @click="is_open = !is_open">
  <div v-if="node_data.item === 'empty'" class="node-empty">
    <div class="node-pulse"></div>
  </div>
  <img v-else-if="node_data.item === 'force'" src="@/assets/force.svg" class="force-icon" :style="`--rotation: ${node_data.angle}deg`">
  <img v-else-if="node_data.item === 'torque'" src="@/assets/torque.svg" class="torque-icon" :class="{ 'neg-torque-icon': node_data.mag < 0 }">
  <img v-else-if="node_data.type === 'fix'" src="@/assets/fix.svg" class="support-icon fix-icon" :class="{ 'fix-icon-end': props.n_length > 0}">
  <img v-else-if="node_data.type === 'roll'" src="@/assets/roll.svg" class="support-icon">
  <img v-else-if="node_data.type === 'pin'" src="@/assets/pin.svg" class="support-icon">
</button>
<Teleport to="body">
  <div v-if="is_open" class="popup-background">
    <div class="popup">
      <div v-if="node_data.item === 'empty'" class="node-init-container">
        <div class="btn-group">
          <button @click="menu_open = 0">Support</button>
          <button @click="menu_open = 1">Force</button>
          <button @click="menu_open = 2">Torque</button>
        </div>
        <div class="options-container">
          <form @submit.prevent="add_beam_elem($event, 0)" v-if="menu_open == 0">
            <div class="support-type-container">
              <div v-if="props.n_length === 0 || props.n_length === props.beam_length">
                <input type="radio" id="fix" name="support_type" value="fix">
                <label for="fix">Fix</label>
              </div>
              <div>
                <input type="radio" id="roll" name="support_type" value="roll">
                <label for="roll">Roll</label>
              </div>
              <div>
                <input type="radio" id="pin" name="support_type" value="pin">
                <label for="pin">Pin</label>
              </div>
            </div>
            <button type="submit">Accept</button>
          </form>
          <form @submit.prevent="add_beam_elem($event, 1)" v-if="menu_open == 1" autocomplete="off">
            <label>Angle (&deg;)</label>
            <input type="text" inputmode="decimal" pattern="^(([12]?[\d]?[\d])|(3[0-5][\d])|(360))$" name="angle" required>
            <label>Magnitude (N)</label>
            <input type="text" inputmode="decimal" pattern="^[\d]*([.,]?[\d]+|[\d])$" name="mag" required>
            <button type="submit">Accept</button>
          </form>
          <form @submit.prevent="add_beam_elem($event, 2)" v-if="menu_open == 2" autocomplete="off">
            <div class="torque-dir-container">
              <label>
                <input type="radio" id="lefthand" name="torque_dir" value="" required>
                <img src="@/assets/torque.svg">
              </label>
              <label>
                <input class="righthand" type="radio" id="righthand" name="torque_dir" value="-" required>
                <img src="@/assets/torque.svg">
              </label>
            </div>
            <label>Magnitude (N)</label>
            <input type="text" inputmode="decimal" pattern="^[\d]*([.,]?[\d]+|[\d])$" name="mag" required>
            <button type="submit">Accept</button>
          </form>
        </div>
      </div>
      <div v-else class="node-data-container">
        <p>{{ node_data.item }}</p>
        <p v-if="node_data.item === 'support'">{{ node_data.type }}</p>
        <p>x = {{ props.n_length }}m</p>
        <p v-if="node_data.angle">&alpha; = {{ node_data.angle }}&deg;</p>
        <p v-if="node_data.item === 'force'">F = {{ node_data.mag }}N</p>
        <p v-if="node_data.item === 'torque'">M = {{ node_data.mag }}Nm</p>
      </div>
      <div class="btn-group">
        <button @click="delete_node">Delete node</button>
        <button @click="clear_beam_elem">Clear node</button>
        <button @click="is_open = !is_open">Close</button>
      </div>
    </div>
  </div>
</Teleport>
</template>

<style scoped>
.popup{
  position: absolute;
  z-index: 1000;
  top: 20%;
  inset: 20% 0 0 0;
  margin: 0 auto;
  border-radius: 1em;
  background-color: var(--clr-background);
  padding: 2em;
  width: fit-content;
  height: fit-content;
}

.popup-background {
  position: fixed;
  background-color: rgba(0,0,0,0.4);
  width: 100vw;
  height: 100vh;
  z-index: 999;
  top: 0;
}

@keyframes pulse{
  0%{
    scale: 1;
    opacity: 0;
  }
  50%{
    scale: 1.5;
    opacity: 1;
  }
  100%{
    scale: 1;
    opacity: 0;
  }
}

.node {
  position: absolute;
  --left: 0%;
  width: 32px;
  inset: 0 0 0 calc(var(--left) - 18px);
  margin: auto 0;
  background-color: transparent;
  transition: none;
  cursor: pointer;
}

.node:hover {
  box-shadow: none;
  transform: none;
  transition: none;
}

.node:focus {
  outline: none;
}

.node:hover .node-empty, .node:focus .node-empty {
  background-color: var(--clr-blue-dark);
}

.node:hover .node-pulse, .node:focus .node-pulse {
  border-color: var(--clr-blue-dark);
}

.node:hover > img, .node:focus > img {
  filter: drop-shadow(6px 3px 2px var(--clr-text-soft));
}

.node-pulse {
  width: 32px;
  height: 32px;
  border: 2px solid var(--clr-blue);
  border-radius: 50%;
  animation: pulse 2s ease 1s infinite;
}

.node-empty {
  width: 32px;
  height: 32px;
  background-color: var(--clr-blue);
  border-radius: 50%;
}

.force-icon {
  position: relative;
  top: -25px;
  left: -8px;
  --rotation: 0deg;
  transform: rotate(calc(90deg - var(--rotation)));
  transform-origin: 50% 100%;
}

.torque-icon {
  position: relative;
  top: -25px;
  left: -22px;
}

.neg-torque-icon {
  transform: scaleX(-1);
  left: -16px;
}

.support-icon {
  position: relative;
  left: -16px;
  top: 20px;
}

.fix-icon {
  top: 2px;
  left: -6px;
}

.fix-icon-end {
  transform: scaleX(-1);
  left: 4px;
}

.node-data-container {
  display: flex;
  flex-direction: column;
  margin-bottom: 1em;
  font-size: var(--fs-p);
}

.support-type-container {
  display: flex;
  flex-direction: column;
}

.support-type-container > * {
  margin-bottom: 0.5em;
}

.options-container form {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1.5em 0 1.5em 0;
  padding: 0.5em;
  border: 2px solid var(--clr-border);
  border-radius: 1em;
}

.options-container form input {
  margin-bottom: 0.7em;
}

.torque-dir-container {
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin: 0.5em;
}

.torque-dir-container input[type=radio] { 
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.torque-dir-container input[type=radio] + img {
  cursor: pointer;
  padding: 0.4em;
}

.torque-dir-container input[type=radio]:checked + img {
  border-radius: 1em;
  outline: 3px solid var(--clr-blue-dark);
}

.torque-dir-container input:hover + img {
  transform: translateY(-0.25em);
}

input.righthand + img{
  transform: scaleX(-1);
}

input.righthand:hover + img{
  transform: translateY(-0.25em) scaleX(-1);
}
</style>