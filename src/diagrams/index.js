import PascalLaw from './PascalLaw.jsx'
import OpenCenter from './OpenCenter.jsx'
import ClosedCenter from './ClosedCenter.jsx'
import DoubleActingActuator from './DoubleActingActuator.jsx'
import Reservoir from './Reservoir.jsx'
import FilterBypass from './FilterBypass.jsx'
import CylinderCalc from './CylinderCalc.jsx'
import PumpTypes from './PumpTypes.jsx'
import SealTypes from './SealTypes.jsx'
import Pneudraulics from './Pneudraulics.jsx'
import ViscosityCurve from './ViscosityCurve.jsx'
import PneumaticBrakeValve from './PneumaticBrakeValve.jsx'

const diagrams = {
  pascalLaw: PascalLaw,
  openCenter: OpenCenter,
  closedCenter: ClosedCenter,
  actuator: DoubleActingActuator,
  reservoir: Reservoir,
  filterBypass: FilterBypass,
  cylinderCalc: CylinderCalc,
  pumpTypes: PumpTypes,
  sealTypes: SealTypes,
  pneudraulics: Pneudraulics,
  viscosity: ViscosityCurve,
  pneumaticValve: PneumaticBrakeValve,
}

export default diagrams
