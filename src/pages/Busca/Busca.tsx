import React, { useEffect } from "react";
import { useSearchParams} from "react-router-dom";


/**
 * Página de busca do sistema. Substitua com a sua lógica de busca,
 * caso exista, ou apague, caso não precise.
 */
const Busca : React.FC = () => {
    const [searchParams] = useSearchParams();

    useEffect(() => {
        // const termo = searchParams.get("termo");
        // TODO: Implementar a rotina de busca com base no termo
    }, [searchParams]);

    return (
        <>
        </>
    );
}

export default Busca;