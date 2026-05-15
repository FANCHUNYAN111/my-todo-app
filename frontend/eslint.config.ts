import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginOxlint from 'eslint-plugin-oxlint'
import skipFormatting from 'eslint-config-prettier/flat'
import tseslint from 'typescript-eslint'
// 1. 引入 vue-eslint-parser
import vueParser from 'vue-eslint-parser'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
    languageOptions: {
      // 2. 使用导入的 vueParser 而不是 vue.parser
      parser: vueParser, 
      parserOptions: {
        parser: tseslint.parser,
        // 【关键修改 1】明确指定 Vue 版本为 3，这样插件会允许 v-model:argument
        vueVersion: '3',
      },
    },
    plugins: {
      // 3. 使用 pluginVue (已导入) 而不是 vue
      vue: pluginVue,
    },
    rules: {
      // ... 其他 vue 规则

      // 【关键修改 2】显式关闭该规则，防止误报
      'vue/no-v-model-argument': 'off',

      // 如果你使用的是较新版本的 eslint-plugin-vue，可能还需要检查这个规则
      'vue/valid-v-model': 'error',
    },
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),

  skipFormatting,
)