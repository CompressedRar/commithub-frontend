import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { getAccountInfo } from "../services/userService";

/**
 * Resolves whether the currently logged-in user has rating privileges
 * (president or administrator roles).
 */
export function useCanEval() {
  const [canEval, setCanEval] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const payload = jwtDecode(token);
      getAccountInfo(payload.id)
        .then((d) => {
          const info = d.data;
          setUserInfo(info);
          setCanEval(info.role === "president" || info.role === "administrator");
        })
        .catch((err) => console.error("useCanEval: failed to load user info", err));
    } catch (err) {
      console.error("useCanEval: invalid token", err);
    }
  }, []);

  return { canEval, userInfo };
}
