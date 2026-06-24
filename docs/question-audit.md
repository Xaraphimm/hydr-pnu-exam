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
