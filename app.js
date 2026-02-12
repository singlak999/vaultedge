/* ============================================================
   VaultEdge — Application Logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initCounters();
  initPortfolioChart();
  initDonutChart();
  initTransactions();
  initSpendingBars();
  initChipToggles();
});

/* ============================================================
   SIDEBAR TOGGLE
   ============================================================ */
function initSidebar() {
  const toggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });

  // Nav item click
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

/* ============================================================
   ANIMATED COUNTERS
   ============================================================ */
function initCounters() {
  const counters = document.querySelectorAll('.kpi-value[data-target]');
  counters.forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    animateCounter(el, target, 1800);
  });
}

function animateCounter(el, target, duration) {
  const start = performance.now();
  const format = (n) => '$' + n.toLocaleString('en-US');

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(target * eased);
    el.textContent = format(current);
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

/* ============================================================
   PORTFOLIO LINE CHART (Canvas)
   ============================================================ */
function initPortfolioChart() {
  const canvas = document.getElementById('portfolioChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  ctx.scale(dpr, dpr);

  const W = rect.width;
  const H = rect.height;

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const data = [1800000, 1920000, 1850000, 2050000, 2180000, 2100000, 2250000, 2380000, 2310000, 2520000, 2680000, 2847563];

  const padL = 60, padR = 20, padT = 20, padB = 40;
  const graphW = W - padL - padR;
  const graphH = H - padT - padB;

  const minVal = Math.min(...data) * 0.95;
  const maxVal = Math.max(...data) * 1.02;

  function getX(i) { return padL + (i / (data.length - 1)) * graphW; }
  function getY(v) { return padT + graphH - ((v - minVal) / (maxVal - minVal)) * graphH; }

  // Animate the chart drawing
  let animProgress = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padT + (i / 4) * graphH;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(W - padR, y);
      ctx.stroke();

      // Labels
      const val = maxVal - (i / 4) * (maxVal - minVal);
      ctx.fillStyle = '#565b73';
      ctx.font = '11px Inter';
      ctx.textAlign = 'right';
      ctx.fillText('$' + (val / 1000000).toFixed(1) + 'M', padL - 10, y + 4);
    }

    // Month labels
    ctx.fillStyle = '#565b73';
    ctx.font = '11px Inter';
    ctx.textAlign = 'center';
    months.forEach((m, i) => {
      ctx.fillText(m, getX(i), H - 10);
    });

    const pointCount = Math.floor(animProgress * data.length);
    if (pointCount < 2) {
      animProgress += 0.04;
      if (animProgress <= 1) requestAnimationFrame(draw);
      return;
    }

    // Gradient fill
    const grad = ctx.createLinearGradient(0, padT, 0, padT + graphH);
    grad.addColorStop(0, 'rgba(0, 214, 143, 0.18)');
    grad.addColorStop(1, 'rgba(0, 214, 143, 0.0)');

    // Area
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(data[0]));
    for (let i = 1; i < pointCount; i++) {
      const cx = (getX(i - 1) + getX(i)) / 2;
      ctx.bezierCurveTo(cx, getY(data[i - 1]), cx, getY(data[i]), getX(i), getY(data[i]));
    }
    ctx.lineTo(getX(pointCount - 1), padT + graphH);
    ctx.lineTo(getX(0), padT + graphH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(data[0]));
    for (let i = 1; i < pointCount; i++) {
      const cx = (getX(i - 1) + getX(i)) / 2;
      ctx.bezierCurveTo(cx, getY(data[i - 1]), cx, getY(data[i]), getX(i), getY(data[i]));
    }
    ctx.strokeStyle = '#00d68f';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Glow line
    ctx.shadowColor = '#00d68f';
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Dots
    for (let i = 0; i < pointCount; i++) {
      ctx.beginPath();
      ctx.arc(getX(i), getY(data[i]), 4, 0, Math.PI * 2);
      ctx.fillStyle = '#06090f';
      ctx.fill();
      ctx.strokeStyle = '#00d68f';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Animate
    if (animProgress < 1) {
      animProgress += 0.04;
      requestAnimationFrame(draw);
    }
  }

  // Start after a short delay for entrance animation
  setTimeout(() => requestAnimationFrame(draw), 500);
}

/* ============================================================
   DONUT CHART (Canvas)
   ============================================================ */
