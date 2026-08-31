/* =====================================================
   SUPABASE
===================================================== */

const SUPABASE_URL =
  "https://nwvkauyoncedbetjridz.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_Rs6Nh2FBLVQHiBW_owiMyQ_2ax0VA-t";


const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );



/* =====================================================
   AYARLAR
===================================================== */

const CURRENT_YEAR =
  new Date().getFullYear();


let currentUser = null;
let currentProfile = null;

let questions = [];
let answers = [];

let currentFilter = "all";

/*
  Giriş ekranında seçilen kişi.
*/
let selectedPerson = "gul";



/* =====================================================
   ELEMENTLER
===================================================== */

const loginScreen =
  document.getElementById("loginScreen");

const appShell =
  document.getElementById("appShell");

const loginBtn =
  document.getElementById("loginBtn");

const loginError =
  document.getElementById("loginError");

const emailInput =
  document.getElementById("email");

const passwordInput =
  document.getElementById("password");

const questionList =
  document.getElementById("questionList");

const answeredCount =
  document.getElementById("answeredCount");

const totalCount =
  document.getElementById("totalCount");

const progressText =
  document.getElementById("progressText");

const progressFill =
  document.getElementById("progressFill");

const toast =
  document.getElementById("toast");

const welcomeUser =
  document.getElementById("welcomeUser");

const currentPersonName =
  document.getElementById("currentPersonName");

const continueBtn =
  document.getElementById("continueBtn");



/* =====================================================
   BAŞLANGIÇ
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  init
);



async function init() {

  /*
    Sayfa açıldığında güvenlik için
    uygulamayı gizliyoruz.
  */

  loginScreen.classList.remove("hidden");
  appShell.classList.add("hidden");


  document.getElementById(
    "heroYear"
  ).textContent = CURRENT_YEAR;


  document.getElementById(
    "yearDisplay"
  ).textContent = CURRENT_YEAR;


  setupPersonButtons();

  setupFilters();


  loginBtn.addEventListener(
    "click",
    login
  );


  passwordInput.addEventListener(
    "keydown",
    event => {

      if (event.key === "Enter") {
        login();
      }

    }
  );


  document
    .getElementById("logoutBtn")
    .addEventListener(
      "click",
      logout
    );


  continueBtn.addEventListener(
    "click",
    continueFromWhereLeft
  );


  /*
    Daha önce giriş yapılmış mı?
  */

  const {
    data,
    error
  } =
    await supabaseClient.auth.getSession();


  if (error) {

    console.error(
      "Oturum kontrol hatası:",
      error
    );

    showLogin();

    return;

  }


  const session =
    data?.session;


  if (session) {

    console.log(
      "Mevcut oturum bulundu."
    );

    currentUser =
      session.user;


    await enterApplication();

  } else {

    console.log(
      "Aktif oturum bulunamadı."
    );

    showLogin();

  }

}



/* =====================================================
   LOGIN EKRANINI GÖSTER
===================================================== */

function showLogin() {

  loginScreen.classList.remove(
    "hidden"
  );

  appShell.classList.add(
    "hidden"
  );

}



/* =====================================================
   UYGULAMAYI GÖSTER
===================================================== */

function showApplication() {

  loginScreen.classList.add(
    "hidden"
  );

  appShell.classList.remove(
    "hidden"
  );

}



/* =====================================================
   GÜL / KAĞAN SEÇİMİ
===================================================== */

function setupPersonButtons() {

  const buttons =
    document.querySelectorAll(
      ".person-btn"
    );


  buttons.forEach(button => {

    button.addEventListener(
      "click",
      function(event) {

        event.preventDefault();


        /*
          Aktif görünümü değiştir.
        */

        buttons.forEach(btn => {

          btn.classList.remove(
            "active"
          );

        });


        this.classList.add(
          "active"
        );


        /*
          Seçilen kişiyi kaydet.
        */

        selectedPerson =
          this.dataset.person;


        const name =
          selectedPerson === "gul"
            ? "Gül"
            : "Kağan";


        loginBtn.innerHTML =
          `${name} olarak giriş yap <span>→</span>`;


        loginError.textContent = "";


        console.log(
          "Seçilen kişi:",
          name
        );

      }
    );

  });


  /*
    Başlangıçta Gül seçili.
  */

  setSelectedPerson("gul");

}



