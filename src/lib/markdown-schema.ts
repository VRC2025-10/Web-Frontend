import { defaultSchema } from "rehype-sanitize";

export const MARKDOWN_SANITIZE_SCHEMA = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "img",
    "input",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "del",
    "hr",
    "dl",
    "dt",
    "dd",
  ],
  attributes: {
    ...(defaultSchema.attributes ?? {}),
    a: [...(defaultSchema.attributes?.a ?? []), "href", "title"],
    img: ["src", "alt", "title"],
    input: ["type", "checked", "disabled"],
    th: ["align"],
    td: ["align"],
  },
  protocols: {
    ...(defaultSchema.protocols ?? {}),
    href: ["https"],
    src: ["https"],
    cite: ["https"],
  },
};