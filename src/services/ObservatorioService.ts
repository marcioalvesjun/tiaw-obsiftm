class ObservatorioService {
    private readonly baseUrl = "https://obsiftm.midi.upt.iftm.edu.br/api";

    public async getProducaoBibliografica(qualInstituicao: number = 0) {
        const response = await fetch(`${this.baseUrl}/Indicadores/ProducaoBibliografica?QualInstituicao=${qualInstituicao}`);
        return response.json();
    }

    public async getOrientacao(qualInstituicao: number = 0) {
        const response = await fetch(`${this.baseUrl}/Indicadores/Orientacao?QualInstituicao=${qualInstituicao}`);
        return response.json();
    }

    public async getUltimaAtualizacaoLattes(qualInstituicao: number = 0) {
        const response = await fetch(`${this.baseUrl}/Pesquisadores/UltimaAtualizacaoLattes?QualInstituicao=${qualInstituicao}`);
        return response.json();
    }

    public async getTitularidade(qualInstituicao: number = 0) {
        const response = await fetch(`${this.baseUrl}/Pesquisadores/Titularidade?QualInstituicao=${qualInstituicao}`);
        return response.json();
    }

    public async getFormacaoAcademica(qualInstituicao: number = 0, qualFormacao: number = 1) {
        const response = await fetch(`${this.baseUrl}/Pesquisadores/FormacaoAcademica?QualInstituicao=${qualInstituicao}&QualFormacao=${qualFormacao}`);
        return response.json();
    }

    public async getAssuntos(qualInstituicao: number = 0, quaisAnos: string = "2023,2022") {
        const response = await fetch(`${this.baseUrl}/Indicadores/Assuntos?QualInstituicao=${qualInstituicao}&QuaisAnos=${quaisAnos}`);
        return response.json();
    }
}

export default ObservatorioService;