/* =====================================================
   KİŞİ SEÇ
===================================================== */

function setSelectedPerson(person) {

  selectedPerson =
    person;


  const buttons =
    document.querySelectorAll(
      ".person-btn"
    );


  buttons.forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.person === person
    );

  });


  const name =
    person === "gul"
      ? "Gül"
      : "Kağan";


  loginBtn.innerHTML =
    `${name} olarak giriş yap <span>→</span>`;

}



/* =====================================================
   LOGIN
===================================================== */

async function login() {

  loginError.textContent = "";


  const email =
    emailInput.value.trim();


  const password =
    passwordInput.value;


  if (!email || !password) {

    loginError.textContent =
      "E-posta ve şifre alanlarını doldurmalısın.";

    return;

  }


  loginBtn.disabled = true;

  loginBtn.innerHTML =
    "Giriş yapılıyor...";


  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth.signInWithPassword({
        email,
        password
      });


    if (error) {

      console.error(
        "Supabase giriş hatası:",
        error
      );


      loginError.textContent =
        "E-posta veya şifre hatalı. Lütfen tekrar dene.";


      restoreLoginButton();

      return;

    }


    currentUser =
      data.user;


    /*
      Kullanıcının gerçek profilini getir.
    */

    const profile =
      await getProfileForUser(
        currentUser.id
      );


    if (!profile) {

      /*
        Profil bulunamadıysa uygulamaya
        yanlış isimle girmesin.
      */

      await supabaseClient.auth.signOut();

      currentUser = null;


      loginError.textContent =
        "Bu hesabın profil bilgisi bulunamadı. Supabase profillerini kontrol et.";


      restoreLoginButton();

      return;

    }


    /*
      Gül seçip Kağan hesabıyla
      giriş yapılmasını engelliyoruz.
    */

    const expectedName =
      selectedPerson === "gul"
        ? "Gül"
        : "Kağan";


    if (
      profile.name &&
      profile.name.toLowerCase() !==
      expectedName.toLowerCase()
    ) {

      await supabaseClient.auth.signOut();

      currentUser = null;

      currentProfile = null;


      loginError.textContent =
        `Bu hesap ${profile.name} hesabı. Lütfen ${profile.name} seçeneğini seçerek tekrar giriş yap.`;


      restoreLoginButton();

      return;

    }


    currentProfile =
      profile;


    await enterApplication();

  }

  catch (error) {

    console.error(
      "Beklenmeyen giriş hatası:",
      error
    );


    loginError.textContent =
      "Bir hata oluştu. Lütfen tekrar dene.";


    restoreLoginButton();

  }

}



/* =====================================================
   LOGIN BUTONUNU ESKİ HALİNE GETİR
===================================================== */

function restoreLoginButton() {

  loginBtn.disabled = false;


  const name =
    selectedPerson === "gul"
      ? "Gül"
      : "Kağan";


  loginBtn.innerHTML =
    `${name} olarak giriş yap <span>→</span>`;

}



/* =====================================================
   PROFİL GETİR
===================================================== */

async function getProfileForUser(userId) {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("profiles")
      .select("*")
      .eq(
        "id",
        userId
      )
      .maybeSingle();


  if (error) {

    console.error(
      "Profil alınamadı:",
      error
    );

    return null;

  }


  return data;

}



/* =====================================================
   UYGULAMAYA GİR
===================================================== */

