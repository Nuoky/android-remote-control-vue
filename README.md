# android-remote-control-vue
> 使用 Vue.js 实现了基于android_remote_contro的WEB端控制组件

### 使用
```
# main.js
import Vue from 'vue'
import App from './App'

import AndroidRemoteControl from 'android-remote-control-vue'
Vue.use(AndroidRemoteControl)

new Vue({
  render: h => h(App),
}).$mount('#app')
```
```
# App.vue
<template>
  <android-remote-control host="YOUR_SERVER_IP" />
</template>

<script>
export default {
  name: 'demo'
}
</script>

```

### 开发
npm install
npm run start

### 构建
npm run build