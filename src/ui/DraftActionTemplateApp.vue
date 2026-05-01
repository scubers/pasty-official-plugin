<template>
  <main class="shell action-shell">
    <div v-if="sessionState.action" class="action-layout">
      <section class="editor-card">
        <div class="editor-card__header">
          <p class="editor-card__eyebrow">Draft Action Template</p>
          <h1 class="editor-card__title">
            {{ sessionState.displayName || sessionState.action.title }}
          </h1>
          <p class="editor-card__subtitle">
            这里保留了 bootstrap、draft 同步和运行按钮的最小示例，开发者可以直接替换字段和交互逻辑。
          </p>
        </div>

        <label class="editor-field">
          <span class="editor-field__label">Title</span>
          <input v-model="title" class="editor-field__input" type="text" />
        </label>

        <label class="editor-field">
          <span class="editor-field__label">Template Tag</span>
          <input v-model="templateTag" class="editor-field__input" type="text" />
        </label>

        <label class="editor-field">
          <span class="editor-field__label">Note</span>
          <textarea v-model="note" class="editor-field__textarea" />
        </label>

        <label class="editor-toggle">
          <input v-model="shouldPin" type="checkbox" />
          <span>Pin item when applying metadata</span>
        </label>

        <div class="editor-actions">
          <button class="editor-actions__primary" type="button" @click="runFromUI('apply-template')">
            Apply
          </button>
          <button class="editor-actions__secondary" type="button" @click="runFromUI('apply-and-pin')">
            Apply + Pin
          </button>
        </div>
      </section>

      <section class="preview-card">
        <p class="preview-card__eyebrow">Draft Preview</p>
        <pre class="preview-card__body">{{ previewText }}</pre>
      </section>
    </div>

    <div v-else class="empty-state">
      <p class="empty-state__title">Waiting for template draft action bootstrap…</p>
      <p class="empty-state__body">Open the template draft action from Action Panel to inspect the session.</p>
    </div>
  </main>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { usePluginActionSession } from "./composables/usePluginActionSession";

const {
  session,
  syncDraft,
  runAction
} = usePluginActionSession();

const sessionState = session;
const title = ref("");
const templateTag = ref("");
const note = ref("");
const shouldPin = ref(false);

watch(
  () => sessionState.draft,
  (draft) => {
    title.value = String(draft?.title ?? "");
    templateTag.value = String(draft?.templateTag ?? "");
    note.value = String(draft?.note ?? "");
    shouldPin.value = Boolean(draft?.shouldPin);
  },
  { immediate: true, deep: true }
);

watch([title, templateTag, note, shouldPin], () => {
  syncDraft({
    title: title.value,
    templateTag: templateTag.value,
    note: note.value,
    shouldPin: shouldPin.value
  });
});

const previewText = computed(() => [
  `Title: ${title.value || "Template draft title"}`,
  `Template Tag: ${templateTag.value || "template-plugin"}`,
  `Pin On Apply: ${shouldPin.value ? "Yes" : "No"}`,
  "",
  note.value.trim() || "Add draft-only guidance or preview output here."
].join("\n"));

function runFromUI(buttonID) {
  runAction({
    buttonID,
    buttonTitle: buttonID,
    draft: {
      title: title.value,
      templateTag: templateTag.value,
      note: note.value,
      shouldPin: shouldPin.value
    }
  });
}
</script>

<style scoped>
.action-shell {
  background:none;
    /* radial-gradient(circle at top left, rgba(251, 191, 36, 0.18), transparent 28%),
    radial-gradient(circle at bottom right, rgba(20, 184, 166, 0.18), transparent 32%),
    linear-gradient(180deg, #fffaf0, #eefbf7); */
}

.action-layout {
  display: grid;
  gap: 14px;
}

.editor-card,
.preview-card {
  padding: 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(16px);
  box-shadow: 0 18px 44px rgba(148, 163, 184, 0.18);
}

.editor-card__eyebrow,
.preview-card__eyebrow {
  margin: 0;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #0f766e;
}

.editor-card__title {
  margin: 10px 0 0;
  font-size: 20px;
}

.editor-card__subtitle {
  margin: 8px 0 0;
  color: #475569;
  font-size: 13px;
  line-height: 1.55;
}

.editor-field {
  display: block;
  margin-top: 16px;
}

.editor-field__label {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #475569;
}

.editor-field__input,
.editor-field__textarea {
  width: 100%;
  box-sizing: border-box;
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.14);
  background: rgba(248, 250, 252, 0.96);
  padding: 12px 14px;
  font-size: 14px;
  color: #0f172a;
}

.editor-field__textarea {
  min-height: 110px;
  resize: vertical;
}

.editor-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  color: #334155;
  font-size: 13px;
  font-weight: 600;
}

.editor-actions {
  display: flex;
  gap: 12px;
  margin-top: 18px;
}

.editor-actions__primary,
.editor-actions__secondary {
  appearance: none;
  border-radius: 14px;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.editor-actions__primary {
  border: 0;
  background: linear-gradient(135deg, #0f766e, #14b8a6);
  color: #f8fafc;
}

.editor-actions__secondary {
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.8);
  color: #0f172a;
}

.preview-card__body {
  margin: 10px 0 0;
  padding: 16px;
  border-radius: 16px;
  background: #e2e8f0;
  color: #0f172a;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
}
</style>
