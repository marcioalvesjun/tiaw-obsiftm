import { useRecoilState } from "recoil"
import { subtitulo } from "../atom"

const useSubtituloState = () => {
    return useRecoilState(subtitulo);
};

export default useSubtituloState;