// Лендинг «Константин - сайты для малого бизнеса»
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Куда отправлять заявки. ЗАМЕНИТЬ: адрес обработчика (Telegram-бот, Formspree и т.п.)
  // Пока пусто - заявка никуда не уходит, посетителю показывается честное сообщение.
  const FORM_ENDPOINT = "";

  /* ---------- 1. Шапка: фон при прокрутке + бургер ---------- */
  function initChrome() {
    const header = document.getElementById("header");
    const cta = document.getElementById("mobileCta");
    const order = document.getElementById("order");
    const burger = document.getElementById("burger");
    const navLinks = document.getElementById("navLinks");

    function onScroll() {
      header.classList.toggle("is-scrolled", scrollY > 30);
      const orderTop = order.getBoundingClientRect().top;
      cta.classList.toggle("is-on", scrollY > innerHeight * 0.8 && orderTop > innerHeight);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    burger.addEventListener("click", () => {
      const open = navLinks.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
    });
    navLinks.addEventListener("click", (e) => {
      if (e.target.tagName === "A") navLinks.classList.remove("is-open");
    });

    // Кнопка тарифа подставляет его в форму
    document.querySelectorAll("[data-plan]").forEach((a) =>
      a.addEventListener("click", () => { document.getElementById("planSelect").value = a.dataset.plan; })
    );
  }

  /* ---------- 2. Веер телефонов ---------- */
  const TOASTS = [
    "Заказ: торт на субботу, 12:00",
    "Стрижка, сегодня 18:30",
    "Запись: суббота 12:30, Мария",
  ];

  function initPhones() {
    const wrap = document.getElementById("phones");
    if (!wrap) return;
    const phones = [...wrap.querySelectorAll(".phone")];
    const tabs = [...document.querySelectorAll(".niche-tabs button")];
    const toast = document.getElementById("demoToast");
    const toastText = document.getElementById("demoToastText");
    let active = 1, autoTimer = 0, toastTimer = 0;

    function show(index, fromUser) {
      active = index;
      const n = phones.length;
      phones.forEach((ph, i) => {
        const pos = (i - index + n) % n; // 0 - впереди, 1 - справа, последний - слева
        ph.classList.toggle("is-front", pos === 0);
        ph.classList.toggle("is-right", pos === 1);
        ph.classList.toggle("is-left", pos === n - 1);
      });
      // вкладки сгруппированы по телефону через data-phone
      tabs.forEach((b) => b.setAttribute("aria-selected", String(Number(b.dataset.phone) === index)));
      toast.classList.remove("is-on");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toastText.textContent = TOASTS[index];
        toast.classList.add("is-on");
      }, reduceMotion ? 0 : 900);
      if (fromUser) clearInterval(autoTimer);
    }

    function pick(i) { show(i, true); }
    tabs.forEach((btn) => btn.addEventListener("click", () => pick(Number(btn.dataset.phone))));
    phones.forEach((ph) => ph.addEventListener("click", () => pick(Number(ph.dataset.i))));
    phones.forEach((ph) => ph.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(Number(ph.dataset.i)); }
    }));

    // При прокрутке телефоны расходятся шире
    if (!reduceMotion) {
      const base = () => (innerWidth <= 520 ? 62 : innerWidth <= 680 ? 92 : 150);
      const onScroll = () => {
        const k = Math.min(scrollY / 400, 1);
        wrap.style.setProperty("--spread", `${base() + k * base() * 0.3}px`);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      onScroll();
      autoTimer = setInterval(() => show((active + 1) % phones.length, false), 4800);
    }
    show(active, false);
  }

  /* ---------- 3. Появление блоков ---------- */
  function initReveal() {
    const items = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window)) { items.forEach((el) => el.classList.add("is-in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach((el) => io.observe(el));
  }

  /* ---------- 4. Калькулятор ---------- */
  function initCalc() {
    const check = document.getElementById("check");
    const lost = document.getElementById("lost");
    if (!check || !lost) return;
    const checkOut = document.getElementById("checkOut");
    const lostOut = document.getElementById("lostOut");
    const money = document.getElementById("money");
    const payback = document.getElementById("payback");
    const fmt = new Intl.NumberFormat("ru-RU");
    const LANDING_PRICE = 24000;
    let shown = 0, anim = 0;

    function plural(n, forms) {
      const n10 = n % 10, n100 = n % 100;
      if (n10 === 1 && n100 !== 11) return forms[0];
      if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return forms[1];
      return forms[2];
    }

    function paintRange(el) {
      const pct = ((el.value - el.min) / (el.max - el.min)) * 100;
      el.style.setProperty("--fill", pct + "%");
    }

    function update() {
      paintRange(check);
      paintRange(lost);
      checkOut.textContent = fmt.format(check.value) + " ₽";
      lostOut.textContent = lost.value;
      const target = Math.round(check.value * lost.value * 30);
      // Осторожное допущение: сайт возвращает треть «потерянных» клиентов
      const days = Math.max(1, Math.ceil(LANDING_PRICE / (target / 3 / 30)));
      payback.textContent = days <= 10
        ? `${days} ${plural(days, ["день", "дня", "дней"])}`
        : days <= 60 ? `${Math.round(days / 7)} ${plural(Math.round(days / 7), ["неделю", "недели", "недель"])}`
        : `${Math.round(days / 30)} ${plural(Math.round(days / 30), ["месяц", "месяца", "месяцев"])}`;

      cancelAnimationFrame(anim);
      const from = shown, start = performance.now(), dur = reduceMotion ? 1 : 500;
      const step = (now) => {
        const k = Math.min((now - start) / dur, 1);
        shown = Math.round(from + (target - from) * (1 - Math.pow(1 - k, 3)));
        money.textContent = fmt.format(shown) + " ₽";
        if (k < 1) anim = requestAnimationFrame(step);
      };
      anim = requestAnimationFrame(step);
    }

    check.addEventListener("input", update);
    lost.addEventListener("input", update);
    update();
  }

  /* ---------- 5. Линия процесса заполняется при прокрутке ---------- */
  function initSteps() {
    const list = document.getElementById("steps");
    const fill = document.getElementById("stepsFill");
    if (!list || !fill) return;
    const steps = [...list.querySelectorAll(".step")];
    function onScroll() {
      const r = list.getBoundingClientRect();
      const mid = innerHeight * 0.6;
      const progress = Math.min(Math.max((mid - r.top - 60) / (r.height - 120), 0), 1);
      fill.style.height = progress * 100 + "%";
      steps.forEach((s) => s.classList.toggle("is-lit", s.getBoundingClientRect().top + 38 < mid));
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 6. FAQ ---------- */
  function initFaq() {
    document.querySelectorAll(".faq-item").forEach((item) => {
      const btn = item.querySelector(".faq-q");
      const ans = item.querySelector(".faq-a");
      btn.addEventListener("click", () => {
        const open = item.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", String(open));
        ans.style.maxHeight = open ? ans.scrollHeight + "px" : "0px";
      });
    });
  }

  /* ---------- 7. Форма заявки ---------- */
  function initForm() {
    const form = document.getElementById("orderForm");
    if (!form) return;
    const error = document.getElementById("formError");
    const done = document.getElementById("formDone");
    const btn = form.querySelector("button[type=submit]");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      const problems = [];
      [["name", "имя"], ["contact", "телефон или Telegram"]].forEach(([key, label]) => {
        const field = form.elements[key];
        const empty = !String(data[key] || "").trim();
        field.setAttribute("aria-invalid", String(empty));
        if (empty) problems.push(label);
      });
      if (problems.length) { error.textContent = `Заполните: ${problems.join(" и ")}.`; return; }
      if (!form.elements.consent.checked) { error.textContent = "Отметьте согласие на обработку данных, иначе я не смогу ответить."; return; }
      error.textContent = "";

      btn.disabled = true;
      btn.textContent = "Отправляю…";
      try {
        if (FORM_ENDPOINT) {
          const res = await fetch(FORM_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          if (!res.ok) throw new Error(`Сервер ответил ${res.status}`);
          done.textContent = "Заявка отправлена. Я свяжусь с вами в течение дня.";
        } else {
          // Демо-режим: обработчик не подключен
          done.textContent = `Демо-режим: обработчик заявок ещё не подключён, поэтому заявка никуда не ушла. Ваши данные: ${data.name}, ${data.contact}, интересует «${data.plan}». Напишите напрямую в WhatsApp или Telegram - кнопки слева.`;
        }
        done.hidden = false;
        form.reset();
        done.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
      } catch (err) {
        error.textContent = "Заявка не отправилась. Проверьте интернет и попробуйте ещё раз или напишите мне в мессенджер.";
      } finally {
        btn.disabled = false;
        btn.textContent = "Отправить заявку";
      }
    });
  }

  /* ---------- Запуск ---------- */
  [initChrome, initPhones, initReveal, initCalc, initSteps, initFaq, initForm].forEach((fn) => {
    try { fn(); } catch (err) { console.error("Ошибка инициализации", fn.name, err); }
  });
})();
