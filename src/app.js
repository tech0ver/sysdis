import { DEFAULT_VALUES, formatValue, updateValues } from "./calculator.js";

const form = document.querySelector("#calculator");
const message = document.querySelector("#validation-message");
const fields = Object.fromEntries(
  [...form.elements]
    .filter((element) => element instanceof HTMLInputElement)
    .map((element) => [element.name, element]),
);

let values = { ...DEFAULT_VALUES };

function render(nextValues, error) {
  for (const [name, field] of Object.entries(fields)) {
    field.value = formatValue(nextValues[name]);
    field.setAttribute("aria-invalid", String(Boolean(error)));
  }

  message.textContent = error ?? "";
}

for (const field of Object.values(fields)) {
  field.addEventListener("change", (event) => {
    const { values: nextValues, error } = updateValues(values, event.target.name, event.target.value);
    if (error) {
      message.textContent = error;
      event.target.setAttribute("aria-invalid", "true");
      return;
    }

    values = nextValues;
    render(values, null);
  });
}

render(values, null);
