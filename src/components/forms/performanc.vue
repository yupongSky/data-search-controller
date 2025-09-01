<template>
  <el-form-item label="性能名称">
    <el-input v-model="performanceName" style="width: 200px" />
  </el-form-item>
  <el-form-item label="测试项目">
    <el-input
      v-model="performanceSubName"
      style="width: 200px"
      :disabled="performanceType === '2'"
    />
  </el-form-item>
  <el-form-item label="参数类型">
    <el-radio-group v-model="performanceType" @change="handleChangeType">
      <el-radio label="1">图片列表</el-radio>
      <el-radio label="2">文字表格</el-radio>
    </el-radio-group>
  </el-form-item>
  <el-form-item label="图片列表" v-if="performanceType === '1'">
    <ImgPreview @change="handleChange" :editData="editData.data.imgParams" />
  </el-form-item>
  <el-form-item label="文字表格" v-if="performanceType === '2'">
    <div class="table-container">
      <div class="item header">
        <div class="name">参数名称</div>
        <div class="value">参数值</div>
        <div class="action">操作</div>
      </div>
      <div class="item" v-for="(item, index) in textParams" :key="index">
        <div class="name">
          <el-input
            v-model="textParams[index].name"
            style="text-align: center; width: 200px"
            placeholder="请输入参数名称"
            @change="handleChangeText"
          />
        </div>
        <div class="value">
          <el-input
            v-model="textParams[index].val"
            placeholder="请输入参数值"
            style="text-align: center; width: 200px"
            @change="handleChangeText"
          />
        </div>
        <div class="action">
          <el-button
            type="danger"
            :icon="RemoveFilled"
            @click="removeTextParam(index)"
            circle
          >
          </el-button>
        </div>
      </div>
    </div>
    <el-button type="primary" @click="addTextParam" style="margin-top: 10px"
      >添加参数</el-button
    >
  </el-form-item>
</template>

<script setup>
import {
  ref,
  onMounted,
  onUnmounted,
  watchEffect,
  computed,
  watch,
  toRaw,
} from "vue";
import { RemoveFilled, Plus } from "@element-plus/icons-vue";
import ImgPreview from "./ImgPreview.vue";
const emit = defineEmits(["change"]);
const pops = defineProps({
  editData: {
    type: Object,
    default: () => ({}),
  },
});
const performanceType = ref("1");
const performanceName = ref("");
const performanceSubName = ref("");
const imgsData = ref([]);
const textParams = ref([
  {
    name: "",
    val: "",
  },
]);
const trueTextParams = ref([]);
onMounted(() => {
  console.log("🚀 ~ pops.editData:", pops.editData);
  if (pops.editData) {
    const { data } = pops.editData;
    performanceType.value = data.performanceType;
    performanceName.value = data.performanceName;
    performanceSubName.value = data.performanceSubName;
    // imgsData.value = data.imgParams;
    textParams.value = data.textParams || [];
    trueTextParams.value = toRaw(
      textParams.value.filter((item) => {
        console.log("🚀 ~ handleChangeText ~ item:", item);
        return item.name || item.val;
      })
    );
  }
});
function addTextParam() {
  textParams.value.push({
    name: "",
    val: "",
  });
}
function removeTextParam(index) {
  textParams.value.splice(index, 1);
}

function handleChange(data) {
  console.log("🚀 ~ handleChange ~ data:", data);
  imgsData.value = data;
}
function handleChangeText() {
  console.log("🚀 ~ handleChangeText ~ textParams:", textParams.value);
  trueTextParams.value = toRaw(
    textParams.value.filter((item) => {
      console.log("🚀 ~ handleChangeText ~ item:", item);
      return item.name || item.val;
    })
  );
  console.log(
    "🚀 ~ handleChangeText ~  trueTextParams.value:",
    trueTextParams.value
  );
}

function handleChangeType() {
  if (performanceType.value === "2") {
    performanceSubName.value = `${performanceName.value}参数`;
  }
}

const updateData = computed(() => {
  console.log("....toRaw(trueTextParams.value)", toRaw(trueTextParams.value));
  return {
    performanceName: performanceName.value,
    performanceType: performanceType.value,
    performanceSubName: performanceSubName.value,
    textParams: toRaw(
      trueTextParams.value.map((item) => {
        return {
          name: item.name,
          val: item.val,
        };
      })
    ),
    imgParams: toRaw(imgsData.value),
  };
});

watch(updateData, (newVal) => {
  console.log("🚀 ~ newVal:", newVal);
  emit("change", newVal);
});
</script>

<style lang="scss" scoped>
.table-container {
  width: 100%;
  .item {
    display: flex;
    text-align: center;
    justify-content: flex-start;
    :deep(.el-input__inner) {
      text-align: center;
    }
    .name {
      flex: 1;
      padding: 0;
    }
    .value {
      flex: 1;
    }
    .action {
      flex: 0.5;
    }
  }
}
</style>
