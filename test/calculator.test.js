import assert from "node:assert/strict";
import test from "node:test";

import { DEFAULT_VALUES, formatValue, updateValues, validate } from "../src/calculator.js";

test("changing MAU preserves percentage and recalculates DAU", () => {
  const result = updateValues(DEFAULT_VALUES, "mau", 2400);

  assert.equal(result.error, null);
  assert.deepEqual(result.values, { mau: 2400, dau: 1200, percentage: 50 });
});

test("changing percentage preserves MAU and recalculates DAU", () => {
  const result = updateValues(DEFAULT_VALUES, "percentage", 80);

  assert.equal(result.error, null);
  assert.deepEqual(result.values, { mau: 1000, dau: 800, percentage: 80 });
});

test("changing DAU preserves MAU and recalculates percentage", () => {
  const result = updateValues(DEFAULT_VALUES, "dau", 250);

  assert.equal(result.error, null);
  assert.deepEqual(result.values, { mau: 1000, dau: 250, percentage: 25 });
});

test("100 percent is valid", () => {
  const result = updateValues(DEFAULT_VALUES, "percentage", 100);

  assert.equal(result.error, null);
  assert.deepEqual(result.values, { mau: 1000, dau: 1000, percentage: 100 });
});

test("rejects non-positive values and values over 100 percent", () => {
  assert.match(validate({ mau: 1000, dau: 0, percentage: 50 }), /DAU/);
  assert.match(validate({ mau: 1000, dau: 1000, percentage: 100.01 }), /at most 100/);
});

test("formats decimal display values without grouping", () => {
  assert.equal(formatValue(33.3333333333), "33.333333");
});