async function enterApplication() {

  if (!currentUser) {

    showLogin();

    return;

  }


  /*
    Önce profil.
  */

  if (!currentProfile) {

    currentProfile =
      await getProfileForUser(
        currentUser.id
      );

  }


  if (!currentProfile) {

    console.error(
      "Kullanıcı profili bulunamadı."
    );


    await supabaseClient.auth.signOut();

    currentUser = null;

    showLogin();

    return;

  }


  /*
    Gerçek kullanıcı adına göre
    giriş ekranındaki seçimi de ayarla.
  */

  if (
    currentProfile.name &&
    currentProfile.name
      .toLowerCase()
      .includes("kağan")
  ) {

    selectedPerson = "kagan";

  } else {

    selectedPerson = "gul";

  }


  /*
    Uygulamayı göster.
  */

  showApplication();


  /*
    Verileri yükle.
  */

  await loadQuestions();

  await loadAnswers();


  /*
    Ekranı çiz.
  */

  renderQuestions();

  updateStats();

  updateUserInterface();


  /*
    Sayfanın başına dön.
  */

  window.scrollTo({
    top: 0,
    behavior: "instant"
  });

}



/* =====================================================
   SORULARI GETİR
===================================================== */

async function loadQuestions() {

  console.log(
    "Sorular yükleniyor..."
  );


  const {
    data,
    error
  } =
    await supabaseClient
      .from("questions")
      .select("*");


  if (error) {

    console.error(
      "SORULAR YÜKLENEMEDİ:",
      error
    );


    questions = [];


    questionList.innerHTML = `
      <div class="empty">
        <div style="font-size:40px;margin-bottom:10px;">
          ⚠️
        </div>

        <strong>Sorular yüklenemedi.</strong>

        <p style="margin-top:10px;">
          Supabase bağlantısını veya RLS izinlerini kontrol etmeliyiz.
        </p>
      </div>
    `;


    showToast(
      "Sorular yüklenirken hata oluştu."
    );


    return;

  }


  /*
    active alanı varsa sadece aktif sorular.
    active alanı yoksa bütün sorular.
  */

  questions =
    (data || [])
      .filter(question =>
        question.active !== false
      )
      .sort(
        (a, b) =>
          Number(a.sort_order ?? 0) -
          Number(b.sort_order ?? 0)
      );


  console.log(
    "Yüklenen soru sayısı:",
    questions.length
  );


  if (!questions.length) {

    questionList.innerHTML = `
      <div class="empty">

        <div style="font-size:40px;margin-bottom:10px;">
          ♡
        </div>

        <strong>Henüz soru bulunamadı.</strong>

        <p style="margin-top:10px;">
          Supabase'deki questions tablosunu kontrol edelim.
        </p>

      </div>
    `;

  }

}



/* =====================================================
   CEVAPLARI GETİR
===================================================== */

async function loadAnswers() {

  if (!currentUser) {

    answers = [];

    return;

  }


  console.log(
    "Cevaplar yükleniyor..."
  );


  const {
    data,
    error
  } =
    await supabaseClient
      .from("answers")
      .select("*")
      .eq(
        "year",
        CURRENT_YEAR
      );


  if (error) {

    console.error(
      "CEVAPLAR YÜKLENEMEDİ:",
      error
    );


    answers = [];


    showToast(
      "Cevaplar yüklenirken hata oluştu."
    );


    return;

  }


  answers =
    data || [];


  console.log(
    "Yüklenen cevap sayısı:",
    answers.length
  );

}



/* =====================================================
   KULLANICI BİLGİLERİ
===================================================== */

function updateUserInterface() {

  if (!currentProfile)
    return;


  const name =
    currentProfile.name ||
    (
      selectedPerson === "gul"
        ? "Gül"
        : "Kağan"
    );


  welcomeUser.textContent =
    `${name} olarak giriş yaptın`;


  currentPersonName.textContent =
    name;


  document.getElementById(
    "heroYear"
  ).textContent =
    CURRENT_YEAR;


  document.getElementById(
    "yearDisplay"
  ).textContent =
    CURRENT_YEAR;

}



/* =====================================================
   SORULARI ÇİZ
===================================================== */

