import Vue from 'vue'
import app from './app.vue'
import RemoteControl from '../src/components/remote-control.vue'

Vue.component(RemoteControl.name, RemoteControl)

new Vue({
  el: '#app',
  render: h => h(app)
})