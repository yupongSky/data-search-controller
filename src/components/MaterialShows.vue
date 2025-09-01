<template>
  <div class="material-shows">
    <div class="performace-list">
      <!-- {{ performance }} -->
      <el-card
        class="performace-list-item"
        v-for="(item, index) in performance"
        :key="item.id"
        shadow="never"
        header-class="performace-list-header"
        style="margin-bottom: 20px"
      >
        <template #header> {{ item.performanceName }}</template>
        <div class="card-list">
          <el-card
            class="subs"
            v-for="(sub, index) in item.subs"
            :key="index"
            shadow="always"
            header-class="sub-header"
          >
            <template #header>{{ sub.performanceSubName }}</template>

            <template v-if="sub.performanceType === '1'">
              <div class="img-list">
                <div
                  class="img-item"
                  v-for="(img, index) in sub.imgs"
                  :key="index"
                >
                  <el-image
                    :src="img"
                    :zoom-rate="1.5"
                    :max-scale="10"
                    :min-scale="0.5"
                    :preview-src-list="sub.imgs"
                    show-progress
                    :initial-index="index"
                    fit="contain"
                  />
                </div>
              </div>
            </template>
            <div class="text-item" v-else>
              <el-table :data="sub.textParams" stripe border>
                <el-table-column
                  prop="name"
                  label="参数名称"
                  width="200"
                  style="text-align: center"
                />
                <el-table-column
                  prop="val"
                  label="参数值"
                  width="200"
                  style="text-align: center"
                />
              </el-table>
            </div>
          </el-card>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  material: {
    type: Object,
    default: () => {},
  },
});

const name = computed(() => {
  return props.material.name;
});

const performance = computed(() => {
  const result = [];
  console.log("🚀 ~ props.material.performance:", props.material.performance);
  console.log("🚀 ~ props.material:", props.material);
  const { performance = [] } = props.material;
  performance.forEach((item) => {
    console.log("🚀 ~ item:", item);
    const { id, data } = item;
    console.log("🚀 ~ data:", data);

    const targetIndex = result.findIndex(
      (i) => item.data.performanceName === i.performanceName
    );

    if (targetIndex > -1) {
      result[targetIndex].subs.push({
        ...item.data,
        imgs: item.data.imgParams.map((i) => i.dataUrl),
      });
    } else {
      const subs = [];
      subs[0] = {
        ...data,
        imgs: data.imgParams.map((i) => i.dataUrl),
      };
      result.push({
        id,
        performanceName: data.performanceName,
        subs,
      });
    }
  });
  console.log("🚀 ~ result:", result);
  return result;
});
</script>

<style lang="scss">
.material-shows {
  width: 100%;
  box-sizing: border-box;
  .performace-list {
    box-sizing: border-box;

    .img-list {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 10px;
      .img-item {
        width: 120px;
        height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        justify-content: center;
        border: 1px solid #eee;
        border-radius: 5px;
      }
    }
  }
}
.card-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.sub-header {
  padding: 10px;
  font-weight: bold;
  .el-card_header {
    font-size: 16px;
  }
}

.performace-list-header {
  background-color: #f5f7fa;
  padding: 10px;
}
</style>
