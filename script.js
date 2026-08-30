const questions = [
  ["Film & Dizi","🎬","En sevdiğim film hangisi?","Örn. Interstellar"],
  ["Film & Dizi","📺","En sevdiğim dizi hangisi?","Örn. Game of Thrones"],
  ["Film & Dizi","🎌","En sevdiğim anime hangisi?","Örn. Attack on Titan"],
  ["Film & Dizi","😂","En çok güldüğüm film veya dizi hangisi?",""],
  ["Film & Dizi","😭","Beni en çok ağlatan film veya dizi hangisi?",""],
  ["Film & Dizi","🦸","En sevdiğim film/dizi karakteri kim?",""],
  ["Film & Dizi","👿","En sevdiğim kötü karakter kim?",""],
  ["Film & Dizi","🎭","Kendime en çok benzeyen karakter kim?",""],
  ["Film & Dizi","💑","Eşime en çok benzeyen karakter kim?",""],
  ["Film & Dizi","🌎","Bir film/dizi evreninde yaşayacak olsam hangisi?",""],
  ["Oyun","🎮","En sevdiğim oyun hangisi?","Örn. The Witcher 3"],
  ["Oyun","🕹️","Çocukluğumun en sevdiğim oyunu hangisi?",""],
  ["Oyun","🏆","Tüm zamanların en iyi oyunu bence hangisi?",""],
  ["Oyun","👑","En sevdiğim oyun karakteri kim?",""],
  ["Oyun","💑","Birlikte oynamayı en sevdiğim oyun hangisi?",""],
  ["Yemek","🍕","En sevdiğim yemek hangisi?","Örn. Mantı"],
  ["Yemek","🍰","En sevdiğim tatlı hangisi?",""],
  ["Yemek","🍔","En sevdiğim fast food hangisi?",""],
  ["Yemek","🥩","En sevdiğim et yemeği hangisi?",""],
  ["Yemek","🍝","En sevdiğim makarna hangisi?",""],
  ["Yemek","🍳","En sevdiğim kahvaltılık hangisi?",""],
  ["Yemek","🍓","En sevdiğim meyve hangisi?",""],
  ["Yemek","☕","En sevdiğim kahve hangisi?",""],
  ["Yemek","🍫","En sevdiğim çikolata hangisi?",""],
  ["Yemek","🤢","Asla yiyemem dediğim yemek hangisi?",""],
  ["Yemek","👨‍🍳","Eşimin yaptığı en sevdiğim yemek hangisi?",""],
  ["Kitap & Şiir","📖","En sevdiğim kitap hangisi?","Örn. Simyacı"],
  ["Kitap & Şiir","🧠","Hayatımı en çok etkileyen kitap hangisi?",""],
  ["Kitap & Şiir","📝","En sevdiğim şiir hangisi?",""],
  ["Kitap & Şiir","❤️","En sevdiğim şiir dizesi hangisi?",""],
  ["Kitap & Şiir","💬","En sevdiğim söz hangisi?",""],
  ["Kitap & Şiir","✨","Hayat görüşümü en iyi anlatan söz hangisi?",""],
  ["Müzik","🎵","En sevdiğim şarkı hangisi?",""],
  ["Müzik","🎤","En sevdiğim sanatçı kim?",""],
  ["Müzik","💿","En sevdiğim albüm hangisi?",""],
  ["Müzik","🥹","Beni en çok duygulandıran şarkı hangisi?",""],
  ["Müzik","💃","Dans etmek için seçtiğim şarkı hangisi?",""],
  ["Müzik","❤️","Bizi en çok anlatan şarkı hangisi?",""],
  ["Müzik","💍","İlişkimizin/düğünümüzün şarkısı hangisi?",""],
  ["Birbirimiz","❤️","Eşimde en sevdiğim özellik nedir?",""],
  ["Birbirimiz","😂","Eşimin en komik özelliği nedir?",""],
  ["Birbirimiz","🥰","Eşimin yaptığı en tatlı şey nedir?",""],
  ["Birbirimiz","😤","Eşimin beni en çok sinirlendiren huyu nedir?",""],
  ["Birbirimiz","🫶","Eşim bana en çok ne zaman sevildiğimi hissettirdi?",""],
  ["Birbirimiz","👀","Eşimde ilk dikkatimi çeken şey neydi?",""],
  ["Birbirimiz","🥹","Eşimle yaşadığım en güzel an hangisi?",""],
  ["Birbirimiz","😂","Birlikte yaşadığımız en komik an hangisi?",""],
  ["Birbirimiz","💋","Birlikte yaşadığımız en romantik an hangisi?",""],
  ["Birbirimiz","📸","En sevdiğim birlikte çekilmiş fotoğrafımız hangisi?",""],
  ["Hayaller","✈️","En sevdiğim şehir hangisi?",""],
  ["Hayaller","🌍","En sevdiğim ülke hangisi?",""],
  ["Hayaller","🏖️","Birlikte en çok gitmek istediğim yer neresi?",""],
  ["Hayaller","🏡","Hayalimdeki ev nasıl?",""],
  ["Hayaller","🚗","Hayalimdeki araba hangisi?",""],
  ["Hayaller","💰","Para sorun olmasaydı alacağım ilk şey ne olurdu?",""],
  ["Hayaller","💼","Hayalimdeki meslek ne?",""],
  ["Hayaller","🌟","Gerçekleştirmek istediğim en büyük hayal ne?",""],
  ["Hayaller","🎯","Bu yıl gerçekleştirmek istediğim en önemli şey ne?",""],
  ["Hayaller","🪄","Bir dilek hakkım olsa ne dilerdim?",""],
  ["Hayaller","🔮","Gelecekte görmek istediğim bir gün hangisi?",""],
  ["Hayaller","🧳","Eşimle yaşamak istediğim en büyük macera ne?",""],
  ["Tahmin","🎯","Eşimce benim en sevdiğim film hangisi?","Tahminini yaz"],
  ["Tahmin","🍕","Eşimce benim en sevdiğim yemek hangisi?","Tahminini yaz"],
  ["Tahmin","🎵","Eşimce benim en sevdiğim şarkı hangisi?","Tahminini yaz"],
  ["Tahmin","📖","Eşimce benim en sevdiğim kitap hangisi?","Tahminini yaz"],
  ["Tahmin","📺","Eşimce benim en sevdiğim dizi hangisi?","Tahminini yaz"],
  ["Tahmin","🎮","Eşimce benim en sevdiğim oyun hangisi?","Tahminini yaz"],
  ["Tahmin","✈️","Eşimce en çok gitmek istediğim yer neresi?","Tahminini yaz"],
  ["Tahmin","💎","Eşimce hayalimdeki araba hangisi?","Tahminini yaz"],
  ["Tahmin","❤️","Eşimce hayatta en çok önem verdiğim şey ne?","Tahminini yaz"],
  ["Tahmin","😊","Eşimce beni en çok ne mutlu eder?","Tahminini yaz"],
  ["Tahmin","💭","Eşimce benim en büyük hayalim ne?","Tahminini yaz"],
  ["Tahmin","🥹","Eşimce birlikte yaşadığımız en güzel an hangisi?","Tahminini yaz"],
  ["Gelecek","🕰️","1 yıl sonra en sevdiğim film hâlâ aynı mı?","Bugünkü cevabını da hatırla"],
  ["Gelecek","🎵","1 yıl sonra en sevdiğim şarkı değişmiş olacak mı?",""],
  ["Gelecek","🍽️","1 yıl sonra en sevdiğim yemek değişmiş olacak mı?",""],
  ["Gelecek","✈️","1 yıl içinde gitmek istediğim yere gitmiş olacak mıyım?",""],
  ["Gelecek","🌟","1 yıl içinde hangi hayalimi gerçekleştirmiş olmayı istiyorum?",""],
  ["Gelecek","❤️","1 yıl sonraki eşime bugün söylemek istediğim bir cümle ne?",""],
  ["Gelecek","💌","1 yıl sonraki kendime bugün söylemek istediğim bir cümle ne?",""],
  ["Gelecek","💑","Gelecek yıl birlikte yaşamak istediğimiz en güzel şey ne?",""],
  ["Gelecek","🔮","Gelecek yıl için ortak dileğimiz ne?",""],
  ["Gelecek","💍","Bir yıl sonra hâlâ birbirimizi ilk günkü kadar iyi tanıyor olacak mıyız?",""]
];

