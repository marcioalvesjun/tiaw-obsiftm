import { useRecoilState } from "recoil";
import { nomeAplicacao } from "../atom";

const useStateNomeAplicacao = () => {
    return useRecoilState(nomeAplicacao);
};

export default useStateNomeAplicacao;