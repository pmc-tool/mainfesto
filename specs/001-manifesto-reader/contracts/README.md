# Contracts: UWP Manifesto Reader

**Feature**: 001-manifesto-reader
**Date**: 2025-11-23
**Purpose**: Define component APIs, data flow contracts, and integration points

---

## Overview

This directory contains contract definitions for the UWP Manifesto Reader. Since this is a **frontend-only application** with no backend API, contracts focus on:

1. **Component APIs**: Props interfaces and callback signatures
2. **Hook Contracts**: Custom hooks and their return types
3. **Utility Function Signatures**: Pure functions in lib/
4. **Event Contracts**: User interactions and system events

---

## Contract Files

- [component-contracts.md](./component-contracts.md) - React component prop interfaces and callbacks
- [hook-contracts.md](./hook-contracts.md) - Custom React hooks APIs
- [utility-contracts.md](./utility-contracts.md) - Pure function signatures (lib/)
- [event-contracts.md](./event-contracts.md) - Event handling and state transitions

---

## Contract Principles

1. **Immutability**: All data passed as props is treated as immutable
2. **Single Responsibility**: Each component/hook has one clear purpose
3. **Unidirectional Data Flow**: Props down, events up
4. **Type Safety**: All contracts defined with strict TypeScript types
5. **Testability**: All contracts have clear inputs/outputs for testing

---

## Data Flow Architecture

```
User Interaction (Click/Scroll/Type)
        │
        ▼
Event Handler (Component)
        │
        ▼
State Update (Hook/useState)
        │
        ▼
Re-render (React)
        │
        ▼
DOM Update (Canvas/Text Layer)
```

---

## Testing Contracts

Each contract must be testable in isolation:

- **Components**: Render with props, assert output
- **Hooks**: Call with test data, assert return values
- **Utilities**: Pure functions - input → output
- **Events**: Trigger event, assert state change

See individual contract files for detailed specifications.
