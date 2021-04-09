import RemoteControl from "./components/remote-control.vue";

function install(Vue) {
  Vue.component(RemoteControl.name, RemoteControl);
}

if (window && window.Vue) {
  Vue.use(install);
}

export default install;