function renderQuestions() {

  if (!currentUser) {

    questionList.innerHTML = "";

    return;

  }


  let visibleQuestions =
    [...questions];


  if (
    currentFilter ===
    "answered"
  ) {

    visibleQuestions =
      visibleQuestions.filter(
        question =>
          getMyAnswer(
            question.id
          )
      );

  }


  if (
    currentFilter ===
    "unanswered"
  ) {

    visibleQuestions =
      visibleQuestions.filter(
        question =>
          !getMyAnswer(
            question.id
          )
      );

  }


  if (!visibleQuestions.length) {

    questionList.innerHTML = `
      <div class="empty">

        <div style="font-size:40px;margin-bottom:10px;">
          ♡
        </div>

        Bu filtrede gösterilecek soru yok.

      </div>
    `;

    return;

  }


  questionList.innerHTML =
    visibleQuestions
      .map(
        (question, index) =>
          createQuestionCard(
            question,
            index
          )
      )
      .join("");


  document
    .querySelectorAll(".save-btn")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          saveAnswer(
            Number(
              button.dataset.questionId
            )
          );

        }
      );

    });

}



/* =====================================================
   SORU KARTI
===================================================== */

function createQuestionCard(
  question,
  index
) {

  const myAnswer =
    getMyAnswer(
      question.id
    );


  const partnerAnswer =
    getPartnerAnswer(
      question.id
    );


  const answered =
    !!myAnswer;


  const partnerName =
    currentProfile?.name === "Gül"
      ? "Kağan"
      : "Gül";


  return `

    <article class="question-card">

      <div class="question-number">
        ${String(index + 1).padStart(2, "0")}
      </div>


      <h3 class="question-title">
        ${escapeHtml(
          question.question
        )}
      </h3>


      <textarea
        class="answer-area"
        id="answer-${question.id}"
        placeholder="Cevabını buraya yaz..."
      >${
        myAnswer
          ? escapeHtml(
              myAnswer.answer
            )
          : ""
      }</textarea>


      <div class="answer-actions">

        <span
          class="saved-label"
          id="saved-${question.id}"
        >
          ${
            answered
              ? "✓ Cevabın kayıtlı"
              : "Henüz cevaplanmadı"
          }
        </span>


        <button
          type="button"
          class="save-btn"
          data-question-id="${question.id}"
        >
          ${
            answered
              ? "Cevabı güncelle"
              : "Cevabı kaydet"
          }
        </button>

      </div>


      ${
        partnerAnswer
          ? `

            <div class="partner-answer">

              <div class="partner-title">
                ♥ ${partnerName}'ın cevabı
              </div>

              <p>
                ${escapeHtml(
                  partnerAnswer.answer
                )}
              </p>

            </div>

          `
          : ""
      }

    </article>

  `;

}



/* =====================================================
   CEVAP KAYDET
===================================================== */

async function saveAnswer(
  questionId
) {

  if (!currentUser) {

    showToast(
      "Önce giriş yapmalısın."
    );

    return;

  }


  const textarea =
    document.getElementById(
      `answer-${questionId}`
    );


  if (!textarea) {

    showToast(
      "Cevap alanı bulunamadı."
    );

    return;

  }


  const answer =
    textarea.value.trim();


  if (!answer) {

    showToast(
      "Önce cevabını yazmalısın ❤️"
    );

    textarea.focus();

    return;

  }


  const button =
    document.querySelector(
      `.save-btn[data-question-id="${questionId}"]`
    );


  if (!button)
    return;


  const originalText =
    button.textContent;


  button.disabled = true;

  button.textContent =
    "Kaydediliyor...";


  const {
    error
  } =
    await supabaseClient
      .from("answers")
      .upsert(
        {
          user_id:
            currentUser.id,

          question_id:
            questionId,

          year:
            CURRENT_YEAR,

          answer:
            answer
        },
        {
          onConflict:
            "user_id,question_id,year"
        }
      );


  if (error) {

    console.error(
      "CEVAP KAYIT HATASI:",
      error
    );


    showToast(
      "Cevap kaydedilemedi."
    );


    button.disabled = false;

    button.textContent =
      originalText;

    return;

  }


  showToast(
    "Cevabın kaydedildi ❤️"
  );


  await loadAnswers();

  renderQuestions();

  updateStats();

}



/* =====================================================
   KENDİ CEVABINI BUL
===================================================== */

function getMyAnswer(
  questionId
) {

  if (!currentUser)
    return null;


  return (
    answers.find(
      answer =>

        String(
          answer.user_id
        ) ===
        String(
          currentUser.id
        ) &&

        String(
          answer.question_id
        ) ===
        String(
          questionId
        ) &&

        Number(
          answer.year
        ) ===
        Number(
          CURRENT_YEAR
        )
    ) ||
    null
  );

}



