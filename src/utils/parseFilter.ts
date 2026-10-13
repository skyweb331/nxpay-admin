import type { GridFilterModel } from "@mui/x-data-grid";

type Filter = Record<string, unknown>;

/** MUI X operator -> backend filter operator (see nxpay-backend queryArgs.ts). */
function toCondition(operator: string, value: unknown): unknown {
  switch (operator) {
    case "contains":
      return { contains: value };
    case "startsWith":
      return { startsWith: value };
    case "endsWith":
      return { endsWith: value };
    case "equals":
    case "is":
    case "=":
      return value;
    case "not":
    case "!=":
      return { ne: value };
    case ">":
    case "after":
      return { gt: value };
    case ">=":
    case "onOrAfter":
      return { gte: value };
    case "<":
    case "before":
      return { lt: value };
    case "<=":
    case "onOrBefore":
      return { lte: value };
    case "isAnyOf":
      return { in: value };
    default:
      return undefined;
  }
}

/** limelite's parseFilterModel, for MUI X DataGrid filter models. */
export function parseFilterModel(model?: GridFilterModel): Filter | undefined {
  if (!model?.items?.length) return undefined;
  const conditions = model.items
    .filter((item) => item.value !== undefined && item.value !== null && item.value !== "")
    .map((item) => {
      const value = item.value instanceof Date ? item.value.toISOString() : item.value;
      const condition = toCondition(item.operator, value);
      return condition === undefined ? null : { [item.field]: condition };
    })
    .filter(Boolean) as Filter[];
  if (!conditions.length) return undefined;
  if (conditions.length === 1) return conditions[0];
  return model.logicOperator === "or" ? { OR: conditions } : { AND: conditions };
}

/** Grid filter AND a fixed scope (customer tab, failed-payout queue). */
export function andFilter(...filters: (Filter | undefined)[]): Filter | undefined {
  const present = filters.filter((f): f is Filter => !!f && Object.keys(f).length > 0);
  if (!present.length) return undefined;
  return present.length === 1 ? present[0] : { AND: present };
}