const KEY = "bizim-enlerimiz-v1";
const state = JSON.parse(localStorage.getItem(KEY) || '{"answers":{},"lastQuestion":0}');
let activeCategory = "Tümü";

const categories = ["Tümü", ...new Set(questions.map(q => q[0]))];
const filters = document.getElementById("filters");
const list = document.getElementById("questionList");

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[char]));
}

function renderFilters() {
  filters.innerHTML = categories.map(cat =>
    `<button class="filter ${cat === activeCategory ? "active" : ""}" data-category="${escapeHTML(cat)}">${escapeHTML(cat)}</button>`
  ).join("");
  filters.querySelectorAll(".filter").forEach(btn => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.category;
      renderFilters();
      renderQuestions();
    });
  });
}

function answerKey(index, person) {
  return `${index}_${person}`;
}

function renderQuestions() {
  const visible = questions.map((q, i) => ({q, i}))
    .filter(({q}) => activeCategory === "Tümü" || q[0] === activeCategory);

  list.innerHTML = visible.map(({q, i}) => `
    <article class="question-card" id="question-${i}">
      <div class="question-meta">
        <span class="question-number">${String(i + 1).padStart(2, "0")}</span>
        <span class="question-category">${q[1]} ${escapeHTML(q[0])}</span>
      </div>
      <h3 class="question-title">${escapeHTML(q[2])}</h3>
      <div class="answers">
        ${personField(i, "gul", "Gul", q[3] || "Cevabını yaz...")}
        ${personField(i, "kagan", "Kagan", q[3] || "Cevabını yaz...")}
      </div>
      <div class="save-row"><button class="save-btn" data-save="${i}">Cevabı kaydet</button></div>
    </article>
  `).join("");

  list.querySelectorAll(".answer-input").forEach(input => {
    input.addEventListener("input", () => {
      state.answers[input.dataset.key] = input.value;
      saveState(false);
      updateProgress();
      const dot = input.parentElement.querySelector(".saved-dot");
      if (dot) dot.style.opacity = input.value.trim() ? "1" : "0";
    });
  });

  list.querySelectorAll(".save-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const i = btn.dataset.save;
      state.lastQuestion = Number(i);
      saveState(true);
      showToast("Cevabınız kaydedildi ♥");
      updateProgress();
    });
  });

  updateSavedDots();
}

