const NUMBER_FORMATTER = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 6,
  useGrouping: false,
});

export const DEFAULT_VALUES = Object.freeze({
  mau: 10_000_000,
  dau: 5_000_000,
  percentage: 50,
});

export const DEFAULT_OPERATION_VALUES = Object.freeze({
  operationsPerDau: 1,
  dauPercentage: 100,
  peakMultiplier: 2,
});

export const DEFAULT_BANDWIDTH_VALUES = Object.freeze({
  dataBytes: 1024,
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

export function calculateOperation(dau, operationValues) {
  if (!isPositiveNumber(dau)) {
    return { error: "DAU must be a positive number." };
  }

  if (!Number.isFinite(operationValues.operationsPerDau) || operationValues.operationsPerDau < 0) {
    return { error: "Operations per DAU per day must be zero or greater." };
  }

  if (!Number.isFinite(operationValues.dauPercentage)
    || operationValues.dauPercentage < 0
    || operationValues.dauPercentage > 100) {
    return { error: "DAU percentage for an operation must be between 0 and 100." };
  }

  const peakMultiplier = operationValues.peakMultiplier ?? DEFAULT_OPERATION_VALUES.peakMultiplier;
  if (!isPositiveNumber(peakMultiplier)) {
    return { error: "Peak multiplier must be greater than 0." };
  }

  const participatingDau = dau * operationValues.dauPercentage / 100;
  const qpd = participatingDau * operationValues.operationsPerDau;

  const qps = qpd / 86_400;
  return { qpd, qps, peakQps: qps * peakMultiplier, error: null };
}

export function updateOperation(dau, operationValues, changedField, rawValue) {
  const value = Number(rawValue);
  if (!Number.isFinite(value) || value < 0) {
    return { error: "Operation values must be zero or greater." };
  }

  const next = { ...operationValues, [changedField]: value };
  if (!Number.isFinite(next.dauPercentage)
    || next.dauPercentage < 0
    || next.dauPercentage > 100) {
    return { error: "DAU percentage for an operation must be between 0 and 100." };
  }

  const participatingDau = dau * next.dauPercentage / 100;
  if (changedField === "qpd") {
    if (participatingDau === 0 && value > 0) {
      return { error: "DAU percentage must be greater than 0 for a positive QPD." };
    }
    next.operationsPerDau = participatingDau === 0 ? 0 : value / participatingDau;
  } else if (changedField === "qps") {
    if (participatingDau === 0 && value > 0) {
      return { error: "DAU percentage must be greater than 0 for a positive QPS." };
    }
    next.operationsPerDau = participatingDau === 0 ? 0 : value * 86_400 / participatingDau;
  } else if (changedField === "peakQps") {
    const { qps } = calculateOperation(dau, next);
    if (qps === 0 && value > 0) {
      return { error: "QPS must be greater than 0 for a positive peak QPS." };
    }
    if (qps > 0) {
      next.peakMultiplier = value / qps;
    }
  } else if (changedField === "peakMultiplier") {
    if (!isPositiveNumber(value)) {
      return { error: "Peak multiplier must be greater than 0." };
    }
  } else if (changedField !== "operationsPerDau" && changedField !== "dauPercentage") {
    throw new Error(`Unknown operation field: ${changedField}`);
  }

  const result = calculateOperation(dau, next);
  return { values: next, ...result };
}

export function calculateBandwidth(qpd, bandwidthValues) {
  if (!Number.isFinite(qpd) || qpd < 0) {
    return { error: "QPD must be zero or greater." };
  }

  if (!Number.isFinite(bandwidthValues.dataBytes) || bandwidthValues.dataBytes < 0) {
    return { error: "Data bytes per operation must be zero or greater." };
  }

  const bytesPerDay = qpd * bandwidthValues.dataBytes;
  return { bytesPerDay, bytesPerSecond: bytesPerDay / 86_400, error: null };
}

export function updateBandwidth(qpd, bandwidthValues, changedField, rawValue) {
  const value = Number(rawValue);
  if (!Number.isFinite(value) || value < 0) {
    return { error: "Bandwidth values must be zero or greater." };
  }

  const next = { ...bandwidthValues, [changedField]: value };
  if (changedField === "bytesPerDay" || changedField === "bytesPerSecond") {
    const bytesPerDay = changedField === "bytesPerSecond" ? value * 86_400 : value;
    if (qpd === 0 && bytesPerDay > 0) {
      return { error: "QPD must be greater than 0 for a positive bandwidth." };
    }
    next.dataBytes = qpd === 0 ? 0 : bytesPerDay / qpd;
  } else if (changedField !== "dataBytes") {
    throw new Error(`Unknown bandwidth field: ${changedField}`);
  }

  const result = calculateBandwidth(qpd, next);
  return { values: next, ...result };
}

export function formatValue(value) {
  return Number.isFinite(value) ? NUMBER_FORMATTER.format(value) : "";
}
