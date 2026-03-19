import { useNavigate } from "react-router";

/**
 * Hook para realizar busca.
 */
const useBusca = () => {
    const navigate = useNavigate();


    return (termo : string) => {
        navigate(`/busca?termo=${encodeURIComponent(termo)}`)   
    }
}

export default useBusca;