import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import {
  getAccountInfo,
} from "../services/userService";

import Swal from "sweetalert2"

export const useAccount = () => {

    const [loading, setLoading] = useState(true);
    const [account, setAccount] = useState(null);
    const [accountIPCR, setAccountIPCR] = useState(null);

    const fetchAccount = async () => {
        setLoading(true);
        try {
            if (localStorage.getItem("token")) {
                const payload = jwtDecode(localStorage.getItem("token"));
                const res = await getAccountInfo(payload.id)
                .then((data) => data.data)
                .catch((error) => {
                    Swal.fire("Error", error.response.data.error, "error");
                });
            
                setAccount(res);
                console.log(res)
                setAccountIPCR(res.ipcrs);
            }
        } catch (error) {
            console.log("settings error", error);
        } finally {
            setLoading(false);
        }
  };

  useEffect(() => {
    fetchAccount();
  }, []);

  return { loading, account, accountIPCR };
};