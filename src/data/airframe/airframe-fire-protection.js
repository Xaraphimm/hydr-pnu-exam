export const questions = [
  // ASA page 132
  {
    id: "AF13-9004",
    q: "Which fire-detection system measures temperature rise compared to a reference temperature?",
    a: [
      "Fenwal continuous loop.",
      "Lindberg continuous element.",
      "Thermocouple."
    ],
    c: 2,
    exp: "The thermocouple-type fire-detection system is activated by an abnormal rate of temperature rise.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.M.K2",
    diagram: null,
  },
  {
    id: "AF13-9009",
    q: "Why does the Fenwal fire-detection system use spot detectors wired parallel between two separate circuits?",
    a: [
      "A control unit is used to isolate the bad system in case of malfunction.",
      "This installation is equal to two systems: a main system and a reserve system.",
      "A short may exist in either circuit without causing a false fire warning."
    ],
    c: 2,
    exp: "The Fenwal fire-detection system is wired between two parallel circuits so that a short can exist in either circuit without causing a false fire warning.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.M.K2",
    diagram: null,
  },
  {
    id: "AF13-9012",
    q: "The most common cause of false fire warnings in continuous-loop fire-detection systems is",
    a: [
      "improper routing or clamping of loops.",
      "moisture.",
      "dents, kinks, or crushed sensor sections."
    ],
    c: 2,
    exp: "Dented, kinked, or crushed sensor sections are a common cause of false fire warnings in the continuous-loop fire-detection system.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.M.K2",
    diagram: null,
  },
  {
    id: "AF13-9013",
    q: "A thermocouple in a fire-detection system causes the warning system to operate because",
    a: [
      "it generates a small current when heated.",
      "heat decreases its electrical resistance.",
      "it expands when heated and forms a ground for the warning system."
    ],
    c: 0,
    exp: "A thermocouple in a fire-detection system generates a warning signal by producing a small current when it is heated. This small current activates a sensitive relay which in turn causes the slave relay to indicate the presence of a fire.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.M.K2",
    diagram: null,
  },
  {
    id: "AF13-9014",
    q: "The thermocouple fire-warning system is activated by a",
    a: [
      "certain temperature.",
      "core resistance drop.",
      "rate-of-temperature rise."
    ],
    c: 2,
    exp: "The thermocouple-type fire-warning system is activated by an abnormal rate of temperature rise rather than by a specific temperature.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.M.K2",
    diagram: null,
  },
  {
    id: "AF13-9019",
    q: "The thermal switches of a bimetallic thermal-switch type fire-detection (single-loop) system are heat-sensitive units that complete circuits at a certain temperature. They are connected in",
    a: [
      "parallel with each other, and in parallel with the indicator lights.",
      "parallel with each other, but in series with the indicator lights.",
      "series with each other, but in parallel with the indicator lights."
    ],
    c: 1,
    exp: "The thermal switches in a bimetallic thermal-switch type of fire-detection system are connected in parallel with each other. The entire combination of switches is connected in series with the indicator light. If any switch completes a circuit to ground, the indicator light will turn on.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.M.K2",
    diagram: null,
  },
  // ASA page 133
  {
    id: "AF13-9015",
    q: "When used in fire-detection systems having a single indicator light, thermal switches are wired in",
    a: [
      "parallel with each other and in series with the light.",
      "series with each other and the light.",
      "series with each other and parallel with the light."
    ],
    c: 0,
    exp: "In fire-detection systems using a single indicator light, the thermal switches are wired in parallel with each other, and the entire combination of switches is in series with the indicator light.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.M.K3",
    diagram: null,
  },
  {
    id: "AF13-9001",
    q: "Smoke detection instruments are classified by their method of",
    a: [
      "construction.",
      "maintenance.",
      "detection."
    ],
    c: 2,
    exp: "Smoke detection instruments are classified according to the method they use for detecting the presence of smoke.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.M.K4",
    diagram: null,
  },
  {
    id: "AF13-9002",
    q: "Smoke detectors that use a measurement of light transmissibility in the air are called",
    a: [
      "thermocouple devices.",
      "photoelectrical devices.",
      "ultraviolet optical devices."
    ],
    c: 1,
    exp: "Smoke detectors that measure the light transmissibility of the air (the ability of the air to allow light to pass through it) are called photoelectrical devices.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.M.K4",
    diagram: null,
  },
  {
    id: "AF13-8997",
    q: "In what areas of aircraft would you find a carbon monoxide detector?",
    a: [
      "Cargo and baggage compartment.",
      "Cabin and flight deck.",
      "Lavatory and engine nacelle."
    ],
    c: 1,
    exp: "Carbon monoxide detectors are installed in the cabin and in the flight deck of an aircraft to inform the occupants of the presence of this deadly gas.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.M.K4",
    diagram: null,
  },
  {
    id: "AF13-8998",
    q: "What occurs when a visual smoke detector is activated?",
    a: [
      "A warning bell within the indicator alarms automatically.",
      "A lamp within the indicator illuminates automatically.",
      "The test lamp illuminates and an alarm is provided automatically."
    ],
    c: 1,
    exp: "When a visual smoke detector is activated, a lamp inside the indicator is automatically turned on. The light is scattered by the smoke so the smoke is visible against the black background inside the window of the indicator.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.M.K4",
    diagram: null,
  },
  {
    id: "AF13-9000",
    q: "When air samples contain carbon monoxide, portable carbon monoxide detectors containing yellow silica gel will turn which color?",
    a: [
      "Blue.",
      "Green.",
      "Red."
    ],
    c: 1,
    exp: "When an air sample containing carbon monoxide passes over silica-gel crystals that have been dyed with a yellow indicator dye, the crystals turn to a shade of green. The intensity of the green color is proportional to the concentration of carbon monoxide in the sample of air.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.M.K4",
    diagram: null,
  },
  {
    id: "AF13-9003",
    q: "A contaminated carbon monoxide portable test unit may be returned to service by",
    a: [
      "cleaning the indicating element with soap and water.",
      "removing the indicating element and installing a new indicating element.",
      "removing the indicating element from the exposed area for 24 hours."
    ],
    c: 1,
    exp: "A contaminated carbon monoxide test unit should be serviced by installing a new indicating element.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.M.K4",
    diagram: null,
  },
  {
    id: "AF13-9007",
    q: "Smoke in the cargo and/or baggage compartment of an aircraft is commonly detected by which instrument?",
    a: [
      "Chemical reactor.",
      "Photoelectric cell.",
      "Sniffer."
    ],
    c: 1,
    exp: "Smoke detectors used in the cargo and/or baggage compartments of aircraft are usually of the photoelectric-cell type, which measures the amount of light that can pass through the air. If there is smoke in the area being protected, the amount of light passing through the smoke is decreased and the system warns the flight crew of the presence of smoke in the compartment.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.M.K4",
    diagram: null,
  },
  // ASA page 134
  {
    id: "AF13-8908",
    q: "Light refraction smoke detectors are activated when the detector",
    a: [
      "measures a reduction in the amount of visible or infrared light in the surrounding area.",
      "senses light reflected from smoke particles passing through a chamber.",
      "uses radiation induced ionization to detect the presence of smoke."
    ],
    c: 1,
    exp: "Light refraction-type smoke detectors detect the presence of smoke by sensing the light that is reflected from smoke particles passing through a chamber.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.M.K4",
    diagram: null,
  },
  {
    id: "AF13-8999",
    q: "The types of fire-extinguishing agents for aircraft interior fires are",
    a: [
      "water, carbon dioxide, dry chemical, and halogenated hydrocarbons.",
      "water, dry chemical, methyl bromide, and chlorobromomethane.",
      "water, carbon tetrachloride, carbon dioxide, and dry chemical."
    ],
    c: 0,
    exp: "Fire-extinguishing agents that are suitable for aircraft interior fires are water, carbon dioxide, dry chemical, and Halon 1301 or 1211, which are both forms of halogenated hydrocarbons.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.M.K5",
    diagram: null,
  },
  {
    id: "AF13-9026",
    q: "Which fire-extinguishing agent is considered to be the least toxic?",
    a: [
      "Carbon dioxide.",
      "Bromotrifluoromethane (Halon 1301).",
      "Bromochloromethane (Halon 1011)."
    ],
    c: 1,
    exp: "Halon 1301 is a popular fire extinguishing agent that is suitable for use in aircraft cabin fires because it is the least toxic of the commonly used extinguishing agents.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.M.K5",
    diagram: null,
  },
  {
    id: "AF13-9005",
    q: "A carbon dioxide (CO2) hand-held fire extinguisher may be used on an electrical fire if the",
    a: [
      "horn is nonmetallic.",
      "handle is insulated.",
      "horn is nonmagnetic."
    ],
    c: 0,
    exp: "A carbon-dioxide fire extinguisher should not be used on an electrical fire unless the horn is made of a nonmetallic material. Most of the horns are made of pressed fiber.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.M.K6",
    diagram: null,
  },
  {
    id: "AF13-9006",
    q: "The proper fire-extinguishing agent to use on an aircraft brake fire is",
    a: [
      "water.",
      "carbon dioxide.",
      "dry powder chemical."
    ],
    c: 2,
    exp: "Aircraft brake fires are properly extinguished by the use of a dry-powder chemical fire extinguisher.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.M.K6",
    diagram: null,
  },
  {
    id: "AF13-9011",
    q: "What is the color code for fire extinguisher lines?",
    a: [
      "Brown.",
      "Yellow.",
      "Red and green."
    ],
    c: 0,
    exp: "Aircraft plumbing that contains fire-extinguishing agents is color coded with a stripe of brown tape and a series of diamonds.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.M.K6",
    diagram: null,
  },
  {
    id: "AF13-9016",
    q: "Built-in aircraft fire-extinguishing systems are ordinarily charged with",
    a: [
      "carbon dioxide and nitrogen.",
      "halogenated hydrocarbons and nitrogen.",
      "sodium bicarbonate and nitrogen."
    ],
    c: 1,
    exp: "Most of the modern aircraft built-in fire-extinguishing systems are charged with a halogenated hydrocarbon agent, such as Halon 1211 or Halon 1301, pressurized with nitrogen.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.M.K6",
    diagram: null,
  },
  {
    id: "AF13-9017",
    q: "In reference to aircraft fire-extinguishing systems,\n(1) during removal or installation, the terminals of discharge cartridges should be grounded or shorted.\n(2) before connecting cartridge terminals to the electrical system, the system should be checked with a voltmeter to see that no voltage exists at the terminal connections.\nRegarding the above statements,",
    a: [
      "only 2 is true.",
      "both 1 and 2 are true.",
      "neither 1 nor 2 is true."
    ],
    c: 1,
    exp: "Statement 1 is true. The discharge cartridges for a fire-extinguishing system contain explosive charges called squibs. These squibs are ignited with an electrical current when the fire extinguisher agent discharge switch is closed. When removing or installing a discharge cartridge, ground or short the terminals to prevent an accidental firing. Statement 2 is also true. Before connecting the cartridge terminals to the electrical system, the system should be checked with a voltmeter to be sure that there is no voltage at the terminal connections.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.M.K6",
    diagram: null,
  },
  // ASA page 135
  {
    id: "AF13-9018",
    q: "What method is used to detect the thermal discharge of a built-in fire-extinguisher system?",
    a: [
      "A discoloring of the yellow plastic disc in the thermal discharge line.",
      "A rupture of the red plastic disc in the thermal discharge line.",
      "The thermal plug missing from the side of the bottle."
    ],
    c: 1,
    exp: "If a built-in fire-extinguishing system is discharged because of a thermal (overheat) condition, the red indicator disc is blown out.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.M.K6",
    diagram: null,
  },
  {
    id: "AF13-9020",
    q: "(Refer to Figure 21.) Using the chart, determine the temperature range for a fire-extinguishing agent storage container with a pressure of 330 psig for both minimum and maximum pressure. (Consider 330 psig for both minimum and maximum pressure.)",
    a: [
      "-47 to 73\u00b0F.",
      "-47 to 71\u00b0F.",
      "-45 to 73\u00b0F."
    ],
    c: 0,
    exp: "For this problem, we must interpolate. 330 psig is 0.3 of the way between 319 and 356, and 73\u00b0 is 0.3 of the way between 70\u00b0 and 80\u00b0. 330 psig is 0.52 of the way between 317 and 342, and 45.2 is 0.52 of the way between 40\u00b0 and 50\u00b0. The fire extinguisher could have a pressure of 330 psig over a temperature range of 45\u00b0 to 73\u00b0F.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.M.K6",
    diagram: null,
  },
  {
    id: "AF13-9021",
    q: "(Refer to Figure 21.) Determine what pressure is acceptable for a fire extinguisher when the surrounding area temperature is 33\u00b0F. (Rounded to the nearest whole number.)",
    a: [
      "215 to 302 psig.",
      "214 to 301 psig.",
      "215 to 301 psig."
    ],
    c: 0,
    exp: "For this problem, we must interpolate. 33\u00b0F is 0.3 of the way between 30\u00b0 and 40\u00b0. 215 psig is 0.3 of the way between 209 and 230 psig, and 302 psig is 0.3 of the way between 295 and 317 psig. At 33\u00b0F the acceptable pressure range is between 215 and 302 psig.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.M.K6",
    diagram: null,
  },
  {
    id: "AF13-9022",
    q: "On a periodic check of fire extinguisher containers, the pressure was not between minimum and maximum limits. What procedure should be followed?",
    a: [
      "Release pressure if above limits.",
      "Replace the extinguisher container.",
      "Increase pressure if below limits."
    ],
    c: 1,
    exp: "On a periodic check of fire extinguisher containers, if the pressure, when corrected for ambient temperature, was not between the minimum and maximum limits, the fire extinguisher container must be replaced.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.M.K6",
    diagram: null,
  },
  {
    id: "AF13-9023",
    q: "In some fire-extinguishing systems, evidence that the system has been intentionally discharged is indicated by the absence of a",
    a: [
      "red disc on the side of the fuselage.",
      "green disc on the side of the fuselage.",
      "yellow disc on the side of the fuselage."
    ],
    c: 2,
    exp: "If a fire extinguisher system has been intentionally discharged, the yellow disc on the side of the fuselage is blown out. If the fire extinguisher system has been discharged because of an overtemperature condition, the red disc is blown out.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.M.K6",
    diagram: null,
  },
  {
    id: "AF13-9028",
    q: "A squib, as used in a fire-protection system, is a",
    a: [
      "temperature-sensing device.",
      "device for causing the fire-extinguishing agent to be released.",
      "probe used for installing frangible discs in extinguisher bottles."
    ],
    c: 1,
    exp: "A squib is an electrically actuated explosive device used to break the seal on a high-rate-discharge fire extinguisher bottle in order to release the agent.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.M.K6",
    diagram: null,
  },
  {
    id: "AF13-9010",
    q: "A fire extinguisher container can be checked to determine its charge by",
    a: [
      "attaching a remote pressure gauge.",
      "weighing the container and its contents.",
      "a hydrostatic test."
    ],
    c: 1,
    exp: "Fire extinguishers containing carbon dioxide are weighed to determine their state of charge. Containers of freon and containers of dry powder have the condition of their charge measured by the use of pressure gauges that are part of the container.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.M.K7",
    diagram: null,
  },
  // ASA page 136
  {
    id: "AF13-9024",
    q: "If a fire extinguisher cartridge is removed from a discharge valve, it should be",
    a: [
      "pressure checked.",
      "used only on the original discharge valve assembly.",
      "replaced with a new cartridge."
    ],
    c: 2,
    exp: "The fire extinguisher cartridge discussed here is the type used in a high-rate-discharge (HRD) freon container. If a cartridge is removed from a discharge valve for any reason, it should not be used in another discharge valve assembly. The distance the contact point protrudes may vary with each unit. Continuity might not exist if a used plug that has been indented with a long contact point were installed in a discharge valve that has a short contact point.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.M.K7",
    diagram: null,
  },
  {
    id: "AF13-9025",
    q: "Which of the following are fire precautions which must be observed when working on an oxygen system?",
    a: [
      "Display \"No Smoking\" placards and keep all tools and oxygen servicing equipment free from oil or grease.",
      "Display \"No Smoking\" placards and provide adequate fire-fighting equipment.",
      "Display \"No Smoking\" placards, provide adequate fire-fighting equipment, keep all tools and oxygen servicing equipment free from oil or grease, and avoid checking aircraft radio or electrical systems."
    ],
    c: 2,
    exp: "All four items listed here are safety precautions to be followed when working with an oxygen system.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.M.K7",
    diagram: null,
  },
  {
    id: "AF13-9027",
    q: "Maintenance of fire-detection systems includes",
    a: [
      "repair of damaged sensing elements.",
      "servicing of the pressure type responder system.",
      "replacement of damaged sensing elements."
    ],
    c: 2,
    exp: "Of the maintenance functions listed here, the only allowable maintenance for a fire-detection system is the replacement of a damaged sensing element.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.M.K7",
    diagram: null,
  },
];
