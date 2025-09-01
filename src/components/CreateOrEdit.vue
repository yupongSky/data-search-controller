<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑材料' : '新增材料'"
    width="80%"
    @close="emit('close')"
  >
    <div class="create-or-edit">
      <el-form>
        <el-form-item label="材料名称">
          <el-input v-model="name" style="width: 300px" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="材料类型">
          <el-select
            v-model="type"
            placeholder="请选择"
            style="width: 300px"
            :disabled="isEdit"
          >
            <el-option label="基材" value="1" />
            <el-option label="无磁部分" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="材料性能">
          <div class="box">
            <template v-for="(item, index) in performance" :key="item.id">
              <el-card
                style="
                  margin-bottom: 10px;
                  margin-right: 10px;
                  padding-right: 50px;
                "
              >
                <el-button
                  class="btn-close"
                  @click="removePerformance(index)"
                  type="danger"
                  >删除</el-button
                >
                <performanceForm
                  :editData="item"
                  @change="
                    (data) => {
                      handleChange(index, data);
                    }
                  "
                >
                </performanceForm>
              </el-card>
            </template>
          </div>

          <div class="options">
            <el-button type="primary" @click="addPerformance"
              >添加材料性能</el-button
            >
          </div>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="emit('close')">取消</el-button>
        <el-button
          type="primary"
          @click="submitNewMaterial"
          :disabled="!name || !type"
        >
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import {
  onMounted,
  ref,
  isRef,
  computed,
  watchEffect,
  reactive,
  watch,
  isReactive,
  toRaw,
} from "vue";
import performanceForm from "./forms/performanc.vue";
import {
  savePerformance,
  getPerformance,
  updatePerformance,
} from "../service/baseDB";
import { ElMessage } from "element-plus";

const props = defineProps({
  showDialog: {
    type: Boolean,
    default: false,
  },
  editData: {
    type: Object,
    default: () => {},
  },
});

const emit = defineEmits(["submit", "close"]);

const dialogVisible = computed(() => props.showDialog);
const name = ref("");
const type = ref("");
const performance = ref([]);
const materialData = computed(() => {
  console.log("performance", performance);
  console.log("performance.value", performance.value);
  console.log("performance,isReactive", isReactive(performance));
  console.log("performance.value,isReactive", isReactive(performance.value));
  console.log("performance,isRef", isRef(performance));
  console.log("performance.value,isRef", isRef(performance.value));
  console.log("performance.value,toRow", toRaw(performance.value));
  return {
    name: name.value,
    type: type.value,
    performance: toRaw(performance.value),
  };
});

const addPerformance = () => {
  const d = performance.value || [];
  console.log("performance,data:", isReactive(d));
  console.log("performance,d.value:", d.value, isReactive(d.value));

  d.push({
    id: Date.now(),
    data: {},
  });
  performance.value = d;
};

function removePerformance(index) {
  performance.value.splice(index, 1);
}

function handleChange(index, data) {
  console.log("🚀 ~ handleChange ~ index:", index);
  console.log("🚀 ~ handleChange ~ data:", data);
  performance.value[index].data = data;
  console.log("🚀 ~ handleChange ~ performance.value:", performance.value);
}

watch(materialData, (newVal) => {
  console.log("🚀 ~ materialData:", newVal);
});

watchEffect(() => {
  console.log("🚀 ~ props.editData.value:", props.editData);
  if (props.editData) {
    name.value = props.editData.name || "";
    type.value = props.editData.type || "1";
    performance.value = props.editData.performance || [];
  }
});
const isEdit = computed(() => {
  console.log("🚀 ~ props.editData:", props.editData);
  return !!props.editData.name;
});

function submitNewMaterial() {
  console.log(
    "🚀 ~ submitNewMaterial ~ materialData.value:",
    materialData.value
  );
  if (isEdit.value) {
    updatePerformance(name.value, type.value, toRaw(performance.value))
      .then((res) => {
        console.log("🚀 ~ submitNewMaterial ~ res:", res);
        ElMessage.success("编辑成功！");

        emit("submit");
        emit("close");
      })
      .catch((err) => {
        console.log("🚀 ~ submitNewMaterial ~ err:", err);
        ElMessage.error("编辑失败！");
      });
    return;
  }
  savePerformance(materialData.value)
    .then((res) => {
      console.log("🚀 ~ submitNewMaterial ~ res:", res);
      ElMessage.success("新增成功！");

      emit("submit");
      emit("close");
    })
    .catch((err) => {
      console.log("🚀 ~ submitNewMaterial ~ err:", err);
      if (err.code === 0) {
        ElMessage.error("材料已存在，无法新增！");
      }
    });
}
</script>

<style lang="scss" scoped>
.box {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;
}
.btn-close {
  position: absolute;
  top: 0;
  right: 0;
}
.el-card {
  position: relative;
}
.options {
  width: 100%;
}
</style>
