import { Card } from "react-dsgov";
import styles from "./home.module.scss";

export function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <Card>
          <Card.Header cardTitle="Observatório" />
          <Card.Content>
            O Observatório tem como principal objetivo o mapeamento das áreas de
            pesquisa, perfis de professores e elaboração de indicadores de
            pesquisa. O Observatório faz parte do Grupo de Pesquisa em Mineração
            da Dados e Imagens (MiDI) do IFTM Campus Avançado Uberaba Parque
            Tecnológico. As estatísticas são realizadas usando o currículo
            Lattes dos professores permanentes da instituição. Para maiores
            informações, clique aqui.
          </Card.Content>
        </Card>
        <Card>
          <Card.Header cardTitle="IFTM" />
          <Card.Content>
            O Instituto Federal de Educação, Ciência e Tecnologia do Triângulo
            Mineiro (IFTM) é composto, atualmente, pelos Campus Campina Verde,
            Ibiá, Ituiutaba, Paracatu, Patos de Minas, Patrocínio, Uberaba,
            Uberaba Parque Tecnológico, Uberlândia e Uberlândia Centro e pela
            Reitoria. A missão do IFTM é ofertar a Educação Profissional e
            Tecnológica por meio do Ensino, Pesquisa e Extensão. Para maiores
            informações, acesse iftm.edu.br.
          </Card.Content>
        </Card>
      </div>
      <Card>
        <Card.Header cardTitle="Atualização dos Dados" />
        <Card.Content>
          Os indicadores são ferramentas de gestão que quantificam o desempenho
          dos docentes do IFTM, sendo essenciais para o seu aprimoramento. A
          lista de docentes é extraída do Portal da Transparência do Governo
          Federal anualmente. Os dados utilizados para a elaboração dos
          indicadores são extraídos da Plataforma Lattes mensalmente. Para saber
          mais sobre cada indicador, basta clicar no ícone (ao lado do título do
          indicador)
        </Card.Content>
      </Card>
      <Card>
        <Card.Header cardTitle="Entre em Contato" />
        <Card.Content>
          Você pode entrar em contato com a equipe de desenvolvimento do
          Observatório IFTM para relatar problemas, deixar sugestões ou
          comentários. Basta enviar um email para o líder do projeto. Para ler
          as principais dúvidas que surgem sobre esta ferramenta e conferir as
          respostas de cada pergunta, clique aqui.
        </Card.Content>
      </Card>
    </div>
  );
}
