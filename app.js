(() => {
  const ME = {
    id: "maria",
    name: "María León",
    city: "CDMX",
    bio: "Pintora. Memoria doméstica y luz como archivo emocional.",
    avatar: "var(--img-artist-1)",
  };

  const OTHER_WORKS = [
    {
      id: "serie-norte",
      title: "Serie Norte",
      artistId: "diego",
      artist: "Diego Mora",
      city: "Monterrey",
      avatar: "var(--img-artist-2)",
      artClass: "art-b",
      desc: "Paisajes reducidos a planos de color y silencio.",
      likes: 86,
      mine: false,
    },
    {
      id: "umbral",
      title: "Umbral",
      artistId: "camila",
      artist: "Camila Orth",
      city: "Guadalajara",
      avatar: "var(--img-artist-3)",
      artClass: "art-c",
      desc: "Trabajo sobre puertas, transiciones y lo que queda fuera de cuadro.",
      likes: 54,
      mine: false,
    },
    {
      id: "atelier",
      title: "Atelier #3",
      artistId: "diego",
      artist: "Diego Mora",
      city: "Monterrey",
      avatar: "var(--img-artist-2)",
      artClass: "art-d",
      desc: "El estudio como paisaje: herramientas, polvo y luz de norte.",
      likes: 41,
      mine: false,
    },
  ];

  const MY_SEED = [
    {
      id: "sin-titulo-14",
      title: "Sin título #14",
      artistId: ME.id,
      artist: ME.name,
      city: ME.city,
      avatar: ME.avatar,
      artClass: "art-a",
      desc: "Una exploración sobre la memoria familiar y la luz de la tarde en el patio.",
      likes: 128,
      mine: true,
    },
  ];

  const state = {
    screen: "splash",
    history: [],
    authMode: "signin",
    authMethod: null,
    hasPhotos: false,
    hasVideo: false,
    recording: false,
    recSeconds: 0,
    recTimer: null,
    voicePlaying: false,
    works: [...MY_SEED, ...OTHER_WORKS],
    currentArtworkId: null,
  };

  const authScreens = ["splash", "login", "profile-setup"];
  const tabScreens = ["home", "my-works", "profile"];
  const overlayScreens = ["artwork", "settings", "published", "share-obra", "obra-qr"];

  const toastEl = document.getElementById("toast");
  const tabbar = document.getElementById("tabbar");

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  function myWorks() {
    return state.works.filter((w) => w.mine);
  }

  function currentWork() {
    return (
      state.works.find((w) => w.id === state.currentArtworkId) ||
      myWorks()[0] ||
      state.works[0]
    );
  }

  function publicObraUrl(slug) {
    const base = `${location.origin}${location.pathname.replace(/index\.html$/, "")}`;
    return new URL(`obra.html?o=${encodeURIComponent(slug)}`, base).href;
  }

  function publicObraPretty(slug) {
    return `unmute.app/o/${slug}`;
  }

  function syncShareUi() {
    const w = currentWork();
    if (!w) return;
    const url = publicObraUrl(w.id);
    const pretty = publicObraPretty(w.id);
    const linkText = document.getElementById("shareLinkText");
    const qrLink = document.getElementById("qrLinkText");
    const qrImg = document.getElementById("obraQrImg");
    const shareTitle = document.getElementById("shareTitle");
    const shareArtist = document.getElementById("shareArtist");
    const sharePreview = document.getElementById("sharePreview");
    const qrTitle = document.getElementById("qrTitle");
    const qrArtist = document.getElementById("qrArtist");

    if (linkText) linkText.textContent = pretty;
    if (qrLink) qrLink.textContent = pretty;
    if (shareTitle) shareTitle.textContent = w.title;
    if (shareArtist) shareArtist.textContent = `${w.artist} · página pública`;
    if (qrTitle) qrTitle.textContent = w.title;
    if (qrArtist) qrArtist.textContent = w.artist;
    if (sharePreview) {
      sharePreview.className = `share-preview ${w.artClass}`;
    }
    if (qrImg) {
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=12&data=${encodeURIComponent(url)}`;
    }
  }

  async function copyPublicLink() {
    const w = currentWork();
    if (!w) return;
    const url = publicObraUrl(w.id);
    try {
      await navigator.clipboard.writeText(url);
      showToast("Enlace copiado");
    } catch {
      prompt("Copia este enlace:", url);
    }
  }

  function openPublicWeb() {
    const w = currentWork();
    if (!w) return;
    window.open(publicObraUrl(w.id), "_blank", "noopener");
  }

  function slugify(title) {
    return (
      title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 40) || "obra"
    );
  }

  function setAuthMode(mode) {
    state.authMode = mode;
    const isSignup = mode === "signup";
    document.getElementById("loginTitle").textContent = isSignup ? "Registro" : "Entrar";
    document.getElementById("loginHeading").textContent = isSignup
      ? "Crea tu cuenta"
      : "Bienvenido";
    document.getElementById("loginSub").textContent = isSignup
      ? "Regístrate con Google, Apple o tu correo."
      : "Entra con Google, Apple o tu correo.";
    document.getElementById("emailContinue").textContent = isSignup
      ? "Crear cuenta"
      : "Entrar";
    document.getElementById("authSwitchNote").innerHTML = isSignup
      ? `¿Ya tienes cuenta? <button type="button" class="linkish" id="switchAuthMode">Entrar</button>`
      : `¿No tienes cuenta? <button type="button" class="linkish" id="switchAuthMode">Regístrate</button>`;
    document.getElementById("switchAuthMode").addEventListener("click", () => {
      setAuthMode(isSignup ? "signin" : "signup");
    });
    document.getElementById("authNameField").classList.toggle("hidden", !isSignup);
  }

  function syncProfile() {
    const name = document.getElementById("setupName")?.value || ME.name;
    const bio = document.getElementById("setupBio")?.value || ME.bio;
    document.getElementById("profileName").textContent = name;
    document.getElementById("profileBio").textContent = bio;
    ME.name = name;
    ME.bio = bio;
    document.getElementById("statWorks").textContent = String(myWorks().length);
  }

  function renderFeed() {
    const root = document.getElementById("feedList");
    const ordered = [
      ...state.works.filter((w) => w.mine),
      ...state.works.filter((w) => !w.mine),
    ];
    const seen = new Set();
    const list = ordered.filter((w) => {
      if (seen.has(w.id)) return false;
      seen.add(w.id);
      return true;
    });

    root.innerHTML = list
      .map(
        (w) => `
      <article class="feed-card" data-work="${w.id}">
        <div class="meta-row">
          <div class="avatar" style="background-image:${w.avatar}"></div>
          <div class="who">
            <strong>${w.artist}${w.mine ? " · tú" : ""}</strong>
            <span>Artista · ${w.city}</span>
          </div>
        </div>
        <button class="art-frame ${w.artClass}" data-open-work="${w.id}" type="button" aria-label="Ver obra">
          <span class="voice-chip"><span class="dot"></span> Voz del artista</span>
        </button>
        <div class="feed-body">
          <h3>${w.title}</h3>
          <p>${w.desc}</p>
          <div class="actions">
            <button class="action" data-toggle="like" type="button">
              <svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
              ${w.likes}
            </button>
            <button class="action" data-open-work="${w.id}" type="button">
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              Escuchar
            </button>
          </div>
        </div>
      </article>`
      )
      .join("");
  }

  function renderMyWorks() {
    const list = myWorks();
    const root = document.getElementById("myWorksList");
    const grid = document.getElementById("profileWorksGrid");

    if (!list.length) {
      root.innerHTML = `<p class="section-pad soft">Aún no has publicado. Toca Subir para crear tu primera obra.</p>`;
    } else {
      root.innerHTML = list
        .map(
          (w) => `
        <article class="work-row">
          <button class="work-thumb ${w.artClass}" data-open-work="${w.id}" type="button" aria-label="Ver obra"></button>
          <div class="work-info">
            <strong>${w.title}</strong>
            <span>Con video · pública</span>
          </div>
          <div class="work-actions">
            <button class="btn btn-ghost btn-sm" data-open-work="${w.id}" type="button">Ver</button>
            <button class="btn btn-ghost btn-sm" data-share-work="${w.id}" type="button">Compartir</button>
            <button class="btn btn-ghost btn-sm" data-qr-work="${w.id}" type="button">QR</button>
          </div>
        </article>`
        )
        .join("");
    }

    grid.innerHTML =
      list
        .map(
          (w) =>
            `<button class="tile ${w.artClass}" data-open-work="${w.id}" type="button" aria-label="${w.title}"></button>`
        )
        .join("") +
      `<button class="tile" data-go="publish-1" type="button" style="display:grid;place-items:center;background:var(--paper);border:1px dashed var(--line);color:var(--accent);font-weight:700" aria-label="Nueva obra">+</button>`;

    document.getElementById("statWorks").textContent = String(list.length);
  }

  function openArtwork(id) {
    const w = state.works.find((x) => x.id === id);
    if (!w) return;
    state.currentArtworkId = id;
    state.voicePlaying = false;
    document.getElementById("artworkTitle").textContent = w.title;
    document.getElementById("artworkArtist").textContent = `${w.artist} · ${w.city}`;
    document.getElementById("artworkDesc").textContent = w.desc;
    document.getElementById("voiceStatus").textContent = "Escuchar al artista";
    document.getElementById("playVoice").classList.remove("playing");
    document.getElementById("playIcon").innerHTML =
      `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
    const hero = document.getElementById("artworkHero");
    hero.className = `art-frame ${w.artClass}`;
    hero.style.borderRadius = "0";
    hero.style.aspectRatio = "4/5";
    go("artwork");
  }

  function go(name, { replace = false, push = true } = {}) {
    if (name === "welcome") name = "login";
    if (name === "publish-4" && !state.hasVideo) {
      showToast("El video es obligatorio para publicar");
      name = "publish-3";
      replace = true;
    }

    const next = document.querySelector(`[data-screen="${name}"]`);
    if (!next) return;

    if (push && !replace) state.history.push(state.screen);
    if (replace) state.history = [];

    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    next.classList.add("active");
    state.screen = name;

    const hideTabs =
      authScreens.includes(name) ||
      name.startsWith("publish") ||
      overlayScreens.includes(name);
    tabbar.classList.toggle("visible", !hideTabs);

    let tab = name;
    if (name === "published" || name === "share-obra" || name === "obra-qr") tab = "my-works";
    document.querySelectorAll(".tab").forEach((t) => {
      t.classList.toggle("active", tabScreens.includes(tab) && t.dataset.tab === tab);
    });

    if (name === "home") renderFeed();
    if (name === "my-works" || name === "profile") renderMyWorks();
    if (name === "publish-1") resetPublishVideo();
    if (name === "publish-4") {
      const title = document.getElementById("artTitle")?.value || "Sin título";
      const desc = document.getElementById("artDesc")?.value || "";
      document.getElementById("previewTitle").textContent = title;
      document.getElementById("previewDesc").textContent =
        desc.slice(0, 120) + (desc.length > 120 ? "…" : "");
    }
    if (name === "login") setAuthMode(state.authMode);
    if (name === "share-obra" || name === "obra-qr") syncShareUi();

    next.querySelector(".screen-scroll")?.scrollTo(0, 0);
  }

  function back() {
    const prev = state.history.pop();
    if (prev) go(prev, { push: false });
    else go("home", { replace: true, push: false });
  }

  function enterAfterAuth(method) {
    state.authMethod = method;
    const labels = { google: "Google", apple: "Apple", email: "correo" };

    if (state.authMode === "signin") {
      syncProfile();
      renderFeed();
      renderMyWorks();
      go("home", { replace: true });
      showToast(`Entraste con ${labels[method] || method}`);
      return;
    }

    if (method === "email") {
      const n = document.getElementById("authName")?.value;
      if (n) document.getElementById("setupName").value = n;
    }
    go("profile-setup", { replace: true });
    showToast(`Cuenta creada con ${labels[method] || method}`);
  }

  function resetPublishVideo() {
    state.hasVideo = false;
    state.recording = false;
    state.recSeconds = 0;
    clearInterval(state.recTimer);
    const recBtn = document.getElementById("recBtn");
    const recTimer = document.getElementById("recTimer");
    const toPreview = document.getElementById("toPreview");
    const videoReadyBadge = document.getElementById("videoReadyBadge");
    const videoRequiredNote = document.getElementById("videoRequiredNote");
    if (recBtn) recBtn.classList.remove("recording");
    if (recTimer) recTimer.textContent = "00:00";
    if (toPreview) toPreview.disabled = true;
    if (videoReadyBadge) videoReadyBadge.classList.add("hidden");
    if (videoRequiredNote) {
      videoRequiredNote.hidden = false;
      videoRequiredNote.textContent = "Graba o sube un video para continuar.";
    }
  }

  function markVideoReady(msg) {
    state.hasVideo = true;
    document.getElementById("toPreview").disabled = false;
    document.getElementById("videoReadyBadge").classList.remove("hidden");
    document.getElementById("videoRequiredNote").hidden = true;
    showToast(msg);
  }

  function stopRec() {
    state.recording = false;
    document.getElementById("recBtn").classList.remove("recording");
    clearInterval(state.recTimer);
    markVideoReady("Video listo");
  }

  function publishWork() {
    if (!state.hasVideo) {
      showToast("Sin video no se publica la obra");
      go("publish-3");
      return;
    }
    const title = document.getElementById("artTitle")?.value?.trim() || "Sin título";
    const desc = document.getElementById("artDesc")?.value?.trim() || "";
    const id = `${slugify(title)}-${Date.now().toString(36).slice(-4)}`;
    state.works.unshift({
      id,
      title,
      artistId: ME.id,
      artist: ME.name,
      city: ME.city,
      avatar: ME.avatar,
      artClass: "art-e",
      desc,
      likes: 0,
      mine: true,
    });
    state.currentArtworkId = id;
    state.hasPhotos = false;
    document.getElementById("photoThumbs").classList.add("hidden");
    resetPublishVideo();
    document.getElementById("publishedTitle").textContent = title;
    document.getElementById("publishedMsg").textContent =
      `“${title}” ya está en el muro y en Mis obras.`;
    renderFeed();
    renderMyWorks();
    go("published", { replace: true });
    showToast("Obra publicada");
  }

  document.body.addEventListener("click", (e) => {
    const goEl = e.target.closest("[data-go]");
    if (goEl) {
      e.preventDefault();
      go(goEl.dataset.go);
      return;
    }

    const backEl = e.target.closest("[data-back]");
    if (backEl) {
      e.preventDefault();
      back();
      return;
    }

    const open = e.target.closest("[data-open-work]");
    if (open) {
      e.preventDefault();
      openArtwork(open.dataset.openWork);
      return;
    }

    const shareWork = e.target.closest("[data-share-work]");
    if (shareWork) {
      e.preventDefault();
      state.currentArtworkId = shareWork.dataset.shareWork;
      go("share-obra");
      return;
    }

    const qrWork = e.target.closest("[data-qr-work]");
    if (qrWork) {
      e.preventDefault();
      state.currentArtworkId = qrWork.dataset.qrWork;
      go("obra-qr");
      return;
    }

    const like = e.target.closest('[data-toggle="like"]');
    if (like) {
      like.classList.toggle("on");
      return;
    }

    const authBtn = e.target.closest("[data-auth]");
    if (authBtn) {
      enterAfterAuth(authBtn.dataset.auth);
    }
  });

  document.getElementById("emailContinue").addEventListener("click", () => {
    enterAfterAuth("email");
  });

  document.getElementById("finishSetup").addEventListener("click", () => {
    syncProfile();
    renderFeed();
    renderMyWorks();
    go("home", { replace: true });
    showToast("Perfil listo");
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    state.authMethod = null;
    state.authMode = "signin";
    go("splash", { replace: true });
  });

  document.getElementById("playVoice").addEventListener("click", () => {
    state.voicePlaying = !state.voicePlaying;
    const btn = document.getElementById("playVoice");
    const icon = document.getElementById("playIcon");
    const status = document.getElementById("voiceStatus");
    btn.classList.toggle("playing", state.voicePlaying);
    if (state.voicePlaying) {
      status.textContent = "Reproduciendo…";
      icon.innerHTML =
        `<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>`;
      showToast("Escuchando la voz del artista");
    } else {
      status.textContent = "Escuchar al artista";
      icon.innerHTML = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
    }
  });

  tabbar.addEventListener("click", (e) => {
    const tab = e.target.closest(".tab");
    if (!tab) return;
    const key = tab.dataset.tab;
    if (key === "home") return go("home");
    if (key === "my-works") return go("my-works");
    if (key === "profile") return go("profile");
    if (key === "publish") return go("publish-1");
  });

  document.querySelectorAll(".feed-tabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.parentElement.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  document.getElementById("addPhotos").addEventListener("click", () => {
    state.hasPhotos = true;
    document.getElementById("photoThumbs").classList.remove("hidden");
    showToast("Fotos agregadas");
  });

  const recBtn = document.getElementById("recBtn");
  const recTimer = document.getElementById("recTimer");
  const toPreview = document.getElementById("toPreview");

  recBtn.addEventListener("click", () => {
    if (state.recording) {
      stopRec();
      return;
    }
    state.hasVideo = false;
    state.recording = true;
    state.recSeconds = 0;
    recBtn.classList.add("recording");
    toPreview.disabled = true;
    document.getElementById("videoReadyBadge").classList.add("hidden");
    const note = document.getElementById("videoRequiredNote");
    note.hidden = false;
    note.textContent = "Grabando… toca de nuevo para terminar.";
    state.recTimer = setInterval(() => {
      state.recSeconds += 1;
      const m = String(Math.floor(state.recSeconds / 60)).padStart(2, "0");
      const s = String(state.recSeconds % 60).padStart(2, "0");
      recTimer.textContent = `${m}:${s}`;
      if (state.recSeconds >= 8) stopRec();
    }, 1000);
  });

  document.getElementById("uploadVideo").addEventListener("click", () => {
    if (state.recording) stopRec();
    recTimer.textContent = "00:47";
    markVideoReady("Video cargado");
  });

  toPreview.addEventListener("click", () => {
    if (!state.hasVideo) {
      showToast("El video es obligatorio");
      return;
    }
    go("publish-4");
  });

  document.getElementById("publishBtn").addEventListener("click", publishWork);

  document.getElementById("copyShareLink")?.addEventListener("click", copyPublicLink);
  document.getElementById("copyShareLinkFromQr")?.addEventListener("click", copyPublicLink);
  document.getElementById("openPublicWeb")?.addEventListener("click", openPublicWeb);
  document.getElementById("openPublicWebFromQr")?.addEventListener("click", openPublicWeb);

  setAuthMode("signin");
  state.currentArtworkId = MY_SEED[0].id;
  renderFeed();
  renderMyWorks();
  go("splash", { replace: true, push: false });
})();
