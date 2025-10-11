import * as React from "react"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

const toastState = {
  toasts: [] as ToastProps[],
  listeners: [] as Array<() => void>
}

export const toast = (props: ToastProps) => {
  toastState.toasts.push(props)
  toastState.listeners.forEach(listener => listener())
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    toastState.toasts.shift()
    toastState.listeners.forEach(listener => listener())
  }, 5000)
}

export const useToast = () => {
  const [, forceUpdate] = React.useReducer(x => x + 1, 0)
  
  React.useEffect(() => {
    toastState.listeners.push(forceUpdate)
    return () => {
      const index = toastState.listeners.indexOf(forceUpdate)
      if (index > -1) {
        toastState.listeners.splice(index, 1)
      }
    }
  }, [])
  
  return {
    toast,
    toasts: toastState.toasts
  }
}