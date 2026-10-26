/* Solar Thermal Inspector dashboard: a small hash-routed SPA over the REST API.
   User-supplied text is only ever inserted with textContent (see el()), never as HTML. */
"use strict";

const $main = document.getElementById("main");
const $dialog = document.getElementById("finding");
const $dialogBody = document.getElementById("finding-body");
const PRIORITY_LABEL = { P1: "P1 urgent", P2: "P2 soon", P3: "P3 scheduled", "-": "Normal" };
const STATUS_LABEL = { open: "Open", in_progress: "In progress", resolved: "Resolved", false_alarm: "False alarm", ok: "Normal" };
let catalog = null;

/* ---------------------------------------------------------------- helpers */

function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
    else if (k === "style") Object.assign(node.style, v);
    else node.setAttribute(k, v === true ? "" : v);
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

const fmt = {
  int: (n) => (n === null || n === undefined ? "–" : Math.round(n).toLocaleString("en-US")),
  pct: (x, d = 1) => (x === null || x === undefined ? "–" : `${(x * 100).toFixed(d)}%`),
  num: (x, d = 2) => (x === null || x === undefined ? "–" : Number(x).toFixed(d)),
  krw: (n) => (n === null || n === undefined ? "–" : `₩${Math.round(n).toLocaleString("en-US")}`),
  krwShort: (n) => {
    if (n === null || n === undefined) return "–";
    if (Math.abs(n) >= 1e8) return `₩${(n / 1e8).toFixed(2)}억`;
    if (Math.abs(n) >= 1e4) return `₩${(n / 1e4).toFixed(0)}만`;
    return `₩${Math.round(n)}`;
  },
  hours: (h) => (h === null || h === undefined ? "–" : h < 1 ? `${Math.max(1, Math.round(h * 60))} min` : h < 48 ? `${h.toFixed(1)} h` : `${(h / 24).toFixed(1)} d`),
};

function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove("show"), 3200);
}

function apiKey() {
  try { return localStorage.getItem("sti-api-key") || ""; } catch { return ""; }
}

