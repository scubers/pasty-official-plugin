function normalizeText(value) {
  return String(value ?? "").replace(/\r\n/g, "\n").trim();
}

function buildTemplateAttachmentKey(payload) {
  const slug = String(payload?.title || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `template-preview-${slug || "item"}`;
}

function createTemplateAttachmentPayload(text) {
  const normalizedText = normalizeText(text);
  if (!normalizedText) {
    return null;
  }

  const lines = normalizedText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return null;
  }

  return {
    kind: "template_preview",
    title: lines[0],
    summary: lines[1] || "Replace this summary with your own renderer payload shape.",
    sourceText: normalizedText,
    metadata: {
      lineCount: lines.length,
      characterCount: normalizedText.length
    }
  };
}

function decodeTemplateAttachmentPayload(payloadJson) {
  try {
    const parsed = JSON.parse(payloadJson || "{}");
    if (
      parsed.kind !== "template_preview" ||
      typeof parsed.title !== "string" ||
      typeof parsed.summary !== "string" ||
      typeof parsed.sourceText !== "string" ||
      typeof parsed.metadata !== "object" ||
      parsed.metadata === null
    ) {
      return null;
    }

    return {
      kind: "template_preview",
      title: parsed.title,
      summary: parsed.summary,
      sourceText: parsed.sourceText,
      metadata: {
        lineCount: Number(parsed.metadata.lineCount) || 0,
        characterCount: Number(parsed.metadata.characterCount) || 0
      }
    };
  } catch {
    return null;
  }
}

function formatTemplateAttachmentPayload(payload) {
  return JSON.stringify(payload, null, 2);
}

module.exports = {
  buildTemplateAttachmentKey,
  createTemplateAttachmentPayload,
  decodeTemplateAttachmentPayload,
  formatTemplateAttachmentPayload
};
