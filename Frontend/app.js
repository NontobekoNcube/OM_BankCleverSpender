/**
 * CleverSpender PWA Core Application Logic
 * Pure Vanilla JavaScript — Offline first with Flask API connectivity
 */

const API_BASE = 'http://127.0.0.1:5000';

// localStorage keys (all prefixed cleverspender_)
const KEYS = {
  userId: 'cleverspender_user_id',
  userName: 'cleverspender_user_name',
  userEmail: 'cleverspender_user_email',
  onboarded: 'cleverspender_onboarded',
  why: 'cleverspender_why',
  setupMethod: 'cleverspender_setup_method',
  reminder: 'cleverspender_reminder',
  history: 'cleverspender_nudge_history',
  streak: 'cleverspender_streak',
  rewards: 'cleverspender_rewards',
  patterns: 'cleverspender_patterns',
  xp: 'cleverspender_xp',
  level: 'cleverspender_level'
};

// Seed realistic fallback data if not already set
function initDefaultData() {
  if (!localStorage.getItem(KEYS.userName)) {
    localStorage.setItem(KEYS.userName, 'Alex Morgan');
  }
  if (!localStorage.getItem(KEYS.userEmail)) {
    localStorage.setItem(KEYS.userEmail, 'alex.morgan@cleverspender.app');
  }
  if (!localStorage.getItem(KEYS.userId)) {
    localStorage.setItem(KEYS.userId, 'usr_' + Math.random().toString(36).substring(2, 9));
  }
  if (!localStorage.getItem(KEYS.streak)) {
    localStorage.setItem(KEYS.streak, '7');
  }
  if (!localStorage.getItem(KEYS.xp)) {
    localStorage.setItem(KEYS.xp, '420');
  }
  if (!localStorage.getItem(KEYS.level)) {
    localStorage.setItem(KEYS.level, '3');
  }
  if (!localStorage.getItem(KEYS.reminder)) {
    const defaultReminder = {
      id: 'rem_101',
      time_window: 'Afternoon',
      time_range: '12:00 - 15:00',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      focus: 'Coffee & Takeaways',
      goal: 'Trip to Japan',
      active: true,
      next_checkin: 'Today, 2:15 PM',
      prompt: 'Walking past Gail’s? Save £4.80 for the Tokyo Ramen Fund.'
    };
    localStorage.setItem(KEYS.reminder, JSON.stringify(defaultReminder));
  }
  if (!localStorage.getItem(KEYS.history)) {
    const defaultHistory = [
      { id: 'h1', action: 'done', xp: 10, time: '2026-09-28T09:15:00Z', focus: 'Coffee', amount: 4.20 },
      { id: 'h2', action: 'done', xp: 10, time: '2026-09-27T13:40:00Z', focus: 'Takeaways', amount: 8.50 },
      { id: 'h3', action: 'snooze', xp: 5, time: '2026-09-26T18:10:00Z', focus: 'Online Shopping', amount: 0 },
      { id: 'h4', action: 'done', xp: 10, time: '2026-09-25T11:20:00Z', focus: 'Coffee', amount: 3.80 },
      { id: 'h5', action: 'skip', xp: 0, time: '2026-09-24T19:00:00Z', focus: 'Takeaways', amount: 0 },
      { id: 'h6', action: 'done', xp: 10, time: '2026-09-23T08:50:00Z', focus: 'Coffee', amount: 4.50 },
      { id: 'h7', action: 'done', xp: 10, time: '2026-09-22T14:15:00Z', focus: 'Coffee', amount: 4.10 }
    ];
    localStorage.setItem(KEYS.history, JSON.stringify(defaultHistory));
  }
  if (!localStorage.getItem(KEYS.rewards)) {
    const defaultRewards = [
      { id: 'streak_master', name: 'Streak Master', desc: '7-day mindful track', icon: '🔥', earned: true, date: 'Earned Jun 12' },
      { id: 'milestone_coin', name: 'Milestone Coin', desc: '£100 saved in pocket', icon: '🪙', earned: true, date: 'Earned Jun 18' },
      { id: 'top_climber', name: 'Top Climber Trophy', desc: 'Top 5% elevation ascent', icon: '🏔️', earned: true, date: 'Earned Jun 22' },
      { id: 'zen_spender', name: 'Zen Spender', desc: '30 mindful swaps', icon: '🌱', earned: false, progress: '18/30' },
      { id: 'cafe_hero', name: 'Cafe Hero', desc: 'Skip 10 takeaway coffees', icon: '☕', earned: false, progress: '7/10' },
      { id: 'impulse_shield', name: 'Impulse Shield', desc: 'Survive weekend splurge', icon: '🛡️', earned: false, progress: 'Resets Friday' }
    ];
    localStorage.setItem(KEYS.rewards, JSON.stringify(defaultRewards));
  }
  if (!localStorage.getItem(KEYS.patterns)) {
    const defaultPatterns = [
      { id: 'p1', name: 'Coffee Runs', avg: 'R450 / month avg', desc: 'Around 14 visits • Peak time 08:30 AM weekdays', icon: '☕', impact: 'High Impact', checked: true, amount: 450 },
      { id: 'p2', name: 'Takeaways', avg: 'R890 / month avg', desc: 'Around 8 deliveries • Peak time Fri & Sat evenings', icon: '🍔', impact: 'Weekend Spikes', checked: true, amount: 890 },
      { id: 'p3', name: 'Subscriptions', avg: 'R340 / month avg', desc: '4 recurring services • 1 unused streaming platform', icon: '📱', impact: 'Review Rec.', checked: false, amount: 340 }
    ];
    localStorage.setItem(KEYS.patterns, JSON.stringify(defaultPatterns));
  }
}

