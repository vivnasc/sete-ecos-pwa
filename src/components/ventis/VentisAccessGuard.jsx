import React from 'react'
import ModuleAccessGuard from '../shared/ModuleAccessGuard'

const VentisAccessGuard = ({ children }) => (
  <ModuleAccessGuard eco="ventis">{children}</ModuleAccessGuard>
)

export default VentisAccessGuard
