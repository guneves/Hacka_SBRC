const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const baseline = {
  paused: false,
  tick: 0,
  scenario: "normal",
  metrics: {
    battery: 83,
    generation: 4.8,
    load: 2.1,
    latency: 32,
    packetLoss: 0.2,
    routersOnline: 5,
    routersTotal: 5,
    temperature: 24,
    humidity: 64,
    smoke: 2,
    aqi: 92,
    sensorsOnline: 8,
    sensorsTotal: 8,
    cyberNoise: 3,
  },
  liveWeather: {
    enabled: false,
    loading: false,
    status: "fallback",
    message: "Sem chamada externa neste ciclo",
    lastFetch: null,
    location: { latitude: -12.9777, longitude: -38.5016 },
    current: null,
  },
  sectors: [
    { id: "clinic", name: "Posto", priority: 1, load: 0.42, batteryShare: 21, status: "normal" },
    { id: "school", name: "Escola", priority: 2, load: 0.38, batteryShare: 16, status: "normal" },
    { id: "homes-north", name: "Norte", priority: 3, load: 0.52, batteryShare: 18, status: "normal" },
    { id: "homes-south", name: "Sul", priority: 3, load: 0.46, batteryShare: 14, status: "normal" },
    { id: "water", name: "Agua", priority: 1, load: 0.32, batteryShare: 13, status: "normal" },
  ],
  assets: [
    { id: "solar-a", name: "Campo solar A", type: "Fotovoltaico", sector: "Norte", criticality: "alta", health: 94, status: "normal", action: "Inspecao em 18 dias" },
    { id: "battery-bank", name: "Banco de baterias", type: "Armazenamento", sector: "Central", criticality: "critica", health: 89, status: "normal", action: "Balanceamento em 9 dias" },
    { id: "mesh-tower", name: "Torre mesh", type: "Rede", sector: "Morro", criticality: "critica", health: 91, status: "normal", action: "Verificar alinhamento em 14 dias" },
    { id: "env-array", name: "Malha ambiental", type: "Sensores", sector: "Sul", criticality: "alta", health: 93, status: "normal", action: "Calibracao em 21 dias" },
    { id: "school-load", name: "Quadro escola", type: "Carga", sector: "Escola", criticality: "media", health: 87, status: "normal", action: "Auditoria de consumo em 12 dias" },
    { id: "clinic-load", name: "Carga posto", type: "Carga critica", sector: "Posto", criticality: "critica", health: 96, status: "normal", action: "Manter prioridade maxima" },
  ],
  events: [],
  history: [],
};

let state = structuredClone(baseline);
let timer = null;
let selectedAssetId = null;

const els = {
  status: $("#system-status"),
  syncMode: $("#sync-mode"),
  activeScenario: $("#active-scenario"),
  pauseButton: $("#pause-button"),
  resetButton: $("#reset-button"),
  kpiScore: $("#kpi-score"),
  kpiScoreLabel: $("#kpi-score-label"),
  kpiAutonomy: $("#kpi-autonomy"),
  kpiAutonomyLabel: $("#kpi-autonomy-label"),
  kpiAvailability: $("#kpi-availability"),
  kpiAvailabilityLabel: $("#kpi-availability-label"),
  kpiEnvRisk: $("#kpi-env-risk"),
  kpiEnvLabel: $("#kpi-env-label"),
  kpiMttr: $("#kpi-mttr"),
  kpiMttrLabel: $("#kpi-mttr-label"),
  stripEnergy: $("#strip-energy"),
  stripEnergyLabel: $("#strip-energy-label"),
  stripEnergyBar: $("#strip-energy-bar"),
  stripNetwork: $("#strip-network"),
  stripNetworkLabel: $("#strip-network-label"),
  stripNetworkBar: $("#strip-network-bar"),
  stripEnvironment: $("#strip-environment"),
  stripEnvironmentLabel: $("#strip-environment-label"),
  stripEnvironmentBar: $("#strip-environment-bar"),
  stripContinuity: $("#strip-continuity"),
  stripContinuityLabel: $("#strip-continuity-label"),
  stripContinuityBar: $("#strip-continuity-bar"),
  latitudeInput: $("#latitude-input"),
  longitudeInput: $("#longitude-input"),
  loadWeather: $("#load-weather"),
  liveWeatherToggle: $("#live-weather-toggle"),
  weatherSourceCopy: $("#weather-source-copy"),
  weatherSourceStatus: $("#weather-source-status"),
  riskBadge: $("#risk-badge"),
  guardianPanel: $("#guardian-panel"),
  guardianTitle: $("#guardian-title"),
  guardianCopy: $("#guardian-copy"),
  forecastText: $("#forecast-text"),
  actionPlan: $("#action-plan"),
  batteryValue: $("#battery-value"),
  batteryBar: $("#battery-bar"),
  generationValue: $("#generation-value"),
  loadValue: $("#load-value"),
  energyStatus: $("#energy-status"),
  latencyValue: $("#latency-value"),
  networkBar: $("#network-bar"),
  packetLoss: $("#packet-loss"),
  routersOnline: $("#routers-online"),
  networkStatus: $("#network-status"),
  temperatureValue: $("#temperature-value"),
  environmentBar: $("#environment-bar"),
  airQuality: $("#air-quality"),
  sensorsOnline: $("#sensors-online"),
  environmentStatus: $("#environment-status"),
  anomalyValue: $("#anomaly-value"),
  opsBar: $("#ops-bar"),
  opsStatus: $("#ops-status"),
  rootCause: $("#root-cause"),
  confidence: $("#confidence"),
  nodeSolar: $("#node-solar"),
  nodeStorage: $("#node-storage"),
  nodeTower: $("#node-tower"),
  nodeSensor: $("#node-sensor"),
  nodeSchool: $("#node-school"),
  nodeClinic: $("#node-clinic"),
  historySize: $("#history-size"),
  analysisList: $("#analysis-list"),
  assetTable: $("#asset-table"),
  assetCount: $("#asset-count"),
  timeline: $("#timeline"),
  eventCount: $("#event-count"),
  template: $("#event-template"),
  drawer: $("#asset-drawer"),
  drawerClose: $("#drawer-close"),
  drawerTitle: $("#drawer-title"),
  drawerType: $("#drawer-type"),
  drawerSector: $("#drawer-sector"),
  drawerHealth: $("#drawer-health"),
  drawerHealthRing: $("#drawer-health-ring"),
  drawerStatus: $("#drawer-status"),
  drawerDescription: $("#drawer-description"),
  drawerMetrics: $("#drawer-metrics"),
  drawerUpdated: $("#drawer-updated"),
  drawerDependencies: $("#drawer-dependencies"),
  drawerAnalysis: $("#drawer-analysis"),
  assetMiniChart: $("#asset-mini-chart"),
  decisionBrief: $("#decision-brief"),
  copyReport: $("#copy-report"),
  reportToast: $("#report-toast"),
  charts: {
    timeline: $("#timeline-chart"),
    radar: $("#risk-radar"),
    sla: $("#sla-chart"),
    capacity: $("#capacity-chart"),
  },
};

const scenarioLabels = {
  normal: "Cenario normal",
  storm: "Tempestade severa",
  network: "Backhaul degradado",
  environment: "Alerta ambiental",
  cyber: "Falha cibernetica",
  cascade: "Falha em cascata",
};

const assetDetails = {
  "solar-a": {
    description: "Campo fotovoltaico responsavel pela maior parte da geracao diurna da comunidade.",
    dependencies: [
      ["Banco de baterias", "recebe excedente e sustenta operacao noturna"],
      ["Quadro escola", "carga flexivel que pode ser reduzida em crise"],
      ["Carga posto", "mantem prioridade energetica em emergencias"],
    ],
  },
  "battery-bank": {
    description: "Reserva energetica central que protege servicos essenciais durante baixa geracao.",
    dependencies: [
      ["Campo solar A", "fonte principal de recarga"],
      ["Torre mesh", "mantem comunicacao quando a rede externa falha"],
      ["Carga posto", "consumidor critico sempre priorizado"],
    ],
  },
  "mesh-tower": {
    description: "No de comunicacao principal da internet comunitaria e da sincronizacao com a nuvem.",
    dependencies: [
      ["Banco de baterias", "energia de backup para manter radio e roteador"],
      ["Malha ambiental", "transporta telemetria dos sensores"],
      ["Carga posto", "garante canal prioritario para atendimento local"],
    ],
  },
  "env-array": {
    description: "Rede de sensores ambientais para calor, fumaca, umidade e qualidade do ar.",
    dependencies: [
      ["Torre mesh", "envia alertas para o painel e cloud"],
      ["Carga posto", "orienta resposta sanitaria em eventos de risco"],
      ["Banco de baterias", "mantem leitura durante interrupcao energetica"],
    ],
  },
  "school-load": {
    description: "Carga comunitaria flexivel: pode reduzir consumo para preservar sistemas criticos.",
    dependencies: [
      ["Banco de baterias", "recebe limite de consumo conforme autonomia"],
      ["Campo solar A", "usa excedente em operacao normal"],
      ["Torre mesh", "mantem conectividade educacional comunitaria"],
    ],
  },
  "clinic-load": {
    description: "Ponto critico da comunidade, protegido pelo Modo Guardiao em qualquer crise.",
    dependencies: [
      ["Banco de baterias", "reserva prioritaria de emergencia"],
      ["Torre mesh", "canal de comunicacao essencial"],
      ["Malha ambiental", "alertas de risco fisico para triagem local"],
    ],
  },
};

