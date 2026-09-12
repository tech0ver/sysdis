import {
  DEFAULT_OPERATION_VALUES,
  DEFAULT_VALUES,
  calculateOperation,
  formatValue,
  updateOperation,
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
}));

let values = { ...DEFAULT_VALUES };
const operations = Object.fromEntries(
  operationFields.map(({ name }) => [name, { ...DEFAULT_OPERATION_VALUES }]),
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
}

render();
