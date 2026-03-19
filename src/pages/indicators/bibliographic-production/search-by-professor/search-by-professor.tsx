import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "react-dsgov";
import useObservatorioService from "../../../../hooks/use-observatorio-service";
import {
  StackedBarChart,
  StackedBarChartDatum,
  StackedBarChartSegment,
} from "../../../../components/charts/stacked-bar-chart/stacked-bar-chart";
import styles from "./search-by-professor.module.scss";

export function SearchByProfessorBibliographic() {
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
      quantidadeProfessores?: number | null;
      professores?: unknown;
    } | null;
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

  const normalizeProfessorList = (input: unknown): unknown[] | null => {
    const anyInput = input as any;
    if (!anyInput) return null;
    if (Array.isArray(anyInput)) return anyInput;
    if (Array.isArray(anyInput.professores)) return anyInput.professores;
    if (Array.isArray(anyInput.items)) return anyInput.items;
    if (Array.isArray(anyInput.data)) return anyInput.data;
    return null;
  };

  const professorOptions = useMemo<Array<{ key: string; label: string }>>(() => {
    const seen = new Set<string>();
    const options: Array<{ key: string; label: string }> = [];

    for (const r of rows) {
      const list = normalizeProfessorList(r.instituicao?.professores);
      if (!list) continue;

      for (const p of list) {
        const anyP = p as any;
        const id =
          anyP.id ?? anyP.codigo ?? anyP.matricula ?? anyP.siape ?? anyP.professorID ?? anyP.professorId ?? null;
        const nome = anyP.nome ?? anyP.Nome ?? anyP.title ?? anyP.label ?? "Professor";
        const key = id != null ? String(id) : nome;

        if (seen.has(key)) continue;
        seen.add(key);
        options.push({ key, label: String(nome) });
      }
    }

    return options.sort((a, b) => a.label.localeCompare(b.label));
  }, [rows]);

  const selectedProfessorKeyInitial = professorOptions[0]?.key ?? "";
  const [selectedProfessorKey, setSelectedProfessorKey] = useState<string>(selectedProfessorKeyInitial);

  useEffect(() => {
    setSelectedProfessorKey((prev) => {
      if (prev && professorOptions.some((o) => o.key === prev)) return prev;
      return professorOptions[0]?.key ?? "";
    });
  }, [professorOptions]);

  const hasProfessorDetails = useMemo(() => {
    return rows.some((r) => Array.isArray(r.instituicao?.professores));
  }, [rows]);

  const [activeBibliographicKeys, setActiveBibliographicKeys] = useState<BibliographicItemKey[]>(allBibliographicKeys);
  useEffect(() => setActiveBibliographicKeys(allBibliographicKeys), [allBibliographicKeys]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = (await observatorioService.getProducaoBibliografica(0)) as ProducaoBibliograficaRow[];
        if (!mounted) return;
        setRows(data ?? []);
      } catch (e) {
        console.error("Failed to load ProducaoBibliografica:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [observatorioService]);

  const years = useMemo(() => {
    const set = new Set<number>();
    rows.forEach((r) => set.add(Number(r.ano)));
    return Array.from(set).sort((a, b) => a - b);
  }, [rows]);

  const getProfessorSegmentCounts = useCallback(
    (prof: unknown): Record<BibliographicItemKey, number> => {
      const anyP = prof as any;
      const eventoArtigoCompleto = Number(anyP.eventoArtigoCompleto ?? 0);
      const eventoArtigoResumo = Number(anyP.eventoArtigoResumo ?? 0);
      const revistaArtigo = Number(anyP.revistaArtigo ?? 0);
      const capituloLivro = Number(anyP.capituloLivro ?? 0);
      const livro = Number(anyP.livro ?? 0);

      return {
        eventoArtigoCompleto,
        eventoArtigoResumo,
        revistaArtigo,
        capituloLivro,
        livro,
      };
    },
    [],
  );

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

    for (const r of rows) {
      const year = Number(r.ano);
      if (!map.has(year)) map.set(year, emptyValues());

      if (!hasProfessorDetails || !selectedProfessorKey) {
        const acc = map.get(year)!;
        acc.eventoArtigoCompleto += Number(r.eventoArtigoCompleto ?? 0);
        acc.eventoArtigoResumo += Number(r.eventoArtigoResumo ?? 0);
        acc.revistaArtigo += Number(r.revistaArtigo ?? 0);
        acc.capituloLivro += Number(r.capituloLivro ?? 0);
        acc.livro += Number(r.livro ?? 0);
        continue;
      }

      const profList = normalizeProfessorList(r.instituicao?.professores);
      if (!profList) continue;

      const match = profList.find((p) => {
        const anyP = p as any;
        const id = anyP.id ?? anyP.codigo ?? anyP.matricula ?? anyP.siape ?? anyP.professorID ?? anyP.professorId ?? null;
        const name = anyP.nome ?? anyP.Nome ?? "";
        const key = id != null ? String(id) : String(name);
        return key === selectedProfessorKey;
      });

      if (!match) continue;
      const acc = map.get(year)!;
      const counts = getProfessorSegmentCounts(match);
      (Object.keys(acc) as BibliographicItemKey[]).forEach((k) => {
        acc[k] = counts[k] ?? 0;
      });
    }

    return years.map((y) => ({ x: y, values: map.get(y)! }));
  }, [hasProfessorDetails, rows, selectedProfessorKey, years, getProfessorSegmentCounts]);

  const bibliographicAverageData = useMemo<Array<StackedBarChartDatum<BibliographicItemKey>>>(() => {
    if (!hasProfessorDetails) {
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
    }

    return bibliographicQuantityData.map((d) => ({ x: d.x, values: { ...d.values } }));
  }, [bibliographicQuantityData, hasProfessorDetails, rows]);

  const periodicalQuantityData = useMemo<Array<StackedBarChartDatum<"revistaArtigo">>>(() => {
    return years.map((y) => ({
      x: y,
      values: { revistaArtigo: bibliographicQuantityData.find((d) => Number(d.x) === y)?.values.revistaArtigo ?? 0 },
    }));
  }, [bibliographicQuantityData, years]);

  const periodicalAverageData = useMemo<Array<StackedBarChartDatum<"revistaArtigo">>>(() => {
    return years.map((y) => ({
      x: y,
      values: { revistaArtigo: bibliographicAverageData.find((d) => Number(d.x) === y)?.values.revistaArtigo ?? 0 },
    }));
  }, [bibliographicAverageData, years]);

  const docProductionCountsData = useMemo<Array<StackedBarChartDatum<BibliographicItemKey>>>(() => {
    if (!hasProfessorDetails || !selectedProfessorKey) {
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

    return bibliographicQuantityData.map((d) => {
      const values: Record<BibliographicItemKey, number> = {
        eventoArtigoCompleto: d.values.eventoArtigoCompleto > 0 ? 1 : 0,
        eventoArtigoResumo: d.values.eventoArtigoResumo > 0 ? 1 : 0,
        revistaArtigo: d.values.revistaArtigo > 0 ? 1 : 0,
        capituloLivro: d.values.capituloLivro > 0 ? 1 : 0,
        livro: d.values.livro > 0 ? 1 : 0,
      };
      return { x: d.x, values };
    });
  }, [bibliographicQuantityData, hasProfessorDetails, rows, selectedProfessorKey]);

  const docProductionPercentData = useMemo<Array<StackedBarChartDatum<BibliographicItemKey>>>(() => {
    if (!hasProfessorDetails || !selectedProfessorKey) {
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

    return bibliographicQuantityData.map((d) => {
      const denom = denomByYear.get(Number(d.x)) ?? 0;
      const percentBase = denom > 0 ? 100 / denom : 0;

      const values: Record<BibliographicItemKey, number> = {
        eventoArtigoCompleto: d.values.eventoArtigoCompleto > 0 ? percentBase : 0,
        eventoArtigoResumo: d.values.eventoArtigoResumo > 0 ? percentBase : 0,
        revistaArtigo: d.values.revistaArtigo > 0 ? percentBase : 0,
        capituloLivro: d.values.capituloLivro > 0 ? percentBase : 0,
        livro: d.values.livro > 0 ? percentBase : 0,
      };
      return { x: d.x, values };
    });
  }, [bibliographicQuantityData, hasProfessorDetails, rows, selectedProfessorKey]);

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
        <Card.Header cardTitle="Produção Bibliográfica - Consulta por Docente" />
        <Card.Content>
          <div className={styles.controls}>
            <label className={styles.control}>
              <span className={styles.label}>Docente</span>
              <select
                className={styles.select}
                value={selectedProfessorKey}
                onChange={(e) => setSelectedProfessorKey(e.target.value)}
                disabled={loading || !hasProfessorDetails || professorOptions.length === 0}
              >
                {professorOptions.length ? (
                  professorOptions.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.label}
                    </option>
                  ))
                ) : (
                  <option value="">Sem dados de professores</option>
                )}
              </select>
            </label>
            <div className={styles.controlsHint}>
              {!hasProfessorDetails ? "A API atual não retorna detalhes por docente; os indicadores serão exibidos de forma estimada." : "Selecione um docente para ver a evolução por ano."}
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
              emptyStateMessage="Sem dados para o período."
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
            {!hasProfessorDetails ? <div className={styles.fallbackNote}>Observação: indicadores estimados (API sem detalhes de professores).</div> : null}
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
            {!hasProfessorDetails ? <div className={styles.fallbackNote}>Observação: indicadores estimados (API sem detalhes de professores).</div> : null}
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
