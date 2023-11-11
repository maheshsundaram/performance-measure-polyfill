import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.206.0/assert/mod.ts";
import { performanceMeasurePolyfill } from "./measure.ts";

const cleanup = () => {
  performance.clearMarks();
  performance.clearMeasures();
};

Deno.test(
  "1. If startOrMeasureOptions is a PerformanceMeasureOptions object and at least one of start, end, duration, and detail exist, run the following checks:",
  async (t) => {
    await t.step(
      "1.1. If endMark is given, throw a TypeError. ",
      () => {
        assertThrows(
          () =>
            performanceMeasurePolyfill("measure", {
              start: "start",
              end: "end",
              duration: 100,
            }, "end"),
          TypeError,
          "If startOrMeasureOptions is an object, endMark cannot be provided.",
        );
        cleanup();
      },
    );

    await t.step(
      "1.2. If startOrMeasureOptions's start and end members are both omitted, throw a TypeError.",
      () => {
        assertThrows(
          () => performanceMeasurePolyfill("measure", {}),
          TypeError,
          "Invalid startOrMeasureOptions.",
        );
        cleanup();
      },
    );

    await t.step(
      "1.3. If startOrMeasureOptions's start, duration, and end members all exist, throw a TypeError.",
      () => {
        assertThrows(
          () =>
            performanceMeasurePolyfill("measure", {
              start: "start",
              duration: 100,
              end: "end",
            }),
          TypeError,
          "Invalid startOrMeasureOptions.",
        );
        cleanup();
      },
    );
  },
);

Deno.test(
  "2. Compute end time as follows:",
  async (t) => {
    await t.step(
      "2.2. Otherwise, if startOrMeasureOptions is a PerformanceMeasureOptions object, and if its end member exists, let end time be the value returned by running the convert a mark to a timestamp algorithm passing in startOrMeasureOptions's end.",
      () => {
        const start = performance.mark("start");
        const end = performance.mark("end");
        const { duration } = performanceMeasurePolyfill("measure", {
          start: "start",
          end: "end",
        });
        assertEquals(duration, end.startTime - start.startTime);
        cleanup();
      },
    );

    await t.step(
      "2.3. Otherwise, if startOrMeasureOptions is a PerformanceMeasureOptions object, and if its start and duration members both exist",
      () => {
        performance.mark("start");
        const { duration } = performanceMeasurePolyfill("measure", {
          start: "start",
          duration: 100,
        });
        assertEquals(duration, 100);
      },
    );

    await t.step(
      "2.4. Otherwise, let end time be the value that would be returned by the Performance object's now() method",
      () => {
        // TODO
        cleanup();
      },
    );
  },
);

Deno.test(
  "3. Compute start time as follows:",
  async (t) => {
    await t.step(
      "3.1. If startOrMeasureOptions is a PerformanceMeasureOptions object, and if its start member exists, let start time be the value returned by running the convert a mark to a timestamp algorithm passing in startOrMeasureOptions's start",
      () => {
        const start = performance.mark("start");
        const { startTime } = performanceMeasurePolyfill("measure", {
          start: "start",
        });
        assertEquals(start.startTime, startTime);
        cleanup();
      },
    );

    await t.step(
      "3.2. Otherwise, if startOrMeasureOptions is a PerformanceMeasureOptions object, and if its duration and end members both exist",
      () => {
        const end = performance.mark("end");
        const duration = 100;
        const { startTime } = performanceMeasurePolyfill("measure", {
          end: "end",
          duration,
        });
        assertEquals(end.startTime - duration, startTime);
      },
    );

    await t.step(
      "3.3. Otherwise, if startOrMeasureOptions is a DOMString, let start time be the value returned by running the convert a mark to a timestamp algorithm passing in startOrMeasureOptions",
      () => {
        const start = performance.mark("start");
        const { startTime } = performanceMeasurePolyfill("measure", "start");
        assertEquals(start.startTime, startTime);
        cleanup();
      },
    );

    await t.step(
      "3.4. Otherwise, let start time be 0",
      () => {
        const { startTime } = performanceMeasurePolyfill("measure");
        assertEquals(startTime, 0);
        cleanup();
      },
    );
  },
);

Deno.test(
  "4. Create a new PerformanceMeasure object (entry) with this's relevant realm.",
  async (t) => {
    const start = performance.mark("start");
    const end = performance.mark("end");
    const entry = performanceMeasurePolyfill("measure", {
      start: "start",
      end: "end",
    });

    await t.step(
      "5. Set entry's name attribute to measureName.",
      () => assertEquals(entry.name, "measure"),
    );

    await t.step(
      `6. Set entry's entryType attribute to DOMString "measure"`,
      () => assertEquals(entry.entryType, "measure"),
    );

    await t.step(
      "7. Set entry's startTime attribute to start time.",
      () => assertEquals(entry.startTime, start.startTime),
    );

    await t.step(
      "8. Set entry's duration attribute to the duration from start time to end time. The resulting duration value MAY be negative.",
      () => assertEquals(entry.duration, end.startTime - start.startTime),
    );

    await t.step(
      "9. Set entry's detail attribute as follows:",
      () => assertEquals(entry.detail, null),
    );

    await t.step(
      "toJSON",
      () => {
        assertEquals(entry.toJSON(), {
          name: "measure",
          entryType: "measure",
          startTime: start.startTime,
          duration: end.startTime - start.startTime,
          detail: null,
        });
      },
    );

    cleanup();
  },
);
