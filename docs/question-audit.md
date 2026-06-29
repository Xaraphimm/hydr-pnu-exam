# Question Audit Notes

This file records source-backed data corrections made to the practice-question banks.
Question IDs are kept stable so existing local progress, history, bookmarks, and notes
continue to work.

## Sources used

- FAA-H-8083-31B, Aviation Maintenance Technician Handbook — Airframe.
- FAA-H-8083-32B, Aviation Maintenance Technician Handbook — Powerplant.
- FAA-S-ACS-1, Aviation Mechanic General, Airframe, and Powerplant Airman Certification Standards.
- Referenced FAA advisory circulars and 14 CFR sections where individual questions cite them.

## Corrections

| Question ID | File | Change | Source basis |
| --- | --- | --- | --- |
| `AF03-8280` | `src/data/airframe/flight-controls.js` | Correct answer changed from A to C. | The question explanation states that moving the control stick rearward and left moves the right aileron down and the elevator up; this matches the corresponding Airframe practice-bank entry and standard flight-control rigging behavior. |
| `AF03-8282` | `src/data/airframe/flight-controls.js` | Correct answer changed from A to C. | The question explanation states that moving the control stick forward and right moves the left aileron down and the elevator down; this matches the corresponding Airframe practice-bank entry and standard flight-control rigging behavior. |
| `AF05-8348` | `src/data/airframe/landing-gear-systems.js` | Added ACS code `AM.II.E.K3`. | The question concerns oleo shock strut servicing/operating position in the landing gear systems task area. |
| `AF06-8451` | `src/data/airframe/hydraulic-pneumatic-systems.js` | Correct answer changed from A to B. | The question explanation says the retained reservoir fluid remains available to the auxiliary hand pump for emergency operations. |
| `AF-8451` | `src/data/airframe/airframe-faa-practice-test.js` | Correct answer changed from C to B. | Same source basis as `AF06-8451`; the practice-bank answer now matches the explanation and topical bank. |
| `AF06-8483` | `src/data/airframe/hydraulic-pneumatic-systems.js` | Correct answer changed from B to A. | The explanation states that the standpipe supply line is attached to the inlet of the main hydraulic system pump; the Airframe practice-bank entry already selected this answer. |
| `AF-8988` | `src/data/airframe/airframe-faa-practice-test.js` | Correct answer changed from C to A; added `FAA-H-8083-31` reference and `AM.II.L.K3` ACS code; explanation aligned with the topical bank. | The topical `AF12-8988` entry and FAA Airframe ice/rain-control subject area describe alcohol injection as a carburetor-icing prevention aid. |

## Powerplant section completion

The Powerplant section was completed by authoring 12 new topic question banks (PP-07
Engine Lubrication Systems already existed). Every bank contains 100 questions sourced
from FAA-H-8083-32B (AMT Handbook — Powerplant), with regulatory items citing the
specific 14 CFR part 43/91 section or AC where applicable. Each question carries an
`AM.III.*` ACS knowledge code, and every bank covers all of the knowledge codes for its
subject area. The banks are wired into [src/data/index.js](../src/data/index.js)
(`questionLoaders` and `QUESTION_COUNTS`) and validated by
[scripts/validate-questions.mjs](../scripts/validate-questions.mjs) and
[tests/data/powerplant-topics.test.js](../tests/data/powerplant-topics.test.js).

| Topic | File | ACS subject | Questions |
| --- | --- | --- | --- |
| PP-01 Reciprocating Engines | `src/data/powerplant/reciprocating-engines.js` | AM.III.A | 100 |
| PP-02 Turbine Engines | `src/data/powerplant/turbine-engines.js` | AM.III.B | 100 |
| PP-03 Engine Inspection | `src/data/powerplant/engine-inspection.js` | AM.III.C | 100 |
| PP-04 Engine Instrument Systems | `src/data/powerplant/engine-instrument-systems.js` | AM.III.D | 100 |
| PP-05 Engine Fire Protection Systems | `src/data/powerplant/engine-fire-protection.js` | AM.III.E | 100 |
| PP-06 Engine Electrical Systems | `src/data/powerplant/engine-electrical-systems.js` | AM.III.F | 100 |
| PP-08 Ignition & Starting Systems | `src/data/powerplant/ignition-starting-systems.js` | AM.III.H | 100 |
| PP-09 Engine Fuel & Fuel Metering Systems | `src/data/powerplant/engine-fuel-metering.js` | AM.III.I | 100 |
| PP-10 Reciprocating Induction & Cooling Systems | `src/data/powerplant/recip-induction-cooling.js` | AM.III.J | 100 |
| PP-11 Turbine Engine Air Systems | `src/data/powerplant/turbine-engine-air-systems.js` | AM.III.K | 100 |
| PP-12 Engine Exhaust & Reverser Systems | `src/data/powerplant/engine-exhaust-reverser.js` | AM.III.L | 100 |
| PP-13 Propellers | `src/data/powerplant/propellers.js` | AM.III.M | 100 |

The Full Powerplant Exam, ACS Targeted Practice, and readiness study were also enabled
for the Powerplant category by generalizing the previously airframe-only handlers in
[src/App.jsx](../src/App.jsx) and the related screens.
