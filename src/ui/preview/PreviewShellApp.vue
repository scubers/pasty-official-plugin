<template>
  <main class="workbench" :data-theme="selectedTheme">
    <section class="workbench__controls">
      <label class="workbench__control">
        <span>View</span>
        <select v-model="selectedView">
          <option value="renderer">Renderer</option>
          <option value="action">Action</option>
        </select>
      </label>

      <label class="workbench__control">
        <span>Scenario</span>
        <select v-model="selectedScenarioID">
          <option
            v-for="scenario in activeScenarioOptions"
            :key="scenario.id"
            :value="scenario.id"
          >
            {{ scenario.label }}
          </option>
        </select>
      </label>

      <label class="workbench__control">
        <span>Theme</span>
        <select v-model="selectedTheme">
          <option value="dark">Dark Host</option>
          <option value="light">Light Host</option>
        </select>
      </label>
    </section>

    <section class="workbench__canvas">
      <div
        class="host-frame"
        :class="selectedView === 'renderer' ? 'host-frame--renderer' : 'host-frame--action'"
      >
        <div class="host-frame__title">
          <span>{{ selectedView === "renderer" ? "Attachment Renderer" : "Draft Action" }}</span>
          <span>{{ frameSizeLabel }}</span>
        </div>

        <div class="host-frame__surface">
          <div class="host-frame__webview" :style="frameStyle">
            <component :is="activeComponent" :key="componentKey" />
          </div>

          <div class="host-frame__strip">
            <button
              v-for="button in activeButtons"
              :key="button.id"
              class="host-frame__button"
              type="button"
              :class="button.id === activeDefaultButtonID ? 'host-frame__button--primary' : ''"
              @click="previewHostButton(button)"
            >
              {{ button.title }}
            </button>
          </div>
        </div>
      </div>

      <aside class="workbench__notes">
        <p class="workbench__notes-title">Preview Notes</p>
        <p class="workbench__notes-body">
          This workbench simulates fixed host chrome, theme changes, and bootstrap/search/theme events.
        </p>
        <p class="workbench__notes-body">
          Host strip buttons are illustrative here. In local preview, bridge calls fall back to console logging.
        </p>
        <p class="workbench__notes-status">{{ statusMessage }}</p>
      </aside>
    </section>
  </main>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import AttachmentTemplateApp from "../AttachmentTemplateApp.vue";
import DraftActionTemplateApp from "../DraftActionTemplateApp.vue";
import { attachmentScenarios } from "./scenarios/attachmentScenarios";
import { actionScenarios } from "./scenarios/actionScenarios";

const query = new URLSearchParams(window.location.search);
const initialView = query.get("view") === "action" ? "action" : "renderer";
const selectedView = ref(initialView);
const selectedTheme = ref(query.get("theme") === "light" ? "light" : "dark");
const statusMessage = ref("Ready for local UI iteration.");

const activeScenarioOptions = computed(() => selectedView.value === "renderer"
  ? attachmentScenarios
  : actionScenarios);

const selectedScenarioID = ref(resolveInitialScenarioID(initialView));

const activeScenario = computed(() => activeScenarioOptions.value.find(
  (scenario) => scenario.id === selectedScenarioID.value
) || activeScenarioOptions.value[0]);

const activeComponent = computed(() => selectedView.value === "renderer"
  ? AttachmentTemplateApp
  : DraftActionTemplateApp);

const activeButtons = computed(() => activeScenario.value?.bootstrap?.buttons ?? []);
const activeDefaultButtonID = computed(() => activeScenario.value?.bootstrap?.defaultButtonID ?? null);

const componentKey = computed(() => `${selectedView.value}:${activeScenario.value?.id ?? "unknown"}`);

const frameStyle = computed(() => selectedView.value === "renderer"
  ? { width: "100%", height: "320px" }
  : { width: "350px", height: "250px" });

const frameSizeLabel = computed(() => selectedView.value === "renderer" ? "Responsive height 320" : "Fixed size 350 × 250");

watch(selectedView, (view) => {
  selectedScenarioID.value = resolveInitialScenarioID(view);
});

watch(
  [selectedView, selectedScenarioID, selectedTheme],
  () => {
    applyPreviewState();
    syncQuery();
  },
  { immediate: true }
);

