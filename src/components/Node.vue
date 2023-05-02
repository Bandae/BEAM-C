<script setup>
import { ref } from 'vue'
const is_open = ref(false)
const menu_open = ref(0)
</script>

<template>
<button class="node" @click="is_open = !is_open">aa</button>

<Teleport to="body">
  <div v-if="is_open" class="popup-background">
    <div class="popup">
      <div class="item-type-container">
        <button @click="menu_open = 0">Podpora</button>
        <button @click="menu_open = 1">Siła</button>
        <button @click="menu_open = 2">Moment</button>
      </div>
      <div class="options-container">
        <form @submit.prevent="send_data___nwm" v-if="menu_open == 0">
          <div class="support-type-container">
            <input type="radio" id="Fix" name="support-type" value="Fix">
            <label for="Fix">Fix</label>
            <input type="radio" id="roll" name="support-type" value="roll">
            <label for="roll">roll</label>
            <input type="radio" id="pin" name="support-type" value="pin">
            <label for="pin">pin</label>
          </div>
          <button type="submit">Accept</button>
        </form>

        <form @submit.prevent="send_data___nwm" v-if="menu_open == 1">
          <label>Angle in deg</label>
          <input type="number">
          <label>Magnitude</label>
          <input type="number">
          <button type="submit">Accept</button>
        </form>

        <form @submit.prevent="send_data___nwm" v-if="menu_open == 2">
          <label>Magnitude</label>
          <input type="number">
          <button type="submit">Accept</button>
        </form>
      </div>
      <button @click="is_open = !is_open">close</button>
    </div>
  </div>
</Teleport>
</template>

<style scoped>
.popup{
  position: absolute;
  z-index: 999;
  top: 20%;
  left: 15%;
  border-radius: 10px;
  background-color: white;
  padding: 20px;
  width: 70%;
}

.node {
  width: 30px;
  height: 30px;
  background-color: red;
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
  z-index: 998;
  top: 0;
}

form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

form *{
  width: 50%;
}

form button{
  margin-top: 10px;
}

form input {
  margin-bottom: 10px;
}
</style>