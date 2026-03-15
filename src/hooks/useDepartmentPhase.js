import { useEffect, useState } from "react";
import { getSettings } from "../services/settingsService";

export default function useDepartmentPhase(){

    const [currentPhase,setCurrentPhase] = useState([])
    const [loading,setLoading] = useState(true)

    const loadPhase = async ()=>{

        try{

            const res = await getSettings()

            let phase = res?.data?.data?.current_phase

            if(!phase) phase = []
            else if(!Array.isArray(phase)) phase=[phase]

            setCurrentPhase(phase)

        }catch(err){

            console.error(err)

        }

        setLoading(false)
    }

    useEffect(()=>{
        loadPhase()
    },[])

    return{
        currentPhase,
        loading
    }

}