async function api(path, opts = {}, retry = true) {
  const headers = Object.assign({}, opts.headers || {});
  if (apiKey()) headers["X-API-Key"] = apiKey();
  const res = await fetch(path, Object.assign({}, opts, { headers }));
  if (res.status === 401 && retry) {
    const key = window.prompt("This server requires an API key for changes. Enter it:");
    if (key) {
      try { localStorage.setItem("sti-api-key", key); } catch { /* private mode */ }
      return api(path, opts, false);
    }
  }
  if (!res.ok) {
    let detail = res.statusText;
    try { const j = await res.json(); detail = typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail); } catch { /* not json */ }
    throw new Error(`${res.status}: ${detail}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

async function getCatalog() {
  if (!catalog) {
    const list = await api("/api/catalog");
    catalog = Object.fromEntries(list.map((c) => [c.name, c]));
  }
  return catalog;
}

function chip(priority) {
  if (priority === "-" || !priority) return el("span", { class: "chip ok", text: "Normal" });
  return el("span", { class: `chip ${priority}`, text: PRIORITY_LABEL[priority] });
}

function tile(label, value, sub, opts = {}) {
  return el("div", { class: `tile${opts.alert ? " alert" : ""}` },
    el("div", { class: "label", text: label }),
    el("div", { class: "value", text: value }),
    sub ? el("div", { class: "sub", text: sub }) : null);
}

function bars(rows, { max, cls } = {}) {
  const top = max || Math.max(1, ...rows.map((r) => r.value));
  return el("div", { class: "bars", role: "list" }, rows.map((r) =>
    el("div", { class: "bar-row", role: "listitem", title: `${r.name}: ${r.label ?? r.value}` },
      el("span", { class: "name", text: r.name }),
      el("span", { class: "bar-track", "aria-hidden": "true" },
        el("span", { class: `bar-fill ${r.cls || cls || ""}`, style: { width: `${(100 * r.value) / top}%`, display: "block" } })),
      el("span", { class: "val", text: r.label ?? fmt.int(r.value) }))));
}

function setNav(name) {
  document.querySelectorAll("nav a[data-nav]").forEach((a) => {
    if (a.dataset.nav === name) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}

function render(...nodes) {
  $main.replaceChildren(...nodes.filter((n) => n !== null && n !== undefined));
}

function errorBox(err) {
  return el("div", { class: "card" }, el("h2", { text: "Something went wrong" }), el("p", { class: "muted", text: String(err.message || err) }));
}

/* ---------------------------------------------------------------- overview */

async function overview() {
  setNav("overview");
  const [k, list] = await Promise.all([api("/api/kpis"), api("/api/inspections")]);
  document.title = "Overview · Solar Thermal Inspector";
  if (!list.length) {
    render(el("div", { class: "card empty" },
      el("h1", { text: "No inspections yet" }),
      el("p", { class: "muted", text: "Upload drone IR images of your modules, or load the bundled demo: 627 module images from the InfraredSolarModules test split, never used in training, with a synthetic site layout." }),
      el("div", { class: "actions", style: { justifyContent: "center" } },
        el("button", { class: "btn primary", onclick: loadDemo, text: "Load demo inspection" }),
        el("a", { class: "btn", href: "#/new", text: "Upload images" }))));
    return;
  }
  const rate = Object.fromEntries(k.trend.map((t) => [t.inspection_id, t]));
  const prio = k.open_by_priority || {};
  render(
    el("div", { class: "page-head" },
      el("div", {}, el("h1", { text: "Fleet overview" }),
        el("p", { class: "muted", text: `${fmt.int(k.inspections)} inspection${k.inspections === 1 ? "" : "s"} · ${fmt.int(k.modules_inspected)} modules scored` })),
      el("div", { class: "actions" },
        el("a", { class: "btn primary", href: "#/new", text: "New inspection" }),
        el("button", { class: "btn", onclick: loadDemo, text: "Load demo" }))),
    el("div", { class: "tiles" },
      tile("Open work orders", fmt.int(k.open_work_orders), `${fmt.int(k.open_p1)} urgent (P1)`, { alert: k.open_p1 > 0 }),
      tile("Overdue", fmt.int(k.overdue_work_orders), "past their priority's deadline", { alert: k.overdue_work_orders > 0 }),
      tile("Power at risk", `${fmt.num(k.open_power_at_risk_kw, 1)} kW`, "from open work orders"),
      tile("Revenue at risk", fmt.krwShort(k.open_revenue_at_risk_krw_year), "per year, if nothing is fixed"),
      tile("Anomaly rate", fmt.pct(k.anomaly_rate), `${fmt.int(k.anomalies)} of ${fmt.int(k.modules_inspected)} modules`),
      tile("Field precision", fmt.pct(k.field_precision, 0), `${fmt.int(k.resolved)} confirmed · ${fmt.int(k.false_alarms)} false alarms`),
      tile("Mean time to resolve", fmt.hours(k.mean_hours_to_resolve), "upload → resolved")),
    el("section", { class: "grid-2" },
      el("div", { class: "card" },
        el("div", { class: "section-head" }, el("h2", { text: "Open work orders by priority" })),
        bars(["P1", "P2", "P3"].map((p) => ({ name: PRIORITY_LABEL[p], value: prio[p] || 0, cls: p }))),
        el("p", { class: "note", text: "Deadlines: P1 within 7 days, P2 within 30, P3 at the next scheduled visit (90)." })),
      el("div", { class: "card" },
        el("div", { class: "section-head" }, el("h2", { text: "Anomaly rate per inspection" })),
        bars(k.trend.slice(-8).map((t) => ({ name: `#${t.inspection_id} ${t.inspected_on}`, value: t.anomaly_rate, label: fmt.pct(t.anomaly_rate) })), { max: 1 }))),
    el("section", {},
      el("div", { class: "section-head" }, el("h2", { text: "Inspections" })),
      el("div", { class: "table-wrap" }, el("table", {},
        el("thead", {}, el("tr", {}, ["#", "Site", "Flown", "Modules", "Anomalies", "Rate", "Model", ""].map((h, i) =>
          el("th", { class: i >= 3 && i <= 5 ? "num" : "", text: h })))),
        el("tbody", {}, list.map((r) => {
          const t = rate[r.id] || {};
          return el("tr", { class: "clickable", onclick: () => { location.hash = `#/inspection/${r.id}`; } },
            el("td", { class: "mono", text: r.id }),
            el("td", {}, el("a", { href: `#/inspection/${r.id}`, text: r.site_name }), r.source === "demo" ? " " : null,
              r.source === "demo" ? el("span", { class: "chip neutral", text: "demo" }) : null),
            el("td", { text: r.inspected_on }),
            el("td", { class: "num", text: fmt.int(r.n_images) }),
            el("td", { class: "num", text: fmt.int(t.anomalies) }),
            el("td", { class: "num", text: fmt.pct(t.anomaly_rate) }),
            el("td", { class: "mono muted", text: r.model_version }),
            el("td", {}, el("a", { href: `#/inspection/${r.id}`, text: "Open →" })));
        }))))));
}

