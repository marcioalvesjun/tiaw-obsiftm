import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "react-dsgov";
import useObservatorioService from "../../../../hooks/use-observatorio-service";
import {
  StackedBarChart,
  StackedBarChartSegment,
  StackedBarChartDatum,
} from "../../../../components/charts/stacked-bar-chart/stacked-bar-chart";
import styles from "./search-by-campus.module.scss";

export function SearchByCampusBibliographic() {
  const observatorioService = useObservatorioService();

  type BibliographicItemKey =
    | "eventoArtigoCompleto"
    | "eventoArtigoResumo"
    | "revistaArtigo"
    | "capituloLivro"
    | "livro";

  type ProducaoBibliograficaRow = {
    ano: number;
    instituicao?: {
      id: number;
      nome: string;
      quantidadeProfessores?: number | null;
      professores?: unknown;
    } | null;
    instituicaoID?: number | null;
    eventoArtigoCompleto?: number | null;
    eventoArtigoResumo?: number | null;
    revistaArtigo?: number | null;
    capituloLivro?: number | null;
    livro?: number | null;
  };

  const bibliographicSegments = useMemo<Array<StackedBarChartSegment<BibliographicItemKey>>>(
    () => [
      { key: "eventoArtigoCompleto", label: "Artigo completo em evento", color: "#0D6EFD" },
      { key: "eventoArtigoResumo", label: "Resumo em evento", color: "#198754" },
      { key: "revistaArtigo", label: "Artigo em periodico", color: "#6F42C1" },
      { key: "capituloLivro", label: "Capitulo de Livro", color: "#FD7E14" },
      { key: "livro", label: "Livro", color: "#DC3545" },
    ],
    [],
  );

  const periodicalSegments = useMemo<Array<StackedBarChartSegment<"revistaArtigo">>>(
    () => [
      {
        key: "revistaArtigo",
        label: "Artigo em periodico",
        color: bibliographicSegments.find((s) => s.key === "revistaArtigo")?.color ?? "#6F42C1",
      },
    ],
    [bibliographicSegments],
  );

  const allBibliographicKeys = useMemo<BibliographicItemKey[]>(
    () => bibliographicSegments.map((s) => s.key),
    [bibliographicSegments],
  );

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<ProducaoBibliograficaRow[]>([]);

  const [campusOptions, setCampusOptions] = useState<Array<{ id: number; nome: string }>>([]);
  const [selectedCampusId, setSelectedCampusId] = useState<number>(0);
  const selectedCampusIdRef = useRef<number>(selectedCampusId);

  useEffect(() => {
    selectedCampusIdRef.current = selectedCampusId;
  }, [selectedCampusId]);

  const [activeBibliographicKeys, setActiveBibliographicKeys] = useState<BibliographicItemKey[]>(allBibliographicKeys);

  useEffect(() => {
    setActiveBibliographicKeys((prev) => {
      const allowed = new Set(allBibliographicKeys);
      const filtered = prev.filter((k) => allowed.has(k));
      return filtered.length ? filtered : allBibliographicKeys;
    });
  }, [allBibliographicKeys]);

  useEffect(() => {
    let mounted = true;

    const loadInitial = async () => {
      try {
        setLoading(true);
        const data = (await observatorioService.getProducaoBibliografica(0)) as ProducaoBibliograficaRow[];
        if (!mounted) return;

        setRows(data ?? []);

        const unique = new Map<number, string>();
        (data ?? []).forEach((r) => {
          const id = r.instituicao?.id ?? r.instituicaoID ?? 0;
          const nome = r.instituicao?.nome ?? "Todos os Campi";
          if (Number.isFinite(id)) unique.set(id, nome);
        });

        const options = Array.from(unique.entries())
          .map(([id, nome]) => ({ id, nome }))
          .sort((a, b) => a.id - b.id);

        const finalOptions = options.length ? options : [{ id: 0, nome: "Todos os Campi" }];
        setCampusOptions(finalOptions);

        if (!finalOptions.some((o) => o.id === selectedCampusIdRef.current) && finalOptions[0]) {
          setSelectedCampusId(finalOptions[0].id);
        }
      } catch (e) {
        console.error("Failed to load ProducaoBibliografica:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadInitial();
    return () => {
      mounted = false;
    };
  }, [observatorioService]);

  useEffect(() => {
    if (selectedCampusId === undefined || Number.isNaN(selectedCampusId)) return;
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const data = (await observatorioService.getProducaoBibliografica(selectedCampusId)) as ProducaoBibliograficaRow[];
        if (!mounted) return;
        setRows(data ?? []);
      } catch (e) {
        console.error("Failed to load ProducaoBibliografica by campus:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [observatorioService, selectedCampusId]);

  const years = useMemo(() => {
    const set = new Set<number>();
    rows.forEach((r) => set.add(Number(r.ano)));
    return Array.from(set).sort((a, b) => a - b);
  }, [rows]);

  const bibliographicQuantityData = useMemo<Array<StackedBarChartDatum<BibliographicItemKey>>>(() => {
    const emptyValues = (): Record<BibliographicItemKey, number> => ({
      eventoArtigoCompleto: 0,
      eventoArtigoResumo: 0,
      revistaArtigo: 0,
      capituloLivro: 0,
      livro: 0,
    });

    const map = new Map<number, Record<BibliographicItemKey, number>>();
    years.forEach((y) => map.set(y, emptyValues()));

    rows.forEach((r) => {
      const year = Number(r.ano);
      if (!map.has(year)) map.set(year, emptyValues());
      const acc = map.get(year)!;
      acc.eventoArtigoCompleto += Number(r.eventoArtigoCompleto ?? 0);
      acc.eventoArtigoResumo += Number(r.eventoArtigoResumo ?? 0);
      acc.revistaArtigo += Number(r.revistaArtigo ?? 0);
      acc.capituloLivro += Number(r.capituloLivro ?? 0);
      acc.livro += Number(r.livro ?? 0);
    });

    return years.map((y) => ({ x: y, values: map.get(y)! }));
  }, [rows, years]);

  const bibliographicAverageData = useMemo<Array<StackedBarChartDatum<BibliographicItemKey>>>(() => {
    const denomByYear = new Map<number, number>();
    rows.forEach((r) => {
      const year = Number(r.ano);
      const denom = Number(r.instituicao?.quantidadeProfessores ?? 0);
      if (!denomByYear.has(year)) denomByYear.set(year, denom);
    });

    return bibliographicQuantityData.map((d) => {
      const denom = denomByYear.get(Number(d.x)) ?? 0;
      const values = { ...d.values };
      (Object.keys(values) as BibliographicItemKey[]).forEach((k) => {
        values[k] = denom > 0 ? values[k] / denom : 0;
      });
      return { x: d.x, values };
    });
  }, [bibliographicQuantityData, rows]);

  const periodicalQuantityData = useMemo<Array<StackedBarChartDatum<"revistaArtigo">>>(() => {
    const map = new Map<number, number>();
    years.forEach((y) => map.set(y, 0));

    rows.forEach((r) => {
      const year = Number(r.ano);
      if (!map.has(year)) map.set(year, 0);
      map.set(year, (map.get(year) ?? 0) + Number(r.revistaArtigo ?? 0));
    });

    return years.map((y) => ({
      x: y,
      values: { revistaArtigo: map.get(y) ?? 0 },
    }));
  }, [rows, years]);

  const periodicalAverageData = useMemo<Array<StackedBarChartDatum<"revistaArtigo">>>(() => {
    const denomByYear = new Map<number, number>();
    rows.forEach((r) => {
      const year = Number(r.ano);
      const denom = Number(r.instituicao?.quantidadeProfessores ?? 0);
      if (!denomByYear.has(year)) denomByYear.set(year, denom);
    });

    return periodicalQuantityData.map((d) => {
      const denom = denomByYear.get(Number(d.x)) ?? 0;
      const value = d.values.revistaArtigo;
      return { x: d.x, values: { revistaArtigo: denom > 0 ? value / denom : 0 } };
    });
  }, [periodicalQuantityData, rows]);

  const normalizeProfessorList = (input: unknown): unknown[] | null => {
    const anyInput = input as any;
    if (!anyInput) return null;
    if (Array.isArray(anyInput)) return anyInput;
    if (Array.isArray(anyInput.professores)) return anyInput.professores;
    if (Array.isArray(anyInput.items)) return anyInput.items;
    if (Array.isArray(anyInput.data)) return anyInput.data;
    return null;
  };

  const hasProfessorDetails = useMemo(
    () => rows.some((r) => Array.isArray(normalizeProfessorList(r.instituicao?.professores))),
    [rows],
  );

  const docProductionCountsData = useMemo<Array<StackedBarChartDatum<BibliographicItemKey>>>(() => {
    if (!hasProfessorDetails) {
      const denomByYear = new Map<number, number>();
      rows.forEach((r) => {
        const year = Number(r.ano);
        const denom = Number(r.instituicao?.quantidadeProfessores ?? 0);
        if (!denomByYear.has(year)) denomByYear.set(year, denom);
      });

      return bibliographicQuantityData.map((d) => {
        const denom = denomByYear.get(Number(d.x)) ?? 0;
        const total = (Object.keys(d.values) as BibliographicItemKey[]).reduce((sum, k) => sum + (d.values[k] ?? 0), 0);

        const values: Record<BibliographicItemKey, number> = {
          eventoArtigoCompleto: 0,
          eventoArtigoResumo: 0,
          revistaArtigo: 0,
          capituloLivro: 0,
          livro: 0,
        };

        (Object.keys(values) as BibliographicItemKey[]).forEach((k) => {
          values[k] = denom > 0 && total > 0 ? Math.round(denom * (d.values[k] ?? 0) / total) : 0;
        });

        return { x: d.x, values };
      });
    }

    const emptyValues = (): Record<BibliographicItemKey, number> => ({
      eventoArtigoCompleto: 0,
      eventoArtigoResumo: 0,
      revistaArtigo: 0,
      capituloLivro: 0,
      livro: 0,
    });

    const map = new Map<number, Record<BibliographicItemKey, number>>();
    years.forEach((y) => map.set(y, emptyValues()));

    rows.forEach((r) => {
      const year = Number(r.ano);
      const professorList = normalizeProfessorList(r.instituicao?.professores);
      if (!professorList) return;

      if (!map.has(year)) map.set(year, emptyValues());
      const acc = map.get(year)!;

      professorList.forEach((p) => {
        const anyP = p as any;
        if (Number(anyP.eventoArtigoCompleto ?? 0) > 0) acc.eventoArtigoCompleto += 1;
        if (Number(anyP.eventoArtigoResumo ?? 0) > 0) acc.eventoArtigoResumo += 1;
        if (Number(anyP.revistaArtigo ?? 0) > 0) acc.revistaArtigo += 1;
        if (Number(anyP.capituloLivro ?? 0) > 0) acc.capituloLivro += 1;
        if (Number(anyP.livro ?? 0) > 0) acc.livro += 1;
      });
    });

    return years.map((y) => ({ x: y, values: map.get(y)! }));
  }, [hasProfessorDetails, rows, years, bibliographicQuantityData]);

  const docProductionPercentData = useMemo<Array<StackedBarChartDatum<BibliographicItemKey>>>(() => {
    if (!hasProfessorDetails) {
      return bibliographicQuantityData.map((d) => {
        const total = (Object.keys(d.values) as BibliographicItemKey[]).reduce((sum, k) => sum + (d.values[k] ?? 0), 0);
        const values = { ...d.values };
        (Object.keys(values) as BibliographicItemKey[]).forEach((k) => {
          values[k] = total > 0 ? (values[k] / total) * 100 : 0;
        });
        return { x: d.x, values };
      });
    }

    const denomByYear = new Map<number, number>();
    rows.forEach((r) => {
      const year = Number(r.ano);
      const denom = Number(r.instituicao?.quantidadeProfessores ?? 0);
      if (!denomByYear.has(year)) denomByYear.set(year, denom);
    });

    return docProductionCountsData.map((d) => {
      const denom = denomByYear.get(Number(d.x)) ?? 0;
      const values = { ...d.values };
      (Object.keys(values) as BibliographicItemKey[]).forEach((k) => {
        values[k] = denom > 0 ? (values[k] / denom) * 100 : 0;
      });
      return { x: d.x, values };
    });
  }, [hasProfessorDetails, bibliographicQuantityData, docProductionCountsData, rows]);

  const activePeriodicalKeys = useMemo<Array<"revistaArtigo">>(
    () => (activeBibliographicKeys.includes("revistaArtigo") ? ["revistaArtigo"] : []),
    [activeBibliographicKeys],
  );

  const handlePeriodicalActiveKeysChange = (next: Array<"revistaArtigo">) => {
    const wantsRevista = next.includes("revistaArtigo");
    setActiveBibliographicKeys((prev) => {
      const had = prev.includes("revistaArtigo");
      if (wantsRevista && !had) return [...prev, "revistaArtigo"];
      if (!wantsRevista && had) return prev.filter((k) => k !== "revistaArtigo");
      return prev;
    });
  };

  return (
    <div className={styles.container}>
      <Card>
        <Card.Header cardTitle="Produção Bibliográfica - Consulta por Campus" />
        <Card.Content>
          <div className={styles.controls}>
            <label className={styles.control}>
              <span className={styles.label}>Campus</span>
              <select
                className={styles.select}
                value={selectedCampusId}
                onChange={(e) => setSelectedCampusId(Number(e.target.value))}
                disabled={loading}
              >
                {campusOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </label>
            <div className={styles.controlsHint}>
              {loading ? "Carregando dados..." : "Selecione o campus e ajuste os itens do gráfico."}
            </div>
          </div>
        </Card.Content>
      </Card>

      <div className={styles.chartsGrid}>
        <Card>
          <Card.Header cardTitle="Produção Bibliográfica: Quantidade x Anos" />
          <Card.Content>
            <StackedBarChart
              data={bibliographicQuantityData}
              segments={bibliographicSegments}
              activeSegmentKeys={activeBibliographicKeys}
              onActiveSegmentKeysChange={setActiveBibliographicKeys}
              formatValue={(v) => String(Math.round(v))}
              segmentLabelMinHeightPercent={0.5}
              emptyStateMessage={loading ? "Carregando..." : "Sem dados para o campus selecionado."}
            />
          </Card.Content>
        </Card>

        <Card>
          <Card.Header cardTitle="Produção Bibliográfica: Média por docente x Anos" />
          <Card.Content>
            <StackedBarChart
              data={bibliographicAverageData}
              segments={bibliographicSegments}
              activeSegmentKeys={activeBibliographicKeys}
              onActiveSegmentKeysChange={setActiveBibliographicKeys}
              formatValue={(v) => (Number.isFinite(v) ? v.toFixed(2) : "0,00")}
              segmentLabelMinHeightPercent={0.5}
              emptyStateMessage="Sem dados disponíveis."
            />
          </Card.Content>
        </Card>

        <Card>
          <Card.Header cardTitle="Docentes com Produção Bibliográfica: Quantidade de Docentes x Anos" />
          <Card.Content>
            <StackedBarChart
              data={docProductionCountsData}
              segments={bibliographicSegments}
              activeSegmentKeys={activeBibliographicKeys}
              onActiveSegmentKeysChange={setActiveBibliographicKeys}
              formatValue={(v) => String(Math.round(v))}
              segmentLabelMinHeightPercent={0.5}
              emptyStateMessage="Sem dados para este indicador."
            />
            {!hasProfessorDetails ? (
              <div className={styles.fallbackNote}>
                Observação: a API não retornou detalhes de professores; este indicador foi estimado com base na proporção da produção.
              </div>
            ) : null}
          </Card.Content>
        </Card>

        <Card>
          <Card.Header cardTitle="Docentes com Produção Bibliográfica: Percentual de Docentes x Anos" />
          <Card.Content>
            <StackedBarChart
              data={docProductionPercentData}
              segments={bibliographicSegments}
              activeSegmentKeys={activeBibliographicKeys}
              onActiveSegmentKeysChange={setActiveBibliographicKeys}
              formatValue={(v) => `${v.toFixed(1)}%`}
              segmentLabelMinHeightPercent={0.5}
              emptyStateMessage="Sem dados para este indicador."
            />
            {!hasProfessorDetails ? (
              <div className={styles.fallbackNote}>
                Observação: a API não retornou detalhes de professores; este indicador foi estimado com base na proporção da produção.
              </div>
            ) : null}
          </Card.Content>
        </Card>

        <Card>
          <Card.Header cardTitle="Produção em Periódicos: Quantidade x Anos" />
          <Card.Content>
            <StackedBarChart
              data={periodicalQuantityData}
              segments={periodicalSegments}
              activeSegmentKeys={activePeriodicalKeys}
              onActiveSegmentKeysChange={handlePeriodicalActiveKeysChange}
              formatValue={(v) => String(Math.round(v))}
              segmentLabelMinHeightPercent={0}
              emptyStateMessage="Sem dados para o indicador de periódicos."
            />
          </Card.Content>
        </Card>

        <Card>
          <Card.Header cardTitle="Produção em Periódicos: Média por professor x Anos" />
          <Card.Content>
            <StackedBarChart
              data={periodicalAverageData}
              segments={periodicalSegments}
              activeSegmentKeys={activePeriodicalKeys}
              onActiveSegmentKeysChange={handlePeriodicalActiveKeysChange}
              formatValue={(v) => (Number.isFinite(v) ? v.toFixed(2) : "0,00")}
              segmentLabelMinHeightPercent={0}
              emptyStateMessage="Sem dados para o indicador de periódicos."
            />
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
