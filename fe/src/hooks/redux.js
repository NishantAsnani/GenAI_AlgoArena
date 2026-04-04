// src/hooks/redux.js
// ─────────────────────────────────────────────────────────────────────────────
// Typed Redux hooks — use these instead of raw useDispatch / useSelector
// ─────────────────────────────────────────────────────────────────────────────

import { useDispatch, useSelector } from 'react-redux'

// Pre-typed dispatch — handles async thunks properly
export const useAppDispatch = () => useDispatch()

// Pre-typed selector
export const useAppSelector = useSelector
