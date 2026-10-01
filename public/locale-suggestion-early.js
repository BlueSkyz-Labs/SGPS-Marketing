/**
 * Locale suggestion, pre-paint insertion (Experience v6 S5, ADR 0009).
 *
 * A synchronous same-origin classic script (CSP `script-src 'self'`, same
 * pattern as theme-init.js) placed right after the header. Because it runs
 * before the parser reaches <main>, the strip exists before the content below
 * it is ever laid out, so showing it causes no layout shift (CLS 0).
 *
 * It only DECIDES and BUILDS the strip. The bundled module script
 * (src/scripts/locale-suggestion.ts) attaches the interactions. The decision
 * mirrors src/lib/locale-suggestion.ts exactly; the architecture contract test
 * runs both against the same vectors so they cannot drift.
 *
 * ADR 0009: navigator.languages is the only signal; no cookie, no network, no
 * redirect, no timezone/country; the only storage key is blueskyz.ui.language
 * and this script only READS it (fail closed when unreadable).
 */
(function () {
  var KEY = "blueskyz.ui.language";
  var LANGS = {
    en: { label: "English", hreflang: "en" },
    vi: { label: "Tiếng Việt", hreflang: "vi" },
    zh: { label: "简体中文", hreflang: "zh-Hans" },
    "zh-hant": { label: "繁體中文", hreflang: "zh-Hant" },
  };
  var COPY = {
    en: {
      question: "View this page in English?",
      accept: "Switch to English",
      keep: "Keep {language}",
    },
    vi: {
      question: "Xem trang bằng Tiếng Việt?",
      accept: "Chuyển sang Tiếng Việt",
      keep: "Giữ {language}",
    },
    zh: {
      question: "使用简体中文查看此页面？",
      accept: "切换到简体中文",
      keep: "保持{language}",
    },
    "zh-hant": {
      question: "使用繁體中文檢視此頁面？",
      accept: "切換至繁體中文",
      keep: "保持{language}",
    },
  };

  function active(value) {
    return (
      typeof value === "string" &&
      Object.prototype.hasOwnProperty.call(LANGS, value)
    );
  }

  function normalize(value) {
    var n = (value == null ? "" : String(value)).trim().toLowerCase();
    if (n === "vi" || n.indexOf("vi-") === 0) return "vi";
    if (n === "en" || n.indexOf("en-") === 0) return "en";
    if (/^zh-(?:hans|cn|sg)(?:-|$)/.test(n)) return "zh";
    if (/^zh-(?:hant|tw|hk|mo)(?:-|$)/.test(n)) return "zh-hant";
    return null;
  }

  function suggest(stored, languages, page) {
    if (active(stored)) return null;
    for (var i = 0; i < languages.length; i++) {
      var tag = languages[i];
      var lang = normalize(tag);
      if (lang) return lang === page ? null : lang;
      if (/^zh(?:-|$)/i.test(String(tag).trim())) return null;
    }
    return null;
  }

  try {
    var script = document.currentScript;
    if (!script || !script.parentNode) return;
    if (document.querySelector("[data-locale-suggestion]")) return;
    var match = /^\/(en|vi|zh-hant|zh)(?:\/|$)/.exec(window.location.pathname);
    if (!match) return;
    var page = match[1];

    var stored = null;
    try {
      stored = window.localStorage.getItem(KEY);
    } catch {
      return; // Cannot remember a choice: never nag.
    }

    var languages =
      navigator.languages && navigator.languages.length
        ? navigator.languages
        : [navigator.language];
    var target = suggest(stored, languages, page);
    if (!target) return;

    var copy = COPY[target];
    var rest =
      window.location.pathname.replace(/^\/(en|vi|zh-hant|zh)(?=\/|$)/, "") ||
      "/";

    var region = document.createElement("div");
    region.className = "locale-suggestion";
    region.setAttribute("role", "region");
    region.setAttribute("aria-label", copy.question);
    region.setAttribute("data-locale-suggestion", target);
    region.lang = LANGS[target].hreflang;

    var text = document.createElement("p");
    text.className = "locale-suggestion__text";
    text.textContent = copy.question;

    var actions = document.createElement("div");
    actions.className = "locale-suggestion__actions";

    var accept = document.createElement("a");
    accept.className = "locale-suggestion__button locale-suggestion__accept";
    accept.href = "/" + target + rest;
    accept.hreflang = LANGS[target].hreflang;
    accept.textContent = copy.accept;

    var keep = document.createElement("button");
    keep.type = "button";
    keep.className = "locale-suggestion__button locale-suggestion__keep";
    keep.textContent = COPY[target].keep.replace(
      "{language}",
      LANGS[page].label,
    );

    actions.appendChild(accept);
    actions.appendChild(keep);
    region.appendChild(text);
    region.appendChild(actions);
    script.parentNode.insertBefore(region, script);
  } catch {
    // Presentation-only enhancement; the module script is the fallback.
  }
})();