const pvModel = {
  peakPowerKw: 6.2,
  absorption: 0.9,
  moduleEfficiency: 0.18,
  u0: 25,
  u1: 6.84,
  tempCoeff: -0.0035,
  systemLoss: 0.13,
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function formatTime() {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());
}

function minutesToLabel(minutes) {
  if (!Number.isFinite(minutes) || minutes > 999) return ">16h";
  const h = Math.floor(minutes / 60);
  const m = Math.max(0, Math.round(minutes % 60));
  return h > 0 ? `${h}h ${m}m` : `${m} min`;
}

function pushEvent(level, title, message) {
  const last = state.events[0];
  if (last && last.title === title && state.tick - last.tick < 4) return;

  state.events.unshift({ level, title, message, time: formatTime(), tick: state.tick });
  state.events = state.events.slice(0, 18);
}

function setScenario(name) {
  if (name === "recover") {
    state.metrics = structuredClone(baseline.metrics);
    state.assets = structuredClone(baseline.assets);
    state.sectors = structuredClone(baseline.sectors);
    state.scenario = "normal";
    pushEvent("info", "Recuperacao concluida", "Parametros restaurados e sincronizacao cloud reativada.");
    simulateTick(true);
    return;
  }

  state.scenario = name;
  const messages = {
    storm: ["warning", "Tempestade severa", "Geracao solar caiu, consumo subiu e radioenlaces perderam margem."],
    network: ["danger", "Backhaul degradado", "A rede comunitaria apresenta latencia alta, perda e roteadores instaveis."],
    environment: ["danger", "Alerta ambiental", "Sensores indicam aumento de temperatura, fumaca e qualidade do ar ruim."],
    cyber: ["warning", "Falha cibernetica simulada", "Ruido de rede e leituras suspeitas exigem isolamento logico."],
    cascade: ["danger", "Falha em cascata", "Energia, rede e ambiente degradaram ao mesmo tempo."],
  };
  pushEvent(...messages[name]);
  simulateTick(true);
}

async function fetchOpenMeteoTelemetry() {
  const latitude = Number(els.latitudeInput.value);
  const longitude = Number(els.longitudeInput.value);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    setWeatherStatus("fallback", "Coordenadas invalidas", "Informe latitude e longitude validas.");
    return;
  }

  state.liveWeather.loading = true;
  setWeatherStatus("loading", "Consultando Open-Meteo", "Buscando meteorologia e radiacao solar.");

  const params = new URLSearchParams({
    latitude: latitude.toFixed(4),
    longitude: longitude.toFixed(4),
    current: "temperature_2m,relative_humidity_2m,precipitation,cloud_cover,wind_speed_10m",
    hourly: "temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,cloud_cover,shortwave_radiation,direct_radiation,diffuse_radiation",
    forecast_days: "1",
    timezone: "auto",
  });

  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const current = normalizeOpenMeteoPayload(payload);
    state.liveWeather = {
      ...state.liveWeather,
      loading: false,
      status: "live",
      message: "Dados reais aplicados ao motor solar e ambiental.",
      lastFetch: new Date(),
      location: { latitude, longitude },
      current,
    };
    state.liveWeather.enabled = true;
    els.liveWeatherToggle.checked = true;
    pushEvent("info", "Open-Meteo atualizado", `Telemetria real carregada para ${latitude.toFixed(4)}, ${longitude.toFixed(4)}.`);
    simulateTick(true);
  } catch (error) {
    state.liveWeather.loading = false;
    state.liveWeather.enabled = false;
    els.liveWeatherToggle.checked = false;
    setWeatherStatus("fallback", "Fallback simulado", `Open-Meteo indisponivel: ${error.message}.`);
    pushEvent("warning", "Falha Open-Meteo", "Nao foi possivel atualizar a API. Simulacao local mantida.");
    render(analyze());
  }
}

function normalizeOpenMeteoPayload(payload) {
  const current = payload.current || {};
  const hourly = payload.hourly || {};
  const index = closestHourlyIndex(hourly.time || [], current.time);

  const shortwave = valueAt(hourly.shortwave_radiation, index, 0);
  const direct = valueAt(hourly.direct_radiation, index, 0);
  const diffuse = valueAt(hourly.diffuse_radiation, index, 0);
  const temperature = numberOr(current.temperature_2m, valueAt(hourly.temperature_2m, index, state.metrics.temperature));
  const humidity = numberOr(current.relative_humidity_2m, valueAt(hourly.relative_humidity_2m, index, state.metrics.humidity));
  const windKmh = numberOr(current.wind_speed_10m, valueAt(hourly.wind_speed_10m, index, 8));
  const precipitation = numberOr(current.precipitation, valueAt(hourly.precipitation, index, 0));
  const cloudCover = numberOr(current.cloud_cover, valueAt(hourly.cloud_cover, index, 30));
  const pv = estimatePvGeneration({ temperature, windKmh, shortwave });

  return {
    time: current.time || hourly.time?.[index] || new Date().toISOString(),
    temperature,
    humidity,
    windKmh,
    precipitation,
    cloudCover,
    shortwave,
    direct,
    diffuse,
    cellTemperature: pv.cellTemperature,
    pvGeneration: pv.acPowerKw,
  };
}

function closestHourlyIndex(times, currentTime) {
  if (!times.length) return 0;
  const target = currentTime ? new Date(currentTime).getTime() : Date.now();
  let best = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  times.forEach((time, index) => {
    const distance = Math.abs(new Date(time).getTime() - target);
    if (distance < bestDistance) {
      best = index;
      bestDistance = distance;
    }
  });
  return best;
}

function valueAt(values, index, fallback) {
  return Array.isArray(values) && Number.isFinite(values[index]) ? values[index] : fallback;
}

