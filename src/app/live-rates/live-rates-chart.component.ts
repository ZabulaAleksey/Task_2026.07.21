import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { environment } from '../../environment';

type Language = 'en' | 'ru' | 'uk';
type ConnectionState = 'connecting' | 'live' | 'reconnecting' | 'error';

Chart.register(...registerables);

const copy = {
  en: { title: 'Live exchange rates', subtitle: 'Streaming prices via Twelve Data WebSocket', pair: 'Currency pair', connecting: 'Connecting…', live: 'Live', reconnecting: 'Reconnecting…', error: 'Stream unavailable', empty: 'Waiting for the first market update…', latest: 'Latest price', configure: 'Add a Twelve Data API key in src/environment.ts to enable the live stream.' },
  ru: { title: 'Курсы валют в реальном времени', subtitle: 'Поток котировок через Twelve Data WebSocket', pair: 'Валютная пара', connecting: 'Подключение…', live: 'В эфире', reconnecting: 'Переподключение…', error: 'Поток недоступен', empty: 'Ожидаем первое обновление рынка…', latest: 'Последний курс', configure: 'Добавьте API-ключ Twelve Data в src/environment.ts, чтобы включить поток.' },
  uk: { title: 'Курси валют у реальному часі', subtitle: 'Потік котирувань через Twelve Data WebSocket', pair: 'Валютна пара', connecting: 'Підключення…', live: 'Наживо', reconnecting: 'Перепідключення…', error: 'Потік недоступний', empty: 'Очікуємо перше оновлення ринку…', latest: 'Останній курс', configure: 'Додайте API-ключ Twelve Data у src/environment.ts, щоб увімкнути потік.' },
} as const;

@Component({
  selector: 'app-live-rates-chart',
  imports: [FormsModule],
  templateUrl: './live-rates-chart.component.html',
  styleUrl: './live-rates-chart.component.css',
})
export class LiveRatesChartComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) language: Language = 'en';
  @ViewChild('ratesCanvas') canvas!: ElementRef<HTMLCanvasElement>;

  readonly pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD'];
  selectedPair = 'EUR/USD';
  state: ConnectionState = 'connecting';
  latestPrice: number | null = null;
  lastUpdate: Date | null = null;
  message = '';

  private chart?: Chart<'line'>;
  private socket?: WebSocket;
  private heartbeat?: ReturnType<typeof setInterval>;
  private reconnectTimer?: ReturnType<typeof setTimeout>;
  private reconnectAttempt = 0;
  private destroyed = false;
  private themeObserver?: MutationObserver;

  text(key: keyof typeof copy.en): string { return copy[this.language][key]; }
  stateText(): string { return this.text(this.state); }

  ngAfterViewInit(): void {
    this.createChart();
    this.observeTheme();
    this.connect();
  }

  changePair(): void {
    this.latestPrice = null;
    this.lastUpdate = null;
    this.message = '';
    this.chart!.data.labels = [];
    this.chart!.data.datasets[0].data = [];
    this.chart!.data.datasets[0].label = this.selectedPair;
    this.chart!.update('none');
    this.reconnectAttempt = 0;
    this.connect();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.clearConnection();
    this.themeObserver?.disconnect();
    this.chart?.destroy();
  }

  private createChart(): void {
    const colors = this.colors();
    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: { labels: [], datasets: [{ label: this.selectedPair, data: [], borderColor: '#0d6efd', backgroundColor: 'rgba(13,110,253,.12)', borderWidth: 2, pointRadius: 0, pointHoverRadius: 4, fill: true, tension: .28 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 220 },
        interaction: { intersect: false, mode: 'index' },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: context => `${this.selectedPair}: ${Number(context.raw).toLocaleString(this.locale(), { maximumFractionDigits: 6 })}` } } },
        scales: {
          x: { grid: { display: false }, ticks: { color: colors.muted, maxTicksLimit: 7 } },
          y: { position: 'right', grid: { color: colors.grid }, ticks: { color: colors.muted, callback: value => Number(value).toLocaleString(this.locale(), { maximumFractionDigits: 6 }) } },
        },
      },
    };
    this.chart = new Chart(this.canvas.nativeElement, config);
  }

  private connect(): void {
    this.clearConnection();
    const key = environment.twelveDataApiKey?.trim();
    if (!key) { this.state = 'error'; this.message = this.text('configure'); return; }
    this.state = this.reconnectAttempt ? 'reconnecting' : 'connecting';
    const socket = new WebSocket(`wss://ws.twelvedata.com/v1/quotes/price?apikey=${encodeURIComponent(key)}`);
    this.socket = socket;
    socket.addEventListener('open', () => {
      this.reconnectAttempt = 0;
      this.state = 'live';
      socket.send(JSON.stringify({ action: 'subscribe', params: { symbols: this.selectedPair } }));
      this.heartbeat = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ action: 'heartbeat' }));
      }, 10_000);
    });
    socket.addEventListener('message', event => this.handleMessage(event.data));
    socket.addEventListener('error', () => { this.message = this.text('error'); });
    socket.addEventListener('close', () => {
      if (this.destroyed || this.socket !== socket) return;
      this.scheduleReconnect();
    });
  }

  private handleMessage(raw: string): void {
    try {
      const event = JSON.parse(raw) as { event?: string; status?: string; message?: string; price?: number | string; timestamp?: number };
      if (event.event === 'price' && event.price != null) {
        const price = Number(event.price);
        if (!Number.isFinite(price)) return;
        this.latestPrice = price;
        this.lastUpdate = new Date((event.timestamp ?? Date.now() / 1000) * 1000);
        this.message = '';
        const labels = this.chart!.data.labels!;
        const points = this.chart!.data.datasets[0].data;
        labels.push(this.lastUpdate.toLocaleTimeString(this.locale(), { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        points.push(price);
        if (points.length > 120) { points.shift(); labels.shift(); }
        this.chart!.update('none');
      } else if (event.status === 'error' || event.event === 'error') {
        this.state = 'error';
        this.message = event.message || this.text('error');
      }
    } catch { /* Ignore non-JSON service frames. */ }
  }

  private scheduleReconnect(): void {
    this.state = 'reconnecting';
    const delay = Math.min(30_000, 1_000 * 2 ** this.reconnectAttempt++);
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  private clearConnection(): void {
    if (this.heartbeat) clearInterval(this.heartbeat);
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.heartbeat = undefined;
    this.reconnectTimer = undefined;
    const socket = this.socket;
    this.socket = undefined;
    if (socket && socket.readyState < WebSocket.CLOSING) socket.close();
  }

  private observeTheme(): void {
    this.themeObserver = new MutationObserver(() => {
      if (!this.chart) return;
      const colors = this.colors();
      const x = this.chart.options.scales?.['x'];
      const y = this.chart.options.scales?.['y'];
      if (x?.ticks) x.ticks.color = colors.muted;
      if (y?.ticks) y.ticks.color = colors.muted;
      if (y?.grid) y.grid.color = colors.grid;
      this.chart.update('none');
    });
    this.themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-bs-theme'] });
  }

  private colors() {
    const dark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    return { muted: dark ? '#adb5bd' : '#6c757d', grid: dark ? 'rgba(255,255,255,.09)' : 'rgba(0,0,0,.08)' };
  }
  private locale(): string { return ({ en: 'en-US', ru: 'ru-RU', uk: 'uk-UA' } as const)[this.language]; }
}
