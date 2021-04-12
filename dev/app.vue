<template>
  <div id="app">
    <android-remote-control host="192.168.28.133:9002" :showControls="true" />
  </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
    }
  }
}
</script>

<style>
</style>