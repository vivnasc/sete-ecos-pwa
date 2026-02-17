import React from 'react'
import ModuleAccessGuard from '../shared/ModuleAccessGuard'

const IgnisAccessGuard = ({ children }) => (
  <ModuleAccessGuard eco="ignis">{children}</ModuleAccessGuard>
)

export default IgnisAccessGuard
