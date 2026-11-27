# Cérebro do Dengas — o Claude Code do dono, com campos cerebrais

> **O que é:** como o Dengas pensa e lembra. **Quando ler:** antes de mexer na conversa, na memória ou na persona do Dengas. Volta: [Dengas](README.md). Código: [modelos/dengas/cerebro.js](../../modelos/dengas/cerebro.js) e [modelos/dengas/cerebro/](../../modelos/dengas/cerebro/).

A conversa do Dengas é o **Claude Code do dono** rodando no PC dele, com a persona do Dengas. Quando o PC não tem o Claude Code (ou ele está sem login), a conversa volta pro Claude do artefato (`sample`), como antes. Ele **não** usa o Jarvis: só a ponte do Board (`--strict-mcp-config`). A arquitetura é a do cérebro do Jarvis (córtex, DNA, amígdala, hipocampo, cerebelo, setores, neurônios e sinapses), aplicada ao Claude e guardada em arquivos (`~/.orbita/dengas/cerebro`), sem banco e sem servidor.

| Campo | Arquivo | O que faz |
|---|---|---|
| **Tronco** | [ponte-mcp.mjs](../../modelos/dengas/ponte-mcp.mjs) | a porta: as ferramentas da Mesa e a permissão no chat ("Pode / Agora não") pro Claude Code, por arquivo (`~/.orbita/dengas/ponte`) |
| **DNA** | [cerebro/dna.js](../../modelos/dengas/cerebro/dna.js) | quem ele é e os limites (prompt de sistema); fixo, ele mesmo não muda |
| **Amígdala** | [cerebro/amigdala.js](../../modelos/dengas/cerebro/amigdala.js) | lê o pedido antes do Claude: intenção, tom, urgência, assuntos; escolhe os setores a acender. Sem custo |
| **Hipocampo** | [cerebro/hipocampo.js](../../modelos/dengas/cerebro/hipocampo.js) | o agora: a sessão do Claude Code que continua (`--resume`) e as últimas trocas (`agora.json`) |
| **Córtex** | [cerebro.js](../../modelos/dengas/cerebro.js) | orquestra: monta cada pedido com `[agora]`, `[amígdala]`, `[lembranças]` (e o fio do hipocampo numa sessão nova) e fala com o Claude Code |
| **Cerebelo** | [cerebro/cerebelo.js](../../modelos/dengas/cerebro/cerebelo.js) | consolida, sem bloquear: 3 min depois da conversa parar (ou a cada 6 trocas) um Haiku sem ferramentas destila o que vale lembrar em neurônios |
| **Rede neural** | [cerebro/rede.js](../../modelos/dengas/cerebro/rede.js) | a memória de longo prazo (`rede.json`): neurônios em 6 setores, sinapses por entidades em comum |

## Rede neural
- **Setores:** decisoes (córtex frontal), sessoes (hipocampo), padroes (cerebelo), incidentes (amígdala), planos (pré-frontal), conhecimento (temporal) — os mesmos 6 do Jarvis.
- **Neurônio:** uma frase curta, o setor, as entidades (palavras-chave), força e último uso. Um quase igual no mesmo setor reforça o que já existe em vez de duplicar.
- **Sinapse:** liga neurônios que dividem 2 ou mais entidades; quando dois são lembrados juntos, a ligação reforça.
- **Lembrar:** as palavras do pedido acendem neurônios (com bônus nos setores que a amígdala escolheu), a ativação se espalha um passo pelas sinapses e só os mais fortes entram, até ~1.400 caracteres.
- **Esquecer:** a força cai pela metade a cada ~45 dias sem uso; abaixo de 0,08 o neurônio some.
- O Claude Code também guarda e busca direto: `memoria_guardar` e `memoria_buscar` (pela ponte).

## O que o Claude Code pode sem perguntar
Ler arquivos, procurar, pesquisar na web, criar artefatos, habilidades e todas as ferramentas da Mesa (as travas de "fora do Board" continuam na página). Rodar comando, escrever ou apagar arquivo e o resto pedem permissão no chat (`--permission-prompt-tool`).

## Diagnóstico
`Mesa.dengasCerebro()` (estado: Claude Code ligado, sessão, rede, hipocampo, cerebelo), `Mesa.dengasCerebro.amigdala(texto)`, `Mesa.dengasCerebro.consolidar()`. O diário do Board (`~/.orbita/logs`) registra `dengas:cerebro`.
