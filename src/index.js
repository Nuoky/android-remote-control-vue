import AndroidRemoteControl from "./components/android-remote-control.vue";

function install(Vue) {
  Vue.component(AndroidRemoteControl.name, AndroidRemoteControl);
}

if (window && window.Vue) {
  Vue.use(install);
}

export default install;
