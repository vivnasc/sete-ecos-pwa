import React from 'react'
import ModuleAccessGuard from '../shared/ModuleAccessGuard'

const AuroraAccessGuard = ({ children }) => (
  <ModuleAccessGuard eco="aurora">{children}</ModuleAccessGuard>
)

export default AuroraAccessGuard