async function loadDemo(ev) {
  const btn = ev && ev.currentTarget;
  if (btn) { btn.disabled = true; btn.textContent = "Scoring 627 modules…"; }
  try {
    const insp = await api("/api/demo", { method: "POST" });
    toast(`Demo inspection #${insp.id} created in ${Math.round(insp.processing_ms)} ms`);
    location.hash = `#/inspection/${insp.id}`;
  } catch (err) {
    toast(err.message);
    if (btn) { btn.disabled = false; btn.textContent = "Load demo"; }
  }
}

/* ---------------------------------------------------------------- inspection */

const listState = { priority: "", predicted_class: "", status: "", needs_review: "", sort: "priority", offset: 0, limit: 50 };

async function inspection(id) {
  setNav("");
  const cat = await getCatalog();
  const insp = await api(`/api/inspections/${id}`);
  const k = insp.kpis;
  document.title = `${insp.site_name} · Inspection #${id}`;
  const byClass = Object.entries(k.by_class).sort((a, b) => b[1] - a[1]);
  const prio = k.by_priority || {};

  const head = el("div", { class: "page-head" },
    el("div", {},
      el("p", { class: "muted" }, el("a", { href: "#/", text: "Overview" }), ` / Inspection #${insp.id}`),
      el("h1", { text: insp.site_name }),
      el("p", { class: "muted", text: `Flown ${insp.inspected_on} · ${fmt.int(insp.n_images)} modules scored in ${fmt.int(insp.processing_ms)} ms · model ${insp.model_version}` })),
    el("div", { class: "actions" },
      el("a", { class: "btn primary", href: `/api/inspections/${id}/workorders.csv`, download: "", text: "Export work orders (CSV)" }),
      el("button", { class: "btn danger", onclick: () => deleteInspection(id), text: "Delete" })));

  const tiles = el("div", { class: "tiles" },
    tile("Anomalies", fmt.int(k.anomalies), `${fmt.pct(k.anomaly_rate)} of ${fmt.int(k.modules)} modules`),
    tile("Urgent (P1)", fmt.int(prio.P1 || 0), `P2 ${fmt.int(prio.P2 || 0)} · P3 ${fmt.int(prio.P3 || 0)}`, { alert: (prio.P1 || 0) > 0 }),
    tile("Power at risk", `${fmt.num(k.power_at_risk_kw, 1)} kW`, `${fmt.num(k.energy_at_risk_mwh_year, 1)} MWh per year`),
    tile("Revenue at risk", fmt.krwShort(k.revenue_at_risk_krw_year), "per year at the site tariff"),
    tile("Needs human review", fmt.int(k.needs_review), "low-confidence or flagged input"),
    k.labelled ? tile("Agreement with labels", fmt.pct(k.label_agreement), `fault recall ${fmt.pct(k.label_recall)} on ${fmt.int(k.labelled)} labelled`) : null);

  const notes = insp.notes ? el("p", { class: "note", text: insp.notes }) : null;
  const rejected = insp.n_rejected
    ? el("section", {}, el("div", { class: "warn" }, `${insp.n_rejected} file(s) were rejected: `,
      insp.rejected.slice(0, 8).map((r) => `${r.file} (${r.reason})`).join("; "), insp.n_rejected > 8 ? "…" : ""))
    : null;

  const mix = el("div", { class: "card" },
    el("div", { class: "section-head" }, el("h2", { text: "Fault mix" }), el("span", { class: "kpi-help", text: "bar colour = priority" })),
    byClass.length ? bars(byClass.map(([name, n]) => ({ name, value: n, cls: (cat[name] || {}).priority }))) : el("p", { class: "muted", text: "No anomalies found." }));

  const mapCard = el("div", { class: "card" }, el("div", { class: "section-head" }, el("h2", { text: "Site map" })), el("p", { class: "muted", text: "Loading…" }));
  const tableHost = el("section", {});
  render(head, notes, tiles, rejected, el("section", { class: "grid-2" }, mix, mapCard), tableHost);
  Object.assign(listState, { offset: 0 });
  renderSiteMap(id, mapCard);
  renderWorkOrders(id, tableHost, cat);
}

