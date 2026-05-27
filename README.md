# Sentinela Digital Pro

Aplicacao 100% via software para demonstrar um centro de operacoes de infraestrutura critica comunitaria.

## O que ela simula

- Energia solar, baterias e cargas por setor.
- Internet comunitaria com roteadores mesh, latencia, perda de pacotes e disponibilidade.
- Sensores ambientais com temperatura, fumaca, qualidade do ar e disponibilidade da malha.
- Inventario de ativos com saude, prioridade e proxima acao.
- Incidentes com severidade, causa raiz provavel, MTTR e plano de resposta.
- Visualizacao detalhada de cada parte da topologia viva ao clicar nos nos do mapa.
- Faixa visual de resiliencia por dominio e brief automatico para decisao operacional.
- Integracao opcional com **Open-Meteo**, escolhida como API principal da pesquisa por ser JSON, sem chave e adequada a projetos comunitarios.

## Diferencial

O **Modo Guardiao** funciona como um gemeo digital operacional:

- calcula risco por dominio;
- preve autonomia e possibilidade de colapso;
- estima SLA e MTTR;
- identifica causa raiz provavel;
- recomenda acoes de isolamento, protecao e recuperacao.

## Como executar

Abra `index.html` no navegador ou sirva a pasta:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Depois acesse:

```text
http://127.0.0.1:8765/index.html
```

## Como apresentar

Use os botoes de **Cenarios controlados**:

- **Tempestade**: queda de geracao solar, consumo alto e radio instavel.
- **Backhaul degradado**: latencia, perda e roteadores caindo.
- **Alerta ambiental**: calor, fumaca e sensores intermitentes.
- **Falha cibernetica**: ruido de rede e leituras suspeitas.
- **Falha em cascata**: crise simultanea com priorizacao automatica.
- **Recuperar**: restaura a operacao normal.

Clique nos membros da **Topologia viva da comunidade** para abrir a visao detalhada do ativo, com telemetria local, dependencias, diagnostico, impacto comunitario e mini grafico.

Use **Copiar relatorio** no painel de decisao operacional para gerar um resumo rapido do estado da infraestrutura.

Use **Atualizar Open-Meteo** para buscar telemetria real por latitude/longitude. Se a API falhar ou a internet estiver indisponivel, o app continua no fallback simulado.

## Arquivos

- `index.html`: estrutura da aplicacao.
- `styles.css`: visual responsivo.
- `app.js`: simulacao, analises e graficos.
- `TASKLIST.md`: plano executavel do sistema completo.
- `MELHORIAS.md`: melhorias priorizadas e executadas.