// Global Offline indicator
function showOfflineBanner(message = 'Offline mode — using local storage') {
  let banner = document.getElementById('offline-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'offline-banner';
    banner.className = 'offline-banner';
    const header = document.querySelector('.app-header');
    if (header && header.parentNode) {
      header.insertAdjacentElement('afterend', banner);
    } else {
      document.body.prepend(banner);
    }
  }
  banner.innerHTML = `<span class="pulse-dot"></span><span>${message}</span>`;
  banner.classList.add('visible');
}

function hideOfflineBanner() {
  const banner = document.getElementById('offline-banner');
  if (banner) {
    banner.classList.remove('visible');
  }
}

// Unified API Caller with async/await, try/catch, fallback to localStorage
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // Fast timeout for responsive offline fallback
    config.signal = controller.signal;

    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    hideOfflineBanner();
    return await response.json();
  } catch (err) {
    showOfflineBanner('Offline mode — using local storage');
    return null; // Signals caller to use localStorage fallback
  }
}

// ----------------- API Endpoints -----------------

// POST /user/register
async function apiRegisterUser(userData) {
  localStorage.setItem(KEYS.userName, userData.name || 'Alex Morgan');
  localStorage.setItem(KEYS.userEmail, userData.email || 'alex.morgan@cleverspender.app');
  if (userData.why) localStorage.setItem(KEYS.why, JSON.stringify(userData.why));
  if (userData.setup_method) localStorage.setItem(KEYS.setupMethod, userData.setup_method);
  localStorage.setItem(KEYS.onboarded, 'true');

  const remote = await apiCall('/user/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });

  const userId = (remote && remote.user_id) ? remote.user_id : (localStorage.getItem(KEYS.userId) || 'usr_' + Date.now());
  localStorage.setItem(KEYS.userId, userId);
  return { user_id: userId, ...userData };
}

// GET /user/<user_id>
async function apiGetUser(userId) {
  const remote = await apiCall(`/user/${userId}`);
  if (remote) return remote;

  return {
    user_id: userId,
    name: localStorage.getItem(KEYS.userName) || 'Alex Morgan',
    email: localStorage.getItem(KEYS.userEmail) || 'alex.morgan@cleverspender.app',
    streak: parseInt(localStorage.getItem(KEYS.streak) || '7', 10),
    xp: parseInt(localStorage.getItem(KEYS.xp) || '420', 10),
    level: parseInt(localStorage.getItem(KEYS.level) || '3', 10),
    tier: 'Standard Tier'
  };
}

// POST /reminder/setup
async function apiSetupReminder(data) {
  const reminderObj = {
    id: 'rem_' + Date.now(),
    time_window: data.time_window || 'Afternoon',
    time_range: data.time_range || '12:00 - 15:00',
    days: data.days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    focus: data.focus || 'Coffee',
    goal: data.goal || 'Trip',
    active: true,
    next_checkin: 'Today, 2:15 PM',
    prompt: `Walking past Gail’s? Save £4.80 for the ${data.goal || 'Tokyo Ramen Fund'}.`
  };
  localStorage.setItem(KEYS.reminder, JSON.stringify(reminderObj));

  const remote = await apiCall('/reminder/setup', {
    method: 'POST',
    body: JSON.stringify({
      user_id: data.user_id || localStorage.getItem(KEYS.userId),
      time_window: data.time_window,
      days: data.days,
      focus: data.focus,
      goal: data.goal
    })
  });

  return remote || reminderObj;
}

// GET /reminder/<user_id>
async function apiGetReminder(userId) {
  const remote = await apiCall(`/reminder/${userId}`);
  if (remote) return remote;

  const local = localStorage.getItem(KEYS.reminder);
  return local ? JSON.parse(local) : null;
}

// PUT /reminder/<user_id>
async function apiUpdateReminder(userId, updates) {
  let local = localStorage.getItem(KEYS.reminder);
  let reminder = local ? JSON.parse(local) : {};
  reminder = { ...reminder, ...updates };
  localStorage.setItem(KEYS.reminder, JSON.stringify(reminder));

  const remote = await apiCall(`/reminder/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
  return remote || reminder;
}

// DELETE /reminder/<user_id>
async function apiDeleteReminder(userId) {
  localStorage.removeItem(KEYS.reminder);
  localStorage.removeItem(KEYS.onboarded);
  localStorage.removeItem(KEYS.history);

  await apiCall(`/reminder/${userId}`, { method: 'DELETE' });
  return { success: true };
}

// GET /notifications/due
async function apiGetNotificationsDue() {
  const remote = await apiCall('/notifications/due');
  if (remote) return remote;

  const reminder = JSON.parse(localStorage.getItem(KEYS.reminder) || '{}');
  if (!reminder || reminder.active === false) {
    return { has_due: false, next_time: 'Tomorrow, 08:30 AM' };
  }

  return {
    has_due: true,
    reminder_id: reminder.id || 'rem_101',
    focus: reminder.focus || 'Coffee & Takeaways',
    goal: reminder.goal || 'Trip to Japan',
    message: reminder.prompt || "Walking past Gail’s? Save £4.80 for the Tokyo Ramen Fund.",
    potential_savings: '£4.80'
  };
}

// POST /reminder/<id>/done
async function apiReminderDone(reminderId) {
  const xpGained = 10;
  recordHistoryAction('done', xpGained, 4.80);
  awardXP(xpGained);
  incrementStreak();

  const remote = await apiCall(`/reminder/${reminderId}/done`, { method: 'POST' });
  return remote || { success: true, xp: xpGained, streak: getStreak() };
}

// POST /reminder/<id>/snooze
async function apiReminderSnooze(reminderId) {
  const xpGained = 5;
  recordHistoryAction('snooze', xpGained, 0);
  awardXP(xpGained);

  const remote = await apiCall(`/reminder/${reminderId}/snooze`, { method: 'POST' });
  return remote || { success: true, xp: xpGained };
}

// POST /reminder/<id>/skip
async function apiReminderSkip(reminderId) {
  recordHistoryAction('skip', 0, 0);

  const remote = await apiCall(`/reminder/${reminderId}/skip`, { method: 'POST' });
  return remote || { success: true, xp: 0 };
}

// POST /statement/upload
async function apiUploadStatement(fileData) {
  const remote = await apiCall('/statement/upload', {
    method: 'POST',
    body: JSON.stringify({ filename: fileData ? fileData.name : 'statement.csv' })
  });

  if (remote && remote.patterns) {
    return remote;
  }

  // Fallback realistic patterns
  const patterns = [
    { id: 'p1', name: 'Coffee Runs', avg: 'R450 / month avg', desc: 'Around 14 visits • Peak time 08:30 AM weekdays', icon: '☕', impact: 'High Impact', checked: true, amount: 450 },
    { id: 'p2', name: 'Takeaways', avg: 'R890 / month avg', desc: 'Around 8 deliveries • Peak time Fri & Sat evenings', icon: '🍔', impact: 'Weekend Spikes', checked: true, amount: 890 },
    { id: 'p3', name: 'Subscriptions', avg: 'R340 / month avg', desc: '4 recurring services • 1 unused streaming platform', icon: '📱', impact: 'Review Rec.', checked: false, amount: 340 }
  ];
  return {
    filename: fileData ? fileData.name : 'Cheque_Account_May.csv',
    transactions_scanned: 342,
    patterns: patterns,
    potential_savings: 1340
  };
}

// GET /statement/<user_id>/patterns
async function apiGetStatementPatterns(userId) {
  const remote = await apiCall(`/statement/${userId}/patterns`);
  if (remote) return remote;

  const local = localStorage.getItem(KEYS.patterns);
  return local ? JSON.parse(local) : [];
}

// GET /leaderboard/public
async function apiGetLeaderboardPublic() {
  const remote = await apiCall('/leaderboard/public');
  if (remote) return remote;

  return [
    { rank: 1, name: 'Chloe T.', elevation: 4820, mindful_pct: 98, badge: 'Apex', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1fahHzArDt7CEGTazf8Ka9oJzdp1Pbz7zOZ--D9Zdt-2ZKRytDjETfRLyy54Hfwv5AKLGba1gVq29vHbb-9ytcXNqylL1a5k6OCBj8Sb-G3z7B1Snoy-panhlaOT1gWOl19nGQxQ4ZsyXn6tTSNSSF9YiiVTz-sO-3y2Ojt4XRlh0ldIF89NlzW9Hx53MOLZN6xzWAlaWkqa9FRyijc9u2lwlw-QC-GUjkPvjql6yi7A6Z8rXPmk6dw' },
    { rank: 2, name: 'David K.', elevation: 4450, mindful_pct: 94, delta: '+140m today', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAz7oltPxffWU-5MHGoDY_uCDGKfDPOnZg0H6aqgu-E5lVVlvNOX77ACH57VE5lB9yn_2gw6g9_tfdaoeemGFWqfs0Wjh8NTe8bvdpTkiCirlVXgkoZtBmIIy1yV8n9llfQl1B_McU7uJ5SbrpJi5fOjreY5i4aBHi5Zr5gmavZ1YDWc8q51QJVkbB7Yca4iueeRlXNLUAjcl_ko126lnTJRENOE5Z4cu1Ji9S9KCZ_oDpOF1p_7q33Kw' },
    { rank: 3, name: 'Maya S.', elevation: 3920, mindful_pct: 91, delta: '+85m today', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBg3aSWy_qmR3SF-U8DwTEdvpvTs6gTnxFIs3NCXCfFKtHP9GwYW2az5bFqxMj4jnMn696NrPZXZhOS1zMkLH_BRFzfWa0oPulBCZGHY125SWW77qntxpQHVv8lAUG4ckxqKMZC6LyimRO1XpGVsSWVrHiCzJcK08gwa3oFfzE9o3frINiaVUUFLrPqpa0vGeanXoSSaIKnYfe0goBrF0RI63QgSFsRl14eyPpOrpNhWrzEqVNuTol7OA' },
    { rank: 4, name: 'Oliver R.', elevation: 3610, mindful_pct: 89, delta: '3h ago', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzB2ye04S8kiRUXet08fU0QJwBf2NhkXVklm3w-Iae01x9Qb4H4UIva1q7czWFmZFRPIcXAMRoawUnI-hs_louqhwa5_zTr30FZ0gQYkMj1MoPj-cSkIQrfwUopjVY0ySGXg_M5skzCOjVqmDlrxmpIiNM427A0wH_g_5yNtV5qz0v51wlVnDQXeEsT0exk2cVEZWi36rCjMINTeBe2oqfD-OCQ5jr0aYj_MJNEwREcGuH5tf1P7kUfg' },
    { rank: 5, name: 'Sarah W.', elevation: 3400, mindful_pct: 86, delta: '5h ago', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAk1lnn8kijOe7m3DfSS-PYmYE4gnsz2aOD4GSgnWgwxGNkgaPjS_zldSka_oi5PLGNxncMrCpXI5Qr4GwMuOZSjUk5sUNV1v90NdjEX7VXYxivW-Li1I8p5e8a8IouglxM99P71fhzT5NtJBqNsJ25wL_rzDO0O1PjcNNrS5flXhM3k2bQBzvyDFWSVaV8qkWxWrlzdWfFhN836Z8qReNtNEAIoR76GbbEI540zKNI5DnxVZdayyTJnQ' },
    { rank: 12, name: 'Alex (You)', elevation: 2400, mindful_pct: 78, delta: '+60m logged', is_user: true, station: 'Station 6 (2,400m)' }
  ];
}

// GET /leaderboard/friends/<user_id>
async function apiGetLeaderboardFriends(userId) {
  const remote = await apiCall(`/leaderboard/friends/${userId}`);
  if (remote) return remote;
  return { locked: true, reason: 'OM Bank VIP Feature' };
}

// GET /rewards/<user_id>
async function apiGetRewards(userId) {
  const remote = await apiCall(`/rewards/${userId}`);
  if (remote) return remote;

  const local = localStorage.getItem(KEYS.rewards);
  return {
    xp: parseInt(localStorage.getItem(KEYS.xp) || '420', 10),
    level: parseInt(localStorage.getItem(KEYS.level) || '3', 10),
    badges: local ? JSON.parse(local) : []
  };
}

// POST /rewards/send
async function apiSendReward(data) {
  awardXP(5);
  const remote = await apiCall('/rewards/send', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return remote || { success: true, xp_awarded: 5, message: `Gift sent to ${data.friend || 'friend'}!` };
}

// ----------------- Helpers & State -----------------

function getStreak() {
  return parseInt(localStorage.getItem(KEYS.streak) || '7', 10);
}

function incrementStreak() {
  const current = getStreak() + 1;
  localStorage.setItem(KEYS.streak, current.toString());
  return current;
}

function awardXP(points) {
  let xp = parseInt(localStorage.getItem(KEYS.xp) || '420', 10) + points;
  localStorage.setItem(KEYS.xp, xp.toString());

  // Check level upgrade every 150 XP
  let level = Math.floor(xp / 150) + 1;
  localStorage.setItem(KEYS.level, level.toString());

  showXPToast(points);
  return { xp, level };
}

function recordHistoryAction(action, xp, amount) {
  const history = JSON.parse(localStorage.getItem(KEYS.history) || '[]');
  history.unshift({
    id: 'h_' + Date.now(),
    action: action,
    xp: xp,
    time: new Date().toISOString(),
    amount: amount || 0
  });
  localStorage.setItem(KEYS.history, JSON.stringify(history));
}

function showXPToast(points, customMessage) {
  let toast = document.getElementById('xp-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'xp-toast';
    toast.className = 'xp-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span style="font-size: 18px;">⚡</span> <span>${customMessage || `+${points} XP Mindful Boost!`}</span>`;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

// Highlight Active Bottom Navigation Item
function highlightActiveNav() {
  const path = window.location.pathname;
  const currentFile = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

  const navItems = document.querySelectorAll('.bottom-nav .nav-item');
  navItems.forEach(item => {
    const href = item.getAttribute('href') || '';
    const targetFile = href.substring(href.lastIndexOf('/') + 1);

    if (
      (currentFile === '' || currentFile === 'index.html') && (targetFile === 'index.html' || targetFile === '') ||
      (currentFile.includes('nudge') && targetFile.includes('nudge')) ||
      (currentFile.includes('mountain') && targetFile.includes('mountain')) ||
      (currentFile.includes('rewards') && targetFile.includes('rewards')) ||
      (currentFile.includes('profile') && targetFile.includes('profile'))
    ) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

// Onboarding Check on Protected Pages
function checkOnboarding() {
  const path = window.location.pathname;
  const currentFile = path.substring(path.lastIndexOf('/') + 1);
  const isOnboarded = localStorage.getItem(KEYS.onboarded) === 'true';

  if (!isOnboarded && currentFile !== 'onboarding.html') {
    // If not onboarded and not already on onboarding page, redirect
    window.location.replace('onboarding.html');
  }
}

// PWA Service Worker Registration & In-App Install prompt
let deferredPrompt = null;

function setupPWA() {
  // Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js')
        .then(reg => {
          console.log('[CleverSpender] Service Worker registered with scope:', reg.scope);
        })
        .catch(err => {
          console.warn('[CleverSpender] Service Worker registration failed:', err);
        });
    });
  }

  // Intercept beforeinstallprompt for in-app install button
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBanner = document.getElementById('pwa-install-banner');
    if (installBanner) {
      installBanner.style.display = 'flex';
    }
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    const installBanner = document.getElementById('pwa-install-banner');
    if (installBanner) {
      installBanner.style.display = 'none';
    }
    showXPToast(50, '🎉 CleverSpender Installed on your device!');
  });
}

function triggerPWAInstall() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('[CleverSpender] User accepted PWA install');
      }
      deferredPrompt = null;
    });
  } else {
    // iOS or already installed guidance
    alert('To install CleverSpender:\n1. Tap the Share or Options icon in your browser.\n2. Select "Add to Home Screen" or "Install App".');
  }
}

// Initialize on page load
function initApp() {
  initDefaultData();
  highlightActiveNav();
  checkOnboarding();
  setupPWA();

  // Network listener
  window.addEventListener('online', () => {
    hideOfflineBanner();
  });
  window.addEventListener('offline', () => {
    showOfflineBanner();
  });

  if (!navigator.onLine) {
    showOfflineBanner();
  }
}

document.addEventListener('DOMContentLoaded', initApp);
