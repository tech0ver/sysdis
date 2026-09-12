import {
  DEFAULT_OPERATION_VALUES,
  DEFAULT_BANDWIDTH_VALUES,
  DEFAULT_STORAGE_VALUES,
  DEFAULT_VALUES,
  calculateBandwidth,
  calculateOperation,
  calculateStorage,
  formatValue,
  updateBandwidth,
  updateOperation,
  updateStorage,
  updateValues,
} from "./calculator.js";

const form = document.querySelector("#calculator");
const message = document.querySelector("#validation-message");
const baseFields = Object.fromEntries(
  ["mau", "dau", "percentage"].map((name) => [name, form.elements.namedItem(name)]),
);
const operationFields = [...document.querySelectorAll("[data-operation]")].map((section) => ({
  name: section.dataset.operation,
  fields: Object.fromEntries(
    ["operationsPerDau", "dauPercentage", "qpd", "qps", "peakMultiplier", "peakQps"].map((property) => [
      property,
      section.querySelector(`[data-property="${property}"]`),
    ]),
  ),
  bandwidthFields: Object.fromEntries(
    ["dataBytes", "bytesPerDay", "bytesPerSecond"].map((property) => [
      property,
      section.querySelector(`[data-bandwidth-property="${property}"]`),
    ]),
  ),
  storageFields: section.dataset.operation === "write" ? Object.fromEntries(
    ["storedBytes", "newDataPercentage", "retentionDays", "compressionFactor", "replicationFactor", "overheadFactor", "logicalBytes", "physicalBytes"].map((property) => [
      property,
      section.querySelector(`[data-storage-property="${property}"]`),
    ]),
  ) : null,
}));

let values = { ...DEFAULT_VALUES };
const operations = Object.fromEntries(
  operationFields.map(({ name }) => [name, { ...DEFAULT_OPERATION_VALUES }]),
);
const bandwidths = Object.fromEntries(
  operationFields.map(({ name }) => [name, { ...DEFAULT_BANDWIDTH_VALUES }]),
);
const storages = Object.fromEntries(
  operationFields
    .filter(({ storageFields }) => storageFields)
    .map(({ name }) => [name, { ...DEFAULT_STORAGE_VALUES }]),
);

function render(error = null) {
  for (const [name, field] of Object.entries(baseFields)) {
    field.value = formatValue(values[name]);
    field.setAttribute("aria-invalid", String(Boolean(error)));
  }

  for (const operation of operationFields) {
    const operationValues = operations[operation.name];
    const result = calculateOperation(values.dau, operationValues);
    for (const [property, field] of Object.entries(operation.fields)) {
      field.value = formatValue(property === "qpd" ? result.qpd
        : property === "qps" ? result.qps
          : property === "peakQps" ? result.peakQps
          : operationValues[property]);
      field.setAttribute("aria-invalid", String(Boolean(error)));
    }

    const bandwidthValues = bandwidths[operation.name];
    const bandwidth = calculateBandwidth(result.qpd, bandwidthValues);
    for (const [property, field] of Object.entries(operation.bandwidthFields)) {
      field.value = formatValue(property === "bytesPerDay" ? bandwidth.bytesPerDay
        : property === "bytesPerSecond" ? bandwidth.bytesPerSecond
          : bandwidthValues[property]);
      field.setAttribute("aria-invalid", String(Boolean(error)));
    }

    if (operation.storageFields) {
      const storageValues = storages[operation.name];
      const storage = calculateStorage(result.qpd, storageValues);
      for (const [property, field] of Object.entries(operation.storageFields)) {
        field.value = formatValue(property === "logicalBytes" ? storage.logicalBytes
          : property === "physicalBytes" ? storage.physicalBytes
            : storageValues[property]);
        field.setAttribute("aria-invalid", String(Boolean(error)));
      }
    }
  }

  message.textContent = error ?? "";
}

for (const field of Object.values(baseFields)) {
  field.addEventListener("change", (event) => {
    const result = updateValues(values, event.target.name, event.target.value);
    if (result.error) {
      message.textContent = result.error;
      event.target.setAttribute("aria-invalid", "true");
      return;
    }

    values = result.values;
    render();
  });
}

for (const operation of operationFields) {
  for (const [property, field] of Object.entries(operation.fields)) {
    field.addEventListener("change", (event) => {
      const result = updateOperation(values.dau, operations[operation.name], property, event.target.value);
      if (result.error) {
        message.textContent = result.error;
        event.target.setAttribute("aria-invalid", "true");
        return;
      }

      operations[operation.name] = result.values;
      render();
    });
  }

  for (const [property, field] of Object.entries(operation.bandwidthFields)) {
    field.addEventListener("change", (event) => {
      const qpd = calculateOperation(values.dau, operations[operation.name]).qpd;
      const result = updateBandwidth(qpd, bandwidths[operation.name], property, event.target.value);
      if (result.error) {
        message.textContent = result.error;
        event.target.setAttribute("aria-invalid", "true");
        return;
      }

      bandwidths[operation.name] = result.values;
      render();
    });
  }

  if (operation.storageFields) {
    for (const [property, field] of Object.entries(operation.storageFields)) {
      field.addEventListener("change", (event) => {
        const writeQpd = calculateOperation(values.dau, operations[operation.name]).qpd;
        const result = updateStorage(writeQpd, storages[operation.name], property, event.target.value);
        if (result.error) {
          message.textContent = result.error;
          event.target.setAttribute("aria-invalid", "true");
          return;
        }

        storages[operation.name] = result.values;
        render();
      });
    }
  }
}

render();
