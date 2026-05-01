<template>
  <main class="shell attachment-shell">
    <section v-if="payload" class="preview-card">
      <header class="preview-card__header">
        <div>
          <p class="preview-card__eyebrow">Attachment Renderer Template</p>
          <h1 class="preview-card__title">{{ payload.title }}</h1>
        </div>
        <div class="preview-card__meta">
          <span>{{ payload.metadata.lineCount }} lines</span>
          <span>{{ payload.metadata.characterCount }} chars</span>
        </div>
      </header>

      <p class="preview-card__summary">{{ payload.summary }}</p>

      <pre class="preview-card__body">{{ payload.sourceText }}</pre>

      <!-- <div class="preview-card__buttons">
        <button
          v-for="action in actions"
          :key="action.id"
          class="preview-card__button"
          type="button"
          :disabled="!action.isEnabled"
          @click="invokeAction(action.id)"
        >
          {{ action.title }}
        </button>
      </div> -->
    </section>

    <div v-else class="empty-state">
      <p class="empty-state__title">Waiting for template attachment bootstrap…</p>
      <p class="empty-state__body">Load the template renderer from a detected attachment to inspect the session.</p>
    </div>
  </main>
</template>

<script setup>
import { usePluginAttachmentSession } from "./composables/usePluginAttachmentSession";

const { actions, payload, invokeAction } = usePluginAttachmentSession();
</script>

<style scoped>
.attachment-shell {
  min-height: 100vh;
  box-sizing: border-box;
  background: none;
}

.preview-card {
  border-radius: 24px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.preview-card__header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.preview-card__eyebrow {
  margin: 0;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #0f766e;
}

.preview-card__title {
  margin: 10px 0 0;
  font-size: 24px;
  line-height: 1.2;
}

.preview-card__meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.preview-card__meta span {
  border-radius: 999px;
  padding: 7px 10px;
  background: #ccfbf1;
  color: #115e59;
  font-size: 12px;
  font-weight: 700;
}

.preview-card__summary {
  margin: 16px 0 0;
  color: #334155;
  font-size: 15px;
  line-height: 1.6;
}

.preview-card__body {
  margin: 16px 0 0;
  padding: 16px;
  border-radius: 16px;
  background: #0f172a;
  color: #d1fae5;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.preview-card__buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.preview-card__button {
  appearance: none;
  border: 0;
  border-radius: 12px;
  padding: 11px 14px;
  background: linear-gradient(135deg, #0f766e, #14b8a6);
  color: #f8fafc;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.preview-card__button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.empty-state {
  min-height: calc(100vh - 32px);
  display: grid;
  place-items: center;
  text-align: center;
}

.empty-state__title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.empty-state__body {
  margin: 10px 0 0;
  color: #6b7280;
  font-size: 14px;
}
</style>