async function renderSiteMap(id, card) {
  const page = await api(`/api/inspections/${id}/findings?anomalies_only=false&sort=location&limit=1000`);
  const placed = page.items.filter((f) => f.block && f.row && f.position);
  const body = [];
  if (!placed.length) {
    body.push(el("p", { class: "muted", text: "No layout supplied. Upload a layout CSV (filename, block, row, position) to see where faults cluster on site." }));
  } else {
    const blocks = {};
    for (const f of placed) ((blocks[f.block] ||= {})[f.row] ||= []).push(f);
    body.push(el("div", { class: "sitemap" }, Object.keys(blocks).sort().map((b) =>
      el("div", { class: "block" }, el("h3", { text: `Block ${b}` }),
        Object.keys(blocks[b]).sort().map((r) => {
          const cells = blocks[b][r].sort((x, y) => x.position.localeCompare(y.position, "en", { numeric: true }));
          return el("div", { class: "map-row" }, el("span", { class: "rl", text: r }), cells.slice(0, 20).map((f) => {
            const label = `${b}-${r}-${f.position}: ${f.is_anomaly ? `${f.predicted_class}, ${PRIORITY_LABEL[f.priority]}` : "normal"}`;
            return f.is_anomaly
              ? el("button", { class: `cell ${f.priority}`, title: label, "aria-label": label, onclick: () => openFinding(f.id) })
              : el("span", { class: "cell ok", title: label });
          }));
        })))));
    body.push(el("div", { class: "legend" },
      ["P1", "P2", "P3"].map((p) => el("span", {}, el("i", { class: p }), PRIORITY_LABEL[p])),
      el("span", {}, el("i", { class: "ok" }), "Normal"),
      el("span", { text: "Click a fault to open it" })));
    if (page.total > page.items.length) body.push(el("p", { class: "note", text: `Showing the first ${page.items.length} of ${page.total} modules.` }));
  }
  card.replaceChildren(el("div", { class: "section-head" }, el("h2", { text: "Site map" })), ...body);
}

async function renderWorkOrders(id, host, cat) {
  const q = new URLSearchParams({ sort: listState.sort, limit: listState.limit, offset: listState.offset });
  for (const key of ["priority", "predicted_class", "status", "needs_review"]) if (listState[key]) q.set(key, listState[key]);
  const page = await api(`/api/inspections/${id}/findings?${q}`);

  const select = (key, label, options) => el("label", { class: "field" }, label,
    el("select", { onchange: (e) => { listState[key] = e.target.value; listState.offset = 0; renderWorkOrders(id, host, cat); } },
      options.map(([v, t]) => el("option", { value: v, text: t, selected: listState[key] === v }))));

  const filters = el("div", { class: "filters" },
    select("priority", "Priority", [["", "All"], ["P1", "P1 urgent"], ["P2", "P2 soon"], ["P3", "P3 scheduled"]]),
    select("predicted_class", "Fault", [["", "All"], ...Object.keys(cat).filter((c) => c !== "No-Anomaly").sort().map((c) => [c, c])]),
    select("status", "Status", [["", "All"], ["open", "Open"], ["in_progress", "In progress"], ["resolved", "Resolved"], ["false_alarm", "False alarm"]]),
    select("needs_review", "Review", [["", "All"], ["true", "Needs review"], ["false", "Confident"]]),
    select("sort", "Sort by", [["priority", "Priority, then loss"], ["loss", "Power loss"], ["score", "Anomaly score"], ["location", "Location"]]));

  const rows = page.items.map((f) => el("tr", { class: "clickable", onclick: () => openFinding(f.id) },
    el("td", {}, el("img", { class: "thumb", src: `/api/findings/${f.id}/image.png?scale=1`, alt: "", width: 24, height: 40, loading: "lazy" })),
    el("td", {}, chip(f.priority), f.needs_review ? " " : null, f.needs_review ? el("span", { class: "chip review", text: "review" }) : null),
    el("td", {}, el("button", { class: "btn small", onclick: (e) => { e.stopPropagation(); openFinding(f.id); }, text: f.predicted_class })),
    el("td", { class: "num", text: fmt.pct(f.class_confidence, 0) }),
    el("td", { text: f.block ? `${f.block}-${f.row}-${f.position}` : "–" }),
    el("td", { class: "mono", text: f.filename }),
    el("td", { class: "num", text: fmt.int(f.est_loss_w) }),
    el("td", { class: "num", text: fmt.krw(f.est_krw_year) }),
    el("td", { text: STATUS_LABEL[f.status] || f.status }),
    el("td", { class: "muted", text: f.ground_truth ? (f.ground_truth === f.predicted_class ? "✓ match" : `label: ${f.ground_truth}`) : "" })));

  const pager = el("div", { class: "pager" },
    el("span", { class: "muted", text: page.total ? `${listState.offset + 1}–${Math.min(listState.offset + listState.limit, page.total)} of ${page.total}` : "0 results" }),
    el("button", { class: "btn small", disabled: listState.offset === 0, onclick: () => { listState.offset -= listState.limit; renderWorkOrders(id, host, cat); }, text: "← Prev" }),
    el("button", { class: "btn small", disabled: listState.offset + listState.limit >= page.total, onclick: () => { listState.offset += listState.limit; renderWorkOrders(id, host, cat); }, text: "Next →" }));

  host.replaceChildren(
    el("div", { class: "section-head" }, el("h2", { text: "Work orders" }), el("span", { class: "kpi-help", text: "one per anomalous module · click a row for the thermal image and actions" })),
    filters,
    el("div", { class: "table-wrap" }, el("table", {},
      el("thead", {}, el("tr", {}, ["", "Priority", "Fault", "Conf.", "Location", "File", "Loss (W)", "₩ / year", "Status", "Ground truth"].map((h, i) =>
        el("th", { class: [3, 6, 7].includes(i) ? "num" : "", text: h, scope: "col" })))),
      el("tbody", {}, rows.length ? rows : el("tr", {}, el("td", { colspan: 10, class: "muted", text: "No work orders match these filters." }))))),
    pager);
}

