export function formatXml(xmlString: string): string {
  if (!xmlString || typeof xmlString !== "string") return xmlString;

  try {
    const cleanXml = xmlString.replace(/>\s+</g, "><").trim();

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(cleanXml, "application/xml");

    if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
      throw new Error("Invalid XML");
    }

    let formatted = "";
    const PADDING = "  ";

    function serialize(node: Node, level: number) {
      const indent = PADDING.repeat(level);

      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const hasChildren = element.childNodes.length > 0;
        const isTextOnly =
          hasChildren &&
          element.childNodes.length === 1 &&
          element.firstChild?.nodeType === Node.TEXT_NODE;

        formatted += `${indent}<${element.tagName}${serializeAttributes(element)}`;

        if (!hasChildren) {
          formatted += " />\n";
        } else if (isTextOnly) {
          formatted += `>${element.textContent}</${element.tagName}>\n`;
        } else {
          formatted += ">\n";
          element.childNodes.forEach((child) => serialize(child, level + 1));
          formatted += `${indent}</${element.tagName}>\n`;
        }
      } else if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) formatted += `${indent}${text}\n`;
      }
    }

    function serializeAttributes(el: Element) {
      return Array.from(el.attributes)
        .map((attr) => ` ${attr.name}="${attr.value}"`)
        .join("");
    }

    if (xmlDoc.documentElement) {
      serialize(xmlDoc.documentElement, 0);
    }

    return formatted.trim();
  } catch (e) {
    console.error("XML Format error:", e);
    return xmlString.trim();
  }
}

export function formatJson(jsonString: string): string {
  if (!jsonString || typeof jsonString !== "string") return jsonString;

  try {
    const obj = JSON.parse(jsonString);
    return JSON.stringify(obj, null, 2);
  } catch (e) {
    return jsonString.replace(/^\s+|\s+$/g, "");
  }
}
