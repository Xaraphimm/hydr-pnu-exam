export const questions = [
  // ASA page 136
  {
    id: "AF14-8214",
    q: "A reduction in anti-torque thrust will cause the",
    a: [
      "tail to pivot in the opposite direction of torque rotation around the main rotor.",
      "tail to pivot in the direction of torque rotation around the main rotor axis.",
      "anti-torque system to become more efficient in the hover mode."
    ],
    c: 1,
    exp: "On a single-rotor helicopter with an antitorque tail rotor, the torque of the main rotor tends to rotate the fuselage in a clockwise direction as viewed from above. The tail rotor compensates for this by attempting to rotate the fuselage in a counterclockwise direction. Decreasing the pitch of the tail rotor allows the torque of the main rotor to rotate the fuselage in a clockwise direction about the main-rotor axis.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.N.K1",
    diagram: null,
  },
  {
    id: "AF14-8220",
    q: "If a single-rotor helicopter is in forward horizontal flight, the angle of attack of the advancing blade is",
    a: [
      "more than the retreating blade.",
      "equal to the retreating blade.",
      "less than the retreating blade."
    ],
    c: 2,
    exp: "The angle of attack of the advancing blade (the blade moving in the same direction the helicopter is traveling) is less than the angle of attack of the retreating blade. The difference in the angle of attack between the two blades compensates in the difference in the airspeed of the two blades and provides uniform lift around the rotor disc. It prevents dissymmetry of lift.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.N.K1",
    diagram: null,
  },
  {
    id: "AF14-8223",
    q: "Which statement is correct concerning torque effect on helicopters?",
    a: [
      "Torque direction is the same as rotor blade rotation.",
      "As horsepower decreases, torque increases.",
      "Torque direction is the opposite of rotor blade rotation."
    ],
    c: 2,
    exp: "The torque direction of a helicopter rotor system is opposite the direction of the rotor rotation.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.N.K1",
    diagram: null,
  },
  // ASA page 137
  {
    id: "AF14-8225",
    q: "Movement about the longitudinal axis (roll) in a helicopter is effected by movement of the",
    a: [
      "collective pitch control.",
      "cyclic pitch control.",
      "reduce lift."
    ],
    c: 1,
    exp: "Movement of a helicopter about its longitudinal (roll) axis is effected by moving the cyclic pitch control to the right or left.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.N.K1",
    diagram: null,
  },
  {
    id: "AF14-8226",
    q: "Movement about the lateral axis (pitch) in a helicopter is effected by movement of the",
    a: [
      "collective pitch control.",
      "cyclic pitch control.",
      "tail rotor pitch control."
    ],
    c: 1,
    exp: "Movement of a helicopter about its lateral (pitch) axis is effected by moving the cyclic pitch control fore and aft.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.N.K1",
    diagram: null,
  },
  {
    id: "AF14-8227",
    q: "Wing dihedral, a rigging consideration on most airplanes of conventional design, contributes most to stability of the airplane about its",
    a: [
      "longitudinal axis.",
      "vertical axis.",
      "lateral axis."
    ],
    c: 0,
    exp: "Lateral dihedral, which is the positive acute angle between the lateral axis of an aircraft and a line parallel to the center of a wing panel, contributes to the lateral stability of an aircraft. Lateral stability (roll stability) is stability of an aircraft about its longitudinal axis.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.N.K1",
    diagram: null,
  },
  {
    id: "AF14-8212",
    q: "The auxiliary (tail) rotor of a helicopter permits the pilot to compensate for and/or accomplish which of the following?",
    a: [
      "Altitude and pitch oscillation.",
      "Airspeed and trimmed flight.",
      "Torque and directional control."
    ],
    c: 2,
    exp: "The auxiliary rotor located on the tail of a single main rotor helicopter compensates for torque and provides for directional control.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.N.K1",
    diagram: null,
  },
  {
    id: "AF14-8213",
    q: "The vertical flight of a helicopter is controlled by",
    a: [
      "collective pitch changes.",
      "cyclic pitch changes.",
      "increasing or decreasing the RPM of the main rotor."
    ],
    c: 0,
    exp: "The amount of lift produced by a helicopter rotor system is determined by the collective pitch of the main rotor system. Vertical flight of a helicopter is controlled by increasing or decreasing the collective pitch.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.N.K2",
    diagram: null,
  },
  {
    id: "AF14-8217",
    q: "A helicopter in forward flight, cruise configuration, changes direction by",
    a: [
      "varying the pitch of the main rotor blades.",
      "changing rotor RPM.",
      "tilting the main rotor disc in the desired direction."
    ],
    c: 2,
    exp: "A helicopter in forward-flight cruise configuration changes its direction by tilting the main rotor disc in the desired direction by using the cyclic pitch control. The direction in which the fuselage rotates about the vertical axis is determined by the pitch of the tail rotor, but this does not change the direction of flight.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.N.K2",
    diagram: null,
  },
  {
    id: "AF14-8219",
    q: "In a hovering helicopter equipped with a tail rotor, directional control is maintained by",
    a: [
      "changing the tail rotor RPM.",
      "tilting the main rotor disc in the desired direction.",
      "varying the pitch of the tail rotor blades."
    ],
    c: 2,
    exp: "The foot-operated pedals of a helicopter change the pitch of the tail rotor blades and thus the thrust they produce. The thrust produced by the tail rotor maintains directional control of a hovering helicopter.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.N.K2",
    diagram: null,
  },
  {
    id: "AF14-8228",
    q: "Other than the manufacturer's maintenance manual, what other document could be used to determine the primary flight control surface deflection for an imported aircraft that is reassembled after shipment?",
    a: [
      "Aircraft Type Certificate Data Sheet.",
      "Import manual for the aircraft.",
      "The certificate of airworthiness issued by the importing country."
    ],
    c: 0,
    exp: "The Type Certificate Data Sheet issued by the FAA for every aircraft that is FAA-certificated, regardless of its country of origin, includes the amount of deflection of the primary flight controls.",
    ref: "AC 43.13-1B",
    acs: "AM.II.N.K2",
    diagram: null,
  },
  // ASA page 138
  {
    id: "AF14-8222",
    q: "One purpose of the freewheeling unit required between the engine and the helicopter transmission is to",
    a: [
      "automatically disengage the rotor from the engine in case of an engine failure.",
      "disconnect the rotor from the engine to relieve the starter load.",
      "permit practice of autorotation landings."
    ],
    c: 0,
    exp: "The freewheeling unit in a helicopter rotor system automatically disengages the rotor from the engine in the case of an engine failure. The freewheeling unit allows the engine to drive the rotor, but if the rotor speed ever becomes greater than that of the engine, the freewheeling unit prevents the rotor driving the engine.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.N.K3",
    diagram: null,
  },
  {
    id: "AF14-8224",
    q: "What is the purpose of the free-wheeling unit in a helicopter drive system?",
    a: [
      "It disengages the engine from the main rotor when engine RPM is less than rotor RPM.",
      "It allows the engines to be started without any load from the transmission.",
      "It allows the rotors to turn slowly as the engine RPM increases."
    ],
    c: 0,
    exp: "Since lift in a helicopter is provided by rotating airfoils, these airfoils must be free to rotate if the engine fails. The freewheeling unit automatically disengages the engine from the main rotor when engine RPM is less than main rotor RPM. This allows the main rotor and tail rotor to continue turning at normal in-flight speeds.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.N.K3",
    diagram: null,
  },
  {
    id: "AF14-8215",
    q: "In rotorcraft external-loading, the ideal location of the cargo release is where the line of action passes",
    a: [
      "aft of the center of gravity at all times.",
      "forward of the center of gravity at all times.",
      "through the center of gravity at all times."
    ],
    c: 2,
    exp: "An ideal location for the cargo release would be one that allows the line of action to pass through the rotorcraft's center of gravity at all times.",
    ref: "AC 43.13-2",
    acs: "AM.II.N.K8",
    diagram: null,
  },
  {
    id: "AF14-8218",
    q: "The purpose in checking main rotor blade tracking is to determine the",
    a: [
      "relative position of the blades during rotation.",
      "flight path of the blades during rotation.",
      "extent of an out of balance condition during rotation."
    ],
    c: 0,
    exp: "The purpose of blade tracking is to bring the tips of all blades into the same tip path throughout their entire cycle of rotation. Tracking shows only the relative position of the blades, not their flight path of flight.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.N.K8",
    diagram: null,
  },
  {
    id: "AF14-8221",
    q: "Main rotor blades that do not cone by the same amount during rotation are said to be out of",
    a: [
      "balance.",
      "collective pitch.",
      "track."
    ],
    c: 2,
    exp: "If the blades of a helicopter rotor do not cone in the same plane they are said to be out of track.",
    ref: "FAA-H-8083-31",
    acs: "AM.II.N.K8",
    diagram: null,
  },
];