async function deleteInspection(id) {
  if (!window.confirm(`Delete inspection #${id} and all its findings? This cannot be undone.`)) return;
  try {
    await api(`/api/inspections/${id}`, { method: "DELETE" });
    toast(`Inspection #${id} deleted`);
    location.hash = "#/";
  } catch (err) { toast(err.message); }
}

/* ---------------------------------------------------------------- finding dialog */

async function openFinding(fid) {
  $dialogBody.replaceChildren(el("p", { class: "muted", text: "Loading…" }));
  if (!$dialog.open) $dialog.showModal();
  let f;
  try { f = await api(`/api/findings/${fid}`); } catch (err) { $dialogBody.replaceChildren(errorBox(err)); return; }
  const ex = f.explanation || {};
  const statusBtn = (status, label, primary) => el("button", {
    class: `btn small${primary ? " primary" : ""}`, disabled: f.status === status,
    onclick: async () => {
      const note = $dialogBody.querySelector("#status-note").value;
      try {
        await api(`/api/findings/${fid}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, note }) });
        toast(`Finding #${fid}: ${STATUS_LABEL[status]}`);
        openFinding(fid);
        const m = location.hash.match(/^#\/inspection\/(\d+)/);
        if (m) { const host = $main.querySelector("section:last-of-type"); if (host) renderWorkOrders(m[1], host, await getCatalog()); }
      } catch (err) { toast(err.message); }
    },
    text: label,
  });

  $dialogBody.replaceChildren(
    el("button", { class: "btn small close", onclick: () => $dialog.close(), text: "Close ✕", "aria-label": "Close" }),
    el("p", { class: "muted", text: `Finding #${f.id} · ${f.filename}${f.block ? ` · ${f.block}-${f.row}-${f.position}` : ""}` }),
    el("h2", { id: "finding-title" }, `${f.predicted_class} `, chip(f.priority)),
    el("p", { class: "muted", text: f.description }),
    el("div", { class: "finding-grid" },
      el("div", { class: "finding-images" },
        el("figure", {}, el("img", { src: `/api/findings/${f.id}/image.png?view=thermal&scale=10`, alt: `False-colour thermal image of module ${f.filename}`, width: 120, height: 200 }), el("figcaption", { text: "False colour (bright = hot)" })),
        el("figure", {}, el("img", { src: `/api/findings/${f.id}/image.png?view=overlay&scale=10`, alt: `Detected hot regions on module ${f.filename}`, width: 120, height: 200 }), el("figcaption", { text: "Hot regions (cyan)" }))),
      el("div", {},
        el("dl", { class: "kv" },
          el("dt", { text: "Recommended action" }), el("dd", { text: f.action }),
          el("dt", { text: "Confidence" }), el("dd", { text: `${fmt.pct(f.class_confidence, 0)} (anomaly score ${fmt.num(f.anomaly_score)})` }),
          el("dt", { text: "Top 3" }), el("dd", { text: f.top3.map(([c, p]) => `${c} ${fmt.pct(p, 0)}`).join(" · ") }),
          el("dt", { text: "Estimated loss" }), el("dd", { text: `${fmt.int(f.est_loss_w)} W · ${fmt.int(f.est_kwh_year)} kWh/yr · ${fmt.krw(f.est_krw_year)}/yr (${f.loss_basis})` }),
          el("dt", { text: "Hot regions" }), el("dd", { text: `${ex.hotspot_count} region(s), ${ex.hot_area_pct}% of module, peak +${ex.peak_contrast} grey levels` }),
          el("dt", { text: "Warm area" }), el("dd", { text: `${ex.warm_area_pct}% of pixels > median + 10 · warmest third +${ex.warmest_third_delta}` }),
          el("dt", { text: "Level vs batch" }), el("dd", { text: `${f.delta_vs_batch >= 0 ? "+" : ""}${fmt.num(f.delta_vs_batch, 1)} grey levels vs the inspection median` }),
          f.radiometric ? el("dt", { text: "Radiometric" }) : null,
          f.radiometric ? el("dd", { text: `ΔT ${f.radiometric.delta_t_c} °C (max ${f.radiometric.t_max_c} °C, median ${f.radiometric.t_median_c} °C)` }) : null,
          f.ground_truth ? el("dt", { text: "Ground truth" }) : null,
          f.ground_truth ? el("dd", { text: f.ground_truth === f.predicted_class ? `${f.ground_truth} ✓` : f.ground_truth }) : null,
          el("dt", { text: "Status" }), el("dd", { text: `${STATUS_LABEL[f.status] || f.status}${f.status_note ? ` — ${f.status_note}` : ""}` })),
        f.warnings.length ? el("p", { class: "warn", text: f.warnings.join(" · ") }) : null,
        f.is_anomaly ? el("div", { class: "form", style: { marginTop: "14px" } },
          el("label", { class: "field" }, "Technician note", el("textarea", { id: "status-note", maxlength: 2000, placeholder: "What was found on site?" })),
          el("div", { class: "actions" },
            statusBtn("in_progress", "Start work"),
            statusBtn("resolved", "Resolved (real fault)", true),
            statusBtn("false_alarm", "False alarm"),
            statusBtn("open", "Reopen"))) : null)));
}

$dialog.addEventListener("click", (e) => { if (e.target === $dialog) $dialog.close(); });

/* ---------------------------------------------------------------- new inspection */

async function newInspection() {
  setNav("new");
  document.title = "New inspection · Solar Thermal Inspector";
  const sites = await api("/api/sites").catch(() => []);
  const today = new Date().toISOString().slice(0, 10);
  const fileInput = el("input", { type: "file", id: "files", name: "files", multiple: true, required: true, accept: ".jpg,.jpeg,.png,.tif,.tiff,.bmp,.csv,.npy,.zip" });
  const layoutInput = el("input", { type: "file", id: "layout", name: "layout", accept: ".csv" });
  const progress = el("progress", { max: 100, value: 0, hidden: true });
  const status = el("p", { class: "muted", role: "status" });
  const submit = el("button", { class: "btn primary", type: "submit", text: "Run inspection" });
  const drop = el("div", { class: "drop" },
    el("p", {}, el("strong", { text: "Drop module images or a ZIP here" }), el("br"), el("span", { class: "muted", text: "or choose files below. One image per module (a crop of a single module)." })),
    fileInput);
  drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("over"); });
  drop.addEventListener("dragleave", () => drop.classList.remove("over"));
  drop.addEventListener("drop", (e) => { e.preventDefault(); drop.classList.remove("over"); fileInput.files = e.dataTransfer.files; status.textContent = `${fileInput.files.length} file(s) ready`; });
  fileInput.addEventListener("change", () => { status.textContent = `${fileInput.files.length} file(s) ready`; });

  const form = el("form", { class: "form card", onsubmit: (e) => {
    e.preventDefault();
    const data = new FormData(form);
    submit.disabled = true;
    progress.hidden = false;
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/inspections");
    if (apiKey()) xhr.setRequestHeader("X-API-Key", apiKey());
    xhr.upload.onprogress = (ev) => { if (ev.lengthComputable) { progress.value = (100 * ev.loaded) / ev.total; status.textContent = ev.loaded < ev.total ? "Uploading…" : "Scoring modules…"; } };
    xhr.onload = () => {
      submit.disabled = false;
      let body = {};
      try { body = JSON.parse(xhr.responseText); } catch { /* ignore */ }
      if (xhr.status === 201) { toast(`Inspection #${body.id}: ${body.kpis.anomalies} anomalies in ${body.n_images} modules`); location.hash = `#/inspection/${body.id}`; }
      else { progress.hidden = true; status.textContent = `Failed (${xhr.status}): ${typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail || xhr.statusText)}`; }
    };
    xhr.onerror = () => { submit.disabled = false; status.textContent = "Network error"; };
    xhr.send(data);
  } },
    el("div", { class: "row" },
      el("label", { class: "field" }, "Site name", el("input", { name: "site_name", required: true, maxlength: 120, list: "sites", placeholder: "e.g. Yeongam Solar, Block A-D" }), el("datalist", { id: "sites" }, sites.map((s) => el("option", { value: s })))),
      el("label", { class: "field" }, "Flight date", el("input", { type: "date", name: "inspected_on", value: today, required: true }))),
    drop,
    el("label", { class: "field" }, "Layout CSV (optional): filename, block, row, position[, label]", layoutInput),
    el("label", { class: "field" }, "Notes", el("textarea", { name: "notes", maxlength: 2000, placeholder: "Irradiance, wind, camera, pilot…" })),
    el("div", { class: "actions" }, submit, el("button", { class: "btn", type: "button", onclick: loadDemo, text: "Or load the demo" })),
    progress, status);

  const quickOut = el("div", {});
  const quickFile = el("input", { type: "file", accept: ".jpg,.jpeg,.png,.tif,.tiff,.bmp,.csv,.npy" });
  const quick = el("form", { class: "form card", onsubmit: async (e) => {
    e.preventDefault();
    if (!quickFile.files.length) return;
    const fd = new FormData();
    fd.append("file", quickFile.files[0]);
    try {
      const r = await api("/api/predict", { method: "POST", body: fd });
      quickOut.replaceChildren(el("dl", { class: "kv" },
        el("dt", { text: "Result" }), el("dd", {}, `${r.predicted_class} `, chip(r.priority)),
        el("dt", { text: "Confidence" }), el("dd", { text: `${fmt.pct(r.class_confidence, 0)} · anomaly score ${fmt.num(r.anomaly_score)}` }),
        el("dt", { text: "Top 3" }), el("dd", { text: r.top3.map(([c, p]) => `${c} ${fmt.pct(p, 0)}`).join(" · ") }),
        el("dt", { text: "Action" }), el("dd", { text: r.action }),
        r.radiometric ? el("dt", { text: "ΔT" }) : null, r.radiometric ? el("dd", { text: `${r.radiometric.delta_t_c} °C` }) : null,
        r.warnings.length ? el("dt", { text: "Warnings" }) : null, r.warnings.length ? el("dd", { text: r.warnings.join(" · ") }) : null));
    } catch (err) { quickOut.replaceChildren(el("p", { class: "warn", text: err.message })); }
  } },
    el("h2", { text: "Quick check: one image" }),
    el("p", { class: "muted", text: "Scores a single module without saving anything." }),
    el("label", { class: "field" }, "Image or temperature matrix", quickFile),
    el("div", { class: "actions" }, el("button", { class: "btn", type: "submit", text: "Score image" })),
    quickOut);

  render(
    el("div", { class: "page-head" }, el("div", {}, el("h1", { text: "New inspection" }),
      el("p", { class: "muted", text: "Accepts JPG/PNG/TIFF IR crops (one module each), radiometric CSV/NPY temperature matrices in °C, or a ZIP of them. A layout.csv inside the ZIP is picked up automatically." }))),
    el("div", { class: "grid-2" }, form, quick));
}

