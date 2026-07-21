// Yönetim paneli etkileşimleri — kütüphanesiz.

function feedbackEl(scope) {
  return scope.querySelector(".form-feedback") || document.querySelector(".form-feedback");
}

function say(scope, message, ok) {
  const el = feedbackEl(scope);
  if (!el) return;
  el.textContent = message;
  el.className = "form-feedback " + (ok ? "ok" : "err");
  if (ok) setTimeout(() => { el.textContent = ""; el.className = "form-feedback"; }, 3000);
}

async function api(url, method, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  if (res.status === 401) { location.href = "/admin/giris"; throw new Error("oturum"); }
  return res.json();
}

// Çıkış
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await api("/admin/api/logout", "POST", {});
    location.href = "/admin/giris";
  });
}

// Tekrarlı satırlar: ekle / sil
document.addEventListener("click", (e) => {
  const addBtn = e.target.closest("[data-add]");
  if (addBtn) {
    const key = addBtn.dataset.add;
    const scope = addBtn.closest("form") || document;
    const list = scope.querySelector(`[data-list="${key}"]`);
    const tpl = document.querySelector(`template[data-template="${key}"]`);
    if (list && tpl) list.appendChild(tpl.content.cloneNode(true));
    return;
  }
  const delBtn = e.target.closest(".arow-del");
  if (delBtn) delBtn.closest(".arow").remove();
});

// Foto/görsel yolu değişince önizlemeyi tazele
document.addEventListener("input", (e) => {
  const input = e.target;
  if (!input.matches("[data-field], input[name='hero']")) return;
  const row = input.closest(".arow") || input.closest(".aimg-field") || input.closest("form");
  if (!row) return;
  const key = input.dataset.field || input.name;
  const img = row.querySelector(`[data-preview="${key}"]`);
  if (img) img.src = input.value;
});

// Görseli tarayıcıda web için küçült: uzun kenar en çok 1920px, JPEG/WebP %85.
// Amaç: 7MB'lık telefon fotosu birkaç yüz KB'a insin (hızlı yükleme, hafif depo).
// PNG şeffaflığı korunur; zaten küçük/optimize dosyalar dokunulmadan geçer.
const UPLOAD_MAX = 1920;
const UPLOAD_QUALITY = 0.85;
const REENCODE_ESIK = 1.5 * 1024 * 1024; // 1.5MB altı + ölçek gerekmiyorsa orijinali gönder

async function webIcinKucult(file) {
  const desteklenen = ["image/jpeg", "image/webp", "image/png"];
  if (!desteklenen.includes(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    const olcek = Math.min(1, UPLOAD_MAX / Math.max(width, height));
    // Zaten küçük ve dosya makulse: yeniden kodlamadan (kalite kaybı olmadan) gönder
    if (olcek === 1 && file.size <= REENCODE_ESIK) {
      bitmap.close && bitmap.close();
      return file;
    }
    const cv = document.createElement("canvas");
    cv.width = Math.round(width * olcek);
    cv.height = Math.round(height * olcek);
    const ctx = cv.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, cv.width, cv.height);
    bitmap.close && bitmap.close();
    const kalite = file.type === "image/png" ? undefined : UPLOAD_QUALITY;
    const blob = await new Promise((çöz) => cv.toBlob(çöz, file.type, kalite));
    // Blob üretilemediyse ya da beklenmedik şekilde büyüdüyse orijinale düş
    if (!blob || blob.size >= file.size) return file;
    return blob;
  } catch {
    return file; // decode/canvas hatasında akış bozulmasın
  }
}

// Görsel yükleme
document.addEventListener("change", async (e) => {
  const fileInput = e.target.closest("input[type=file][data-upload-to]");
  if (!fileInput || !fileInput.files.length) return;
  const file = fileInput.files[0];
  const scope = fileInput.closest(".arow") || fileInput.closest(".aimg-field") || fileInput.closest("form");
  const key = fileInput.dataset.uploadTo;
  const target =
    scope.querySelector(`[data-field="${key}"]`) || scope.querySelector(`input[name="${key}"]`);
  try {
    const gonderilecek = await webIcinKucult(file);
    const res = await fetch("/admin/api/upload", {
      method: "POST",
      headers: { "Content-Type": gonderilecek.type || file.type },
      body: gonderilecek
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Yükleme başarısız.");
    if (target) {
      target.value = data.path;
      target.dispatchEvent(new Event("input", { bubbles: true }));
    }
  } catch (err) {
    say(fileInput.closest("form") || document, err.message, false);
  } finally {
    fileInput.value = "";
  }
});

// Liste satırlarını nesnelere çevir
function readList(scope, key) {
  const list = scope.querySelector(`[data-list="${key}"]`);
  if (!list) return [];
  return [...list.querySelectorAll(".arow")].map((row) => {
    const obj = {};
    row.querySelectorAll("[data-field]").forEach((input) => {
      obj[input.dataset.field] = input.type === "checkbox" ? input.checked : input.value.trim();
    });
    return obj;
  });
}

// Kaydet: data-save taşıyan formlar (PUT)
document.querySelectorAll("form[data-save]").forEach((form) => {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {};
    form.querySelectorAll("input[name], textarea[name], select[name]").forEach((el) => {
      if (el.type === "checkbox") payload[el.name] = el.checked;
      else payload[el.name] = el.value;
    });
    form.querySelectorAll("[data-list]").forEach((list) => {
      const key = list.dataset.list;
      payload[key] =
        key === "gallery"
          ? readList(form, key).map((r) => r.url).filter(Boolean)
          : readList(form, key);
    });
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      const data = await api(form.dataset.save, "PUT", payload);
      if (data.ok) say(form, "Kaydedildi. Değişiklikler yayında.", true);
      else say(form, data.error || "Kaydedilemedi.", false);
    } catch (err) {
      if (err.message !== "oturum") say(form, "Bağlantı kurulamadı.", false);
    } finally {
      button.disabled = false;
    }
  });
});

// Oluştur: data-create taşıyan formlar (POST) — kayıt sonrası düzenleme sayfasına git
document.querySelectorAll("form[data-create]").forEach((form) => {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = form.querySelector("input[name=name]").value.trim();
    if (!name) return;
    try {
      const data = await api(form.dataset.create, "POST", { name });
      if (data.ok) location.href = form.dataset.create.replace("/api", "") + "/" + data.slug;
      else say(document.body, data.error || "Oluşturulamadı.", false);
    } catch (err) {
      if (err.message !== "oturum") say(document.body, "Bağlantı kurulamadı.", false);
    }
  });
});

// Sil: data-delete taşıyan butonlar
document.querySelectorAll("button[data-delete]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    if (!confirm(`"${btn.dataset.name}" silinecek. Emin misin?`)) return;
    try {
      const data = await api(btn.dataset.delete, "DELETE");
      if (data.ok) location.reload();
      else say(document.body, data.error || "Silinemedi.", false);
    } catch (err) {
      if (err.message !== "oturum") say(document.body, "Bağlantı kurulamadı.", false);
    }
  });
});