function resolveInitialScenarioID(view) {
  const requestedScenarioID = query.get("scenario");
  const options = view === "renderer" ? attachmentScenarios : actionScenarios;
  return options.some((scenario) => scenario.id === requestedScenarioID)
    ? requestedScenarioID
    : options[0].id;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function dispatchEvent(name, detail) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

function applyPreviewState() {
  const scenario = activeScenario.value;
  if (!scenario) {
    return;
  }

  const bootstrap = clone(scenario.bootstrap);
  window.__PASTY_PLUGIN_BOOTSTRAP__ = null;
  window.__PASTY_PLUGIN_ACTION_BOOTSTRAP__ = null;

  if (selectedView.value === "renderer") {
    window.__PASTY_PLUGIN_BOOTSTRAP__ = bootstrap;
    dispatchEvent("pasty-plugin-bootstrap", bootstrap);
    dispatchEvent("pasty-plugin-attachment-updated", {
      item: bootstrap.item,
      attachment: bootstrap.attachment
    });
    dispatchEvent("pasty-plugin-search-updated", {
      searchTerms: scenario.searchTerms ?? []
    });
    dispatchEvent("pasty-plugin-theme-updated", {
      accentHex: scenario.accentHex ?? null
    });
    statusMessage.value = `Renderer preview loaded: ${scenario.label}`;
    return;
  }

  window.__PASTY_PLUGIN_ACTION_BOOTSTRAP__ = bootstrap;
  dispatchEvent("pasty-plugin-action-bootstrap", bootstrap);
  statusMessage.value = `Action preview loaded: ${scenario.label}`;
}

function syncQuery() {
  const next = new URL(window.location.href);
  next.searchParams.set("view", selectedView.value);
  next.searchParams.set("scenario", selectedScenarioID.value);
  next.searchParams.set("theme", selectedTheme.value);
  window.history.replaceState({}, "", next);
}

function previewHostButton(button) {
  statusMessage.value = `Host preview button clicked: ${button.title}`;
  console.info("preview.hostButton", {
    view: selectedView.value,
    scenarioID: selectedScenarioID.value,
    buttonID: button.id
  });
}
</script>

<style scoped>
.workbench {
  min-height: 100%;
  padding: 24px;
  color: #e2e8f0;
  background:
    radial-gradient(circle at top left, rgba(15, 118, 110, 0.22), transparent 24%),
    linear-gradient(180deg, #111827, #0f172a);
}

.workbench[data-theme="light"] {
  color: #0f172a;
  background:
    radial-gradient(circle at top left, rgba(14, 165, 233, 0.18), transparent 24%),
    linear-gradient(180deg, #e2e8f0, #cbd5e1);
}

.workbench__controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.workbench__control {
  display: grid;
  gap: 6px;
}

.workbench__control span {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(226, 232, 240, 0.72);
}

.workbench[data-theme="light"] .workbench__control span {
  color: rgba(15, 23, 42, 0.62);
}

.workbench__control select {
  min-width: 170px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.26);
  background: rgba(15, 23, 42, 0.48);
  color: inherit;
}

.workbench[data-theme="light"] .workbench__control select {
  background: rgba(255, 255, 255, 0.82);
}

.workbench__canvas {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  gap: 20px;
  align-items: start;
}

.host-frame {
  padding: 18px;
  border-radius: 22px;
  background: rgba(15, 23, 42, 0.34);
  border: 1px solid rgba(45, 212, 191, 0.2);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.workbench[data-theme="light"] .host-frame {
  background: rgba(248, 250, 252, 0.52);
  border-color: rgba(148, 163, 184, 0.28);
}

.host-frame__title {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: rgba(226, 232, 240, 0.8);
}

.workbench[data-theme="light"] .host-frame__title {
  color: rgba(15, 23, 42, 0.7);
}

.host-frame__surface {
  display: grid;
  gap: 12px;
}

.host-frame__webview {
  overflow: hidden;
  border-radius: 20px;
}

.host-frame--action .host-frame__webview {
  width: 350px;
}

.host-frame__strip {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.host-frame__button {
  appearance: none;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 999px;
  padding: 10px 16px;
  background: rgba(30, 41, 59, 0.54);
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.host-frame__button--primary {
  background: rgba(15, 23, 42, 0.9);
  color: #f8fafc;
}

.workbench[data-theme="light"] .host-frame__button {
  background: rgba(255, 255, 255, 0.82);
  color: #334155;
}

.workbench[data-theme="light"] .host-frame__button--primary {
  background: #0f172a;
  color: #f8fafc;
}

.workbench__notes {
  padding: 16px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.42);
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.workbench[data-theme="light"] .workbench__notes {
  background: rgba(255, 255, 255, 0.76);
}

.workbench__notes-title {
  margin: 0;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.workbench__notes-body,
.workbench__notes-status {
  margin: 10px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: rgba(226, 232, 240, 0.78);
}

.workbench[data-theme="light"] .workbench__notes-body,
.workbench[data-theme="light"] .workbench__notes-status {
  color: rgba(15, 23, 42, 0.72);
}

.workbench__notes-status {
  font-weight: 600;
}

@media (max-width: 980px) {
  .workbench__canvas {
    grid-template-columns: minmax(0, 1fr);
  }

  .workbench__notes {
    order: -1;
  }
}
</style>
