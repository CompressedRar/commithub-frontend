import { useCallback, useEffect, useState } from "react"
import Swal from "sweetalert2"
import { getAccounts } from "../services/userService";


export const useMembers = () => {

    const fetchMembers = useCallback(async ()=> {
        try {
            const res = await getAccounts();
            return res.data
        }
        catch(error){
            console.log("hook dept", error);
            Swal.fire("Error", "There is an error fetching members", "error");
            return []
        }
    }, []);


    return { fetchMembers }
}