const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..", "..");
const manifestPath = path.resolve(projectRoot, "manifest.json");

function loadManifest() {
  return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
}

test("manifest registers template detector, renderer, and actions", () => {
  const manifest = loadManifest();

  assert.equal(manifest.plugin.id, "plugin.template.full");
  assert.equal(manifest.detectors.length, 1);
  assert.equal(manifest.attachmentRenderers.length, 1);
  assert.equal(manifest.actions.length, 2);

  const detector = manifest.detectors.find((entry) => entry.id === "template-detector");
  assert.ok(detector, "expected template-detector to be declared in manifest");
  assert.deepEqual(detector.supportedInputKinds, ["text"]);
  assert.deepEqual(detector.attachmentTypes, ["plugin.template.full.preview"]);

  const renderer = manifest.attachmentRenderers.find((entry) => entry.id === "template-renderer");
  assert.ok(renderer, "expected template-renderer to be declared in manifest");
  assert.equal(renderer.attachmentType, "plugin.template.full.preview");
  assert.equal(renderer.uiEntry, "renderers/template-renderer/index.html");

  const autoAction = manifest.actions.find((entry) => entry.id === "template-auto-action");
  assert.ok(autoAction, "expected template-auto-action to be declared in manifest");
  assert.equal(autoAction.lifecycle, "auto-run");

  const draftAction = manifest.actions.find((entry) => entry.id === "template-draft-action");
  assert.ok(draftAction, "expected template-draft-action to be declared in manifest");
  assert.equal(draftAction.lifecycle, "draft");
  assert.equal(draftAction.uiEntry, "actions/template-draft-action/index.html");
});

test("package declares only the template build dependencies", () => {
  const packageJSON = JSON.parse(
    fs.readFileSync(path.resolve(projectRoot, "package.json"), "utf8")
  );

  assert.equal(packageJSON.name, "@pasty/template-plugin");
  assert.ok(packageJSON.dependencies.vue, "expected vue dependency");
  assert.equal(packageJSON.dependencies.gridjs, undefined);
  assert.equal(packageJSON.dependencies.luxon, undefined);
  assert.equal(packageJSON.dependencies.yaml, undefined);
});

test("runtime setup registers template handlers", () => {
  const pluginDefinition = require(path.resolve(projectRoot, "src/runtime/index.js"));
  const runtime = pluginDefinition.setup({});

  assert.ok(runtime.detectors["template-detector"], "expected template-detector runtime handler");
  assert.ok(
    runtime.attachmentRenderers["template-renderer"],
    "expected template-renderer runtime handler"
  );
  assert.ok(runtime.actions["template-auto-action"], "expected template-auto-action runtime handler");
  assert.ok(
    runtime.actions["template-draft-action"],
    "expected template-draft-action runtime handler"
  );
});

test("template source files exist in runtime and ui trees", () => {
  const requiredPaths = [
    "src/runtime/shared/templateAttachmentPayload.js",
    "src/runtime/detectors/templateDetector.js",
    "src/runtime/renderers/templateRenderer.js",
    "src/runtime/actions/templateAutoAction.js",
    "src/runtime/actions/templateDraftAction.js",
    "src/ui/AttachmentTemplateApp.vue",
    "src/ui/DraftActionTemplateApp.vue",
    "src/ui/renderers/template-renderer/index.html",
    "src/ui/renderers/template-renderer/main.js",
    "src/ui/actions/template-draft-action/index.html",
    "src/ui/actions/template-draft-action/main.js"
  ];

  for (const relativePath of requiredPaths) {
    assert.ok(
      fs.existsSync(path.resolve(projectRoot, relativePath)),
      `expected ${relativePath} to exist`
    );
  }
});

test("template detector emits preview attachment for text input", async () => {
  const { detectTemplateAttachment } = require(path.resolve(
    projectRoot,
    "src/runtime/detectors/templateDetector.js"
  ));

  const artifacts = await detectTemplateAttachment({
    content: {
      kind: "text",
      payload: {
        text: "Template plugin headline\nSecond line\nThird line"
      }
    }
  });

  assert.equal(artifacts.length, 1);
  assert.equal(artifacts[0].attachmentType, "plugin.template.full.preview");

  const payload = JSON.parse(artifacts[0].payloadJson);
  assert.equal(payload.kind, "template_preview");
  assert.equal(payload.title, "Template plugin headline");
  assert.equal(payload.metadata.lineCount, 3);
  assert.equal(payload.metadata.characterCount, 47);
});

test("template renderer resolves buttons and copies payload json", async () => {
  const { resolveAttachment, invokeOperation } = require(path.resolve(
    projectRoot,
    "src/runtime/renderers/templateRenderer.js"
  ));

  const payloadJson = JSON.stringify({
    kind: "template_preview",
    title: "Template plugin headline",
    summary: "Second line",
    sourceText: "Template plugin headline\nSecond line",
    metadata: {
      lineCount: 2,
      characterCount: 36
    }
  });
  const attachment = { payloadJson };
  const resolved = resolveAttachment({ attachment });

  assert.equal(resolved.displayName, "Template Preview · Template plugin headline");
  assert.deepEqual(
    resolved.buttons.map((entry) => entry.id),
    ["copy-json", "copy-summary"]
  );

  let copiedText = null;
  const output = await invokeOperation(
    {
      attachment,
      buttonID: "copy-json"
    },
    {
      host: {
        clipboard: {
          async copyText(value) {
            copiedText = value;
          }
        }
      }
    }
  );

  assert.equal(output.success, true);
  assert.equal(output.userMessage, "Template payload copied");
  assert.match(copiedText, /"kind": "template_preview"/);
});

test("template draft action applies tags and pin state", async () => {
  const { createTemplateDraftAction } = require(path.resolve(
    projectRoot,
    "src/runtime/actions/templateDraftAction.js"
  ));

  const action = createTemplateDraftAction();
  const session = await action.resolveSession({
    item: {
      text: "Draft action example",
      tags: ["existing"]
    }
  });

  assert.deepEqual(
    session.buttons.map((entry) => entry.id),
    ["apply-template", "apply-and-pin"]
  );
  assert.equal(session.initialDraft.templateTag, "template-plugin");

  let appliedTags = null;
  let pinnedValue = null;

  const result = await action.invokeOperation(
    {
      item: {
        text: "Draft action example",
        tags: ["existing"]
      },
      draft: {
        templateTag: "release-note",
        shouldPin: true
      },
      buttonID: "apply-and-pin"
    },
    {
      host: {
        capabilities: {
          canSetTags: true,
          canSetPinned: true
        },
        item: {
          async setTags(nextTags) {
            appliedTags = nextTags;
          },
          async setPinned(nextPinned) {
            pinnedValue = nextPinned;
          }
        }
      }
    }
  );

  assert.equal(result.result.resultKind, "none");
  assert.equal(result.userMessage, "Template metadata applied and pinned");
  assert.deepEqual(appliedTags, ["existing", "template-plugin", "release-note"]);
  assert.equal(pinnedValue, true);
});
