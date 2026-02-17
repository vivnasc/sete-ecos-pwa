import React from 'react'
import ModuleAccessGuard from '../shared/ModuleAccessGuard'

const ImagoAccessGuard = ({ children }) => (
  <ModuleAccessGuard eco="imago">{children}</ModuleAccessGuard>
)

export default ImagoAccessGuard
