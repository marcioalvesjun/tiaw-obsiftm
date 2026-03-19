import { useRecoilState } from "recoil"
import { loading } from "../atom"

/**
 * Hook para definir se está ou não carregando. Mostra um 
 * overlay na tela se estiver carregando.
 */
const useLoadingState = () => {
    return useRecoilState(loading);
};

export default useLoadingState;