<template>
  <div class="android-remote-control">
    <div :class="{
      'horizontal': isRotate,
      'portrait': !isRotate
    }">
      <div class='canvas-wapper'>
        <canvas
          ref="canvas"
          class='canvas'
          tabindex="0"
          @mouseup="handleMouseUp"
          @touchend="handleMouseUp"
          @mousedown="handleMouseDown"
          @touchstart="handleMouseUp"
          @mousemove="handleMouseMove"
          @touchmove="handleMouseMove"
          @keydown="handleKeyDown"
          @keyup="handleKeyUp"
          :style="{
            maxHeight,
            maxWidth
          }"
        >
        </canvas>
      </div>
      <div v-if="showControls" class='controls-wapper'>
        <div class='control'>
          <button ref="power" tabindex="2" @click="handlePower()">Power</button>
          <button ref="get-clip" tabindex="3" @click="handleGetClip()">Get Clipboard</button>
          <button ref="set-clip" tabindex="4" @click="handleSetClip()">Set Clipboard</button>
        </div>
        <div class='control'>
          <textarea cols="24" rows="3" v-model="txtClip"></textarea>
        </div>
        <div class='control'>
          <button ref="list-ports" tabindex="6" @click="handlePortList()">Ports</button>
          <input tabindex='7' v-model="portNum" size='1' style='flex:5;' />
          <button tabindex="8" @click="handleFwdPort()">Fwd</button>
          <button tabindex="9" @click="handleRevPort()">Rev</button>
        </div>
        <div style='white-space: pre-wrap;'>{{ portList }}</div>
        <div class='control'>
          <button ref="minicap" :class="{
            off: !minicapOn
          }" tabindex="10" @click="handleMinicap()">Minicap</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

const BLANK_IMG = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='

