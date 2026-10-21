  function openTab(evt, tabId) {
    const tabContents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabContents.length; i++) {
      tabContents[i].classList.remove("active");
    }
    const tabBtns = document.getElementsByClassName("tab-btn");
    for (let i = 0; i < tabBtns.length; i++) {
      tabBtns[i].classList.remove("active");
    }
    document.getElementById(tabId).classList.add("active");
    evt.currentTarget.classList.add("active");
  }

  function openSubTab(evt, subTabId, parentTabId) {
    if (parentTabId) {
      const tabContents = document.getElementsByClassName("tab-content");
      for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove("active");
      }
      document.getElementById(parentTabId).classList.add("active");
    }

    const currentTab = document.getElementById(parentTabId) || evt.currentTarget.closest('.tab-content');
    const subContents = currentTab.getElementsByClassName("sub-tab-content");
    for (let i = 0; i < subContents.length; i++) {
      subContents[i].classList.remove("active");
    }

    const subBtns = evt.currentTarget.parentElement.getElementsByClassName("sub-tab-btn");
    for (let i = 0; i < subBtns.length; i++) {
      subBtns[i].classList.remove("active");
    }

    document.getElementById(subTabId).classList.add("active");
    evt.currentTarget.classList.add("active");
  }

  // ============================================================
  // قسم السياحة (Tourism) — بوابة الدخول والتنقل
  // ============================================================
  const TOURISM_DEFAULT_PIN = '1234';
  const ADMIN_DEFAULT_PIN = '2026@Look#1$';

  // ترحيل لمرة واحدة: مسح أي رمز إدارة قديم مخزّن حتى يعمل الرمز الجديد
  try {
    if (!localStorage.getItem('pin_migrated_v2')) {
      localStorage.removeItem('admin_pin');
      localStorage.setItem('pin_migrated_v2', '1');
    }
  } catch (e) { /* ignore */ }

  function getTourismPin() {
    return localStorage.getItem('tourism_pin') || TOURISM_DEFAULT_PIN;
  }

  function getAdminPin() {
    return localStorage.getItem('admin_pin') || ADMIN_DEFAULT_PIN;
  }

  // ===== شاشة الدخول (Role-based) =====
  let selectedLoginRole = null;

  // إعادة شاشة الدخول لحالتها الافتراضية: إخفاء حقل كلمة المرور وزر الدخول
  function resetLoginScreen() {
    selectedLoginRole = null;
    const a = document.getElementById('roleAdminBtn');
    const tr = document.getElementById('roleTourismBtn');
    if (a) a.classList.remove('active');
    if (tr) tr.classList.remove('active');
    const err = document.getElementById('loginError');
    if (err) err.style.display = 'none';
    const wrap = document.getElementById('loginPinWrap');
    if (wrap) wrap.style.display = 'none';
    const inp = document.getElementById('loginPinInput');
    if (inp) inp.value = '';
  }

  function selectLoginRole(role) {
    selectedLoginRole = role;
    const a = document.getElementById('roleAdminBtn');
    const tr = document.getElementById('roleTourismBtn');
    if (a) a.classList.toggle('active', role === 'admin');
    if (tr) tr.classList.toggle('active', role === 'tourism');
    const err = document.getElementById('loginError');
    if (err) err.style.display = 'none';
    const wrap = document.getElementById('loginPinWrap');
    const inp = document.getElementById('loginPinInput');

    if (role === 'admin') {
      // إظهار حقل كلمة المرور وزر الدخول فقط عند اختيار "الحسابات"
      if (wrap) wrap.style.display = 'block';
      if (inp) { inp.value = ''; inp.focus(); }
    } else {
      // قسم السياحة مفتوح بدون رقم سري -> إخفاء الحقل والدخول مباشرة
      if (wrap) wrap.style.display = 'none';
      if (inp) inp.value = '';
      sessionStorage.setItem('authRole', 'tourism');
      enterTourism();
    }
  }

  function showLoginError() {
    const err = document.getElementById('loginError');
    if (err) err.style.display = 'block';
    const inp = document.getElementById('loginPinInput');
    if (inp) { inp.value = ''; inp.focus(); }
  }

  function submitLogin() {
    // قسم السياحة مفتوح بدون رقم سري
    if (selectedLoginRole === 'tourism') {
      sessionStorage.setItem('authRole', 'tourism');
      enterTourism();
      return;
    }
    const inp = document.getElementById('loginPinInput');
    const pin = (inp ? inp.value : '').trim();
    if (pin === getAdminPin()) {
      sessionStorage.setItem('authRole', 'admin');
      showAdminApp();
    } else showLoginError();
  }

  function showAdminApp() {
    const login = document.getElementById('loginScreen');
    const app = document.getElementById('appScreen');
    const tourism = document.getElementById('tourismScreen');
    if (login) login.style.display = 'none';
    if (tourism) tourism.style.display = 'none';
    if (app) app.style.display = 'block';
    window.scrollTo(0, 0);
  }

  function logout() {
    sessionStorage.removeItem('authRole');
    sessionStorage.removeItem('tourismMode');
    const login = document.getElementById('loginScreen');
    const app = document.getElementById('appScreen');
    const tourism = document.getElementById('tourismScreen');
    const tourismModal = document.getElementById('tourismEntityDetailsModal');
    if (tourismModal) tourismModal.style.display = 'none';
    if (app) app.style.display = 'none';
    if (tourism) tourism.style.display = 'none';
    if (login) login.style.display = 'flex';
    resetLoginScreen();
    window.scrollTo(0, 0);
  }

  // معاينة قسم السياحة من داخل واجهة الإدارة (بدون رمز، لأن المدير مسجّل دخول بالفعل)
  function previewTourism() {
    sessionStorage.setItem('tourismMode', '1');
    enterTourism();
  }

  function enterTourism() {
    sessionStorage.setItem('tourismMode', '1');
    const login = document.getElementById('loginScreen');
    const app = document.getElementById('appScreen');
    const tourism = document.getElementById('tourismScreen');
    const tourismModal = document.getElementById('tourismEntityDetailsModal');
    if (tourismModal) tourismModal.style.display = 'none';
    if (login) login.style.display = 'none';
    if (app) app.style.display = 'none';
    if (tourism) tourism.style.display = 'block';
    if (window.App && typeof App.refreshTourismView === 'function') App.refreshTourismView();
    window.scrollTo(0, 0);
  }

  function exitTourism() {
    const role = sessionStorage.getItem('authRole');
    sessionStorage.removeItem('tourismMode');
    const tourism = document.getElementById('tourismScreen');
    const tourismModal = document.getElementById('tourismEntityDetailsModal');
    if (tourismModal) tourismModal.style.display = 'none';
    if (tourism) tourism.style.display = 'none';
    if (role === 'admin') {
      // المدير كان في وضع المعاينة -> يرجع لواجهة الإدارة
      const app = document.getElementById('appScreen');
      if (app) app.style.display = 'block';
    } else {
      // موظف السياحة -> تسجيل خروج والعودة لشاشة الدخول
      logout();
      return;
    }
    window.scrollTo(0, 0);
  }

  function openTourismSubTab(evt, subTabId) {
    const container = document.getElementById('tourismScreen');
    if (!container) return;
    const contents = container.getElementsByClassName('tourism-subtab-content');
    for (let i = 0; i < contents.length; i++) contents[i].classList.remove('active');
    const btns = evt.currentTarget.parentElement.getElementsByClassName('sub-tab-btn');
    for (let i = 0; i < btns.length; i++) btns[i].classList.remove('active');
    const target = document.getElementById(subTabId);
    if (target) target.classList.add('active');
    evt.currentTarget.classList.add('active');
  }

  function changeTourismPin() {
    const newPin = prompt(t('tourism_pin_prompt'), '');
    if (newPin === null) return;
    const trimmed = newPin.trim();
    if (trimmed.length < 4) {
      if (window.showToast) window.showToast(t('tourism_pin_invalid'), 'error'); else alert(t('tourism_pin_invalid'));
      return;
    }
    localStorage.setItem('tourism_pin', trimmed);
    if (window.showToast) window.showToast(t('tourism_pin_changed'), 'success'); else alert(t('tourism_pin_changed'));
  }

  function changeAdminPin() {
    const newPin = prompt(t('admin_pin_prompt'), '');
    if (newPin === null) return;
    const trimmed = newPin.trim();
    if (trimmed.length < 4) {
      if (window.showToast) window.showToast(t('tourism_pin_invalid'), 'error'); else alert(t('tourism_pin_invalid'));
      return;
    }
    localStorage.setItem('admin_pin', trimmed);
    if (window.showToast) window.showToast(t('admin_pin_changed'), 'success'); else alert(t('admin_pin_changed'));
  }

    function filterTourismEntitySummaryTable() {
    const input = document.getElementById('searchTourismEntitySummary');
    const filter = input ? input.value.toLowerCase() : '';
    document.querySelectorAll('#tourismEntitySummaryTable tbody tr').forEach(tr => {
      if (tr.children.length === 1) return;
      tr.style.display = tr.innerText.toLowerCase().includes(filter) ? '' : 'none';
    });
  }

  function printTourismDashboard() { window.print(); }

  function downloadTourismDashboardPDF() {
    const element = document.getElementById('printableTourismArea');
    if (!element) return;
    html2pdf().set({
      margin: 0.5, filename: 'Tourism_Credit_Dashboard.pdf',
      jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' },
      html2canvas: { ignoreElements: (el) => el.classList && el.classList.contains('no-print') }
    }).from(element).save();
  }

  // استرجاع حالة الدخول بعد إعادة تحميل الصفحة (مثلاً عند تغيير اللغة)
  document.addEventListener('DOMContentLoaded', function () {
    const role = sessionStorage.getItem('authRole');
    const login = document.getElementById('loginScreen');
    const app = document.getElementById('appScreen');
    const tourism = document.getElementById('tourismScreen');

    if (role === 'admin') {
      if (login) login.style.display = 'none';
      if (tourism) tourism.style.display = 'none';
      if (app) app.style.display = 'block';
    } else if (role === 'tourism') {
      if (login) login.style.display = 'none';
      if (app) app.style.display = 'none';
      if (tourism) tourism.style.display = 'block';
      if (window.App && typeof App.refreshTourismView === 'function') App.refreshTourismView();
    } else {
      // لا يوجد تسجيل دخول -> شاشة الدخول (حقل كلمة المرور مخفي حتى الضغط على "الحسابات")
      if (app) app.style.display = 'none';
      if (tourism) tourism.style.display = 'none';
      if (login) login.style.display = 'flex';
      resetLoginScreen();
    }
  });

  function toggleAccountsMenu(evt) {
    const menu = document.getElementById("accountsSubMenu");
    const isHidden = menu.style.display === "none" || menu.style.display === "";
    menu.style.display = isHidden ? "flex" : "none";
    document.getElementById("accountsArrowIcon").innerText = isHidden ? "▲" : "▼";
  }

  function toggleTaxDiscountMenu(evt) {
    const menu = document.getElementById("taxDiscountSubMenu");
    const isHidden = menu.style.display === "none" || menu.style.display === "";
    menu.style.display = isHidden ? "flex" : "none";
    document.getElementById("taxArrowIcon").innerText = isHidden ? "▲" : "▼";
    openTab(evt, "taxDiscountTab");
  }

  function toggleCreditMenu(evt) {
    const menu = document.getElementById("creditSubMenu");
    const isHidden = menu.style.display === "none" || menu.style.display === "";
    menu.style.display = isHidden ? "flex" : "none";
    document.getElementById("creditArrowIcon").innerText = isHidden ? "▲" : "▼";
    openTab(evt, "creditTab");
  }

  function toggleAviationMenu(evt) {
    const menu = document.getElementById("aviationSubMenu");
    const isHidden = menu.style.display === "none" || menu.style.display === "";
    menu.style.display = isHidden ? "flex" : "none";
    document.getElementById("aviationArrowIcon").innerText = isHidden ? "▲" : "▼";
    openTab(evt, "aviationTab");
  }

  function toggleTicketsMenu(evt) {
    const menu = document.getElementById("ticketsSubMenu");
    const isHidden = menu.style.display === "none" || menu.style.display === "";
    menu.style.display = isHidden ? "flex" : "none";
    document.getElementById("ticketsArrowIcon").innerText = isHidden ? "▲" : "▼";
    openTab(evt, "ticketsTab");
  }

  function toggleShopsMenu(evt) {
    const menu = document.getElementById("shopsSubMenu");
    const isHidden = menu.style.display === "none" || menu.style.display === "";
    menu.style.display = isHidden ? "flex" : "none";
    document.getElementById("shopsArrowIcon").innerText = isHidden ? "▲" : "▼";
    openTab(evt, "shopsTab");
  }

  function toggleSettlementMenu(evt) {
    const menu = document.getElementById("settlementSubMenu");
    const isHidden = menu.style.display === "none" || menu.style.display === "";
    menu.style.display = isHidden ? "flex" : "none";
    document.getElementById("settlementArrowIcon").innerText = isHidden ? "▲" : "▼";
    openTab(evt, "settlementTab");
  }

  function filterSuppliersTable() {
    const input = document.getElementById("searchSupplier");
    const filter = input ? input.value.toLowerCase() : "";
    const trs = document.querySelectorAll("#suppliersTable tbody tr");
    trs.forEach(tr => {
      if (tr.children.length === 1) return;
      tr.style.display = tr.innerText.toLowerCase().includes(filter) ? "" : "none";
    });
  }

  function filterCreditTable() {
    const input = document.getElementById("searchCredit");
    const filter = input ? input.value.toLowerCase() : "";
    const trs = document.querySelectorAll("#creditTable tbody tr");
    trs.forEach(tr => {
      if (tr.children.length === 1) return;
      tr.style.display = tr.innerText.toLowerCase().includes(filter) ? "" : "none";
    });
  }

  function filterEntitySummaryTable() {
    const input = document.getElementById("searchEntitySummary");
    const filter = input ? input.value.toLowerCase() : "";
    const trs = document.querySelectorAll("#entitySummaryTable tbody tr");
    trs.forEach(tr => {
      if (tr.children.length === 1) return;
      tr.style.display = tr.innerText.toLowerCase().includes(filter) ? "" : "none";
    });
  }

  function filterShopsTable() {
    const input = document.getElementById("searchShop");
    const filter = input ? input.value.toLowerCase() : "";
    const trs = document.querySelectorAll("#shopsTable tbody tr");
    trs.forEach(tr => {
      if (tr.children.length === 1) return;
      tr.style.display = tr.innerText.toLowerCase().includes(filter) ? "" : "none";
    });
  }

  function filterShopSummaryTable() {
    const input = document.getElementById("searchShopSummary");
    const filter = input ? input.value.toLowerCase() : "";
    const trs = document.querySelectorAll("#shopSummaryTable tbody tr");
    trs.forEach(tr => {
      if (tr.children.length === 1) return;
      tr.style.display = tr.innerText.toLowerCase().includes(filter) ? "" : "none";
    });
  }

  function filterShopDirectoryTable() {
    const input = document.getElementById("searchShopDirectory");
    const filter = input ? input.value.toLowerCase() : "";
    const trs = document.querySelectorAll("#shopDirectoryTable tbody tr");
    trs.forEach(tr => {
      if (tr.children.length === 1) return;
      tr.style.display = tr.innerText.toLowerCase().includes(filter) ? "" : "none";
    });
  }

  function filterAviationTable() {
    const input = document.getElementById("searchAviation");
    const filter = input ? input.value.toLowerCase() : "";
    const trs = document.querySelectorAll("#aviationTable tbody tr");
    trs.forEach(tr => {
      if (tr.children.length === 1) return;
      tr.style.display = tr.innerText.toLowerCase().includes(filter) ? "" : "none";
    });
  }

  function filterAviationCommissionTable() {
    const input = document.getElementById("searchAviationCommission");
    const filter = input ? input.value.toLowerCase() : "";
    const trs = document.querySelectorAll("#aviationCommissionTable tbody tr");
    trs.forEach(tr => {
      if (tr.children.length === 1) return;
      tr.style.display = tr.innerText.toLowerCase().includes(filter) ? "" : "none";
    });
  }

  function filterTicketsTable() {
    const guideFilter = (document.getElementById("ticketSearchGuide")?.value || "").toLowerCase().trim();
    const fileCodeFilter = (document.getElementById("ticketSearchFileCode")?.value || "").toLowerCase().trim();
    const landmarkFilter = (document.getElementById("ticketSearchLandmark")?.value || "").toLowerCase().trim();

    const trs = document.querySelectorAll("#ticketsTable tbody tr");
    trs.forEach(tr => {
      if (tr.children.length === 1) return;
      // ترتيب الأعمدة: #(0) الحركة(1) رقم الملف(2) اسم المزار(3) المندوب/المرشد(4) ...
      const fileCodeText = (tr.children[2] ? tr.children[2].innerText : "").toLowerCase();
      const landmarkText = (tr.children[3] ? tr.children[3].innerText : "").toLowerCase();
      const guideText = (tr.children[4] ? tr.children[4].innerText : "").toLowerCase();

      const matchesGuide = !guideFilter || guideText.includes(guideFilter);
      const matchesFileCode = !fileCodeFilter || fileCodeText.includes(fileCodeFilter);
      const matchesLandmark = !landmarkFilter || landmarkText.includes(landmarkFilter);

      tr.style.display = (matchesGuide && matchesFileCode && matchesLandmark) ? "" : "none";
    });
  }

  // ===== بحث سجل مخزون التذاكر (نافذة البحث: المرشد/المندوب + رقم الملف + اسم المزار) =====
  function openTicketsSearchModal() {
    // اقتراحات أسماء المزارات من حركات التذاكر المسجلة
    const landmarks = [...new Set(((window.App && window.App.currentTickets) || [])
      .filter(t => t.ticketName).map(t => t.ticketName.trim()))]
      .sort((a, b) => a.localeCompare(b, 'ar'));
    const dl = document.getElementById('ticketSearchLandmarkList');
    if (dl) dl.innerHTML = landmarks.map(n => `<option value="${escapeHTML(n)}"></option>`).join('');

    document.getElementById('ticketsSearchModal').style.display = 'flex';
    setTimeout(() => { const inp = document.getElementById('ticketSearchGuide'); if (inp) inp.focus(); }, 50);
  }

  function closeTicketsSearchModal() {
    document.getElementById('ticketsSearchModal').style.display = 'none';
  }

  function applyTicketsSearch() {
    filterTicketsTable();
    closeTicketsSearchModal();
    updateTicketsFilterChip();
  }

  function updateTicketsFilterChip() {
    const chip = document.getElementById('ticketsActiveFilter');
    if (!chip) return;
    const guide = (document.getElementById('ticketSearchGuide')?.value || '').trim();
    const fileCode = (document.getElementById('ticketSearchFileCode')?.value || '').trim();
    const landmark = (document.getElementById('ticketSearchLandmark')?.value || '').trim();
    if (!guide && !fileCode && !landmark) { chip.innerHTML = ''; chip.style.display = 'none'; return; }
    const parts = [];
    if (guide) parts.push('المرشد: ' + escapeHTML(guide));
    if (fileCode) parts.push('الملف: ' + escapeHTML(fileCode));
    if (landmark) parts.push('المزار: ' + escapeHTML(landmark));
    chip.innerHTML = `<span>${parts.join(' • ')}</span><button type="button" title="مسح البحث" onclick="resetTicketsSearch()">✖</button>`;
    chip.style.display = 'inline-flex';
  }

  function resetTicketsSearch() {
    const g = document.getElementById('ticketSearchGuide'); if (g) g.value = '';
    const f = document.getElementById('ticketSearchFileCode'); if (f) f.value = '';
    const l = document.getElementById('ticketSearchLandmark'); if (l) l.value = '';
    filterTicketsTable();
    updateTicketsFilterChip();
  }

  function filterTicketsBalanceTable() {
    const input = document.getElementById("searchTicketsBalance");
    const filter = input ? input.value.toLowerCase() : "";
    const trs = document.querySelectorAll("#ticketsBalanceTable tbody tr");
    trs.forEach(tr => {
      if (tr.children.length === 1) return;
      tr.style.display = tr.innerText.toLowerCase().includes(filter) ? "" : "none";
    });
  }

  // أسماء الشهور بالعربي
  const ARABIC_MONTH_NAMES = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

  // استخراج اسم الشهر بالعربي من رقم الملف بتنسيق yyyymm/file number (مثال: 202603/145 => مارس)
  // بيقبل كمان الأرقام العربية (٠-٩) وفواصل / \ - . بين الشهر ورقم الملف. لو التنسيق غير صحيح يرجع فاضي.
  function getMonthNameFromFileCode(fileCode) {
    const s = String(fileCode || '').trim().replace(/[\u0660-\u0669]/g, d => String(d.charCodeAt(0) - 0x0660));
    const m = s.match(/^(\d{4})(\d{2})\s*[\/\\\-.]/);
    if (!m) return '';
    const month = parseInt(m[2], 10);
    return (month >= 1 && month <= 12) ? ARABIC_MONTH_NAMES[month - 1] : '';
  }

  // بيانات الشهر والسنة من رقم الملف، مستخدمة في تجميع تحليل البيانات (عشان نفس الشهر في سنتين مختلفتين ميتلخبطش)
  // بترجع label زي "نوفمبر 2025" وsortKey زي "202511" للترتيب الزمني الصحيح
  function getYearMonthFromFileCode(fileCode) {
    const s = String(fileCode || '').trim().replace(/[\u0660-\u0669]/g, d => String(d.charCodeAt(0) - 0x0660));
    const m = s.match(/^(\d{4})(\d{2})[\/\\\-.]/);
    if (!m) return null;
    const year = m[1];
    const month = parseInt(m[2], 10);
    if (month < 1 || month > 12) return null;
    return { label: ARABIC_MONTH_NAMES[month - 1] + ' ' + year, sortKey: year + m[2] };
  }

  // توحيد النص للبحث (يتجاهل الفرق بين أ/ا/إ و ى/ي و ة/ه والتشكيل) عشان البحث باسم الشهر ينجح بأي كتابة
  function normalizeSearchText(str) {
    return String(str || '')
      .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  // ===== بحث تصفيات الأوبريتور (نافذة البحث: اسم الأوبريتور + الشهر) =====
  const settlementSearchState = {
    list:    { operator: '', month: '' },
    archive: { operator: '', month: '' }
  };
  let settlementSearchMode = 'list';

  function openSettlementSearchModal(mode) {
    settlementSearchMode = mode === 'archive' ? 'archive' : 'list';
    const st = settlementSearchState[settlementSearchMode];
    const wantApproved = settlementSearchMode === 'archive';

    // الأوبريتورز الموجودين فعلاً في الصفحة الحالية (الجارية أو الأرشيف)
    const guides = new Set();
    ((window.App && window.App.currentSettlements) || []).forEach(s => {
      if (!!s.isApproved === wantApproved && s.guideName && s.guideName.trim()) guides.add(s.guideName.trim());
    });
    const opSel = document.getElementById('settlementSearchOperator');
    opSel.innerHTML = '<option value="">الكل</option>' +
      Array.from(guides).sort((a, b) => a.localeCompare(b, 'ar')).map(g => `<option value="${escapeHTML(g)}">${escapeHTML(g)}</option>`).join('');
    opSel.value = guides.has(st.operator) ? st.operator : '';

    const monthSel = document.getElementById('settlementSearchMonth');
    monthSel.innerHTML = '<option value="">الكل</option>' +
      ARABIC_MONTH_NAMES.map(m => `<option value="${m}">${m}</option>`).join('');
    monthSel.value = st.month || '';

    document.getElementById('settlementSearchModal').style.display = 'flex';
  }

  function closeSettlementSearchModal() {
    document.getElementById('settlementSearchModal').style.display = 'none';
  }

  function applySettlementSearch() {
    settlementSearchState[settlementSearchMode] = {
      operator: document.getElementById('settlementSearchOperator').value,
      month: document.getElementById('settlementSearchMonth').value
    };
    closeSettlementSearchModal();
    applySettlementFilter(settlementSearchMode);
  }

  function clearSettlementSearch(mode) {
    settlementSearchState[mode] = { operator: '', month: '' };
    applySettlementFilter(mode);
  }

  function applySettlementFilter(mode) {
    const isArchive = mode === 'archive';
    const st = settlementSearchState[mode];
    const selectedOperator = (st.operator || '').toLowerCase().trim();
    const selectedMonth = normalizeSearchText(st.month);

    const printElem = document.getElementById(isArchive ? 'archiveSettlementPrintFilter' : 'settlementPrintFilter');
    if (printElem) {
      printElem.innerText = [st.operator || 'جميع الأوبريتورز', st.month ? 'شهر ' + st.month : ''].filter(Boolean).join(' — ');
    }

    // شارة توضح الفلتر الشغال + زر مسح
    const chip = document.getElementById(isArchive ? 'archiveActiveFilter' : 'settlementActiveFilter');
    if (chip) {
      const parts = [];
      if (st.operator) parts.push('الأوبريتور: ' + escapeHTML(st.operator));
      if (st.month) parts.push('الشهر: ' + escapeHTML(st.month));
      chip.innerHTML = parts.length ? `<span>${parts.join(' • ')}</span><button type="button" title="مسح البحث" onclick="clearSettlementSearch('${mode}')">✖</button>` : '';
      chip.style.display = parts.length ? 'inline-flex' : 'none';
    }

    const trs = document.querySelectorAll(isArchive ? '#settlementsArchiveTable tbody tr' : '#settlementsTable tbody tr');
    trs.forEach(tr => {
      if (tr.children.length === 1) return;
      const guideName = (tr.getAttribute('data-guide') || '').toLowerCase().trim();
      const rowMonth = normalizeSearchText(tr.getAttribute('data-month') || '');
      const operatorMatch = !selectedOperator || guideName === selectedOperator;
      const monthMatch = !selectedMonth || rowMonth === selectedMonth;
      tr.style.display = (operatorMatch && monthMatch) ? '' : 'none';
    });

    if (window.App) {
      if (isArchive && window.App.updateArchiveSettlementTotalCommission) window.App.updateArchiveSettlementTotalCommission();
      if (!isArchive && window.App.updateSettlementTotalCommission) window.App.updateSettlementTotalCommission();
    }
  }

  function filterSettlementsTable() { applySettlementFilter('list'); }
  function filterArchiveSettlementsTable() { applySettlementFilter('archive'); }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const m = document.getElementById('settlementSearchModal');
      if (m && m.style.display === 'flex') closeSettlementSearchModal();
      const sm = document.getElementById('statementSearchModal');
      if (sm && sm.style.display === 'flex') closeStatementSearchModal();
      const tm = document.getElementById('ticketsSearchModal');
      if (tm && tm.style.display === 'flex') closeTicketsSearchModal();
    }
  });

  // طباعة بوضع أفقي (landscape) للصفحات العريضة، وبيرجّع الإعداد الافتراضي بعد الطباعة
  function printWithOrientation(orientation) {
    const style = document.createElement('style');
    style.textContent = '@page { size: A4 ' + orientation + '; margin: 8mm; }';
    document.head.appendChild(style);
    const cleanup = () => { style.remove(); window.removeEventListener('afterprint', cleanup); };
    window.addEventListener('afterprint', cleanup);
    window.print();
  }
  function printArchiveSettlementsList() { printWithOrientation('landscape'); }
  function printSettlementAnalysis() { printWithOrientation('portrait'); }
  function downloadArchiveSettlementsPDF() {
    const element = document.getElementById('printableSettlementArchiveArea');
    const opt = {
      margin:       0.5,
      filename:     'Settlement_Archive_Report.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, ignoreElements: (el) => el.classList && el.classList.contains('no-print') },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(element).save();
  }

  function printSuppliersList() { window.print(); }
  function downloadSuppliersPDF() {
    const element = document.getElementById('printableSuppliersArea');
    html2pdf().set({ margin: 0.5, filename: 'Suppliers_Report.pdf', jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }, html2canvas: { ignoreElements: (el) => el.classList && el.classList.contains('no-print') } }).from(element).save();
  }
  function printDashboard() { window.print(); }
  function downloadDashboardPDF() {
    const element = document.getElementById('printableArea');
    html2pdf().set({ margin: 0.5, filename: 'Credit_Dashboard.pdf', jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }, html2canvas: { ignoreElements: (el) => el.classList && el.classList.contains('no-print') } }).from(element).save();
  }
  function downloadShopsDashboardPDF() {
    const element = document.getElementById('printableShopsArea');
    html2pdf().set({ margin: 0.5, filename: 'Shops_Dashboard.pdf', jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }, html2canvas: { ignoreElements: (el) => el.classList && el.classList.contains('no-print') } }).from(element).save();
  }
  function downloadMasterDashboardPDF() {
    const element = document.getElementById('printableMasterDashboard');
    html2pdf().set({ margin: 0.5, filename: 'Master_Dashboard.pdf', jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }, html2canvas: { ignoreElements: (el) => el.classList && el.classList.contains('no-print') } }).from(element).save();
  }
  function downloadAviationPDF() {
    const element = document.getElementById('printableAviationArea');
    html2pdf().set({ margin: 0.5, filename: 'Aviation_Report.pdf', jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }, html2canvas: { ignoreElements: (el) => el.classList && el.classList.contains('no-print') } }).from(element).save();
  }
  function downloadTicketsPDF() {
    const element = document.getElementById('printableTicketsArea');
    html2pdf().set({
      margin: 0.5, filename: 'Tickets_Report.pdf', jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' },
      html2canvas: { ignoreElements: (el) => el.classList && el.classList.contains('no-print') }
    }).from(element).save();
  }
  function downloadTicketsBalancePDF() {
    const element = document.getElementById('printableTicketsBalanceArea');
    html2pdf().set({
      margin: 0.5, filename: 'Tickets_Balance_Report.pdf', jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' },
      html2canvas: { ignoreElements: (el) => el.classList && el.classList.contains('no-print') }
    }).from(element).save();
  }
  function printSettlementsList() { printWithOrientation('landscape'); }
  function downloadSettlementAnalysisPDF() {
    const element = document.getElementById('printableSettlementAnalysis');
    html2pdf().set({ margin: 0.5, filename: 'Settlement_Analysis.pdf', jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }, html2canvas: { ignoreElements: (el) => el.classList && el.classList.contains('no-print') } }).from(element).save();
  }
  function downloadSettlementsPDF() {
    const element = document.getElementById('printableSettlementArea');
    html2pdf().set({ margin: 0.5, filename: 'Settlements_Report.pdf', jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }, html2canvas: { ignoreElements: (el) => el.classList && el.classList.contains('no-print') } }).from(element).save();
  }
  function downloadStatementPDF() {
    const element = document.getElementById('printableStatementArea');
    html2pdf().set({ margin: 0.5, filename: 'Account_Statement.pdf', jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }, html2canvas: { ignoreElements: (el) => el.classList && el.classList.contains('no-print') } }).from(element).save();
  }
  function exportStatementToExcel() {
    const table = document.getElementById('statementRunningTable');
    if (!table) return;
    const wb = XLSX.utils.table_to_book(table, {sheet: "كشف الحساب"});
    XLSX.writeFile(wb, "Account_Statement.xlsx");
  }
  function resetStatementFilters() {
    document.getElementById('stEntityName').value = '';
    document.getElementById('stFileCode').value = '';
    document.getElementById('stCurrency').value = 'EGP';
    document.getElementById('statementRunningTbody').innerHTML = '<tr><td colspan="5" style="text-align:center; color:#64748b;">قم باختيار الفندق/الجهة والضغط على (🔍 بحث) لعرض كشف الحساب</td></tr>';
    const wrap = document.getElementById('statementResultsWrap');
    if (wrap) wrap.style.display = 'none';
    updateStatementFilterChip();
  }
  // ===== بحث كشف الحساب (نافذة البحث: اسم الحساب + رقم الملف + العملة) =====
  function openStatementSearchModal() {
    // اقتراحات أسماء الحسابات من حركات الكريديت المسجلة
    const entities = [...new Set(((window.App && window.App.currentCredit) || [])
      .filter(c => !c.isDeleted && c.entity).map(c => c.entity.trim()))]
      .sort((a, b) => a.localeCompare(b, 'ar'));
    const dl = document.getElementById('stEntityList');
    if (dl) dl.innerHTML = entities.map(n => `<option value="${escapeHTML(n)}"></option>`).join('');

    document.getElementById('statementSearchModal').style.display = 'flex';
    setTimeout(() => { const inp = document.getElementById('stEntityName'); if (inp) inp.focus(); }, 50);
  }

  function closeStatementSearchModal() {
    document.getElementById('statementSearchModal').style.display = 'none';
  }

  // تنفيذ البحث ثم إغلاق النافذة (لو اسم الحساب فاضي تفضل النافذة مفتوحة)
  function applyStatementSearch() {
    if (!document.getElementById('stEntityName').value.trim()) {
      alert('يرجى اختيار اسم الحساب أولاً');
      return;
    }
    renderRunningStatement();
    closeStatementSearchModal();
    updateStatementFilterChip();
  }

  // شارة توضح البحث الشغال + زر مسح
  function updateStatementFilterChip() {
    const chip = document.getElementById('statementActiveFilter');
    if (!chip) return;
    const entity = document.getElementById('stEntityName').value.trim();
    const wrap = document.getElementById('statementResultsWrap');
    const active = entity && wrap && wrap.style.display !== 'none';
    if (!active) { chip.innerHTML = ''; chip.style.display = 'none'; return; }
    const fileCode = document.getElementById('stFileCode').value.trim();
    const currency = document.getElementById('stCurrency').value;
    const parts = ['الحساب: ' + escapeHTML(entity)];
    if (fileCode) parts.push('الملف: ' + escapeHTML(fileCode));
    parts.push('العملة: ' + escapeHTML(currency));
    chip.innerHTML = `<span>${parts.join(' • ')}</span><button type="button" title="مسح البحث" onclick="resetStatementFilters()">✖</button>`;
    chip.style.display = 'inline-flex';
  }

  function searchCreditEntitySuggestions() {
    const queryVal = document.getElementById('creditEntity').value.trim().toLowerCase();
    const dropdown = document.getElementById('creditEntitySuggestions');
    if (!queryVal || !window.App) { dropdown.style.display = 'none'; return; }

    // نبحث في أسماء الفنادق/الجهات المسجلة فعليًا في سجل عمليات الكريديت (أرصدة الكريديت)
    const matched = [...new Set(window.App.currentCredit.map(c => c.entity))]
      .filter(e => e && e.toLowerCase().includes(queryVal));

    if (matched.length === 0) { dropdown.style.display = 'none'; return; }

    dropdown.innerHTML = matched.map(m => `<div class="suggestion-item" onclick="selectCreditEntitySuggestion('${escapeHTML(m)}')"><span>${escapeHTML(m)}</span></div>`).join('');
    dropdown.style.display = 'block';
  }
  function selectCreditEntitySuggestion(name) {
    document.getElementById('creditEntity').value = name;
    document.getElementById('creditEntitySuggestions').style.display = 'none';
  }
  function searchShopEntitySuggestions() {
    const queryVal = document.getElementById('shopEntity').value.trim().toLowerCase();
    const dropdown = document.getElementById('shopEntitySuggestions');
    if (!queryVal || !window.App) { dropdown.style.display = 'none'; return; }

    // لو الاسم مطابق تمامًا لمحل في الدليل، نعبّي نسبة العمولة ونوع المحل تلقائيًا
    applyShopAutoFill(document.getElementById('shopEntity').value);

    // نبحث في المحلات المسجلة في دليل المحلات، وكمان في أسماء المحلات اللي ليها حركات سابقة
    const directoryMatches = (window.App.currentShopDirectory || [])
      .filter(s => (s.name || '').toLowerCase().includes(queryVal))
      .map(s => ({ name: s.name, extra: [s.region, s.type, s.commissionRate != null ? s.commissionRate + '%' : ''].filter(Boolean).join(' • ') }));

    const historyNames = new Set(directoryMatches.map(m => m.name));
    const historyMatches = [...new Set(window.App.currentShops.map(s => s.entity))]
      .filter(e => e && e.toLowerCase().includes(queryVal) && !historyNames.has(e))
      .map(e => ({ name: e, extra: '' }));

    const matched = [...directoryMatches, ...historyMatches];
    if (matched.length === 0) { dropdown.style.display = 'none'; return; }

    dropdown.innerHTML = matched.map(m => `
      <div class="suggestion-item" onclick="selectShopEntitySuggestion('${escapeHTML(m.name)}')">
        <span>${escapeHTML(m.name)}</span>
        ${m.extra ? `<span style="font-size:12px; color:#94a3b8;">${escapeHTML(m.extra)}</span>` : ''}
      </div>
    `).join('');
    dropdown.style.display = 'block';
  }
  // اقتراحات اسم المحل في مودال تعديل حركة المحل: أي محل اسمه فيه نفس الحروف/الكلمة المكتوبة (بتجاهل أ/ا و ة/ه والتشكيل)
  function searchEditShopEntitySuggestions() {
    const input = document.getElementById('editShopEntity');
    const dropdown = document.getElementById('editShopEntitySuggestions');
    if (!input || !dropdown) return;
    syncShopFeeMode(true);
    const q = normalizeSearchText(input.value);
    if (!q || !window.App) { dropdown.style.display = 'none'; return; }

    const directory = (window.App.currentShopDirectory || [])
      .filter(s => normalizeSearchText(s.name).includes(q))
      .map(s => ({ name: s.name, extra: [s.region, s.type, s.commissionRate != null ? s.commissionRate + '%' : ''].filter(Boolean).join(' • ') }));
    const known = new Set(directory.map(m => m.name));
    const history = [...new Set((window.App.currentShops || []).map(s => s.entity))]
      .filter(e => e && normalizeSearchText(e).includes(q) && !known.has(e))
      .map(e => ({ name: e, extra: '' }));

    const matched = [...directory, ...history];
    if (matched.length === 0) { dropdown.style.display = 'none'; return; }
    dropdown.innerHTML = matched.map(m => `
      <div class="suggestion-item" data-name="${escapeHTML(m.name)}" onclick="selectEditShopEntitySuggestion(this.dataset.name)">
        <span>${escapeHTML(m.name)}</span>
        ${m.extra ? `<span style="font-size:12px; color:#94a3b8;">${escapeHTML(m.extra)}</span>` : ''}
      </div>`).join('');
    dropdown.style.display = 'block';
  }

  // عند اختيار محل من الاقتراحات: نكتب الاسم، ولو المحل موجود في الدليل نحدّث نوع المحل ونسبة العمولة منه
  function selectEditShopEntitySuggestion(name) {
    document.getElementById('editShopEntity').value = name;
    document.getElementById('editShopEntitySuggestions').style.display = 'none';
    syncShopFeeMode(true);

    const target = (name || '').trim().toLowerCase();
    const shop = (window.App && window.App.currentShopDirectory || []).find(s => (s.name || '').trim().toLowerCase() === target);
    if (!shop) return;

    const typeSelect = document.getElementById('editShopShopType');
    if (typeSelect && shop.type) {
      const norm = s => String(s).replace(/[ةه]/g, 'ه').replace(/\s+/g, '').trim();
      let opt = Array.from(typeSelect.options).find(o => o.value === String(shop.type).trim() || norm(o.value) === norm(shop.type));
      if (!opt) {
        opt = document.createElement('option'); opt.value = String(shop.type).trim(); opt.textContent = opt.value;
        typeSelect.insertBefore(opt, Array.from(typeSelect.options).find(o => o.value === 'أخرى') || null);
      }
      typeSelect.value = opt.value;
    }
    const commissionInput = document.getElementById('editShopCommission');
    const moveType = document.getElementById('editShopType');
    if (commissionInput && shop.commissionRate != null && !(moveType && moveType.value === 'deduction')) {
      commissionInput.value = shop.commissionRate;
    }
  }

  // قفل قايمة الاقتراحات لما نضغط في أي مكان بره حقل اسم المحل
  document.addEventListener('click', (e) => {
    const dd = document.getElementById('editShopEntitySuggestions');
    if (dd && dd.style.display !== 'none' && !e.target.closest('#editShopEntity') && !e.target.closest('#editShopEntitySuggestions')) dd.style.display = 'none';
  });

  function selectShopEntitySuggestion(name) {
    document.getElementById('shopEntity').value = name;
    document.getElementById('shopEntitySuggestions').style.display = 'none';
    applyShopAutoFill(name);
  }

  // تعبئة نسبة العمولة ونوع المحل تلقائيًا من دليل المحلات بمجرد اختيار/كتابة اسم المحل
  function applyShopAutoFill(name) {
    const commissionInput = document.getElementById('shopCommission');
    const typeInput = document.getElementById('shopShopType');
    const target = (name || '').trim().toLowerCase();
    const shop = (window.App && window.App.currentShopDirectory || [])
      .find(s => (s.name || '').trim().toLowerCase() === target);

    if (commissionInput) {
      commissionInput.value = (shop && shop.commissionRate != null) ? shop.commissionRate : '';
    }
    if (typeInput) {
      const shopType = (shop && shop.type) ? String(shop.type).trim() : '';
      let matchedValue = '';
      if (shopType) {
        const options = Array.from(typeInput.options);
        // 1) مطابقة مباشرة لقيمة الخيار
        const exact = options.find(o => o.value === shopType);
        if (exact) {
          matchedValue = exact.value;
        } else {
          // 2) مطابقة بعد التطبيع (تتعامل مع اختلاف ه/ة والمسافات)
          const normalize = s => String(s).replace(/[ةه]/g, 'ه').replace(/\s+/g, '').trim();
          const fuzzy = options.find(o => normalize(o.value) === normalize(shopType));
          matchedValue = fuzzy ? fuzzy.value : '';
        }
      }
      typeInput.value = matchedValue;
    }

    // مراعاة حالة قفل العمولة حسب نوع الحركة الحالي بعد التعبئة التلقائية
    onShopTypeChange();
  }

  // عند اختيار "دائن (المحصل)" يعني المبلغ محصّل بالكامل من المحل، فلا داعي لحساب عمولة
  // فيتم قفل خانة نسبة العمولة وتصفيرها. وعند الرجوع لـ "مدين (لنا)" تُعاد تفعيلها
  // وتُعاد تعبئتها تلقائيًا من دليل المحلات إن وُجد.
  function onShopTypeChange() {
    const typeSelect = document.getElementById('shopType');
    const commissionInput = document.getElementById('shopCommission');
    if (!typeSelect || !commissionInput) return;

    if (typeSelect.value === 'deduction') {
      commissionInput.value = '';
      commissionInput.disabled = true;
    } else {
      commissionInput.disabled = false;
      const entityName = document.getElementById('shopEntity') ? document.getElementById('shopEntity').value : '';
      const target = (entityName || '').trim().toLowerCase();
      const shop = (window.App && window.App.currentShopDirectory || [])
        .find(s => (s.name || '').trim().toLowerCase() === target);
      commissionInput.value = (shop && shop.commissionRate != null) ? shop.commissionRate : commissionInput.value;
    }
    syncShopFeeMode(false);
  }

  // نفس منطق onShopTypeChange لكن لحقول مودال تعديل حركة المحل
  // ===== محلات بمبلغ ثابت للوحدة (بدل نسبة العمولة): الإجمالي = العدد × المبلغ الثابت =====
  function normalizeShopKey(name) {
    return normalizeSearchText(name).replace(/[\s()]/g, '');
  }
  function getFixedFeeShop(name) {
    const key = normalizeShopKey(name);
    if (!key || !window.App) return null;
    return (window.App.currentShopDirectory || []).find(s => !s.isDeleted && parseFloat(s.fixedUnitAmount) > 0 && normalizeShopKey(s.name) === key) || null;
  }

  // بيقفل خانة العمولة ويظهر خانة "العدد" ويثبّت المبلغ والعملة لو المحل بمبلغ ثابت والحركة "مدين"
  function syncShopFeeMode(isEdit) {
    const p = isEdit ? 'editShop' : 'shop';
    const el = (s) => document.getElementById(p + s);
    const entity = el('Entity'), type = el('Type'), amount = el('Amount'), currency = el('Currency'), commission = el('Commission');
    const qtyWrap = el('QuantityWrap'), qty = el('Quantity');
    if (!entity || !type || !amount || !currency || !commission || !qtyWrap) return;

    const shop = type.value === 'deposit' ? getFixedFeeShop(entity.value) : null;
    if (shop) {
      qtyWrap.style.display = 'block';
      amount.value = shop.fixedUnitAmount; amount.readOnly = true; amount.dataset.fixedFill = '1';
      currency.value = shop.fixedCurrency || 'USD'; currency.disabled = true;
      commission.value = ''; commission.disabled = true;
      updateShopFixedHint(isEdit);
    } else {
      qtyWrap.style.display = 'none';
      if (amount.dataset.fixedFill) { amount.value = ''; delete amount.dataset.fixedFill; }
      amount.readOnly = false; currency.disabled = false;
      commission.disabled = (type.value === 'deduction');
      const hint = el('FixedHint'); if (hint) hint.textContent = '';
    }
  }

  function updateShopFixedHint(isEdit) {
    const p = isEdit ? 'editShop' : 'shop';
    const hint = document.getElementById(p + 'FixedHint');
    const shop = getFixedFeeShop(document.getElementById(p + 'Entity').value);
    if (!hint || !shop) return;
    const q = parseInt(document.getElementById(p + 'Quantity').value);
    const unit = parseFloat(shop.fixedUnitAmount), cur = shop.fixedCurrency || 'USD';
    hint.textContent = q > 0 ? `الإجمالي: ${q} × ${unit} = ${(q * unit).toLocaleString(undefined, {maximumFractionDigits: 2})} ${cur}` : `سعر الوحدة ${unit} ${cur} — اكتب العدد`;
  }

  // دليل المحلات: التبديل بين "نسبة %" و"مبلغ ثابت للوحدة"
  function toggleShopDirFeeMode(prefix) {
    const fixed = document.getElementById(prefix + 'FeeMode').value === 'fixed';
    const comm = document.getElementById(prefix + 'CommissionWrap');
    comm.style.display = fixed ? 'none' : (comm.dataset.show || '');
    document.getElementById(prefix + 'FixedWrap').style.display = fixed ? 'block' : 'none';
    if (fixed) document.getElementById(prefix + 'Commission').value = '';
  }

  function onEditShopTypeChange() {
    const typeSelect = document.getElementById('editShopType');
    const commissionInput = document.getElementById('editShopCommission');
    if (!typeSelect || !commissionInput) return;

    if (typeSelect.value === 'deduction') {
      commissionInput.value = '';
      commissionInput.disabled = true;
    } else {
      commissionInput.disabled = false;
    }
    syncShopFeeMode(true);
  }

  function renderRunningStatement() {
    const entity = document.getElementById('stEntityName').value.trim();
    const currency = document.getElementById('stCurrency').value;
    const fileCode = document.getElementById('stFileCode').value.trim().toLowerCase();

    if (!entity) { alert('يرجى اختيار اسم الجهة أو الفندق أولاً'); return; }

    const stWrap = document.getElementById('statementResultsWrap');
    if (stWrap) stWrap.style.display = 'block';

    document.getElementById('stInfoEntity').innerText = entity;
    document.getElementById('stInfoCurrency').innerText = currency;
    document.getElementById('pdfStatementSub').innerText = `اسم الجهة: ${entity} | العملة: ${currency}`;

    const records = (window.App ? window.App.currentCredit : []).filter(c => {
      if (c.isDeleted) return false;
      if (c.entity.trim().toLowerCase() !== entity.toLowerCase()) return false;
      if ((c.currency || 'EGP').toUpperCase() !== currency) return false;
      if (fileCode && !(c.fileCode || '').toLowerCase().includes(fileCode)) return false;
      return true;
    }).sort((a,b) => new Date(a.arrivalDate || 0) - new Date(b.arrivalDate || 0));

    let runningBalance = 0;
    let totalDebit = 0;
    let totalCredit = 0;
    let html = '';

    records.forEach((r) => {
      const amt = parseFloat(r.amount) || 0;
      const isDeposit = r.type === 'deposit';
      const debitVal = isDeposit ? amt : 0;
      const creditVal = !isDeposit ? amt : 0;

      totalDebit += debitVal;
      totalCredit += creditVal;
      runningBalance += (debitVal - creditVal);

      html += `
        <tr>
          <td>${formatDateDMY(r.arrivalDate)}</td>
          <td>${escapeHTML(r.description || r.fileCode || '-')}</td>
          <td style="color:#16a34a; font-weight:700;">${debitVal ? debitVal.toLocaleString() : '-'}</td>
          <td style="color:#dc2626; font-weight:700;">${creditVal ? creditVal.toLocaleString() : '-'}</td>
          <td style="color:#2563eb; font-weight:800;">${runningBalance.toLocaleString()}</td>
        </tr>
      `;
    });

    if (records.length === 0) {
      html = '<tr><td colspan="5" style="text-align:center; color:#64748b;">لا توجد حركات مطابقة للبحث</td></tr>';
    }

    document.getElementById('statementRunningTbody').innerHTML = html;
    document.getElementById('stCardDebit').innerText = totalDebit.toLocaleString();
    document.getElementById('stCardCredit').innerText = totalCredit.toLocaleString();
    document.getElementById('stCardBalance').innerText = runningBalance.toLocaleString();
    document.getElementById('stTotalCount').innerText = records.length;
  }

  function formatDateDMY(iso) {
    if (!iso) return '-';
    const parts = iso.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return iso;
  }

  function escapeHTML(str) {
    if (typeof str !== 'string') return str ?? '';
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // ===== أسماء الملفات حسب كود الملف (للتصفيات القديمة اللي اسم الملف فيها فاضي) =====
  // لو التصفية نفسها فيها اسم ملف محفوظ بيتعرض هو، ولو فاضي بنرجع لهذه القائمة.
  const SETTLEMENT_FILE_NAMES = {
    "202511/20": "Michel Premont",
    "202511/14": "Karen Collishaw",
    "202511/31": "Travelphoer",
    "202511/32": "Selma Budak",
    "202511/21": "Kulbinder Kaur Hari",
    "202511/1": "Rance Wall",
    "202512/2": "Nadine Baladi",
    "202512/3": "Etienne Audet",
    "202512/8": "Troy Gua",
    "202512/18": "Van Der",
    "202512/22": "True Blue Tour",
    "202512/23": "The Greatest Travel",
    "202512/24": "Morjan Luja",
    "202512/12": "Thai Group",
    "202512/38": "Lucien Callige's Family",
    "202512/42": "Cheung Tsz Yat",
    "202512/14": "Tahlia",
    "202512/6": "Alexandria & Thisen",
    "202511/46": "Clemence",
    "202511/22": "Hollie Oswald",
    "202511/9": "Massimiliano Scudeletti",
    "202511/17": "Rene",
    "202511/5": "Mary Forbes",
    "202511/19": "Christopher",
    "202602/32": "around of the world - KOUFOGAZOS/",
    "202602/19": "SONA",
    "202603/19": "Kelly Moody",
    "202603/13": "Alok",
    "202603/21": "Sylvie Arkoun",
    "202602/5": "Tour4U",
    "202602/16": "DeWonder FIT",
    "202602/8": "DeWonder Travel",
    "202602/22": "Wong Man Ian",
    "202602/24": "Sung",
    "202602/28": "Fiona and Antonio",
    "202602/13": "Larry James",
    "202601/10": "NOI ORATORIO SACRI CUORI DI GESÙ E MARIA – APS",
    "202601/6": "Plenustour Japan",
    "202601/7": "Robert",
    "202601/28": "Jatinder Singh",
    "202602/14": "Suraj",
    "202601/25": "Marco's Family",
    "202601/15": "Pamela",
    "202512/1": "Bonnie Hewitt",
    "202512/13": "Paula",
    "202512/9": "Natalie Odzer",
    "202512/26": "Syed",
    "202512/28": "Hazel H",
    "202511/18": "Patrick Barnes",
    "202511/6": "IHPL",
    "202511/2": "Lalitha Narayanan",
    "202511/3": "Isaac Singh",
    "202511/45": "Moses Ong",
    "202511/15": "Eyup Karaman",
    "202511/4": "Haniff Sabar",
    "202511/35": "Bert Cornelissen",
    "202606/2": "Julie Berris",
    "202605/15": "Montserrat Blanch",
    "202604/26": "Robert Tyler Trent",
    "202603/32": "Shelby",
    "202603/1": "Kurt Reynolds",
    "202512/61": "Steven Xu",
    "202512/45": "Maisah Howard",
    "202512/40": "Mr. Milind",
    "202512/35": "Breogan Alvarez",
    "202512/31": "Swendri Weeraratne",
    "202512/16": "Priscilla Vythilingum",
    "202512/15": "Do Afrika",
    "202512/7": "CHARLES SCHREYER",
    "202512/5": "Faisal Qureshi",
    "202512/4": "amber brunck",
    "202604/21": "Chow",
    "202604/20": "Meltem's Group GEM+Bahariye+Alexandria",
    "202604/12": "Malcuit",
    "202604/7": "Meltem's Group \"A\"",
    "202604/5": "Meltem's Group \"B\"",
    "202604/4": "Armin Kabir",
    "202603/37": "D wonder 2",
    "202603/25": "Mark Wood",
    "202603/2": "Mayra Boitel",
    "202603/26": "Murphy",
    "202603/29": "D wonder 1",
    "202603/22": "Peter Valentin",
    "202605/13": "Harry schulz",
    "202605/10": "Ravi Rekha",
    "202604/24": "Blossom Travel",
    "202604/22": "Blossom Travel",
    "202604/10": "Joseph Laur",
    "202604/3": "Eugene Tarasula",
    "202603/33": "steffani Fescher",
    "202603/9": "Linda Guo",
    "202604/17": "D wonder 3",
    "202601/3": "Peter Cubra",
    "202601/13": "Sarah Mayer",
    "202601/26": "Patrick Garnier",
    "202606/11": "Stan Dong",
    "202607/6": "Jadok Travel",
    "202607/8": "KONTA MAYUMI & KURIHARA NANAMMI"
  };

  // بتبدّل الأرقام العربية بإنجليزي وتشيل المسافات وتوحّد الفاصل (\\ - . تتحول لـ /) عشان المطابقة متتأثرش بشكل الكتابة
  function normalizeFileCodeKey(fileCode) {
    return String(fileCode || '').trim()
      .replace(/[\u0660-\u0669]/g, d => String(d.charCodeAt(0) - 0x0660))
      .replace(/\s+/g, '')
      .replace(/[\\\-.]/g, '/');
  }

  // اسم الملف المعروض للتصفية: المحفوظ في السجل أولًا، وإلا من القائمة حسب كود الملف
  function getSettlementFileName(record) {
    const saved = String((record && record.fileName) || '').trim();
    if (saved) return saved;
    return SETTLEMENT_FILE_NAMES[normalizeFileCodeKey(record && record.fileCode)] || '';
  }
