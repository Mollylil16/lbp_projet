/**
 * Hook pour gérer l'historique Undo/Redo
 * Permet d'annuler et rétablir des actions
 */

import { useState, useCallback, useRef } from 'react'

interface HistoryState<T> {
  past: T[]
  present: T
  future: T[]
}

/**
 * Hook pour l'historique Undo/Redo
 */
export function useUndoRedo<T>(initialValue: T, maxHistory: number = 50) {
  const [state, setState] = useState<HistoryState<T>>({
    past: [],
    present: initialValue,
    future: [],
  })

  const canUndo = state.past.length > 0
  const canRedo = state.future.length > 0

  const setValue = useCallback(
    (newValue: T) => {
      setState((current) => {
        const newPast = [...current.past, current.present]
        // Limiter l'historique
        if (newPast.length > maxHistory) {
          newPast.shift()
        }

        return {
          past: newPast,
          present: newValue,
          future: [], // Vider le futur quand on fait une nouvelle action
        }
      })
    },
    [maxHistory]
  )

  const undo = useCallback(() => {
    if (!canUndo) return

    setState((current) => {
      const previous = current.past[current.past.length - 1]
      const newPast = current.past.slice(0, -1)
      const newFuture = [current.present, ...current.future]

      return {
        past: newPast,
        present: previous,
        future: newFuture,
      }
    })
  }, [canUndo])

  const redo = useCallback(() => {
    if (!canRedo) return

    setState((current) => {
      const next = current.future[0]
      const newFuture = current.future.slice(1)
      const newPast = [...current.past, current.present]

      return {
        past: newPast,
        present: next,
        future: newFuture,
      }
    })
  }, [canRedo])

  const reset = useCallback((newValue?: T) => {
    setState({
      past: [],
      present: newValue !== undefined ? newValue : initialValue,
      future: [],
    })
  }, [initialValue])

  return {
    value: state.present,
    setValue,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
    historyLength: state.past.length,
  }
}

/**
 * Hook pour un historique simplifié avec callback
 */
export function useUndoRedoWithCallback<T>(
  initialValue: T,
  onChange?: (value: T) => void,
  maxHistory: number = 50
) {
  const { value, setValue, undo, redo, canUndo, canRedo, reset } = useUndoRedo(
    initialValue,
    maxHistory
  )

  const setValueWithCallback = useCallback(
    (newValue: T) => {
      setValue(newValue)
      if (onChange) {
        onChange(newValue)
      }
    },
    [setValue, onChange]
  )

  const undoWithCallback = useCallback(() => {
    undo()
    if (onChange) {
      onChange(value)
    }
  }, [undo, onChange, value])

  const redoWithCallback = useCallback(() => {
    redo()
    if (onChange) {
      onChange(value)
    }
  }, [redo, onChange, value])

  return {
    value,
    setValue: setValueWithCallback,
    undo: undoWithCallback,
    redo: redoWithCallback,
    canUndo,
    canRedo,
    reset,
  }
}
