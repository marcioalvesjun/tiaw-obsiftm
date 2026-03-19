import dataProducaoBibliografica from "../mocks/data/producao-bibliografica.json";
import dataOrientacao from "../mocks/data/orientacao.json";
import dataUltimaAtualizacao from "../mocks/data/ultima-atualizacao-lattes.json";
import dataTitularidade from "../mocks/data/titularidade.json";
import dataFormacaoAcademica from "../mocks/data/formacao-academica.json";
import dataAssuntos from "../mocks/data/assuntos.json";

class ObservatorioService {
    private readonly baseUrl = "https://obsiftm.midi.upt.iftm.edu.br/api";
    private readonly useLocalData = process.env.NODE_ENV === "production";

    private filterByInstituicao<T extends { instituicao?: { id?: number | null } | null; instituicaoID?: number | null }>(
        data: T[],
        qualInstituicao: number
    ) {
        if (qualInstituicao === 0) return data;
        return data.filter((item) => {
            const id = item.instituicao?.id ?? item.instituicaoID ?? 0;
            return Number(id) === qualInstituicao;
        });
    }

    public async getProducaoBibliografica(qualInstituicao: number = 0) {
        if (this.useLocalData) {
            return this.filterByInstituicao(dataProducaoBibliografica as any[], qualInstituicao);
        }
        const response = await fetch(`${this.baseUrl}/Indicadores/ProducaoBibliografica?QualInstituicao=${qualInstituicao}`);
        return response.json();
    }

    public async getOrientacao(qualInstituicao: number = 0) {
        if (this.useLocalData) {
            return this.filterByInstituicao(dataOrientacao as any[], qualInstituicao);
        }
        const response = await fetch(`${this.baseUrl}/Indicadores/Orientacao?QualInstituicao=${qualInstituicao}`);
        return response.json();
    }

    public async getUltimaAtualizacaoLattes(qualInstituicao: number = 0) {
        if (this.useLocalData) {
            return this.filterByInstituicao(dataUltimaAtualizacao as any[], qualInstituicao);
        }
        const response = await fetch(`${this.baseUrl}/Pesquisadores/UltimaAtualizacaoLattes?QualInstituicao=${qualInstituicao}`);
        return response.json();
    }

    public async getTitularidade(qualInstituicao: number = 0) {
        if (this.useLocalData) {
            return this.filterByInstituicao(dataTitularidade as any[], qualInstituicao);
        }
        const response = await fetch(`${this.baseUrl}/Pesquisadores/Titularidade?QualInstituicao=${qualInstituicao}`);
        return response.json();
    }

    public async getFormacaoAcademica(qualInstituicao: number = 0, qualFormacao: number = 1) {
        if (this.useLocalData) {
            const byCampus = this.filterByInstituicao(dataFormacaoAcademica as any[], qualInstituicao);
            return byCampus.filter((item: any) => Number(item.tipoFormacao ?? 0) === qualFormacao);
        }
        const response = await fetch(`${this.baseUrl}/Pesquisadores/FormacaoAcademica?QualInstituicao=${qualInstituicao}&QualFormacao=${qualFormacao}`);
        return response.json();
    }

    public async getAssuntos(qualInstituicao: number = 0, quaisAnos: string = "2023,2022") {
        if (this.useLocalData) {
            void qualInstituicao;
            void quaisAnos;
            return dataAssuntos;
        }
        const response = await fetch(`${this.baseUrl}/Indicadores/Assuntos?QualInstituicao=${qualInstituicao}&QuaisAnos=${quaisAnos}`);
        return response.json();
    }
}

export default ObservatorioService;
