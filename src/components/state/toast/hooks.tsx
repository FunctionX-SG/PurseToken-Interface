import { useCallback, useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks'

import { setToast } from './reducer'



interface toastTypeReturn {
  id: number
  message: string,
  link?: string,
  type: string,
}

export function useToast():[toastTypeReturn[],(message:string,type:string,link?:string)=>void,(id:number)=>void] {
  const dispatch = useAppDispatch()
  const [toasts,setToasts] = useState<toastTypeReturn[]>([])
  const toast = useAppSelector((state) => state.toast.value)
  const removeToast = useCallback(
    (id:number) => {
      setToasts((prevToasts:any) => prevToasts.filter((toast:any) => toast.id !== id))
  },[setToasts]);
  const showToast = useCallback(
    (message:string,type:string,link?:string) => {
      const _toast:toastTypeReturn = {
        id: Date.now(),
        message: message,
        link: link,
        type: type,
      };
      setToasts((toasts:any)=>[_toast,...toasts]);
      let time:number = 5
      if (type==="success"){
        time = 8
      }
      setTimeout(() => {
        removeToast(_toast.id)
      }, time*1000);
    },[setToasts,removeToast]
  )
  useEffect(()=>{
    dispatch(setToast(toasts))
  },[toasts,dispatch])
  
  
  return [toast, showToast,removeToast]
}
