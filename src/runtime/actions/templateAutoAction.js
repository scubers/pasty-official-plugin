const { actionResult } = require("../sdk/results/actionResult");

function summarizeText(text) {
  const normalized = String(text || "").trim();
  if (!normalized) {
    return "Template auto action received empty text.";
  }

  const [firstLine, secondLine] = normalized.split(/\r?\n/);
  return [
    "Template Auto Action",
    `Title: ${firstLine || "Untitled"}`,
    `Summary: ${secondLine || "Add your domain-specific output here."}`
  ].join("\n");
}

function createTemplateAutoAction() {
  return {
    async resolveSession() {
      return {
        displayName: "Template Auto Action",
        buttons: [],
        defaultButtonID: null,
        initialDraft: {}
      };
    },

    async invokeOperation(input) {
      const summary = summarizeText(input?.item?.text || "");
      return actionResult.text(summary, {
        userMessage: "Template summary ready"
      });
    }
  };
}

module.exports = {
  createTemplateAutoAction
};
