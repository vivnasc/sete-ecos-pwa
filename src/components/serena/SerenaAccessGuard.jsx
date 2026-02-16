import React from 'react'
import ModuleAccessGuard from '../shared/ModuleAccessGuard'

const SerenaAccessGuard = ({ children }) => (
  <ModuleAccessGuard eco="serena">{children}</ModuleAccessGuard>
)

export default SerenaAccessGuard
