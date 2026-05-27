# Sentinela Digital Pro

Aplicação 100% via software para demonstrar um centro de operações de infraestrutura crítica comunitária.

## O que ela simula

- Energia solar, baterias e cargas por setor.
- Internet comunitária com roteadores mesh, latência, perda de pacotes e disponibilidade.
- Sensores ambientais com temperatura, fumaça, qualidade do ar e disponibilidade da malha.
- Inventário de ativos com saúde, prioridade e próxima ação.
- Incidentes com severidade, causa raiz provável, MTTR e plano de resposta.
- Visualização detalhada de cada parte da topologia viva ao clicar nos nós do mapa.
- Faixa visual de resiliência por domínio e brief automático para decisão operacional.
- Integração opcional com **Open-Meteo**, escolhida como API principal da pesquisa por ser JSON, sem chave e adequada a projetos comunitários.
- Tela inicial enxuta com seções expansíveis para dados reais, análises, gráficos, operação e simulações.
- Interface mais acessível com link de pular conteúdo, foco visível, descrições operacionais, regiões anunciadas e modal navegável por teclado.

## Diferencial

O **Modo Guardião** funciona como um gêmeo digital operacional:

- calcula risco por domínio;
- prevê autonomia e possibilidade de colapso;
- estima SLA e MTTR;
- identifica causa raiz provável;
- recomenda ações de isolamento, proteção e recuperação.

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

Use os botões de **Cenários controlados**:

- **Tempestade**: queda de geração solar, consumo alto e rádio instável.
- **Backhaul degradado**: latência, perda e roteadores caindo.
- **Alerta ambiental**: calor, fumaça e sensores intermitentes.
- **Falha cibernética**: ruído de rede e leituras suspeitas.
- **Falha em cascata**: crise simultânea com priorização automática.
- **Recuperar**: restaura a operação normal.

Clique nos membros da **Topologia viva da comunidade** para abrir a visão detalhada do ativo, com telemetria local, dependências, diagnóstico, impacto comunitário e mini gráfico.

Use **Copiar relatório** no painel de decisão operacional para gerar um resumo rápido do estado da infraestrutura.

Use `Tab` para navegar pelos controles, `Esc` para fechar a visão detalhada de um ativo e o link inicial para pular direto ao painel principal.

Use **Atualizar Open-Meteo** para buscar telemetria real por latitude/longitude. Se a API falhar ou a internet estiver indisponível, o app continua no fallback simulado.

## Arquivos

- `index.html`: estrutura da aplicação.
- `styles.css`: visual responsivo.
- `app.js`: simulação, análises e gráficos.
- `TASKLIST.md`: plano executável do sistema completo.
- `MELHORIAS.md`: melhorias priorizadas e executadas.
