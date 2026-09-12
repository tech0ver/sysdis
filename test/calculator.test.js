import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_VALUES,
  calculateBandwidth,
  calculateStorage,
  calculateOperation,
  formatValue,
  updateOperation,
  updateBandwidth,
  updateStorage,
  updateValues,
  validate,
} from "../src/calculator.js";

test("changing MAU preserves percentage and recalculates DAU", () => {
  const result = updateValues(DEFAULT_VALUES, "mau", 2400);

  assert.equal(result.error, null);
  assert.deepEqual(result.values, { mau: 2400, dau: 1200, percentage: 50 });
});

test("changing percentage preserves MAU and recalculates DAU", () => {
  const result = updateValues(DEFAULT_VALUES, "percentage", 80);

  assert.equal(result.error, null);
  assert.deepEqual(result.values, { mau: 10_000_000, dau: 8_000_000, percentage: 80 });
});

test("changing DAU preserves MAU and recalculates percentage", () => {
  const result = updateValues(DEFAULT_VALUES, "dau", 250);

  assert.equal(result.error, null);
  assert.deepEqual(result.values, { mau: 10_000_000, dau: 250, percentage: 0.0025 });
});

test("100 percent is valid", () => {
  const result = updateValues(DEFAULT_VALUES, "percentage", 100);

  assert.equal(result.error, null);
  assert.deepEqual(result.values, { mau: 10_000_000, dau: 10_000_000, percentage: 100 });
});

test("rejects non-positive values and values over 100 percent", () => {
  assert.match(validate({ mau: 1000, dau: 0, percentage: 50 }), /DAU/);
  assert.match(validate({ mau: 1000, dau: 1000, percentage: 100.01 }), /at most 100/);
});

test("formats decimal display values without grouping", () => {
  assert.equal(formatValue(33.3333333333), "33.333333");
});

test("calculates QPD and QPS for a percentage of DAU", () => {
  const result = calculateOperation(500, { operationsPerDau: 12, dauPercentage: 25 });

  assert.equal(result.error, null);
  assert.equal(result.qpd, 1500);
  assert.equal(result.qps, 1500 / 86_400);
});

test("allows zero operations and zero participating DAU", () => {
  assert.deepEqual(calculateOperation(500, { operationsPerDau: 0, dauPercentage: 100 }), {
    qpd: 0,
    qps: 0,
    peakQps: 0,
    error: null,
  });
  assert.deepEqual(calculateOperation(500, { operationsPerDau: 5, dauPercentage: 0 }), {
    qpd: 0,
    qps: 0,
    peakQps: 0,
    error: null,
  });
});

test("rejects invalid operation values", () => {
  assert.match(calculateOperation(500, { operationsPerDau: -1, dauPercentage: 50 }).error, /zero or greater/);
  assert.match(calculateOperation(500, { operationsPerDau: 1, dauPercentage: 101 }).error, /between 0 and 100/);
});

test("changing QPD derives queries per user per day and QPS", () => {
  const result = updateOperation(500, { operationsPerDau: 1, dauPercentage: 100 }, "qpd", 100_000);

  assert.equal(result.error, null);
  assert.equal(result.values.operationsPerDau, 200);
  assert.equal(result.qpd, 100_000);
  assert.equal(result.qps, 100_000 / 86_400);
});

test("changing QPS derives queries per user per day and QPD", () => {
  const result = updateOperation(500, { operationsPerDau: 1, dauPercentage: 100 }, "qps", 2);

  assert.equal(result.error, null);
  assert.equal(result.values.operationsPerDau, 345.6);
  assert.equal(result.qpd, 172_800);
  assert.equal(result.qps, 2);
});

test("changing operation DAU percentage preserves per-user daily queries", () => {
  const result = updateOperation(500, { operationsPerDau: 10, dauPercentage: 100 }, "dauPercentage", 20);

  assert.equal(result.error, null);
  assert.equal(result.values.operationsPerDau, 10);
  assert.equal(result.qpd, 1000);
  assert.equal(result.qps, 1000 / 86_400);
});

test("changing peak multiplier derives peak QPS", () => {
  const result = updateOperation(500, { operationsPerDau: 10, dauPercentage: 100, peakMultiplier: 2 }, "peakMultiplier", 3);

  assert.equal(result.error, null);
  assert.equal(result.qps, 5000 / 86_400);
  assert.equal(result.peakQps, 15_000 / 86_400);
});

test("changing peak QPS derives peak multiplier", () => {
  const result = updateOperation(500, { operationsPerDau: 10, dauPercentage: 100, peakMultiplier: 2 }, "peakQps", 1);

  assert.equal(result.error, null);
  assert.equal(result.qps, 5000 / 86_400);
  assert.equal(result.values.peakMultiplier, 86_400 / 5000);
  assert.equal(result.peakQps, 1);
});

test("calculates bandwidth from QPD and response bytes", () => {
  const result = calculateBandwidth(100_000, { dataBytes: 1024 });

  assert.equal(result.error, null);
  assert.equal(result.bytesPerDay, 102_400_000);
  assert.equal(result.bytesPerSecond, 102_400_000 / 86_400);
});

test("changing bytes per day derives data bytes and bytes per second", () => {
  const result = updateBandwidth(100_000, { dataBytes: 1024 }, "bytesPerDay", 200_000_000);

  assert.equal(result.error, null);
  assert.equal(result.values.dataBytes, 2000);
  assert.equal(result.bytesPerSecond, 200_000_000 / 86_400);
});

test("changing bytes per second derives data bytes and bytes per day", () => {
  const result = updateBandwidth(100_000, { dataBytes: 1024 }, "bytesPerSecond", 5000);

  assert.equal(result.error, null);
  assert.equal(result.values.dataBytes, 4320);
  assert.equal(result.bytesPerDay, 432_000_000);
});

test("calculates physical storage from the new-data portion of write QPD", () => {
  const result = calculateStorage(100_000, {
    storedBytes: 1024,
    newDataPercentage: 50,
    retentionDays: 365,
    compressionFactor: 1,
    replicationFactor: 3,
    overheadFactor: 1.2,
  });

  assert.equal(result.error, null);
  assert.equal(result.logicalBytes, 100_000 * 0.5 * 1024 * 365);
  assert.equal(result.physicalBytes, result.logicalBytes * 3 * 1.2);
});

test("changing physical storage derives stored bytes per new write", () => {
  const result = updateStorage(100_000, {
    storedBytes: 1024,
    newDataPercentage: 100,
    retentionDays: 10,
    compressionFactor: 1,
    replicationFactor: 2,
    overheadFactor: 1,
  }, "physicalBytes", 4_000_000_000);

  assert.equal(result.error, null);
  assert.equal(result.values.storedBytes, 2000);
  assert.equal(result.logicalBytes, 2_000_000_000);
  assert.equal(result.physicalBytes, 4_000_000_000);
});