/* =====================================================
   PARTNER CEVABI
===================================================== */

function getPartnerAnswer(
  questionId
) {

  if (!currentUser)
    return null;


  return (
    answers.find(
      answer =>

        String(
          answer.user_id
        ) !==
        String(
          currentUser.id
        ) &&

        String(
          answer.question_id
        ) ===
        String(
          questionId
        ) &&

        Number(
          answer.year
        ) ===
        Number(
          CURRENT_YEAR
        )
    ) ||
    null
  );

}



/* =====================================================
   İSTATİSTİKLER
===================================================== */

function updateStats() {

  const answered =
    questions.filter(
      question =>
        getMyAnswer(
          question.id
        )
    ).length;


  const total =
    questions.length;


  const percentage =
    total === 0
      ? 0
      : Math.round(
          (
            answered /
            total
          ) * 100
        );


  answeredCount.textContent =
    answered;


  totalCount.textContent =
    total;


  progressText.textContent =
    `${percentage}%`;


  progressFill.style.width =
    `${percentage}%`;

}



/* =====================================================
   FİLTRELER
===================================================== */

function setupFilters() {

  document
    .querySelectorAll(".filter-btn")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(
              ".filter-btn"
            )
            .forEach(btn =>
              btn.classList.remove(
                "active"
              )
            );


          button.classList.add(
            "active"
          );


          currentFilter =
            button.dataset.filter;


          renderQuestions();

        }
      );

    });

}



/* =====================================================
   KALDIĞIM YERDEN DEVAM ET
===================================================== */

function continueFromWhereLeft() {

  if (!currentUser) {

    showToast(
      "Önce giriş yapmalısın."
    );

    return;

  }


  const firstUnanswered =
    questions.find(
      question =>
        !getMyAnswer(
          question.id
        )
    );


  if (firstUnanswered) {

    const element =
      document.getElementById(
        `answer-${firstUnanswered.id}`
      );


    if (element) {

      element.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });


      setTimeout(
        () =>
          element.focus(),
        500
      );

    }

    return;

  }


  document
    .getElementById(
      "questions"
    )
    .scrollIntoView({
      behavior: "smooth"
    });


  showToast(
    "Tüm soruları cevapladın! ❤️"
  );

}



/* =====================================================
   LOGOUT
===================================================== */

async function logout() {

  await supabaseClient.auth.signOut();


  currentUser = null;

  currentProfile = null;

  questions = [];

  answers = [];

  currentFilter = "all";


  appShell.classList.add(
    "hidden"
  );


  loginScreen.classList.remove(
    "hidden"
  );


  emailInput.value = "";

  passwordInput.value = "";

  loginError.textContent = "";


  setSelectedPerson(
    "gul"
  );


  /*
    Tüm filtreleri sıfırla.
  */

  document
    .querySelectorAll(
      ".filter-btn"
    )
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.filter === "all"
      );

    });


  showToast(
    "Çıkış yapıldı."
  );

}



/* =====================================================
   TOAST
===================================================== */

let toastTimer;


function showToast(
  message
) {

  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      2600
    );

}



/* =====================================================
   HTML GÜVENLİĞİ
===================================================== */

function escapeHtml(
  value
) {

  return String(value)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}



/* =====================================================
   AUTH DEĞİŞİKLİĞİ
===================================================== */

supabaseClient.auth.onAuthStateChange(
  (event, session) => {

    console.log(
      "Auth event:",
      event
    );


    /*
      SIGNED_OUT durumunda login ekranı.
    */

    if (
      event ===
      "SIGNED_OUT"
    ) {

      currentUser = null;

      currentProfile = null;

      questions = [];

      answers = [];


      showLogin();

    }


    /*
      Burada SIGNED_IN olduğunda
      tekrar enterApplication çağırmıyoruz.

      Çünkü login() ve init() zaten bunu yapıyor.
      Böylece iki kere veri yükleme
      ve yarış koşulu oluşmuyor.
    */

  }
);
