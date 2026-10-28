import { lessons as base } from "./course";
import { foundationDetails } from "./details-foundations";
import { theoryDetails } from "./details-theory";
const details = { ...foundationDetails, ...theoryDetails };
export const lessons = base.map((l) => ({
  ...l,
  steps: details[l.id]
    ? [...details[l.id]]
        .map((s) => ({
          ...s,
          pattern:
            l.id === 4 &&
            [
              "Keep four steady beats before adding a pattern",
              "Add the first C ↔ Am change",
            ].includes(s.title)
              ? 3
              : s.pattern,
        }))
        .sort((a, b) => (a.sourceStart ?? 0) - (b.sourceStart ?? 0))
    : l.steps,
}));
export const videoIds = [
  "wAfbTvEeMmw",
  "UIhlHxxFNQM",
  "ODLFoDeUMqw",
  "bXcYT5lePX4",
  "6sw25rlOle8",
  "3NqcJZlw6GY",
  "m_2NdqHltho",
  "1c0ZNt2JS-c",
  "rHggr-5Q95I",
  "Pkfm42vrY2E",
];
