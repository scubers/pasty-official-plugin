const {
  buildTemplateAttachmentKey,
  createTemplateAttachmentPayload
} = require("../shared/templateAttachmentPayload");

async function detectTemplateAttachment(input) {
  if (input?.content?.kind !== "text") {
    return [];
  }

  const payload = createTemplateAttachmentPayload(input?.content?.payload?.text ?? "");
  if (!payload) {
    return [];
  }

  return [
    {
      attachmentType: "plugin.template.full.preview",
      attachmentKey: buildTemplateAttachmentKey(payload),
      payloadJson: JSON.stringify(payload),
      attachmentSyncScope: "syncable"
    }
  ];
}

function createTemplateDetector() {
  return {
    async detect(input) {
      return {
        artifacts: await detectTemplateAttachment(input)
      };
    }
  };
}

module.exports = {
  createTemplateDetector,
  detectTemplateAttachment
};
