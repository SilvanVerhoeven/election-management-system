export const templateTypes = {
  Results: "results",
  Config: "config",
} as const

export type TemplateTypes = typeof templateTypes[keyof typeof templateTypes];