/* ---------------------------------------------------------------- model page */

async function modelPage() {
  setNav("model");
  document.title = "Model · Solar Thermal Inspector";
  const [info, cat] = await Promise.all([api("/api/model"), api("/api/catalog")]);
  const m = info.metrics;
  if (!m || !m.binary) { render(errorBox(new Error("No evaluation metrics found. Run training/evaluate.py."))); return; }
  const b = m.binary.cnn, mc = m.multiclass.cnn, w = m.workload_10k;
  const names = { rule: "Rule: peak contrast", iforest: "Isolation Forest (no labels)", gbm: "Gradient boosting, 30 features", cnn: "CNN, raw pixels (served)" };
  const table = (heads, rows, numeric = []) => el("div", { class: "table-wrap" }, el("table", {},
    el("thead", {}, el("tr", {}, heads.map((h, i) => el("th", { class: numeric.includes(i) ? "num" : "", text: h, scope: "col" })))),
    el("tbody", {}, rows.map((r) => el("tr", {}, r.map((c, i) => el("td", { class: numeric.includes(i) ? "num" : "" }, c)))))));

  render(
    el("div", { class: "page-head" }, el("div", {}, el("h1", { text: "Model card" }),
      el("p", { class: "muted", text: `${m.model_version} · evaluated ${m.evaluated} on ${fmt.int(m.dataset.test_anomalies + m.dataset.test_normal)} held-out test images (${m.dataset.name})` }))),
    el("div", { class: "tiles" },
      tile("Faults caught (recall)", fmt.pct(b.recall), `threshold chosen on validation for ≥ ${fmt.pct(m.recall_target, 0)}`),
      tile("Alert precision (test)", fmt.pct(b.precision), "test split is 50% faulty, see below for real plants"),
      tile("Critical faults missed", `${b.critical_missed} / ${b.critical_total}`, m.critical_classes.join(", ")),
      tile("12-class accuracy", fmt.pct(mc.accuracy), `macro-F1 ${fmt.num(mc.macro_f1, 3)} · top-2 ${fmt.pct(mc.top2_accuracy)}`),
      tile("Calibration error", fmt.num(mc.ece, 3), `ECE after temperature scaling (T = ${m.cnn_training.temperature})`),
      tile("Inference", `${fmt.num(m.latency.single_image_ms, 2)} ms`, `per image on 1 CPU thread · ${fmt.int(m.latency.images_per_second_batched)} img/s batched`)),
    el("section", {}, el("div", { class: "section-head" }, el("h2", { text: "Model comparison: anomaly vs normal (test split)" })),
      table(["Model", "ROC-AUC", "PR-AUC", "Recall", "Precision", "False-alarm rate", "Critical missed"],
        Object.entries(m.binary).map(([k, v]) => [names[k], fmt.num(v.roc_auc, 3), fmt.num(v.pr_auc, 3), fmt.num(v.recall, 3), fmt.num(v.precision, 3), fmt.num(v.fpr, 3), `${v.critical_missed} / ${v.critical_total}`]), [1, 2, 3, 4, 5, 6]),
      el("p", { class: "note", text: "Every threshold was set on the validation split and applied once to the test split." })),
    el("section", { class: "grid-2" },
      el("div", { class: "card" }, el("h2", { text: "Precision at real-world fault rates" }),
        el("p", { class: "note", text: "Alerts get less precise as faults get rarer, because false alarms come from the larger healthy population." }),
        bars(m.prevalence_precision.map((p) => ({ name: `${fmt.pct(p.prevalence, 0)} faulty`, value: p.precision, label: fmt.pct(p.precision, 0) })), { max: 1 }),
        el("p", { class: "note", text: `Example: ${fmt.int(w.modules)} modules with ${fmt.pct(w.assumed_prevalence, 0)} faulty → about ${fmt.int(w.alerts)} alerts: ${fmt.int(w.caught)} real faults caught, ${fmt.int(w.missed)} missed, ${fmt.int(w.false_alarms)} false alarms.` })),
      el("div", { class: "card" }, el("h2", { text: "Recall per class (CNN)" }),
        bars(Object.entries(mc.per_class).sort((a, b2) => b2[1].support - a[1].support).map(([n, v]) => ({ name: n, value: v.recall, label: `${fmt.pct(v.recall, 0)} (n=${v.support})`, cls: (cat.find((c) => c.name === n) || {}).priority })), { max: 1 }),
        el("p", { class: "note", text: "Bar colour = the class's work-order priority. Small classes (n < 40) carry wide uncertainty." }))),
    el("section", {}, el("div", { class: "section-head" }, el("h2", { text: "Alert policy" }),
      el("span", { class: "kpi-help", text: `active: ${info.alert_policy} (set ALERT_POLICY=standard|safety)` })),
      table(["Policy", "Recall", "False-alarm rate", "Precision at 5% faulty", "Critical faults missed"],
        Object.entries(m.policies).map(([k, v]) => [k === info.alert_policy ? `${k} (active)` : k, fmt.num(v.recall, 3), fmt.num(v.fpr, 3), fmt.pct(v.precision_at_5pct, 0), `${v.critical_missed} / ${v.critical_total}`]), [1, 2, 3, 4]),
      el("p", { class: "note", text: "safety adds a lower alert bar for the critical classes (dead modules, bypass diodes, multiple hot spots): fewer missed critical faults for about twice the false alarms. Pick it where a missed dead module costs more than a technician check." })),
    el("section", {}, el("div", { class: "section-head" }, el("h2", { text: "Robustness (same threshold)" })),
      table(["Perturbation", "Accuracy", "Macro-F1", "Recall", "False-alarm rate"],
        m.robustness.map((r) => [r.perturbation, fmt.num(r.accuracy, 3), fmt.num(r.macro_f1, 3), fmt.num(r.recall, 3), fmt.num(r.fpr, 3)]), [1, 2, 3, 4]),
      el("p", { class: "note", text: "Strong sensor noise is the weakest point; global brightness offsets barely matter. Re-fly or review noisy frames." })),
    el("section", {}, el("div", { class: "section-head" }, el("h2", { text: "Fault catalogue and economics" }),
      el("span", { class: "kpi-help", text: `module ${info.economics.module_power_w} W · yield ${info.economics.specific_yield_kwh_per_kwp} kWh/kWp/yr · ₩${info.economics.tariff_krw_per_kwh}/kWh (set via env vars)` })),
      table(["Class", "Priority", "Share of output lost", "Basis", "Safety", "Action"],
        cat.filter((c) => c.name !== "No-Anomaly").map((c) => [c.name, chip(c.priority), fmt.pct(c.loss_fraction, 0), c.loss_basis, c.safety ? "yes" : "", c.action]), [2])));
}

/* ---------------------------------------------------------------- router */

async function route() {
  const hash = location.hash || "#/";
  if ($dialog.open) $dialog.close();
  try {
    let m;
    if ((m = hash.match(/^#\/inspection\/(\d+)$/))) await inspection(m[1]);
    else if (hash === "#/new") await newInspection();
    else if (hash === "#/model") await modelPage();
    else await overview();
  } catch (err) {
    render(errorBox(err));
  }
  $main.focus({ preventScroll: true });
}

window.addEventListener("hashchange", route);
route();