export default {
  name: 'android-remote-control',
  props: {
    host: '',
    showControls: false
  },
  data () {
    return {
      debug: false,
      context: null,
      ws: null,
      isRotate: false,
      canvas: null,
      txtClip: '',
      txtClipAllowUpdate: true,
      portList: '',
      portNum: '19000,19001,7007',
      minicapOn: false,
      maxWidth: 0,
      maxHeight: 0
    }
  },
  mounted () {
    this.init()
  },
  beforeDestroy () {
  },
  computed: {
  },
  methods: {
    handleMouseDown (e) {
      if (this.canvas.mousedown) return
      this.canvas.mousedown = true
      this.mouseHandler('d', e)
      e.preventDefault()
      this.canvas.focus()
    },
    handleMouseMove (e) {
      if (!this.canvas.mousedown) return
      if (!this.canvas.debounce) {
        this.canvas.debounce++
        this.mouseHandler('m', e)
        setTimeout(() => {
          this.canvas.debounce = 0
        }, 100)
      }
    },
    handleMouseUp (e) {
      if (!this.canvas.mousedown) return
      this.canvas.mousedown = false
      this.mouseHandler('u', e)
      e.preventDefault()
    },
    handleKeyDown (e) {
      this.keyHandler(e, true)
      e.preventDefault()
    },
    handleKeyUp (e) {
      this.keyHandler(e, false)
      e.preventDefault()
    },
    init () {
      this.canvas = this.$refs.canvas
      this.context = this.canvas.getContext('2d')
      this.initCanvas()
      this.createWs()
      this.canvas.mousedown = false
      this.canvas.debounce = 0
    },
    handleGetClip (e) {
      this.txtClipAllowUpdate = true
      this.wsJson({ event: 'getclip' })
    },
    handleSetClip (e) {
      this.wsJson({ event: 'setclip', text: this.txtClip })
    },
    handlePortList () {
      this.wsJson({ event: 'listports' })
    },
    handleFwdPort () {
      this.wsJson({ event: 'addport', rev: false, port: this.portNum })
    },
    handleRevPort () {
      this.wsJson({ event: 'addport', rev: true, port: this.portNum })
    },
    handleMinicap () {
      this.wsJson({ event: 'minicap' })
    },
    handleMinitouch () {
      this.wsJson({ event: 'minitouch' })
    },
    handlePower () {
      this.wsJson({ event: 'power' })
    },
    initCanvas () {
      let height = window.innerHeight
      let width = window.innerWidth

      if (this.isRotate) {
        height = window.innerWidth - 200
        width = window.innerHeight - 200
      } else {
        height = window.innerHeight - 200
        width = window.innerWidth - 200
      }
      this.maxHeight = `${height}px`
      this.maxWidth = `${width}px`
    },
    setDebug () {
      this.debug = !this.debug
      this.wsJson({ event: 'debug', val: this.debug })
    },
    wsOnMessage (message) {
      if (typeof message.data === 'string') {
        let j = null
        try { j = JSON.parse(message.data) } catch (e) { }
        if (j) {
          if (j.type === 'GetClipboardResponse') this.getClipResponse(j)
          if (j.type === 'ports') this.getPortsResponse(j)
          if (j.type === 'minicapStatus') {
            if (!j.state) this.blankScreen()
            console.log(message.data)
          }
          if (j.type === 'minitouchStatus') {
            if (!j.state) this.blankTouch()
            console.log(message.data)
          }
        }
      } else {
        var blob = new Blob([message.data], { type: 'image/jpeg' })
        var URL = window.URL || window.webkitURL
        var img = new Image()
        img.onload = () => {
          this.canvas.width = img.width
          this.canvas.height = img.height
          this.setRotate(img.width, img.height)
          this.context.drawImage(img, 0, 0)
          img.onload = null
          img.src = BLANK_IMG
          img = null
          u = null
          blob = null
          this.initCanvas()
          this.minicapOn = true
        }
        var u = URL.createObjectURL(blob)
        img.src = u
      }
    },
    createWs () {
      this.ws = new WebSocket('ws://' + this.host, 'minicap')
      this.ws.binaryType = 'blob'

      this.ws.onclose = () => {
        this.blankScreen()
        console.log('ws close...try reopen in 2 seconds')
        setTimeout(this.createWs, 2000)
      }

      this.ws.onopen = () => { console.log('ws open') }
      this.ws.onerror = () => { console.log('ws error', arguments) }

      this.ws.onmessage = this.wsOnMessage
    },
    wsJson (obj) {
      if (this.ws.readyState === this.ws.OPEN) {
        var json = JSON.stringify(obj)
        if (this.debug) console.log(json)
        this.ws.send(json)
      } else console.log('websocket is closed')
    },
    blankScreen () {
      this.context.fillStyle = '#a00'
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
      this.minicapOn = false
    },
    setRotate (w, h) {
      this.isRotate = w / h > 1
    },
    mouseHandler (t, e) {
      // getBoundingClientRect top 元素上边界距窗口最上边的距离
      var rect = this.canvas.getBoundingClientRect()
      var cx = (e.clientX || (e.touches[0] || e.changedTouches[0] || {}).clientX) - rect.left
      var cy = (e.clientY || (e.touches[0] || e.changedTouches[0] || {}).clientY) - rect.top

      var x = cx / this.canvas.scrollWidth; var y = cy / this.canvas.scrollHeight
      if (this.isRotate) { var tmp = x; x = 1 - y; y = tmp }
      this.wsJson({ event: 'mouse', t: t, x: x, y: y })
      if (this.debug) console.log(e.type, t, this.canvas.debounce, this.canvas.mousedown, cx, cy, this.canvas.scrollWidth, this.canvas.scrollHeight)
    },
    keyHandler (e, isDown) {
      var cl = e.getModifierState('CapsLock')
      var obj = {
        event: 'key',
        key: e.keyCode,
        mods: [e.shiftKey, e.ctrlKey, e.altKey, e.metaKey, cl],
        isDown
      }
      this.wsJson(obj)
    },
    getClipResponse (j) {
      if (this.txtClipAllowUpdate) {
        this.txtClip = j.message.text
        this.txtClipAllowUpdate = false
      }
    },
    getPortsResponse (j) {
      this.portList = j.data
    }
  }
}
</script>

<style lang="scss" scoped>
.android-remote-control {
  display: flex;
}
.portrait {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  .canvas-wapper {
    flex: initial !important;
    flex-shrink: 1;
  }
  .controls-wapper {
    flex: 1;
  }
}
.horizontal {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  .canvas-wapper {
    flex: initial !important;
    flex-shrink: 1;
  }
  .controls-wapper {
    flex: 1;
  }
}

.canvas-wapper {
  .canvas {
    border: 1px solid black;
  }
}

.controls-wapper {
  border: 1px solid black;
  .control {
    display: flex;
    border: 1px solid black;
  }
}

.off {
  background-color: red;
}
</style>
