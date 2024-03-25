<template>
  <div class="card">
    <el-icon class="close" @click="close">
      <CircleCloseFilled />
    </el-icon>
    <strong>建筑详情</strong>
    <br><br>
    <div>
      类型： {{ type }}
    </div>

  </div>
</template>

<script setup>
import { CircleCloseFilled } from '@element-plus/icons-vue';
import { defineProps, ref, getCurrentInstance } from 'vue';
const props = defineProps({
  type: {
    type: String,
    required: true
  }
});

// 获取组件的实例
const instance = getCurrentInstance();

// 定义一个响应式的变量
const type = ref(props.type);

// 定义一个关闭组件的方法
const close = () => {
  console.log(instance);
  console.log(111)
  // 检查 instance 是否为 null
  if (instance) {
    console.log(222)
    // 从父元素中移除组件的元素
    instance.vnode.el.parentNode.removeChild(instance.vnode.el);
  }
};

</script>

<style scoped>
.card {
  position: relative;
  width: 150px;
  height: 120px;
  border-radius: 20px;
  background: #bcf1f1;
  background-image: url("../../src/assets/pop.png") ;
  background-size: cover;
  background-position: center;
  box-shadow: 15px 15px 30px rgb(178, 215, 249),
    -15px -15px 30px rgb(96, 171, 224);
  padding: 12px;
}

.close {
  width: 25px;
  height: 25px;
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
}
</style>