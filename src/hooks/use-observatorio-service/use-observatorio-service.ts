import { useMemo } from "react";
import ObservatorioService from "../../services/ObservatorioService";

const useObservatorioService = () => {
    return useMemo(() => new ObservatorioService(), []);
};

export default useObservatorioService;
