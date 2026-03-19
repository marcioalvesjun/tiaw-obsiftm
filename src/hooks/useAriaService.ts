import { useAuth } from "react-oidc-context";
import AriaService from "../services/AriaService"
import { useMemo } from "react";

const useAriaService = () => {
    const auth = useAuth();
    return useMemo(() => new AriaService(auth), [auth]);
}

export default useAriaService;