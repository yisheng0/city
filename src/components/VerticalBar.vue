<template>
	<div class="container">
		<div style="color: aliceblue;">【服务资源占用比】</div>
		<div ref="target"  class="target"></div>
	</div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
	data: {
		type: Object,
		required: true
	}
})

const target = ref(null)
let mChart = null
onMounted(() => {
	mChart = echarts.init(target.value)
	renderChart()
})

const renderChart = () => {
	const options = {
		// X 轴展示选项
		xAxis: {
			type: 'category',
			// 根据根据服务端数据筛选
			data: props.data.servers.map((item) => item.name),
			// 文字色值
			axisLabel: {
				color: '#9EB1C8'
			}
		},
		// Y 轴展示数据
		yAxis: {
			// 数据展示
			type: 'value',
			// 不显示轴
			show: false,
			// 最大值（防止触顶）
			max: function (value) {
				// 取整
				return parseInt(value.max * 1.2)
			}
		},
		// echarts 网格绘制的位置，对应 上、右、下、左
		grid: {
			top: 16,
			right: 0,
			bottom: 26,
			left: -26,
			// 计算边距时，包含标签
			containLabel: true
		},
		// 柱形图核心配置
		series: {
			// 柱形图
			type: 'bar',
			// 数据筛选
			data: props.data.servers.map((item) => ({
				name: item.name,
				value: item.value
			})),
			// 每个轴的样式
			itemStyle: {
				color: '#479AD3', // 设置柱子的颜色
				barBorderRadius: 5, // 设置柱子的圆角
				shadowColor: 'rgba(0, 0, 0, 0.3)', // 设置柱子的阴影颜色
				shadowBlur: 5 // 设置柱子的阴影模糊大小
			},
			// 柱子宽度
			barWidth: 12,
			// 文本
			label: {
				show: true,
				// 设置标签位置为右侧
				position: 'top',
				textStyle: {
					// 设置标签文本颜色
					color: '#fff'
				},
				formatter: '{c}%'
			}
		}
	}

	mChart.setOption(options)
}

// 监听数据的变化，重新渲染图表
watch(
	() => props.data,
	() => {
		renderChart()
	}
)
</script>

<style scoped>
@property --angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}

@keyframes rotate {
  to {
    --angle: 360deg;
  }
}

.container {
  border: 0.3rem dotted transparent;
  border-image: conic-gradient(from var(--angle),
      rgb(77, 123, 203) 90deg,
      transparent 90deg 180deg,
      rgb(50, 77, 128) 180deg 270deg,
      transparent 270deg 360deg) 1 1;
  animation: rotate 5s infinite linear;
  --angle: 0deg;
  background-color: rgb(16, 12, 42);
  height: 35vh;
}
.target{
  width: 100%;
  height: 100%;
}
</style>
