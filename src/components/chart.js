import {  shallowRef, onMounted, onDeactivated, onBeforeUnmount } from "vue"
import purple from "../assets/purple.json"
import * as echarts from 'echarts'
const useEcharts = (elRef, options) => {
  const charts = shallowRef()

  const initCharts = () => {
    echarts.registerTheme('purple', purple)
    charts.value = echarts.init(elRef.value, 'purple')
    setOptions(options)
  }
  const setOptions = (options) => {
    charts.value && charts.value.setOption(options)
  }
  const echartsResize = () => {
    charts.value && charts.value.resize()
  }
  const throttledResize = throttle(() => {
    charts.value && charts.value.resize()
  }, 250); 
  onMounted(() => {
    window.addEventListener("resize", throttledResize)
  })
  // 防止 echarts 页面 keepAlive 时，还在继续监听页面
  onDeactivated(() => {
    window.removeEventListener("resize", throttledResize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener("resize", throttledResize)
  })
  return {
    initCharts,
    setOptions,
    throttledResize
  }
}
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}
export { useEcharts }