function personField(i, person, label, placeholder) {
  const key = answerKey(i, person);
  const value = state.answers[key] || "";
  return `
    <label>
      <span class="person-label"><span>${label}</span><span class="saved-dot">● Kaydedildi</span></span>
      <textarea class="answer-input" data-key="${key}" placeholder="${escapeHTML(placeholder)}">${escapeHTML(value)}</textarea>
    </label>
  `;
}

function updateSavedDots() {
  list.querySelectorAll(".answer-input").forEach(input => {
    const dot = input.parentElement.querySelector(".saved-dot");
    if (dot) dot.style.opacity = input.value.trim() ? "1" : "0";
  });
}

function updateProgress() {
  let answered = 0;
  questions.forEach((_, i) => {
    const m = (state.answers[answerKey(i, "gul")] || "").trim();
    const g = (state.answers[answerKey(i, "kagan")] || "").trim();
    if (m || g) answered++;
  });
  const pct = Math.round((answered / questions.length) * 100);
  document.getElementById("answeredCount").textContent = answered;
  document.getElementById("totalCount").textContent = questions.length;
  document.getElementById("progressText").textContent = `${pct}%`;
  document.getElementById("progressFill").style.width = `${pct}%`;
}

function saveState(show = false) {
  localStorage.setItem(KEY, JSON.stringify(state));
  if (show) showToast("Kaydedildi ♥");
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1800);
}

document.getElementById("continueBtn").addEventListener("click", () => {
  const target = document.getElementById(`question-${state.lastQuestion}`) || document.getElementById("questions");
  target.scrollIntoView({behavior:"smooth", block:"center"});
});

document.getElementById("resetBtn").addEventListener("click", () => {
  const ok = confirm("Bu cihazdaki tüm cevaplar silinsin mi? Bu işlem geri alınamaz.");
  if (!ok) return;
  localStorage.removeItem(KEY);
  location.reload();
});

renderFilters();
renderQuestions();
updateProgress();
