# Mesa: arquitetura

A Mesa é um artefato do Claude instalado como app, que cobre a área de trabalho com uma janela só. Dentro dela
moram os widgets e o Dengas, o assistente. Este documento diz onde cada coisa fica e por quê, no estado da
**Mesa 0.16** (piloto). O histórico de cada mudança, com o que foi e o que não foi testado, está em
`apps/mesa/refinos.md`.

## As quatro camadas

| Camada | Onde | O que é | Quando usar |
|---|---|---|---|
| Casca | `mesa-src.html` | A janela única, a moldura dos widgets (arrastar, redimensionar pelas bordas, X flutuante), o barramento de eventos, o clique que passa pro Windows, aparência, visões | Só o que vale pra todos os widgets |
| Widget de fábrica | `widgets/NN-nome.js`, `Mesa.define` | Roda dentro da página; alcança o PC pelo PowerShell (`api.ps`, `api.ajudante`) | Precisa do PC ou da rede |
| Hóspede | `Mesa.hospeda` + marcador `APP:nome` na montagem | Um app inteiro do desklive rodando original num iframe, com uma "janela de mentira" | O app já existe (Onda, Órbita) |
| Widget solto | `Mesa.criaSolto`, guardado como dado | iframe com sandbox, sem PC e sem rede; fala pelo objeto `mesa` | Só interface e lógica; é o que o Dengas cria na hora |

Regra de bolso: começa como solto; se precisar do PC ou da rede, vira de fábrica; se já existe como app, entra como hóspede.

## Contrato de todo widget

- `estado()`: o que o Dengas enxerga dele. Curto, em dados simples.
- `comandos: [{ nome, descricao, esquema, roda }]`: o que dá pra fazer com ele.
- `api.emitir(tipo, dado)`: eventos no barramento, com o nome `<id>:<tipo>`.
- `Mesa.agente('<id>', '<regras>')`: as regras do mini agente do app (ver abaixo).
- Um widget nunca chama outro direto: só por comando ou evento.

## Dengas e os mini agentes

O Dengas (`widgets/00-dengas.js`) conversa com o Claude da própria pessoa (capacidade `sample` do artefato, sem
chave de API). Ele não carrega as ferramentas de todos os apps: isso estourava o teto de ferramentas por pergunta
e misturava o conhecimento de cada app na cabeça dele. Em vez disso:

```
pessoa ──> Dengas (regras gerais + ferramentas da casca)
              ├─ widget_comando  → um comando só, direto no app
              └─ agente(app, pedido)
                    └─ mini agente do app: outra chamada ao Claude, com
                         · as regras do app (Mesa.agente)
                         · o estado do app e o espaço da tela (caixa dele e dos vizinhos)
                         · as ferramentas do app (os comandos) + caixa (mover/redimensionar a si mesmo)
                       faz quantos passos precisar e devolve o resultado em texto
```

- Todo app com comandos ganha um agente sem código a mais. As regras são opcionais; sem elas o agente trabalha só
  pelas descrições dos comandos.
- O Dengas passa o **objetivo**, não os passos. Quem sabe os passos é o agente do app.
- Custo: uma tarefa delegada são duas chamadas ao Claude, então é mais lenta que um comando direto. Por isso o
  comando direto continua existindo.
- O mapa da tela que os agentes recebem hoje vem de `Mesa.estado()` (tamanho da tela e a caixa de cada widget).
  Um mapa mais rico (espaço livre, espaçamentos) entra por aí, sem mudar o contrato.

Ferramentas da casca que o Dengas tem: `mesa_estado`, `mesa_widget`, `widget_comando`, `agente`, `mesa_aparencia`,
`internet`, `conector`, `documento`, `widget_criar`, `widget_fonte`, `widget_remover`, `mesa_visao`, `mesa_app`,
`lembrar`, `abrir_site`.

### Limites do Claude do artefato

- Descrição de ferramenta até 1 KB, esquema até 4 KB, nome com `A-Z a-z 0-9 _ -`.
- Número de ferramentas por pergunta: `sample.limits().tools.maxCount`.
- A lista de ferramentas é fixada quando a pergunta começa. Por isso `widget_comando` e `agente` resolvem o app na
  hora da chamada.
- Texto longo de instrução vai nas regras, nunca na descrição de uma ferramenta.

## O que o app instalado barra, e como a Mesa contorna

| Barreira | Saída |
|---|---|
| Página de fora embutida (`frame-src`): iframe de YouTube ou de qualquer site fica preto | O **furo**: o widget abre uma janela do Edge em modo app, sem moldura, e a mantém embaixo de um buraco do widget (`.furo` deixa o clique passar) |
| A página não tem rede | Tudo que precisa de internet sai pelo PowerShell do PC |

## Navegador da Mesa (`widgets/35-video.js`)

- Janela do Edge com perfil próprio (`~/.mesa/edge`), que guarda os logins de quem usa.
- A janela é posta e movida com `SetWindowPos`; a barra de título que o Edge desenha é escondida subindo a janela e
  recortando com `SetWindowRgn`. Nenhuma tecla é enviada ao PC.
- Ler e agir na página: o Edge abre com uma porta de depuração local, sorteada a cada abertura, e o ajudante roda
  funções na página (`Runtime.evaluate`). As funções são escritas no widget; o que vem do Claude entra só como
  dado. Comandos: `tocar`, `abrir_site`, `ler_tela`, `clicar`, `rolar`, `voltar`, `fechar_janela`.
- De propósito não existe comando de digitar em página: nada de formulário, login, compra ou envio de mensagem.
- Risco conhecido: enquanto a janela está aberta, qualquer programa do próprio PC pode usar essa porta.

## Internet do Dengas

Ferramenta `internet`, pelo PowerShell: `pesquisar` (resultados em texto), `imagens` (API aberta do Wikimedia
Commons) e `ler` (texto de uma página https). O texto do Claude vai em base64 e nunca vira código.

## Conectores do Claude

Pela capacidade `mcp` do artefato o Dengas usa os conectores da conta de quem instalou (e-mail, agenda,
arquivos, música). A página só alcança o que for declarado ao publicar, em `capabilities.mcp.servers`: o nome de
exibição do conector e os nomes das ferramentas. A lista viva vem de `listTools()` e entra nas regras do Dengas;
a ferramenta `conector` descreve e chama. Criar documento (`documento`) só acontece no clique da pessoa num botão.
Ao publicar, passar sempre o conjunto inteiro de capacidades (`desktop`, `sample`, `mcp`).

## Montar e testar

```
powershell -NoProfile -ExecutionPolicy Bypass -File modelos\mesa\build.ps1 -SemToqueDeTecla
```

Sai em `modelos/saida/mesa.html` (fora do git). No navegador, por `localhost`, dá pra conferir a casca, os widgets
e os ganchos `window.Mesa` e `window.__mesa`. O que depende do app instalado (Claude, PC, conectores, a janela do
Edge alinhada ao furo) só se confere lá: cada entrada do `refinos.md` diz o que ficou sem testar.

## Próximos passos

- Dengas que reage sozinho: um pulso que junta os eventos do barramento e chama o Claude quando vale, com filtro,
  intervalo mínimo e modo quieto.
- Mapa completo da tela como fonte do estado que os agentes recebem.
- Cada widget na própria pasta, com README, pronto pra compartilhar.
- Mais de uma aba no navegador; a Estante como hóspede.
