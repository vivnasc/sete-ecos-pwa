import React from 'react'
import ModuleAccessGuard from '../shared/ModuleAccessGuard'

const EcoaAccessGuard = ({ children }) => (
  <ModuleAccessGuard eco="ecoa">{children}</ModuleAccessGuard>
)

export default EcoaAccessGuard
