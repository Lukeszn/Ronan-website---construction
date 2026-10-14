/* Ronan O'Toole Concrete Cutting: site script. No API keys or secrets live here. */
(function () {
  "use strict";

  // Analytics: paste a Google Analytics 4 measurement ID here to enable.
  // It only loads after the visitor accepts the cookie banner.
  var GA_ID = "G-XXXXXXXXXX";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var inArtifact = !!(window.claude && typeof window.claude.use === "function");

  function track(name, params) { if (typeof window.gtag === "function") window.gtag("event", name, params || {}); }

  var y = $("#year"); if (y) y.textContent = String(new Date().getFullYear());

  // Mobile menu
  var toggle = $("#menu-toggle"), nav = $("#site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", String(!open));
      toggle.setAttribute("aria-expanded", String(!open));
      document.documentElement.classList.toggle("menu-open", !open);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.getAttribute("data-open") === "true") { nav.setAttribute("data-open", "false"); toggle.setAttribute("aria-expanded", "false"); document.documentElement.classList.remove("menu-open"); toggle.focus(); }
    });
    $$("a", nav).forEach(function (a) {
      a.addEventListener("click", function () { nav.setAttribute("data-open", "false"); toggle.setAttribute("aria-expanded", "false"); document.documentElement.classList.remove("menu-open"); });
    });
  }

  // Highlight the nav link for the section in view
  var navLinks = $$(".nav-links .nav-link");
  if (navLinks.length && "IntersectionObserver" in window) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) { a.removeAttribute("aria-current"); });
        var link = byId[en.target.id]; if (link) link.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(byId).forEach(function (id) { var sec = document.getElementById(id); if (sec) spy.observe(sec); });
  }

  // Will it cut? Typical limits match the figures shown on each service
  var JOBS = {
    wall:  { label: "Wall thickness", service: "Wall sawing or new opening", name: "Wall sawing", max: 730, over: "wire", noun: "wall" },
    floor: { label: "Slab or road depth", service: "Floor or road sawing", name: "Floor and road sawing", max: 400, over: "wire", noun: "slab" },
    core:  { label: "Hole diameter", service: "Core drilling", name: "Core drilling", min: 12, max: 500, noun: "hole" },
    chase: { label: "Cut depth", service: "Chasing or hand sawing", name: "Chasing and hand sawing", max: 260, over: "wall", noun: "cut" },
    wire:  { label: "Section thickness", service: "Wire sawing", name: "Wire sawing", max: 0, noun: "section" }
  };
  var checker = $("#checker");
  if (checker) {
    checker.hidden = false;
    var sizeIn = $("#cut-size"), fill = $("#g-fill"), cap = $("#g-cap");
    var current = function () { var r = $('input[name="cut-job"]:checked', checker); return r ? r.value : "wall"; };
    var setText = function (id, t) { var el = document.getElementById(id); if (el) el.textContent = t; };
    var renderCut = function () {
      var key = current(), job = JOBS[key], mm = Math.round(Number(sizeIn.value));
      setText("cut-size-label", job.label);
      var valid = mm > 0 && mm < 10000;
      var fits = !valid || !job.max || (mm <= job.max && (!job.min || mm >= job.min));
      var method = job;
      if (valid && !fits && job.over && mm > job.max) method = JOBS[job.over];
      var status = $("#cut-method");
      status.innerHTML = '<span class="cr-status"></span><span class="cr-name"></span>';
      var st = $(".cr-status", status);
      st.setAttribute("data-fit", valid ? (fits ? "yes" : "no") : "");
      st.textContent = !valid ? "Enter a size in millimetres" : fits ? mm + " mm is within range" : mm + " mm is past the typical " + (job.min && mm < job.min ? "minimum" : "limit");
      $(".cr-name", status).textContent = method.name;
      var note;
      if (!valid) note = "Rough is fine. You can confirm the exact size later.";
      else if (key === "wire") note = "A diamond wire loops around the section, so there is no practical depth limit.";
      else if (fits) note = job.name + " handles a " + job.noun + " this size, up to " + job.max + " mm" + (job.min ? " (from " + job.min + " mm)" : "") + ".";
      else if (job.min && mm < job.min) note = "Holes under " + job.min + " mm are usually drilled, not cored. Send the details and I will advise.";
      else if (job.over) note = "That is deeper than " + job.name.toLowerCase() + " usually goes (" + job.max + " mm), so " + method.name.toLowerCase() + " is the likely method.";
      else note = "That is larger than the usual " + job.max + " mm. Send the details and I will advise on the best method.";
      setText("cut-note", note);
      // Gauge: the limit sits at most 87% along, so anything past it has room to show
      if (job.max && valid) {
        var scale = Math.max(job.max, mm) * 1.15;
        fill.style.width = Math.min(100, mm / scale * 100) + "%";
        fill.setAttribute("data-over", String(mm > job.max));
        cap.hidden = false; cap.style.left = (job.max / scale * 100) + "%";
        setText("g-cap-label", "limit " + job.max + " mm");
      } else {
        fill.style.width = valid ? "60%" : "0"; fill.setAttribute("data-over", "false"); cap.hidden = true;
      }
      checker.setAttribute("data-service", method.service);
      checker.setAttribute("data-size", valid ? mm + " mm " + job.noun : "");
    };
    $$('input[name="cut-job"]', checker).forEach(function (r) { r.addEventListener("change", renderCut); });
    sizeIn.addEventListener("input", renderCut);
    $("#cut-quote").addEventListener("click", function () {
      var svc = $("#f-service"), size = $("#f-size");
      if (svc) svc.value = checker.getAttribute("data-service");
      if (size && checker.getAttribute("data-size") && !size.value) size.value = checker.getAttribute("data-size");
      track("cut_check", { service: checker.getAttribute("data-service") });
    });
    renderCut();
  }

  // Areas map: pointing at a town in the list highlights it on the map
  $$(".towns li[data-town]").forEach(function (li) {
    var dot = document.getElementById("town-" + li.getAttribute("data-town"));
    if (!dot) return;
    var on = function () { li.classList.add("on"); dot.classList.add("on"); };
    var off = function () { li.classList.remove("on"); dot.classList.remove("on"); };
    li.addEventListener("mouseenter", on); li.addEventListener("mouseleave", off);
    dot.addEventListener("mouseenter", on); dot.addEventListener("mouseleave", off);
  });

  // Work photo viewer
  var lb = $("#lightbox");
  if (lb && typeof lb.showModal === "function") {
    $$(".zoom").forEach(function (b) {
      b.addEventListener("click", function () {
        var img = $("img", b), cap = b.closest("figure").querySelector("figcaption b");
        $("#lb-img").src = b.getAttribute("data-full");
        $("#lb-img").alt = img.alt;
        $("#lb-cap").textContent = cap ? cap.textContent : "";
        lb.showModal();
      });
    });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });
  }

  // Cookie consent and analytics
  var banner = $("#cookie");
  function loadAnalytics() {
    if (inArtifact || !GA_ID || GA_ID.indexOf("XXXX") !== -1) return;
    var s = document.createElement("script");
    s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, { anonymize_ip: true });
  }
  $$('a[href^="tel:"]').forEach(function (a) {
    a.addEventListener("click", function () { track("phone_click", { link_text: a.textContent.trim() }); });
  });
  function setConsent(v) { store.set("cookie-consent", v); if (banner) banner.hidden = true; if (v === "accepted") loadAnalytics(); }
  if (banner) {
    var c = store.get("cookie-consent");
    if (c === "accepted") loadAnalytics(); else if (c !== "rejected") banner.hidden = false;
    $("#cookie-accept").addEventListener("click", function () { setConsent("accepted"); });
    $("#cookie-reject").addEventListener("click", function () { setConsent("rejected"); });
    var cs = $("#cookie-settings"); if (cs) cs.addEventListener("click", function () { banner.hidden = false; $("#cookie-accept").focus(); });
  }

  // Quote form: validation, spam checks, submission
  var form = $("#quote-form");
  if (!form) return;
  var started = $("#started_at"); if (started) started.value = String(Date.now());

  var rules = {
    name: function (v) { return v.trim().length >= 2 ? "" : "Enter your name."; },
    phone: function (v) { var d = v.replace(/[^\d+]/g, ""); return /^\+?\d{9,15}$/.test(d) ? "" : "Enter a phone number, for example 087 123 4567."; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Enter an email address, for example name@example.com."; },
    location: function (v) { return v.trim().length >= 2 ? "" : "Enter the town or Eircode where the work is."; },
    service: function (v) { return v ? "" : "Choose the service you need, or pick Not sure."; },
    details: function (v) { return v.trim().length >= 10 ? "" : "Add a short description of the job (at least 10 characters)."; }
  };
  var ids = { name: "f-name", phone: "f-phone", email: "f-email", location: "f-location", service: "f-service", details: "f-details" };

  function showError(key, msg) {
    var input = document.getElementById(ids[key] || key), err = document.getElementById("e-" + key);
    var field = input ? input.closest(".field") : null;
    if (field) field.setAttribute("data-invalid", msg ? "true" : "false");
    if (input) { input.setAttribute("aria-invalid", msg ? "true" : "false"); if (err) input.setAttribute("aria-describedby", "e-" + key); }
    if (err) err.textContent = msg;
  }
  function validateField(key) { var el = document.getElementById(ids[key]); var m = rules[key](el.value); showError(key, m); return m; }
  Object.keys(ids).forEach(function (k) {
    var el = document.getElementById(ids[k]);
    el.addEventListener("blur", function () { if (el.value) validateField(k); });
    el.addEventListener("input", function () { if (el.getAttribute("aria-invalid") === "true") validateField(k); });
  });

  function validatePhotos() {
    var f = $("#f-photos"); var files = f && f.files ? Array.prototype.slice.call(f.files) : [];
    var msg = "";
    if (files.length > 3) msg = "Choose up to 3 photos.";
    else if (files.some(function (x) { return x.size > 8 * 1024 * 1024; })) msg = "Each photo must be 8 MB or smaller.";
    else if (files.some(function (x) { return x.type && x.type.indexOf("image/") !== 0; })) msg = "Photos must be image files.";
    showError("photos", msg); return msg;
  }

  var status = $("#form-status"), submit = $("#f-submit");
  function setStatus(state, msg) { status.setAttribute("data-state", state); status.textContent = msg; }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    var firstBad = null;
    Object.keys(ids).forEach(function (k) { if (validateField(k) && !firstBad) firstBad = document.getElementById(ids[k]); });
    if (validatePhotos() && !firstBad) firstBad = $("#f-photos");
    var consent = $("#f-consent");
    if (!consent.checked) { showError("consent", "Tick the box so I can reply to your enquiry."); if (!firstBad) firstBad = consent; } else showError("consent", "");
    if (firstBad) { setStatus("err", "Check the highlighted fields."); firstBad.focus(); return; }

    // Spam checks: honeypot must be empty and the form must not be sent within 3 seconds of loading
    var hp = $("#company_website");
    var elapsed = Date.now() - Number(started ? started.value : 0);
    if ((hp && hp.value) || elapsed < 3000) { showSuccess(); return; }

    submit.disabled = true; setStatus("", "Sending...");
    var data = new FormData(form);
    try {
      if (inArtifact) {
        var db = await window.claude.use("db");
        if (!db) throw new Error("unavailable");
        var files = $("#f-photos").files || [];
        await db.collection("quotes").add({
          name: data.get("name"), phone: data.get("phone"), email: data.get("email"),
          location: data.get("location"), service: data.get("service"), size: data.get("size") || "",
          timing: data.get("timing"), details: data.get("details"),
          photoNames: Array.prototype.map.call(files, function (f) { return f.name; }),
          submittedAt: new Date().toISOString()
        });
      } else {
        data.delete("started_at");
        var res = await fetch("/", { method: "POST", body: data });
        if (!res.ok) throw new Error("HTTP " + res.status);
      }
      track("generate_lead", { form_name: "quote", service: data.get("service") || "" });
      showSuccess();
    } catch (err) {
      submit.disabled = false;
      setStatus("err", "Your request could not be sent. Please try again, or ring 087 123 4567.");
    }
  });

  function showSuccess() {
    var area = $("#form-area");
    area.innerHTML = '<div class="success-panel" tabindex="-1" id="sent"><h3>Thanks, your quote request has been sent</h3><p>I will reply within one working day. If the job is urgent, ring 087 123 4567.</p></div>';
    $("#sent").focus();
  }
})();
