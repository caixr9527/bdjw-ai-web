<script setup lang="ts">
import { isImage, isFile } from '@/utils/helper'
import IconCsv from '@/components/icons/IconCsv.vue'
import IconDoc from '@/components/icons/IconDoc.vue'
import IconHtml from '@/components/icons/IconHtml.vue'
import IconMd from '@/components/icons/IconMd.vue'
import IconPdf from '@/components/icons/IconPdf.vue'
import IconPpt from '@/components/icons/IconPpt.vue'
import IconProperties from '@/components/icons/IconProperties.vue'
import IconTxt from '@/components/icons/IconTxt.vue'
import IconXls from '@/components/icons/IconXls.vue'
import IconXml from '@/components/icons/IconXml.vue'
import IconYaml from '@/components/icons/IconYaml.vue'
const props = defineProps({
  account: {
    type: Object,
    default: () => {
      return {}
    },
    required: true,
  },
  query: { type: String, default: '', required: true },
  image_urls: { type: Array, default: () => [] },
  enable_user_info: { type: Boolean, default: false, required: false },
})
</script>

<template>
  <div v-if="enable_user_info" class="flex gap-2">
    <!-- 左侧头像 -->
    <a-avatar :size="30" shape="circle" class="flex-shrink-0" :image-url="props.account?.avatar" />
    <!-- 右侧昵称与消息 -->
    <div class="flex flex-col items-start gap-2">
      <!-- 账号昵称 -->
      <div class="text-gray-700 font-bold">{{ props.account?.name }}</div>
      <!-- 人类消息 -->
      <div class="bg-blue-100 border border-blue-200 text-gray-700 px-4 py-3 rounded-2xl break-all">
        <a-image v-for="(image_url, idx) in props.image_urls" :key="idx" :src="String(image_url)" />
        {{ props.query }}
      </div>
    </div>
  </div>
  <div
    v-else
    class="bg-blue-100 border border-blue-200 text-gray-700 px-4 py-3 rounded-2xl break-all ml-auto"
  >
    <template v-for="(image_url, idx) in props.image_urls" :key="idx">
      <a-image v-if="isImage(String(image_url))" :src="String(image_url)" />
      <a-space direction="horizontal" v-else-if="isFile(String(image_url))">
        <a :href="String(image_url)" target="_blank" rel="noopener noreferrer" class="custom-spacing">
          <a-avatar :size="64" shape="square">
            <icon-csv v-if="String(image_url).endsWith('csv')" />
            <icon-doc v-else-if="String(image_url).endsWith('doc') || String(image_url).endsWith('docx')" />
            <icon-html v-else-if="String(image_url).endsWith('htm') || String(image_url).endsWith('html')" />
            <icon-md v-else-if="String(image_url).endsWith('md') || String(image_url).endsWith('markdown')" />
            <icon-pdf v-else-if="String(image_url).endsWith('pdf')" />
            <icon-ppt v-else-if="String(image_url).endsWith('ppt') || String(image_url).endsWith('pptx')" />
            <icon-properties v-else-if="String(image_url).endsWith('properties')" />
            <icon-txt v-else-if="String(image_url).endsWith('txt')" />
            <icon-xls v-else-if="String(image_url).endsWith('xls') || String(image_url).endsWith('xlsx')" />
            <icon-xml v-else-if="String(image_url).endsWith('xml')" />
            <icon-yaml v-else-if="String(image_url).endsWith('yaml') || String(image_url).endsWith('yml')" />
            <icon-file v-else />
          </a-avatar>
        </a>
      </a-space>
    </template>
    <div>
      {{ props.query }}
    </div>
  </div>
</template>

<style scoped>
.custom-spacing {
  margin-right: 12px !important; /* 匹配 <a-space> 的间距值 */
  transition: opacity 0.3s;
}
.custom-spacing:hover {
  opacity: 0.8;
}
</style>
