import {create} from "zustand";
import type {User} from "../types/auth.ts";


export type AuthStore = {
    token:string;
    user:User |null;
    refreshToken:string;
    login:(token:string, user:User, refreshToken:string)=>void,
    logout:()=>void
}

export const useAuthStore = create<AuthStore>((set)=>({
    token:localStorage.getItem("token") ?? '',
    user:null,
    refreshToken:localStorage.getItem("refreshToken") ?? '',
    login:(token,user, refreshToken:string)=>{
        localStorage.setItem('token', token)
        localStorage.setItem('refreshToken', refreshToken)
        set({token,user, refreshToken})
    },
    logout:()=>{
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        set({token:'', refreshToken:'',user:null})
    }
}))