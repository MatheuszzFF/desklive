# Diário técnico

> **O que é:** o registro datado de toda mudança ou descoberta técnica de **movimento, tamanho ou hover** (R26), do jeito que foi feita: o que mudou, por quê, os números e como foi provado. **Quando ler:** pra saber como se chegou num número ou numa regra, ou antes de repetir uma tentativa. O estado atual de cada assunto fica no arquivo do assunto; aqui fica a história.

## Arquivos

Um arquivo por mês (`AAAA-MM.md`), dias em ordem e, dentro do dia, a entrada mais nova no fim.

| Arquivo | Período |
|---|---|
| [2026-11.md](2026-11.md) | novembro de 2026: janela do tamanho do conteúdo, motor v2 → v2.2, pesquisa do host, sonda, Onda v20 (motor-piloto) e o vídeo, R25, Onda v21 em andamento |

## Como registrar

Toda mudança técnica de movimento, tamanho ou hover ganha, **na mesma tarefa**:
1. uma entrada no arquivo do mês (modelo abaixo);
2. a atualização do arquivo do assunto ([ambiente](../referencias/ambiente/README.md), [motor](../referencias/motor/README.md), [motion](../padroes/motion/README.md), [hover e balões](../padroes/hover-e-baloes.md)); medição nova → [medições](../referencias/ambiente/medicoes.md); bug novo ou resolvido → [bugs e lições](../referencias/motor/bugs-e-licoes.md);
3. uma linha no [CHANGELOG](../CHANGELOG.md) (e, se for refino de app, a entrada em `apps/<app>/refinos.md`, R22).

Sem caminhos pessoais, nomes de usuário, tokens ou links de artefato: o repo é público.

## Modelo

```
### AAAA-MM-DD · <app> v<N> (ou "host", "motor", "pesquisa") · <título curto>
- **O que mudou:** …
- **Por quê:** o sintoma ou o pedido dele (com a frase, se houver).
- **Números:** antes → depois, com unidade.
- **Como foi provado:** sonda / registro / vídeo a 60 fps / simulador (diga qual) e o que NÃO foi testado.
- **Arquivos:** docs atualizados (links relativos).
```

Marcas de confiança: **(medido)** no app instalado; **(host)** lido no código do host; **(sim)** só no simulador; **(hipótese)** ainda não provado.
