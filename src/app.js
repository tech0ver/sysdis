import {
  DEFAULT_OPERATION_VALUES,
  DEFAULT_VALUES,
  calculateOperation,
  formatValue,
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
    ["operationsPerDau", "dauPercentage"].map((property) => [
      property,
      section.querySelector(`[name$="${property[0].toUpperCase()}${property.slice(1)}"]`),
    ]),
  ),
  qpd: section.querySelector("output[id$='-qpd']"),
  qps: section.querySelector("output[id$='-qps']"),
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
    for (const [property, field] of Object.entries(operation.fields)) {
      field.value = formatValue(operationValues[property]);
      field.setAttribute("aria-invalid", String(Boolean(error)));
    }

    const result = calculateOperation(values.dau, operationValues);
    operation.qpd.value = result.error ? "" : formatValue(result.qpd);
    operation.qps.value = result.error ? "" : formatValue(result.qps);
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
      const next = { ...operations[operation.name], [property]: Number(event.target.value) };
      const result = calculateOperation(values.dau, next);
      if (result.error) {
        message.textContent = result.error;
        event.target.setAttribute("aria-invalid", "true");
        return;
      }

      operations[operation.name] = next;
      render();
    });
  }
}

render();