function numberOr(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

function estimatePvGeneration({ temperature, windKmh, shortwave }) {
  const windMs = Math.max(0.2, windKmh / 3.6);
  const heatLoss = pvModel.u0 + pvModel.u1 * windMs;
  const cellTemperature =
    temperature + (shortwave * pvModel.absorption * (1 - pvModel.moduleEfficiency)) / Math.max(heatLoss, 1);
  const dcPowerKw =
    pvModel.peakPowerKw *
    (shortwave / 1000) *
    (1 + pvModel.tempCoeff * (cellTemperature - 25));
  const acPowerKw = clamp(dcPowerKw * (1 - pvModel.systemLoss), 0, pvModel.peakPowerKw);
  return { cellTemperature, acPowerKw };
}

function applyLiveWeatherTelemetry() {
  if (!state.liveWeather.enabled || !state.liveWeather.current) return;

  const w = state.liveWeather.current;
  const m = state.metrics;
  m.temperature = clamp(w.temperature + rand(-0.2, 0.2), 5, 52);
  m.humidity = clamp(w.humidity + rand(-1, 1), 10, 100);
  m.generation = clamp(w.pvGeneration + rand(-0.08, 0.08), 0, pvModel.peakPowerKw);
  m.aqi = clamp(96 - w.cloudCover * 0.12 - w.precipitation * 2 + rand(-2, 2), 35, 99);
  m.smoke = clamp(w.shortwave < 80 && w.cloudCover > 80 ? 5 + rand(0, 4) : rand(0, 3), 0, 30);

  if (w.precipitation > 2) {
    m.latency = clamp(m.latency + w.precipitation * 6, 20, 220);
    m.packetLoss = clamp(m.packetLoss + w.precipitation * 0.35, 0, 12);
  }
}

function setWeatherStatus(status, title, message) {
  state.liveWeather.status = status;
  state.liveWeather.message = message;
  renderWeatherSource();
}

function simulateTick(force = false) {
  if (state.paused && !force) return;

  state.tick += 1;
  const m = state.metrics;
  const wave = Math.sin(state.tick / 6);

  if (state.scenario === "normal") {
    m.generation = clamp(4.7 + wave * 0.35 + rand(-0.14, 0.18), 4.0, 5.4);
    m.load = clamp(2.15 + rand(-0.12, 0.18), 1.8, 2.65);
    m.battery = clamp(m.battery + 0.13 + rand(-0.08, 0.08), 74, 96);
    m.latency = clamp(32 + wave * 5 + rand(-4, 4), 19, 58);
    m.packetLoss = clamp(0.25 + rand(-0.1, 0.12), 0, 0.8);
    m.routersOnline = 5;
    m.temperature = clamp(24 + wave * 1.1 + rand(-0.4, 0.4), 21, 28);
    m.humidity = clamp(64 + rand(-2, 2), 55, 75);
    m.smoke = clamp(rand(0, 4), 0, 6);
    m.aqi = clamp(93 + rand(-2, 2), 86, 98);
    m.sensorsOnline = 8;
    m.cyberNoise = clamp(3 + rand(-1, 2), 0, 8);
  }

  applyLiveWeatherTelemetry();

  if (state.scenario === "storm") {
    m.generation = clamp(1.05 + rand(-0.22, 0.3), 0.35, 1.8);
    m.load = clamp(3.65 + rand(-0.24, 0.32), 3.1, 4.55);
    m.battery = clamp(m.battery - rand(1.4, 2.5), 0, 100);
    m.latency = clamp(92 + rand(-18, 38), 55, 190);
    m.packetLoss = clamp(4 + rand(-0.5, 4.5), 1.5, 11);
    m.temperature = clamp(22 + rand(-1, 1), 18, 25);
    m.humidity = clamp(88 + rand(-3, 4), 78, 98);
    m.aqi = clamp(82 + rand(-9, 4), 58, 88);
  }

  if (state.scenario === "network") {
    m.latency = clamp(470 + rand(-90, 190), 240, 900);
    m.packetLoss = clamp(22 + rand(-5, 14), 9, 48);
    m.routersOnline = Math.random() > 0.35 ? 2 : 1;
    m.battery = clamp(m.battery - rand(0.15, 0.42), 0, 100);
    m.cyberNoise = clamp(10 + rand(-2, 6), 4, 20);
  }

  if (state.scenario === "environment") {
    m.temperature = clamp(m.temperature + rand(0.7, 1.5), 25, 49);
    m.smoke = clamp(m.smoke + rand(4, 10), 0, 100);
    m.aqi = clamp(m.aqi - rand(4, 10), 0, 100);
    m.sensorsOnline = Math.random() > 0.35 ? 6 : 5;
    m.latency = clamp(65 + rand(-8, 25), 40, 130);
  }

  if (state.scenario === "cyber") {
    m.cyberNoise = clamp(m.cyberNoise + rand(5, 12), 0, 100);
    m.packetLoss = clamp(m.packetLoss + rand(4, 9), 0, 55);
    m.latency = clamp(m.latency + rand(60, 160), 55, 760);
    m.sensorsOnline = Math.random() > 0.5 ? 7 : 6;
    m.aqi = clamp(m.aqi + rand(-12, 12), 35, 98);
  }

  if (state.scenario === "cascade") {
    m.generation = clamp(0.65 + rand(-0.18, 0.2), 0, 1.25);
    m.load = clamp(4.35 + rand(-0.28, 0.5), 3.6, 5.35);
    m.battery = clamp(m.battery - rand(2.4, 3.9), 0, 100);
    m.latency = clamp(660 + rand(-130, 230), 330, 1100);
    m.packetLoss = clamp(31 + rand(-8, 18), 16, 64);
    m.routersOnline = Math.random() > 0.45 ? 2 : 1;
    m.temperature = clamp(m.temperature + rand(0.4, 1.2), 25, 46);
    m.smoke = clamp(m.smoke + rand(3, 8), 0, 100);
    m.aqi = clamp(m.aqi - rand(4, 8), 0, 100);
    m.sensorsOnline = Math.random() > 0.48 ? 5 : 4;
    m.cyberNoise = clamp(m.cyberNoise + rand(3, 9), 0, 100);
  }

  updateAssets();
  const analysis = analyze();
  recordHistory(analysis);
  detectEvents(analysis);
  render(analysis);
}

function updateAssets() {
  const m = state.metrics;
  const penalties = {
    "solar-a": m.generation < 1.5 ? 24 : m.generation < m.load ? 10 : 0,
    "battery-bank": m.battery < 20 ? 44 : m.battery < 45 ? 18 : 0,
    "mesh-tower": m.latency > 300 || m.packetLoss > 15 ? 38 : m.latency > 130 ? 15 : 0,
    "env-array": m.smoke > 35 || m.temperature > 38 ? 36 : m.sensorsOnline < 8 ? 16 : 0,
    "school-load": state.scenario === "storm" || state.scenario === "cascade" ? 12 : 0,
    "clinic-load": m.battery < 25 || state.scenario === "cascade" ? 14 : 0,
  };

  state.assets = state.assets.map((asset) => {
    const base = baseline.assets.find((item) => item.id === asset.id);
    const health = clamp(base.health - penalties[asset.id] - rand(0, 3), 5, 100);
    const status = health < 55 ? "danger" : health < 78 ? "warning" : "normal";
    return { ...asset, health, status, action: nextAction(asset.id, status) };
  });

  state.sectors = state.sectors.map((sector) => {
    const extraLoad = state.scenario === "storm" ? 0.22 : state.scenario === "cascade" ? 0.34 : 0;
    const protectedSector = sector.id === "clinic" || sector.id === "water";
    const load = clamp(sector.load + extraLoad - (protectedSector && state.scenario === "cascade" ? 0.08 : 0), 0.18, 1.15);
    const status = load > 0.95 || (state.metrics.battery < 22 && !protectedSector) ? "danger" : load > 0.72 ? "warning" : "normal";
    return { ...sector, load, status };
  });
}

function nextAction(assetId, status) {
  if (status === "normal") {
    const base = baseline.assets.find((asset) => asset.id === assetId);
    return base.action;
  }
  const actions = {
    "solar-a": status === "danger" ? "Despachar limpeza e bypass de string" : "Checar irradiancia e conectores",
    "battery-bank": status === "danger" ? "Ativar racionamento e proteger cargas criticas" : "Reduzir cargas nao essenciais",
    "mesh-tower": status === "danger" ? "Comutar para rota local e reiniciar radio" : "Recalcular rota mesh",
    "env-array": status === "danger" ? "Confirmar evento em campo e alertar defesa civil" : "Recalibrar sensores divergentes",
    "school-load": status === "danger" ? "Cortar cargas nao essenciais" : "Agendar economia de energia",
    "clinic-load": status === "danger" ? "Garantir UPS e radio prioritario" : "Manter prioridade de fornecimento",
  };
  return actions[assetId];
}

function riskSet() {
  const m = state.metrics;
  const energy = clamp((100 - m.battery) * 0.45 + Math.max(0, m.load - m.generation) * 16, 0, 100);
  const network = clamp(m.latency / 8 + m.packetLoss * 1.45 + (m.routersTotal - m.routersOnline) * 13, 0, 100);
  const environment = clamp(Math.max(0, m.temperature - 28) * 4 + m.smoke * 0.72 + (100 - m.aqi) * 0.38 + (m.sensorsTotal - m.sensorsOnline) * 9, 0, 100);
  const cyber = clamp(m.cyberNoise * 1.18 + m.packetLoss * 0.55, 0, 100);
  const continuity = clamp((energy * 0.35 + network * 0.28 + environment * 0.22 + cyber * 0.15), 0, 100);
  return { energy, network, environment, cyber, continuity };
}

function analyze() {
  const risks = riskSet();
  const operationalScore = Math.round(clamp(100 - risks.continuity, 0, 100));
  const severity = risks.continuity >= 65 ? "danger" : risks.continuity >= 38 ? "warning" : "normal";
  const netDischarge = Math.max(0, state.metrics.load - state.metrics.generation);
  const autonomyMinutes = netDischarge > 0 ? (state.metrics.battery / netDischarge) * 8 : 990;
  const availability = clamp(99.92 - risks.network * 0.13 - (state.metrics.routersTotal - state.metrics.routersOnline) * 2.1, 72, 99.99);
  const mttr = Math.round(12 + risks.continuity * 0.62 + (state.metrics.routersTotal - state.metrics.routersOnline) * 7);
  const anomaly = anomalyScore();
  const root = rootCause(risks, anomaly);
  return { risks, operationalScore, severity, autonomyMinutes, availability, mttr, anomaly, root };
}

function anomalyScore() {
  const m = state.metrics;
  const parts = [
    Math.abs(m.generation - 4.7) / 0.9,
    Math.abs(m.load - 2.2) / 0.7,
    Math.abs(m.latency - 35) / 80,
    Math.abs(m.packetLoss - 0.5) / 7,
    Math.abs(m.temperature - 24) / 5,
    Math.abs(m.smoke - 2) / 18,
    Math.abs(m.cyberNoise - 4) / 12,
  ];
  return Math.max(...parts);
}

function rootCause(risks, anomaly) {
  const candidates = [
    ["Energia", risks.energy],
    ["Rede", risks.network],
    ["Ambiente", risks.environment],
    ["Seguranca", risks.cyber],
  ].sort((a, b) => b[1] - a[1]);

  const label = candidates[0][1] < 20 ? "nenhuma" : candidates[0][0];
  const confidence = clamp(Math.round(58 + candidates[0][1] * 0.4 + anomaly * 7), 60, 98);
  return { label, confidence };
}

function recordHistory(analysis) {
  const m = state.metrics;
  state.history.push({
    time: formatTime(),
    battery: m.battery,
    generation: m.generation,
    load: m.load,
    latency: m.latency,
    packetLoss: m.packetLoss,
    envRisk: analysis.risks.environment,
    score: analysis.operationalScore,
    risk: analysis.risks.continuity,
    availability: analysis.availability,
  });
  state.history = state.history.slice(-72);
}

function detectEvents(analysis) {
  if (analysis.severity === "danger") {
    pushEvent("danger", "Modo Guardiao ativado", "Risco operacional alto exige isolamento, priorizacao e recuperacao guiada.");
  } else if (analysis.severity === "warning") {
    pushEvent("warning", "Degradacao preventiva", "O modelo detectou tendencia fora do padrao e abriu acompanhamento.");
  }

  if (analysis.risks.energy > 70) pushEvent("danger", "Energia em risco", "Autonomia baixa ou consumo maior que geracao por tempo prolongado.");
  if (analysis.risks.network > 70) pushEvent("danger", "Rede em risco", "Backhaul ou malha mesh sem estabilidade suficiente.");
  if (analysis.risks.environment > 70) pushEvent("danger", "Evento ambiental", "Sensores apontam risco fisico que afeta operacao comunitaria.");
  if (analysis.risks.cyber > 65) pushEvent("warning", "Anomalia logica", "Padrao de ruido sugere leitura falsa, ataque simples ou falha de firmware.");
}

function levelFromSeverity(severity) {
  return severity === "danger" ? "danger" : severity === "warning" ? "warning" : "normal";
}

function levelForRisk(risk) {
  return risk >= 70 ? "danger" : risk >= 38 ? "warning" : "normal";
}

function applyLevel(element, level) {
  element.classList.remove("warning", "danger");
  if (level !== "normal") element.classList.add(level);
}

function setProgress(element, value, level) {
  element.style.width = `${clamp(value, 3, 100)}%`;
  element.style.background = level === "danger" ? "var(--red)" : level === "warning" ? "var(--amber)" : "var(--green)";
}

function render(analysis = analyze()) {
  const m = state.metrics;
  const risks = analysis.risks;
  const severity = analysis.severity;
  const statusText = severity === "danger" ? "Modo crise ativo" : severity === "warning" ? "Atencao preventiva" : "Operacao normal";

  els.status.lastChild.textContent = ` ${statusText}`;
  els.status.querySelector("i").style.background = severity === "danger" ? "var(--red)" : severity === "warning" ? "var(--amber)" : "var(--green)";
  els.syncMode.textContent = m.routersOnline < 3 ? "Edge local ativo, cloud degradada" : "Edge + Cloud sincronizado";
  els.activeScenario.textContent = scenarioLabels[state.scenario];

  renderWeatherSource();
  renderKpis(analysis);
  renderResilienceStrip(analysis);
  renderDomainCards(analysis);
  renderTwin(analysis);
  renderGuardian(analysis);
  renderAnalysis(analysis);
  renderAssets();
  renderTimeline();
  renderDecisionBrief(analysis);
  renderSelectedAssetDetail(analysis);
  drawCharts(analysis);
}

function renderKpis(analysis) {
  els.kpiScore.textContent = analysis.operationalScore;
  els.kpiScoreLabel.textContent = analysis.severity === "danger" ? "Crise operacional" : analysis.severity === "warning" ? "Degradacao" : "Normal";
  els.kpiAutonomy.textContent = minutesToLabel(analysis.autonomyMinutes);
  els.kpiAutonomyLabel.textContent = analysis.autonomyMinutes < 60 ? "Autonomia critica" : analysis.autonomyMinutes < 180 ? "Economia recomendada" : "Baterias saudaveis";
  els.kpiAvailability.textContent = `${analysis.availability.toFixed(2)}%`;
  els.kpiAvailabilityLabel.textContent = analysis.availability < 95 ? "SLA rompido" : analysis.availability < 98.5 ? "SLA em risco" : "SLA dentro da meta";
  els.kpiEnvRisk.textContent = `${Math.round(analysis.risks.environment)}%`;
  els.kpiEnvLabel.textContent = analysis.risks.environment >= 70 ? "Risco fisico alto" : analysis.risks.environment >= 38 ? "Anomalia ambiental" : "Sem anomalias";
  els.kpiMttr.textContent = `${analysis.mttr} min`;
  els.kpiMttrLabel.textContent = analysis.mttr > 60 ? "Requer equipe externa" : "Equipe local pronta";
}

function renderResilienceStrip(analysis) {
  const items = [
    [els.stripEnergy, els.stripEnergyLabel, els.stripEnergyBar, analysis.risks.energy, "Energia protegida", "Energia em atencao", "Energia critica"],
    [els.stripNetwork, els.stripNetworkLabel, els.stripNetworkBar, analysis.risks.network, "Rede saudavel", "Rede instavel", "Rede critica"],
    [els.stripEnvironment, els.stripEnvironmentLabel, els.stripEnvironmentBar, analysis.risks.environment, "Ambiente normal", "Ambiente anormal", "Ambiente critico"],
    [els.stripContinuity, els.stripContinuityLabel, els.stripContinuityBar, analysis.risks.continuity, "Continuidade protegida", "Continuidade em risco", "Continuidade critica"],
  ];

  items.forEach(([card, label, bar, risk, normalText, warningText, dangerText]) => {
    const level = levelForRisk(risk);
    card.classList.remove("warning", "danger");
    if (level !== "normal") card.classList.add(level);
    label.textContent = level === "danger" ? dangerText : level === "warning" ? warningText : normalText;
    bar.style.width = `${clamp(100 - risk, 4, 100)}%`;
    bar.style.background =
      level === "danger"
        ? "linear-gradient(90deg, var(--red), #f07b72)"
        : level === "warning"
          ? "linear-gradient(90deg, var(--amber), #f2be52)"
          : "linear-gradient(90deg, var(--green), #6ec99a)";
  });
}

function renderWeatherSource() {
  const source = state.liveWeather;
  const current = source.current;
  const mode = source.enabled && current ? "live" : source.status;
  const label = mode === "live" ? "Open-Meteo live" : mode === "loading" ? "carregando" : "fallback";
  const tagLevel = mode === "live" ? "normal" : mode === "loading" ? "warning" : "warning";
  const lastFetch = source.lastFetch
    ? new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(source.lastFetch)
    : "sem cache";

  els.liveWeatherToggle.checked = Boolean(source.enabled && current);
  els.loadWeather.textContent = source.loading ? "Atualizando..." : "Atualizar Open-Meteo";
  els.loadWeather.disabled = source.loading;
  els.weatherSourceCopy.textContent =
    mode === "live"
      ? `Usando temperatura, vento, chuva, nuvens e radiacao solar reais para ajustar geracao PV e risco ambiental.`
      : "Telemetria em modo simulado com fallback local ativo.";
  els.weatherSourceStatus.innerHTML =
    `<span class="tag ${tagLevel}">${label}</span>` +
    `<b>${mode === "live" ? `${current.temperature.toFixed(1)} C · ${current.shortwave.toFixed(0)} W/m2` : source.status === "loading" ? "Consultando API" : "Simulacao local"}</b>` +
    `<small>${mode === "live" ? `Atualizado ${lastFetch}; nuvens ${current.cloudCover.toFixed(0)}%, vento ${current.windKmh.toFixed(1)} km/h.` : source.message}</small>`;
}

function renderDomainCards(analysis) {
  const m = state.metrics;
  const energyLevel = levelForRisk(analysis.risks.energy);
  const networkLevel = levelForRisk(analysis.risks.network);
  const envLevel = levelForRisk(analysis.risks.environment);
  const opsLevel = levelFromSeverity(analysis.severity);

  applyLevel($("#energy-card"), energyLevel);
  applyLevel($("#network-card"), networkLevel);
  applyLevel($("#environment-card"), envLevel);
  applyLevel($("#ops-card"), opsLevel);

  els.batteryValue.textContent = `${Math.round(m.battery)}%`;
  els.generationValue.textContent = `${m.generation.toFixed(1)} kW gerados`;
  els.loadValue.textContent = `${m.load.toFixed(1)} kW consumidos`;
  els.energyStatus.textContent = energyLevel === "danger" ? "Critica" : energyLevel === "warning" ? "Em atencao" : "Estavel";
  setProgress(els.batteryBar, m.battery, energyLevel);

  const networkHealth = clamp(100 - analysis.risks.network, 4, 100);
  els.latencyValue.textContent = `${Math.round(m.latency)} ms`;
  els.packetLoss.textContent = `${m.packetLoss.toFixed(1)}% perda`;
  els.routersOnline.textContent = `${m.routersOnline}/${m.routersTotal} roteadores`;
  els.networkStatus.textContent = networkLevel === "danger" ? "Degradada" : networkLevel === "warning" ? "Instavel" : "Online";
  setProgress(els.networkBar, networkHealth, networkLevel);

  const envHealth = clamp(100 - analysis.risks.environment, 3, 100);
  els.temperatureValue.textContent = `${Math.round(m.temperature)} C`;
  els.airQuality.textContent = `${Math.round(m.aqi)} AQI`;
  els.sensorsOnline.textContent = `${m.sensorsOnline}/${m.sensorsTotal} sensores`;
  els.environmentStatus.textContent = envLevel === "danger" ? "Risco alto" : envLevel === "warning" ? "Anormal" : "Normal";
  setProgress(els.environmentBar, envHealth, envLevel);

  els.opsStatus.textContent = opsLevel === "danger" ? "Causa raiz ativa" : opsLevel === "warning" ? "Investigando" : "Sem anomalia";
  els.anomalyValue.textContent = `${analysis.anomaly.toFixed(1)}s`;
  els.rootCause.textContent = `Causa: ${analysis.root.label}`;
  els.confidence.textContent = `${analysis.root.confidence}% confianca`;
  setProgress(els.opsBar, clamp(100 - analysis.risks.continuity, 3, 100), opsLevel);
}

function renderTwin(analysis) {
  const m = state.metrics;
  const nodeLevels = {
    "solar-a": levelForRisk(analysis.risks.energy),
    "battery-bank": m.battery < 20 ? "danger" : m.battery < 45 ? "warning" : "normal",
    "mesh-tower": levelForRisk(analysis.risks.network),
    "env-array": levelForRisk(analysis.risks.environment),
    "school-load": state.sectors.find((s) => s.id === "school").status,
    "clinic-load": m.battery < 15 ? "warning" : "normal",
  };

  $$(".node").forEach((node) => {
    const level = nodeLevels[node.dataset.asset] || "normal";
    node.classList.remove("warning", "danger");
    if (level !== "normal") node.classList.add(level);
  });

  els.nodeSolar.textContent = `${m.generation.toFixed(1)} kW`;
  els.nodeStorage.textContent = `${Math.round(m.battery)}%`;
  els.nodeTower.textContent = `${Math.round(m.latency)} ms`;
  els.nodeSensor.textContent = `${m.sensorsOnline}/${m.sensorsTotal}`;
  els.nodeSchool.textContent = state.sectors.find((s) => s.id === "school").status === "danger" ? "corte parcial" : "carga media";
  els.nodeClinic.textContent = analysis.severity === "danger" ? "protegido" : "prioritario";

  $$("[data-link]").forEach((link) => {
    link.classList.remove("warning", "danger");
    const id = link.dataset.link;
    if ((id.includes("tower") && analysis.risks.network >= 70) || (id.includes("sensor") && analysis.risks.environment >= 70)) {
      link.classList.add("danger");
    } else if ((id.includes("storage") && analysis.risks.energy >= 38) || analysis.risks.network >= 38) {
      link.classList.add("warning");
    }
  });
}

function renderGuardian(analysis) {
  const severity = analysis.severity;
  const risks = analysis.risks;
  applyLevel(els.guardianPanel, severity);
  els.riskBadge.textContent = `${Math.round(risks.continuity)}%`;
  els.riskBadge.style.color = severity === "danger" ? "var(--red)" : severity === "warning" ? "var(--amber)" : "var(--green)";

  if (severity === "danger") {
    els.guardianTitle.textContent = "Modo Guardiao em crise";
    els.guardianCopy.textContent = "Falhas simultaneas podem derrubar servicos essenciais. O sistema prioriza posto, agua, sensores de risco e roteador central.";
    els.forecastText.textContent = `Colapso operacional provavel em ${minutesToLabel(analysis.autonomyMinutes)} se nao houver intervencao.`;
  } else if (severity === "warning") {
    els.guardianTitle.textContent = "Modo preventivo";
    els.guardianCopy.textContent = "A telemetria saiu do padrao. A recomendacao e reduzir carga, estabilizar rede e observar tendencia por janela curta.";
    els.forecastText.textContent = analysis.autonomyMinutes < 240
      ? `Autonomia pode ficar critica em ${minutesToLabel(analysis.autonomyMinutes)}.`
      : "Risco moderado, sem colapso imediato.";
  } else {
    els.guardianTitle.textContent = "Sistema estavel";
    els.guardianCopy.textContent = "A operacao esta dentro dos limites. O modelo preditivo segue em observacao continua.";
    els.forecastText.textContent = "Sem risco de colapso nas proximas 3 horas.";
  }

  const actions = actionPlan(analysis);
  els.actionPlan.innerHTML = actions.map((item) => `<li>${item}</li>`).join("");

  const phaseLevels = phaseState(analysis);
  Object.entries(phaseLevels).forEach(([phase, value]) => {
    const phaseEl = $(`[data-phase="${phase}"]`);
    phaseEl.classList.remove("active", "warning", "danger");
    if (value.level) phaseEl.classList.add(value.level);
    $(`#phase-${phase}`).textContent = value.text;
  });
}

function actionPlan(analysis) {
  const cause = analysis.root.label;
  if (analysis.severity === "danger") {
    const base = [
      "Ativar matriz de prioridade: posto de saude, agua, sensores ambientais e roteador central.",
      "Isolar cargas nao essenciais da escola e dos setores residenciais por 30 minutos.",
      "Operar em edge local se cloud ou backhaul permanecerem instaveis.",
      "Abrir incidente P1 com responsavel, causa provavel e tempo maximo de resposta.",
    ];
    if (cause === "Rede") base.splice(1, 0, "Comutar para rota mesh secundaria e limitar trafego nao essencial.");
    if (cause === "Energia") base.splice(1, 0, "Reduzir carga em 35% e proteger banco de baterias contra descarga profunda.");
    if (cause === "Ambiente") base.splice(1, 0, "Confirmar evento com dois sensores independentes e avisar lideranca local.");
    return base;
  }
  if (analysis.severity === "warning") {
    return [
      "Acompanhar tendencia por 10 minutos antes de escalar.",
      "Preparar reducao de carga nao essencial se o score cair abaixo de 60.",
      "Validar causa provavel com telemetria cruzada de energia, rede e sensores.",
    ];
  }
  return [
    "Manter coleta edge/cloud em tempo real.",
    "Atualizar baseline de normalidade com as ultimas amostras saudaveis.",
    "Rodar previsao de autonomia, SLA e risco ambiental a cada ciclo.",
  ];
}

function phaseState(analysis) {
  if (analysis.severity === "danger") {
    return {
      detect: { level: "danger", text: "P1 ativo" },
      isolate: { level: "danger", text: "executando" },
      protect: { level: "danger", text: "prioritario" },
      recover: { level: "warning", text: `${analysis.mttr} min` },
    };
  }
  if (analysis.severity === "warning") {
    return {
      detect: { level: "warning", text: "alerta" },
      isolate: { level: "warning", text: "preparar" },
      protect: { level: "", text: "aguardando" },
      recover: { level: "", text: "aguardando" },
    };
  }
  return {
    detect: { level: "active", text: "ativo" },
    isolate: { level: "", text: "aguardando" },
    protect: { level: "", text: "aguardando" },
    recover: { level: "", text: "aguardando" },
  };
}

function renderAnalysis(analysis) {
  const items = [
    {
      title: "Causa raiz provavel",
      text: `${analysis.root.label === "nenhuma" ? "Nenhuma causa dominante" : analysis.root.label} com ${analysis.root.confidence}% de confianca.`,
    },
    {
      title: "Previsao de autonomia",
      text: `Autonomia projetada: ${minutesToLabel(analysis.autonomyMinutes)} considerando geracao e consumo atuais.`,
    },
    {
      title: "SLA e continuidade",
      text: `Disponibilidade estimada de ${analysis.availability.toFixed(2)}%, MTTR de ${analysis.mttr} minutos e score ${analysis.operationalScore}.`,
    },
    {
      title: "Anomalia estatistica",
      text: `Maior desvio observado: ${analysis.anomaly.toFixed(1)}s contra o baseline simulado da comunidade.`,
    },
  ];

  els.analysisList.innerHTML = items
    .map((item) => `<div class="analysis-item"><strong>${item.title}</strong><p>${item.text}</p></div>`)
    .join("");
}

function renderDecisionBrief(analysis) {
  const decision = buildDecisionBrief(analysis);
  els.decisionBrief.innerHTML = [
    briefItem("Estado", decision.state, decision.summary, "wide"),
    briefItem("Servico afetado", decision.service, decision.serviceDetail, ""),
    briefItem("Prioridade", decision.priority, decision.priorityDetail, ""),
    briefItem("Proxima melhor acao", decision.nextAction, decision.actionDetail, "wide"),
  ].join("");
}

function briefItem(label, title, text, extraClass) {
  return `<div class="decision-item ${extraClass}"><span>${label}</span><strong>${title}</strong><p>${text}</p></div>`;
}

function buildDecisionBrief(analysis) {
  const cause = analysis.root.label;
  const severity = analysis.severity;
  const service = cause === "nenhuma" ? "Operacao geral" : cause;
  const serviceDetails = {
    Energia: "Geracao, bateria e carga comunitaria exigem ajuste fino.",
    Rede: "Latencia, perda de pacotes ou roteadores afetam cloud e comunicacao.",
    Ambiente: "Sensores apontam evento fisico ou perda de cobertura ambiental.",
    Seguranca: "Ruido logico sugere leitura falsa, ataque simples ou firmware instavel.",
    "Operacao geral": "Nenhum dominio domina o risco neste momento.",
  };

  if (severity === "danger") {
    return {
      state: "Crise operacional",
      summary: `Score ${analysis.operationalScore}, risco ${Math.round(analysis.risks.continuity)}% e MTTR estimado em ${analysis.mttr} minutos.`,
      service,
      serviceDetail: serviceDetails[service],
      priority: "P1 imediato",
      priorityDetail: "Abrir incidente, proteger servicos essenciais e registrar decisao.",
      nextAction: firstActionFor(analysis),
      actionDetail: "Executar agora e reavaliar a cada ciclo de telemetria.",
    };
  }

  if (severity === "warning") {
    return {
      state: "Degradacao preventiva",
      summary: `Score ${analysis.operationalScore}, autonomia ${minutesToLabel(analysis.autonomyMinutes)} e confianca ${analysis.root.confidence}%.`,
      service,
      serviceDetail: serviceDetails[service],
      priority: "P2 monitorado",
      priorityDetail: "Acompanhar tendencia antes de acionar equipe externa.",
      nextAction: firstActionFor(analysis),
      actionDetail: "Preparar contencao se o score cair abaixo de 60.",
    };
  }

  return {
    state: "Operacao saudavel",
    summary: `Score ${analysis.operationalScore}, SLA ${analysis.availability.toFixed(2)}% e risco baixo.`,
    service: "Todos os dominios",
    serviceDetail: "Energia, rede, ambiente e edge operando dentro do baseline.",
    priority: "P3 rotina",
    priorityDetail: "Manter observabilidade e atualizar baseline com amostras saudaveis.",
    nextAction: "Continuar previsao e sincronizacao edge/cloud.",
    actionDetail: "Nenhuma intervencao imediata necessaria.",
  };
}

function firstActionFor(analysis) {
  return actionPlan(analysis)[0];
}

async function copyOperationalReport() {
  const analysis = analyze();
  const decision = buildDecisionBrief(analysis);
  const report = [
    "Sentinela Digital Pro - Relatorio operacional",
    `Horario: ${formatTime()}`,
    `Cenario: ${scenarioLabels[state.scenario]}`,
    `Fonte meteorologica: ${state.liveWeather.enabled && state.liveWeather.current ? "Open-Meteo" : "Simulacao local"}`,
    `Estado: ${decision.state}`,
    `Score operacional: ${analysis.operationalScore}`,
    `Risco de continuidade: ${Math.round(analysis.risks.continuity)}%`,
    `Causa raiz provavel: ${analysis.root.label} (${analysis.root.confidence}% confianca)`,
    `Autonomia energetica: ${minutesToLabel(analysis.autonomyMinutes)}`,
    `SLA estimado: ${analysis.availability.toFixed(2)}%`,
    `MTTR estimado: ${analysis.mttr} min`,
    `Servico afetado: ${decision.service}`,
    `Prioridade: ${decision.priority}`,
    "",
    "Proximas acoes:",
    ...actionPlan(analysis).map((item, index) => `${index + 1}. ${item}`),
  ].join("\n");

  try {
    await navigator.clipboard.writeText(report);
  } catch {
    const area = document.createElement("textarea");
    area.value = report;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }

  els.reportToast.classList.add("show");
  window.setTimeout(() => els.reportToast.classList.remove("show"), 1800);
  pushEvent("info", "Relatorio copiado", "Resumo operacional enviado para a area de transferencia.");
  renderTimeline();
}

function renderAssets() {
  els.assetCount.textContent = `${state.assets.length} ativos`;
  els.assetTable.innerHTML = state.assets
    .map((asset) => {
      const level = asset.status;
      const color = level === "danger" ? "var(--red)" : level === "warning" ? "var(--amber)" : "var(--green)";
      return `
        <tr>
          <td>${asset.name}</td>
          <td>${asset.type}</td>
          <td>${asset.sector}</td>
          <td><div class="health-bar"><i style="width:${asset.health.toFixed(0)}%;background:${color}"></i></div></td>
          <td><span class="tag ${level}">${levelLabel(level)}</span></td>
          <td>${asset.action}</td>
        </tr>`;
    })
    .join("");
}

function levelLabel(level) {
  return level === "danger" ? "critico" : level === "warning" ? "atencao" : "normal";
}

function renderTimeline() {
  els.timeline.innerHTML = "";
  state.events.forEach((event) => {
    const clone = els.template.content.cloneNode(true);
    const item = clone.querySelector(".event");
    item.classList.add(`level-${event.level}`);
    clone.querySelector("strong").textContent = event.title;
    clone.querySelector("p").textContent = event.message;
    clone.querySelector("time").textContent = event.time;
    els.timeline.appendChild(clone);
  });
  els.eventCount.textContent = `${state.events.length} evento${state.events.length === 1 ? "" : "s"}`;
  els.historySize.textContent = `${state.history.length} amostras`;
}

function openAssetDetail(assetId) {
  selectedAssetId = assetId;
  const asset = state.assets.find((item) => item.id === assetId);
  if (!asset) return;

  els.drawer.classList.add("open");
  els.drawer.setAttribute("aria-hidden", "false");
  pushEvent("info", asset.name, `${asset.type} em ${asset.sector}. Saude ${asset.health.toFixed(0)}%. ${asset.action}.`);
  renderSelectedAssetDetail(analyze());
  renderTimeline();
}

function closeAssetDetail() {
  els.drawer.classList.remove("open");
  els.drawer.setAttribute("aria-hidden", "true");
  selectedAssetId = null;
}

function renderSelectedAssetDetail(analysis = analyze()) {
  if (!selectedAssetId || !els.drawer.classList.contains("open")) return;

  const asset = state.assets.find((item) => item.id === selectedAssetId);
  if (!asset) return;

  const detail = assetDetails[asset.id];
  const metrics = assetMetricCards(asset.id, analysis);
  const status = levelLabel(asset.status);
  const color = asset.status === "danger" ? "var(--red)" : asset.status === "warning" ? "var(--amber)" : "var(--green)";
  const angle = Math.round((asset.health / 100) * 360);

  els.drawerTitle.textContent = asset.name;
  els.drawerType.textContent = `${asset.type} · criticidade ${asset.criticality}`;
  els.drawerSector.textContent = `Setor ${asset.sector}`;
  els.drawerHealth.textContent = `${asset.health.toFixed(0)}%`;
  els.drawerHealthRing.style.background =
    `radial-gradient(circle at center, #fff 0 57%, transparent 58%), conic-gradient(${color} 0deg, ${color} ${angle}deg, #dfe7e1 ${angle + 1}deg)`;
  els.drawerStatus.className = `tag ${asset.status}`;
  els.drawerStatus.textContent = status;
  els.drawerDescription.textContent = detail.description;
  els.drawerUpdated.textContent = `tick ${state.tick} · ${formatTime()}`;

  els.drawerMetrics.innerHTML = metrics
    .map((metric) => `<div class="detail-metric"><span>${metric.label}</span><strong>${metric.value}</strong></div>`)
    .join("");

  els.drawerDependencies.innerHTML = detail.dependencies
    .map(([name, description]) => `<div class="dependency-item"><div><b>${name}</b><span>${description}</span></div><span class="tag normal">ligado</span></div>`)
    .join("");

  const diagnostics = assetDiagnostics(asset, analysis);
  els.drawerAnalysis.innerHTML = diagnostics
    .map((item) => `<div class="drawer-analysis-item"><b>${item.title}</b><p>${item.text}</p></div>`)
    .join("");

  drawAssetMiniChart(asset.id, analysis);
}

function assetMetricCards(assetId, analysis) {
  const m = state.metrics;
  const sector = state.sectors.find((item) => item.id === "school");
  const clinic = state.sectors.find((item) => item.id === "clinic");
  const map = {
    "solar-a": [
      ["Geracao atual", `${m.generation.toFixed(1)} kW`],
      ["Demanda total", `${m.load.toFixed(1)} kW`],
      ["Risco energia", `${Math.round(analysis.risks.energy)}%`],
      ["Saldo instantaneo", `${(m.generation - m.load).toFixed(1)} kW`],
    ],
    "battery-bank": [
      ["Carga do banco", `${Math.round(m.battery)}%`],
      ["Autonomia", minutesToLabel(analysis.autonomyMinutes)],
      ["Descarga liquida", `${Math.max(0, m.load - m.generation).toFixed(1)} kW`],
      ["MTTR estimado", `${analysis.mttr} min`],
    ],
    "mesh-tower": [
      ["Latencia", `${Math.round(m.latency)} ms`],
      ["Perda de pacotes", `${m.packetLoss.toFixed(1)}%`],
      ["Roteadores", `${m.routersOnline}/${m.routersTotal}`],
      ["SLA estimado", `${analysis.availability.toFixed(2)}%`],
    ],
    "env-array": [
      ["Temperatura", `${Math.round(m.temperature)} C`],
      ["Fumaca", `${Math.round(m.smoke)}%`],
      ["Qualidade do ar", `${Math.round(m.aqi)} AQI`],
      ["Sensores online", `${m.sensorsOnline}/${m.sensorsTotal}`],
    ],
    "school-load": [
      ["Carga atual", `${Math.round(sector.load * 100)}%`],
      ["Prioridade", `P${sector.priority}`],
      ["Reserva alocada", `${sector.batteryShare}%`],
      ["Estado", levelLabel(sector.status)],
    ],
    "clinic-load": [
      ["Carga atual", `${Math.round(clinic.load * 100)}%`],
      ["Prioridade", `P${clinic.priority}`],
      ["Reserva alocada", `${clinic.batteryShare}%`],
      ["Protecao", analysis.severity === "danger" ? "ativa" : "pronta"],
    ],
  };

  return map[assetId].map(([label, value]) => ({ label, value }));
}

function assetDiagnostics(asset, analysis) {
  const risks = analysis.risks;
  const cause = analysis.root.label;
  return [
    {
      title: "Leitura operacional",
      text: `${asset.name} esta em estado ${levelLabel(asset.status)} com saude ${asset.health.toFixed(0)}%. Causa raiz global: ${cause}.`,
    },
    {
      title: "Risco relacionado",
      text: relatedRiskText(asset.id, risks),
    },
    {
      title: "Acao recomendada",
      text: asset.action,
    },
    {
      title: "Impacto comunitario",
      text: impactText(asset.id, analysis),
    },
  ];
}

function relatedRiskText(assetId, risks) {
  const map = {
    "solar-a": `Risco energetico em ${Math.round(risks.energy)}%, calculado por bateria, geracao e consumo.`,
    "battery-bank": `Continuidade em risco ${Math.round(risks.continuity)}%, com autonomia projetada a partir da descarga liquida.`,
    "mesh-tower": `Risco de rede em ${Math.round(risks.network)}%, combinando latencia, perda e roteadores indisponiveis.`,
    "env-array": `Risco ambiental em ${Math.round(risks.environment)}%, cruzando calor, fumaca, AQI e sensores offline.`,
    "school-load": `Carga flexivel usada para aliviar energia quando o risco energetico passa de 38%.`,
    "clinic-load": `Servico essencial protegido mesmo em risco de continuidade de ${Math.round(risks.continuity)}%.`,
  };
  return map[assetId];
}

function impactText(assetId, analysis) {
  const map = {
    "solar-a": "Se falhar, a comunidade passa a operar por bateria e precisa reduzir cargas flexiveis.",
    "battery-bank": "Se ficar critica, o Modo Guardiao corta cargas nao essenciais e preserva posto, agua e comunicacao.",
    "mesh-tower": "Se degradar, a cloud perde sincronizacao e o painel passa a depender de operacao edge local.",
    "env-array": "Se degradar, eventos ambientais precisam ser confirmados por redundancia ou verificacao em campo.",
    "school-load": "Pode ser reduzida sem derrubar servicos vitais, funcionando como amortecedor de carga.",
    "clinic-load": `Tem prioridade maxima; em crise recebe protecao automatica e MTTR alvo de ${analysis.mttr} minutos.`,
  };
  return map[assetId];
}

function drawAssetMiniChart(assetId, analysis) {
  const canvas = els.assetMiniChart;
  const { ctx, width, height } = chartContext(canvas);
  const pad = 24;
  const data = state.history.length ? state.history : [{ battery: 83, latency: 32, risk: 10, envRisk: 8, score: 92 }];
  const series = assetSeries(assetId, data, analysis);
  ctx.clearRect(0, 0, width, height);
  drawGrid(ctx, width, height, pad);
  series.forEach((item) => drawSeries(ctx, item.values, item.min, item.max, width, height, pad, item.color));
  drawLegend(ctx, series.map((item) => [item.label, item.color]), pad, 16);
}

function assetSeries(assetId, data, analysis) {
  const maps = {
    "solar-a": [
      { label: "Geracao", values: data.map((d) => d.generation * 18), min: 0, max: 100, color: "#ce7a1a" },
      { label: "Carga", values: data.map((d) => d.load * 18), min: 0, max: 100, color: "#285fd6" },
    ],
    "battery-bank": [
      { label: "Bateria", values: data.map((d) => d.battery), min: 0, max: 100, color: "#168a5b" },
      { label: "Risco", values: data.map((d) => d.risk), min: 0, max: 100, color: "#c2413f" },
    ],
    "mesh-tower": [
      { label: "Latencia", values: data.map((d) => d.latency), min: 0, max: 700, color: "#285fd6" },
      { label: "Perda", values: data.map((d) => d.packetLoss * 10), min: 0, max: 100, color: "#7652c8" },
    ],
    "env-array": [
      { label: "Risco amb.", values: data.map((d) => d.envRisk), min: 0, max: 100, color: "#168a5b" },
      { label: "Risco geral", values: data.map((d) => d.risk), min: 0, max: 100, color: "#c2413f" },
    ],
    "school-load": [
      { label: "Score", values: data.map((d) => d.score), min: 0, max: 100, color: "#285fd6" },
      { label: "Risco", values: data.map((d) => d.risk), min: 0, max: 100, color: "#c2413f" },
    ],
    "clinic-load": [
      { label: "SLA", values: data.map((d) => d.availability), min: 70, max: 100, color: "#168a5b" },
      { label: "Risco", values: data.map((d) => d.risk), min: 0, max: 100, color: "#c2413f" },
    ],
  };
  return maps[assetId] || maps["battery-bank"];
}

function chartContext(canvas) {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(320, Math.floor(rect.width * ratio));
  canvas.height = Math.max(220, Math.floor(canvas.getAttribute("height") * ratio));
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { ctx, width: canvas.width / ratio, height: canvas.height / ratio };
}

function drawCharts(analysis) {
  drawTimelineChart();
  drawRadarChart(analysis);
  drawSlaChart(analysis);
  drawCapacityChart();
}

function drawTimelineChart() {
  const { ctx, width, height } = chartContext(els.charts.timeline);
  const pad = 34;
  const data = state.history.length ? state.history : [{ battery: 83, latency: 32, risk: 10, generation: 4.8, load: 2.1 }];
  ctx.clearRect(0, 0, width, height);
  drawGrid(ctx, width, height, pad);
  drawSeries(ctx, data.map((d) => d.battery), 0, 100, width, height, pad, "#168a5b");
  drawSeries(ctx, data.map((d) => d.risk), 0, 100, width, height, pad, "#c2413f");
  drawSeries(ctx, data.map((d) => d.latency), 0, 700, width, height, pad, "#285fd6");
  drawLegend(ctx, [
    ["Bateria", "#168a5b"],
    ["Risco", "#c2413f"],
    ["Latencia", "#285fd6"],
  ], pad, 18);
}

function drawRadarChart(analysis) {
  const { ctx, width, height } = chartContext(els.charts.radar);
  ctx.clearRect(0, 0, width, height);
  const cx = width / 2;
  const cy = height / 2 + 10;
  const radius = Math.min(width, height) * 0.32;
  const labels = ["Energia", "Rede", "Ambiente", "Cyber", "Continuidade"];
  const values = [analysis.risks.energy, analysis.risks.network, analysis.risks.environment, analysis.risks.cyber, analysis.risks.continuity];

  ctx.strokeStyle = "#dbe4dd";
  ctx.fillStyle = "#64716b";
  ctx.font = "12px system-ui";
  for (let ring = 1; ring <= 4; ring += 1) {
    polygon(ctx, labels.length, cx, cy, (radius * ring) / 4);
    ctx.stroke();
  }
  labels.forEach((label, index) => {
    const p = radarPoint(index, labels.length, cx, cy, radius + 22);
    ctx.fillText(label, p.x - 24, p.y + 4);
  });
  ctx.beginPath();
  values.forEach((value, index) => {
    const p = radarPoint(index, values.length, cx, cy, radius * (value / 100));
    if (index === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();
  ctx.fillStyle = "rgba(194, 65, 63, 0.18)";
  ctx.strokeStyle = "#c2413f";
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
}

function drawSlaChart(analysis) {
  const { ctx, width, height } = chartContext(els.charts.sla);
  ctx.clearRect(0, 0, width, height);
  const services = [
    ["Energia", clamp(99.9 - analysis.risks.energy * 0.11, 70, 99.9), "#ce7a1a"],
    ["Internet", clamp(analysis.availability, 70, 99.9), "#285fd6"],
    ["Sensores", clamp(99.7 - analysis.risks.environment * 0.13, 70, 99.9), "#168a5b"],
    ["Edge", clamp(99.95 - analysis.risks.cyber * 0.07, 72, 99.95), "#7652c8"],
  ];
  const maxBar = width - 110;
  ctx.font = "12px system-ui";
  services.forEach((service, index) => {
    const y = 32 + index * 45;
    ctx.fillStyle = "#64716b";
    ctx.fillText(service[0], 12, y + 8);
    ctx.fillStyle = "#e6ece8";
    roundedRect(ctx, 78, y, maxBar, 16, 8);
    ctx.fill();
    ctx.fillStyle = service[2];
    roundedRect(ctx, 78, y, maxBar * (service[1] / 100), 16, 8);
    ctx.fill();
    ctx.fillStyle = "#17211d";
    ctx.fillText(`${service[1].toFixed(1)}%`, width - 50, y + 12);
  });
}

function drawCapacityChart() {
  const { ctx, width, height } = chartContext(els.charts.capacity);
  ctx.clearRect(0, 0, width, height);
  const pad = 32;
  const barWidth = Math.max(28, (width - pad * 2) / state.sectors.length - 14);
  ctx.font = "12px system-ui";
  state.sectors.forEach((sector, index) => {
    const x = pad + index * (barWidth + 14);
    const maxH = height - 70;
    const loadH = maxH * sector.load;
    const batteryH = maxH * (sector.batteryShare / 30);
    const level = sector.status;
    const color = level === "danger" ? "#c2413f" : level === "warning" ? "#b7791f" : "#168a5b";
    ctx.fillStyle = "#e6ece8";
    roundedRect(ctx, x, 25, barWidth, maxH, 7);
    ctx.fill();
    ctx.fillStyle = "rgba(40, 95, 214, 0.22)";
    roundedRect(ctx, x, 25 + maxH - batteryH, barWidth, batteryH, 7);
    ctx.fill();
    ctx.fillStyle = color;
    roundedRect(ctx, x, 25 + maxH - loadH, barWidth, loadH, 7);
    ctx.fill();
    ctx.fillStyle = "#64716b";
    ctx.fillText(sector.name, x - 3, height - 18);
  });
  drawLegend(ctx, [
    ["Carga", "#168a5b"],
    ["Reserva", "#285fd6"],
  ], 10, 16);
}

function drawGrid(ctx, width, height, pad) {
  ctx.strokeStyle = "#dbe4dd";
  ctx.lineWidth = 1;
  ctx.font = "12px system-ui";
  ctx.fillStyle = "#64716b";
  for (let i = 0; i <= 4; i += 1) {
    const y = pad + ((height - pad * 2) * i) / 4;
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(width - pad, y);
    ctx.stroke();
  }
}

function drawSeries(ctx, values, min, max, width, height, pad, color) {
  const range = max - min;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  ctx.beginPath();
  values.forEach((value, index) => {
    const x = pad + (innerW * index) / Math.max(values.length - 1, 1);
    const y = pad + innerH - (innerH * (clamp(value, min, max) - min)) / range;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.stroke();
}

function drawLegend(ctx, items, x, y) {
  ctx.font = "12px system-ui";
  let cursor = x;
  items.forEach(([label, color]) => {
    ctx.fillStyle = color;
    ctx.fillRect(cursor, y - 9, 10, 10);
    ctx.fillStyle = "#64716b";
    ctx.fillText(label, cursor + 15, y);
    cursor += label.length * 7 + 58;
  });
}

function radarPoint(index, count, cx, cy, radius) {
  const angle = -Math.PI / 2 + (Math.PI * 2 * index) / count;
  return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
}

function polygon(ctx, count, cx, cy, radius) {
  ctx.beginPath();
  for (let i = 0; i < count; i += 1) {
    const p = radarPoint(i, count, cx, cy, radius);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
}

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function togglePause() {
  state.paused = !state.paused;
  els.pauseButton.title = state.paused ? "Retomar simulacao" : "Pausar simulacao";
  els.pauseButton.setAttribute("aria-label", state.paused ? "Retomar simulacao" : "Pausar simulacao");
  els.pauseButton.innerHTML = state.paused
    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>';
}

function resetSimulation() {
  state = structuredClone(baseline);
  state.liveWeather.location = {
    latitude: Number(els.latitudeInput.value) || baseline.liveWeather.location.latitude,
    longitude: Number(els.longitudeInput.value) || baseline.liveWeather.location.longitude,
  };
  pushEvent("info", "Sistema iniciado", "Coleta edge/cloud, analise e visualizacoes complexas ativadas.");
  for (let i = 0; i < 8; i += 1) simulateTick(true);
  render();
}

function bindEvents() {
  els.pauseButton.addEventListener("click", togglePause);
  els.resetButton.addEventListener("click", resetSimulation);
  els.loadWeather.addEventListener("click", fetchOpenMeteoTelemetry);
  els.liveWeatherToggle.addEventListener("change", () => {
    if (els.liveWeatherToggle.checked) {
      if (state.liveWeather.current) {
        state.liveWeather.enabled = true;
        state.liveWeather.status = "live";
        pushEvent("info", "Open-Meteo ativado", "Cache de telemetria real aplicado ao motor operacional.");
        simulateTick(true);
      } else {
        fetchOpenMeteoTelemetry();
      }
    } else {
      state.liveWeather.enabled = false;
      state.liveWeather.status = "fallback";
      state.liveWeather.message = "Dados reais pausados pelo usuario.";
      pushEvent("info", "Fallback ativado", "Motor voltou a operar com simulacao local.");
      simulateTick(true);
    }
  });
  $$(".scenario-buttons button").forEach((button) => {
    button.addEventListener("click", () => setScenario(button.dataset.scenario));
  });
  $$(".node").forEach((node) => {
    node.addEventListener("click", () => {
      openAssetDetail(node.dataset.asset);
    });
  });
  els.drawerClose.addEventListener("click", closeAssetDetail);
  els.copyReport.addEventListener("click", copyOperationalReport);
  $("[data-close-drawer]").addEventListener("click", closeAssetDetail);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && els.drawer.classList.contains("open")) closeAssetDetail();
  });
  window.addEventListener("resize", () => render(analyze()));
}

function boot() {
  bindEvents();
  resetSimulation();
  timer = window.setInterval(simulateTick, 1800);
}

boot();
