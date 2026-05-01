const { rendererResult } = require("../sdk/results/rendererResult");
const {
  decodeTemplateAttachmentPayload,
  formatTemplateAttachmentPayload
} = require("../shared/templateAttachmentPayload");

function resolveAttachment(input) {
  const payload = decodeTemplateAttachmentPayload(input?.attachment?.payloadJson);
  if (!payload) {
    return {
      displayName: "Template Preview",
      tintHex: "#6B7280",
      buttons: [
        { id: "copy-json", title: "Copy JSON", isEnabled: false },
        { id: "copy-summary", title: "Copy Summary", isEnabled: false }
      ]
    };
  }

  return {
    displayName: `Template Preview · ${payload.title}`,
    tintHex: "#0F766E",
    buttons: [
      { id: "copy-json", title: "Copy JSON", isEnabled: true },
      { id: "copy-summary", title: "Copy Summary", isEnabled: true }
    ]
  };
}

async function invokeOperation(input, ctx) {
  const payload = decodeTemplateAttachmentPayload(input?.attachment?.payloadJson);
  if (!payload) {
    return rendererResult.failure("Invalid template payload");
  }

  if (input.buttonID === "copy-json") {
    await ctx.host.clipboard.copyText(formatTemplateAttachmentPayload(payload));
    return rendererResult.success({ userMessage: "Template payload copied" });
  }

  if (input.buttonID === "copy-summary") {
    await ctx.host.clipboard.copyText(payload.summary);
    return rendererResult.success({ userMessage: "Template summary copied" });
  }

  return rendererResult.success();
}

function createTemplateRenderer() {
  return {
    async resolveAttachment(input, ctx) {
      return resolveAttachment(input, ctx);
    },
    async invokeOperation(input, ctx) {
      return invokeOperation(input, ctx);
    }
  };
}

module.exports = {
  createTemplateRenderer,
  invokeOperation,
  resolveAttachment
};
