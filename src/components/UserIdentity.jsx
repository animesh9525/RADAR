import React from 'react';
import { useApp } from '../context/AppContext';

// Single source of truth for the signed-in planner identity used by the whole
// application shell (sidebar footer, topbar chip, settings, audit records).
const DEMO_IDENTITY = { name: 'Demo Planner', role: 'Planner' };

function useCurrentUser() {
  const { user } = useApp();
  return {
    name: (user && user.name) || DEMO_IDENTITY.name,
    role: (user && user.role) || DEMO_IDENTITY.role,
  };
}

function initialsOf(name) {
  return String(name || '').slice(0, 2).toUpperCase() || 'DP';
}

export function UserIdentity({ variant = 'chip', className = '' }) {
  const { name, role } = useCurrentUser();
  const initials = initialsOf(name);

  if (variant === 'sidebar') {
    return (
      <div className={`identity ${className}`} data-identity="sidebar" title={`${name} · ${role}`}>
        <span className="identity-avatar" aria-hidden="true">{initials}</span>
        <span className="identity-text">
          <span className="identity-name">{name}</span>
          <span className="identity-role">{role}</span>
        </span>
      </div>
    );
  }

  return (
    <span className={`profile-chip ${className}`} data-identity="topbar" title={`Signed in as ${name}`}>
      <span className="profile-chip-avatar" aria-hidden="true">{initials}</span>
      <span className="profile-chip-text">
        <span className="profile-chip-name">{name}</span>
        <span className="profile-chip-role">{role}</span>
      </span>
    </span>
  );
}
