const NUMBER_FORMATTER = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 6,
  useGrouping: false,
});

export const DEFAULT_VALUES = Object.freeze({
  mau: 1000,
  dau: 500,
  percentage: 50,
});

function isPositiveNumber(value) {
  return Number.isFinite(value) && value > 0;
}

export function validate(values) {
  if (!isPositiveNumber(values.mau)) {
    return "MAU must be a positive number.";
  }

  if (!isPositiveNumber(values.dau)) {
    return "DAU must be a positive number.";
  }

  if (!isPositiveNumber(values.percentage) || values.percentage > 100) {
    return "Active users percentage must be greater than 0 and at most 100.";
  }

  if (values.dau > values.mau) {
    return "DAU cannot be greater than MAU.";
  }

  return null;
}

export function updateValues(values, changedField, rawValue) {
  const value = Number(rawValue);
  const next = { ...values, [changedField]: value };

  if (!Number.isFinite(value)) {
    return { values: next, error: `${changedField.toUpperCase()} must be a number.` };
  }

  if (changedField === "mau") {
    next.dau = next.mau * next.percentage / 100;
  } else if (changedField === "dau") {
    next.percentage = next.dau / next.mau * 100;
  } else if (changedField === "percentage") {
    next.dau = next.mau * next.percentage / 100;
  } else {
    throw new Error(`Unknown field: ${changedField}`);
  }

  return { values: next, error: validate(next) };
}

export function formatValue(value) {
  return Number.isFinite(value) ? NUMBER_FORMATTER.format(value) : "";
}