function initDonutChart() {
  const canvas = document.getElementById('donutChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const dpr = window.devicePixelRatio || 1;
  const size = 200;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  ctx.scale(dpr, dpr);

  const segments = [
    { label: 'Stocks', value: 42, color: '#00d68f' },
    { label: 'Bonds', value: 20, color: '#3b82f6' },
    { label: 'Real Estate', value: 18, color: '#7b61ff' },
    { label: 'Crypto', value: 12, color: '#f59e0b' },
    { label: 'Cash', value: 8, color: '#22d3ee' },
  ];

  const cx = size / 2, cy = size / 2, outerR = 88, innerR = 58;
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  // Build legend
  const legendEl = document.getElementById('donutLegend');
  segments.forEach(seg => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `<span class="legend-dot" style="background:${seg.color}"></span>${seg.label} (${seg.value}%)`;
    legendEl.appendChild(item);
  });

  // Animate
  let animProg = 0;
  function draw() {
    ctx.clearRect(0, 0, size, size);

    let startAngle = -Math.PI / 2;
    const totalAngle = Math.PI * 2 * Math.min(animProg, 1);

    segments.forEach(seg => {
      const segAngle = (seg.value / total) * Math.PI * 2;
      const drawAngle = Math.min(segAngle, Math.max(totalAngle - (startAngle + Math.PI / 2), 0));

      if (drawAngle > 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, startAngle, startAngle + drawAngle);
        ctx.arc(cx, cy, innerR, startAngle + drawAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = seg.color;
        ctx.fill();
      }

      startAngle += segAngle;
    });

    if (animProg < 1) {
      animProg += 0.025;
      requestAnimationFrame(draw);
    }
  }

  setTimeout(() => requestAnimationFrame(draw), 700);
}

/* ============================================================
   TRANSACTIONS
   ============================================================ */
function initTransactions() {
  const list = document.getElementById('transactionsList');

  const transactions = [
    { name: 'Apple Inc.', category: 'Stock Purchase', amount: -4250.00, date: 'Feb 11, 2026', emoji: '🍎', bg: 'var(--green-dim)' },
    { name: 'Salary Deposit', category: 'Employment', amount: 18420.00, date: 'Feb 10, 2026', emoji: '💰', bg: 'var(--blue-dim)' },
    { name: 'Netflix', category: 'Subscription', amount: -17.99, date: 'Feb 9, 2026', emoji: '🎬', bg: 'var(--coral-dim)' },
    { name: 'Dividend — MSFT', category: 'Investment Income', amount: 345.80, date: 'Feb 8, 2026', emoji: '📈', bg: 'var(--violet-dim)' },
    { name: 'Whole Foods', category: 'Groceries', amount: -187.42, date: 'Feb 7, 2026', emoji: '🛒', bg: 'var(--amber-dim)' },
    { name: 'Tesla Bond Coupon', category: 'Bond Interest', amount: 625.00, date: 'Feb 6, 2026', emoji: '⚡', bg: 'var(--green-dim)' },
    { name: 'Uber Rides', category: 'Transportation', amount: -42.50, date: 'Feb 5, 2026', emoji: '🚗', bg: 'var(--coral-dim)' },
  ];

  transactions.forEach(tx => {
    const isPositive = tx.amount >= 0;
    const formattedAmt = (isPositive ? '+' : '-') + '$' + Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 });

    const row = document.createElement('div');
    row.className = 'tx-row';
    row.innerHTML = `
      <div class="tx-icon-wrap" style="background:${tx.bg}">${tx.emoji}</div>
      <div class="tx-details">
        <span class="tx-name">${tx.name}</span>
        <span class="tx-category">${tx.category}</span>
      </div>
      <div class="tx-right">
        <span class="tx-amount ${isPositive ? 'positive' : 'negative'}">${formattedAmt}</span>
        <span class="tx-date">${tx.date}</span>
      </div>
    `;
    list.appendChild(row);
  });
}

/* ============================================================
   SPENDING BARS
   ============================================================ */
function initSpendingBars() {
  const container = document.getElementById('spendingBars');

  const items = [
    { label: 'Housing', value: 2100, max: 3000, color: 'var(--green)' },
    { label: 'Food & Dining', value: 890, max: 1200, color: 'var(--blue)' },
    { label: 'Transportation', value: 420, max: 800, color: 'var(--violet)' },
    { label: 'Entertainment', value: 310, max: 500, color: 'var(--amber)' },
  ];

  items.forEach(item => {
    const pct = (item.value / item.max) * 100;
    const el = document.createElement('div');
    el.className = 'spending-item';
    el.innerHTML = `
      <div class="spending-item-header">
        <span class="spending-item-label">${item.label}</span>
        <span class="spending-item-value">$${item.value.toLocaleString()}</span>
      </div>
      <div class="spending-bar-track">
        <div class="spending-bar-fill" style="background:${item.color}" data-width="${pct}%"></div>
      </div>
    `;
    container.appendChild(el);
  });

  // Animate bars after entrance
  setTimeout(() => {
    document.querySelectorAll('.spending-bar-fill').forEach(bar => {
      bar.style.width = bar.dataset.width;
    });
  }, 900);
}

/* ============================================================
   CHIP TOGGLES
   ============================================================ */
function initChipToggles() {
  document.querySelectorAll('.card-actions').forEach(group => {
    group.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      });
    });
  });
}
