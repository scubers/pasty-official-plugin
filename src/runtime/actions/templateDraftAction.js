const { actionResult } = require("../sdk/results/actionResult");

function normalizeTag(value) {
  return String(value?.stringValue || value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolveInitialTitle(item) {
  const firstLine = String(item?.text || "")
    .split(/\r?\n/, 1)[0]
    .trim();
  return firstLine || "Template draft title";
}

function buildTags(item, draft) {
  return Array.from(
    new Set([
      ...(Array.isArray(item?.tags) ? item.tags : []),
      "template-plugin",
      normalizeTag(draft?.templateTag)
    ].filter(Boolean))
  );
}

function createTemplateDraftAction() {
  return {
    async resolveSession(input) {
      const item = input?.item || {};
      return {
        displayName: "Template Draft Action",
        buttons: [
          { id: "apply-template", title: "Apply Template", isEnabled: true },
          { id: "apply-and-pin", title: "Apply + Pin", isEnabled: true }
        ],
        defaultButtonID: "apply-template",
        initialDraft: {
          title: resolveInitialTitle(item),
          templateTag: "template-plugin",
          shouldPin: false,
          note: ""
        }
      };
    },

    async invokeOperation(input, ctx) {
      const trigger = input?.buttonID || "apply-template";
      const host = ctx?.host || {};
      const draft = input?.draft || {};
      const tags = buildTags(input?.item || {}, draft);

      if (!host.capabilities?.canSetTags) {
        return actionResult.none({ userMessage: "Tag capability unavailable" });
      }

      await host.item.setTags(tags);

      const shouldPin = trigger === "apply-and-pin" || Boolean(draft?.shouldPin);
      if (shouldPin && host.capabilities?.canSetPinned) {
        await host.item.setPinned(true);
      }

      return actionResult.none({
        userMessage: shouldPin
          ? "Template metadata applied and pinned"
          : "Template metadata applied"
      });
    }
  };
}

module.exports = {
  createTemplateDraftAction
};
