# Tasklist de melhorias executadas

## Ordem de execução

- [x] Melhorar os visuais com uma faixa de resiliência por domínio, estados cromáticos e leitura mais rápida do risco.
- [x] Adicionar um painel de decisão operacional com resumo executivo, serviço afetado, prioridade e próxima melhor ação.
- [x] Criar exportação rápida de relatório de incidente para apoiar pitch, demonstração e registro operacional.
- [x] Atualizar a documentação com as novas capacidades.
- [x] Validar sintaxe, carregamento local e interações principais.

## Resultado esperado

O app passa a comunicar melhor o estado da comunidade em poucos segundos, além de gerar um resumo acionável para manutenção e apresentação.

## Rodada Open-Meteo

- [x] Selecionar Open-Meteo como API mais adequada da pesquisa para primeira integração real.
- [x] Adicionar controles de latitude e longitude sem exigir chave de API.
- [x] Integrar temperatura, umidade, vento, chuva, nuvens e radiação solar ao motor operacional.
- [x] Calcular geração fotovoltaica estimada com modelo físico simplificado baseado em irradiância, vento e temperatura.
- [x] Manter fallback simulado automático para preservar a demo sem internet.

## Rodada acessibilidade e explicação

- [x] Adicionar link de pular conteúdo, foco visível e suporte a preferência de redução de movimento.
- [x] Explicar KPIs, gráficos, cenários e topologia com textos curtos de apoio.
- [x] Anunciar mudanças importantes por regiões `aria-live`.
- [x] Melhorar labels dinâmicos dos nós da topologia para leitores de tela.
- [x] Tornar a gaveta de detalhes mais adequada ao teclado, com foco inicial, retorno de foco e fechamento por `Esc`.

## Rodada compactação e português brasileiro

- [x] Encapsular dados reais, análises, gráficos, operação e simulações em seções expansíveis.
- [x] Manter KPIs, faixa de resiliência, topologia e Modo Guardião visíveis na primeira dobra.
- [x] Revisar textos estáticos e dinâmicos para português brasileiro.
- [x] Redesenhar gráficos ao abrir seções expansíveis para preservar layout responsivo.
