const SUPABASE_URL =
  "https://nwvkauyoncedbetjridz.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_Rs6Nh2FBLVQHiBW_owiMyQ_2ax0VA-t";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
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
let selectedPerson = "gul";

let isLoadingApplication = false;


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

  console.log("=================================");
  console.log("GÜL & KAĞAN UYGULAMASI");
  console.log("BAŞLATILIYOR");
  console.log("=================================");

  showLoginScreen();

  setYear();

  setupPersonButtons();

  setupFilters();


  if (loginBtn) {
    loginBtn.addEventListener(
      "click",
      login
    );
  }


  if (passwordInput) {

    passwordInput.addEventListener(
      "keydown",
      event => {

        if (event.key === "Enter") {
          login();
        }

      }
    );

  }


  const logoutBtn =
    document.getElementById("logoutBtn");


  if (logoutBtn) {

    logoutBtn.addEventListener(
      "click",
      logout
    );

  }


  if (continueBtn) {

    continueBtn.addEventListener(
      "click",
      continueFromWhereLeft
    );

  }


  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth.getSession();


    if (error) {

      console.error(
        "Session kontrol hatası:",
        error
      );

      showLoginError(
        "Oturum kontrol edilemedi: " +
        error.message
      );

      return;

    }


    const session =
      data?.session;


    if (session) {

      console.log(
        "Mevcut session bulundu:",
        session.user.email
      );

      currentUser =
        session.user;

      await loadApplication();

    } else {

      showLoginScreen();

    }

  } catch (error) {

    console.error(
      "Başlangıç hatası:",
      error
    );

    showLoginError(
      "Başlangıç hatası: " +
      error.message
    );

  }

}


/* =====================================================
   YIL
===================================================== */

function setYear() {

  const heroYear =
    document.getElementById("heroYear");

  const yearDisplay =
    document.getElementById("yearDisplay");


  if (heroYear) {
    heroYear.textContent =
      CURRENT_YEAR;
  }


  if (yearDisplay) {
    yearDisplay.textContent =
      CURRENT_YEAR;
  }

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
      function () {

        buttons.forEach(btn => {

          btn.classList.remove(
            "active"
          );

        });


        this.classList.add(
          "active"
        );


        selectedPerson =
          this.dataset.person;


        updateLoginButton();

        clearLoginError();

      }
    );

  });


  const gulButton =
    document.querySelector(
      '.person-btn[data-person="gul"]'
    );


  if (gulButton) {

    buttons.forEach(btn =>
      btn.classList.remove("active")
    );

    gulButton.classList.add("active");

  }


  updateLoginButton();

}


/* =====================================================
   LOGIN BUTONU
===================================================== */

function updateLoginButton() {

  if (!loginBtn)
    return;


  const name =
    selectedPerson === "gul"
      ? "Gül"
      : "Kağan";


  loginBtn.innerHTML =
    `${name} olarak giriş yap <span>→</span>`;

}


/* =====================================================
   LOGIN
===================================================== */

async function login() {

  if (!loginBtn)
    return;


  clearLoginError();


  const email =
    emailInput
      ? emailInput.value.trim()
      : "";


  const password =
    passwordInput
      ? passwordInput.value
      : "";


  if (!email || !password) {

    showLoginError(
      "E-posta ve şifre alanlarını doldurmalısın."
    );

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
        "SUPABASE LOGIN HATASI:",
        error
      );


      showLoginError(
        "Giriş başarısız: " +
        error.message
      );


      loginBtn.disabled = false;

      updateLoginButton();

      return;

    }


    if (!data?.user) {

      showLoginError(
        "Giriş başarılı görünüyor fakat kullanıcı bilgisi alınamadı."
      );


      loginBtn.disabled = false;

      updateLoginButton();

      return;

    }


    currentUser =
      data.user;


    console.log(
      "GİRİŞ BAŞARILI:",
      currentUser.id,
      currentUser.email
    );


    const result =
      await loadApplication();


    if (!result) {

      await supabaseClient.auth.signOut();

    }

  } catch (error) {

    console.error(
      "LOGIN EXCEPTION:",
      error
    );


    showLoginError(
      "Beklenmeyen giriş hatası: " +
      error.message
    );

  } finally {

    loginBtn.disabled = false;

    updateLoginButton();

  }

}


/* =====================================================
   UYGULAMAYI YÜKLE
===================================================== */

async function loadApplication() {

  if (!currentUser)
    return false;


  if (isLoadingApplication)
    return false;


  isLoadingApplication = true;


  try {

    /*
      Profil yüklenmeden sorular kesinlikle
      uygulama ekranında gösterilmiyor.
    */

    const profileResult =
      await loadProfile();


    if (!profileResult.success) {

      showLoginScreen();

      showLoginError(
        profileResult.message
      );

      return false;

    }


    /*
      Seçilen Gül / Kağan ile gerçek profil
      aynı kişi mi kontrol ediyoruz.
    */

    const profileName =
      normalizePersonName(
        currentProfile?.name
      );


    const selectedName =
      selectedPerson === "gul"
        ? "gul"
        : "kagan";


    if (
      profileName &&
      profileName !== selectedName
    ) {

      await supabaseClient.auth.signOut();

      showLoginScreen();

      showLoginError(
        `Bu hesap ${currentProfile?.name || "başka bir kullanıcı"} hesabı. Lütfen giriş ekranında doğru kişiyi seç.`
      );

      return false;

    }


    /*
      Sorular
    */

    const questionResult =
      await loadQuestions();


    if (!questionResult.success) {

      showLoginScreen();

      showLoginError(
        questionResult.message
      );

      return false;

    }


    /*
      Cevaplar
    */

    const answerResult =
      await loadAnswers();


    if (!answerResult.success) {

      console.error(
        "Cevaplar yüklenemedi:",
        answerResult.message
      );

      answers = [];

    }


    /*
      Artık uygulamayı gösteriyoruz.
    */

    loginScreen.classList.add(
      "hidden"
    );

    appShell.classList.remove(
      "hidden"
    );


    renderQuestions();

    updateStats();

    updateUserInterface();


    return true;

  } catch (error) {

    console.error(
      "UYGULAMA YÜKLEME HATASI:",
      error
    );


    showLoginScreen();

    showLoginError(
      "Uygulama yüklenemedi: " +
      error.message
    );


    return false;

  } finally {

    isLoadingApplication = false;

  }

}


/* =====================================================
   PROFİL
===================================================== */

async function loadProfile() {

  if (!currentUser) {

    return {
      success: false,
      message: "Aktif kullanıcı bulunamadı."
    };

  }


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("profiles")
        .select("*")
        .eq(
          "id",
          currentUser.id
        )
        .maybeSingle();


    if (error) {

      console.error(
        "PROFİL HATASI:",
        error
      );


      return {

        success: false,

        message:
          `Profil yüklenemedi.

Supabase hatası:
${error.message}

Kod:
${error.code || "yok"}

Detay:
${error.details || "yok"}

Hint:
${error.hint || "yok"}`

      };

    }


    if (!data) {

      return {

        success: false,

        message:
          `Bu hesabın profil bilgisi bulunamadı.

Giriş yapan User ID:
${currentUser.id}

profiles tablosundaki id ile
auth.users id aynı olmalıdır.`

      };

    }


    currentProfile =
      data;


    console.log(
      "PROFİL:",
      currentProfile
    );


    return {

      success: true,
      data

    };

  } catch (error) {

    console.error(
      "Profil exception:",
      error
    );


    return {

      success: false,

      message:
        error.message

    };

  }

}


/* =====================================================
   PROFİL İSİM NORMALİZASYONU
===================================================== */

function normalizePersonName(name) {

  if (!name)
    return "";


  const value =
    String(name)
      .trim()
      .toLocaleLowerCase("tr-TR");


  if (
    value.includes("gül") ||
    value.includes("gul")
  ) {

    return "gul";

  }


  if (
    value.includes("kağan") ||
    value.includes("kagan")
  ) {

    return "kagan";

  }


  return value;

}


/* =====================================================
   SORULAR
===================================================== */

async function loadQuestions() {

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("questions")
        .select(
          "id, question, sort_order, active"
        )
        .eq(
          "active",
          true
        )
        .order(
          "sort_order",
          {
            ascending: true
          }
        );


    if (error) {

      console.error(
        "SORULAR HATASI:",
        error
      );


      return {

        success: false,

        message:
          `Sorular yüklenemedi.

${error.message}

Kod:
${error.code || "yok"}`

      };

    }


    questions =
      data || [];


    console.log(
      "SORU SAYISI:",
      questions.length
    );


    return {

      success: true,
      data: questions

    };

  } catch (error) {

    console.error(
      "Sorular exception:",
      error
    );


    return {

      success: false,
      message: error.message

    };

  }

}


/* =====================================================
   CEVAPLAR
===================================================== */

async function loadAnswers() {

  if (!currentUser) {

    return {

      success: false,

      message:
        "Kullanıcı bulunamadı."

    };

  }


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("answers")
        .select(
          "id, user_id, question_id, year, answer, updated_at"
        )
        .eq(
          "year",
          CURRENT_YEAR
        );


    if (error) {

      console.error(
        "CEVAPLAR HATASI:",
        error
      );


      return {

        success: false,

        message:
          `Cevaplar yüklenemedi.

${error.message}

Kod:
${error.code || "yok"}`

      };

    }


    answers =
      data || [];


    console.log(
      "CEVAP SAYISI:",
      answers.length
    );


    return {

      success: true,
      data: answers

    };

  } catch (error) {

    console.error(
      "Cevap exception:",
      error
    );


    return {

      success: false,
      message: error.message

    };

  }

}


/* =====================================================
   KULLANICI ARAYÜZÜ
===================================================== */

function updateUserInterface() {

  if (!currentProfile)
    return;


  const name =
    currentProfile.name ||
    currentUser?.email ||
    "Kullanıcı";


  if (welcomeUser) {

    welcomeUser.textContent =
      `${name} olarak giriş yaptın`;

  }


  if (currentPersonName) {

    currentPersonName.textContent =
      name;

  }


  setYear();

}


/* =====================================================
   SORULARI ÇİZ
===================================================== */

function renderQuestions() {

  if (!questionList)
    return;


  let visibleQuestions =
    [...questions];


  if (
    currentFilter === "answered"
  ) {

    visibleQuestions =
      visibleQuestions.filter(
        question =>
          !!getMyAnswer(
            question.id
          )
      );

  }


  if (
    currentFilter === "unanswered"
  ) {

    visibleQuestions =
      visibleQuestions.filter(
        question =>
          !getMyAnswer(
            question.id
          )
      );

  }


  if (
    !visibleQuestions.length
  ) {

    questionList.innerHTML = `

      <div class="empty">

        <div style="
          font-size:40px;
          margin-bottom:10px;
        ">
          ♡
        </div>

        ${
          questions.length === 0
            ? `
              <strong>
                Henüz soru bulunamadı.
              </strong>

              <p style="
                margin-top:10px;
                font-size:12px;
              ">
                Supabase'de questions tablosunu
                kontrol et.
              </p>
            `
            : `
              Bu filtrede gösterilecek soru yok.
            `
        }

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
    normalizePersonName(
      currentProfile?.name
    ) === "gul"
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
                ♥ ${escapeHtml(partnerName)}'ın cevabı
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
   CEVAP KAYDET / GÜNCELLE
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


  if (!textarea)
    return;


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


  button.disabled = true;

  button.textContent =
    "Kaydediliyor...";


  try {

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
        "Cevap kaydedilemedi: " +
        error.message
      );


      button.disabled = false;

      button.textContent =
        "Cevabı kaydet";

      return;

    }


    showToast(
      "Cevabın kaydedildi ❤️"
    );


    await loadAnswers();

    renderQuestions();

    updateStats();


  } catch (error) {

    console.error(
      "Cevap exception:",
      error
    );


    showToast(
      "Cevap kaydedilemedi: " +
      error.message
    );


    button.disabled = false;

    button.textContent =
      "Cevabı kaydet";

  }

}


/* =====================================================
   KENDİ CEVABIN
===================================================== */

function getMyAnswer(
  questionId
) {

  if (!currentUser)
    return null;


  return (
    answers.find(
      answer =>

        answer.user_id ===
          currentUser.id &&

        Number(answer.question_id) ===
          Number(questionId) &&

        Number(answer.year) ===
          Number(CURRENT_YEAR)

    ) || null
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

        answer.user_id !==
          currentUser.id &&

        Number(answer.question_id) ===
          Number(questionId) &&

        Number(answer.year) ===
          Number(CURRENT_YEAR)

    ) || null
  );

}


/* =====================================================
   İSTATİSTİKLER
===================================================== */

function updateStats() {

  const answered =
    questions.filter(
      question =>
        !!getMyAnswer(
          question.id
        )
    ).length;


  const total =
    questions.length;


  const percentage =
    total === 0
      ? 0
      : Math.round(
          (answered / total) * 100
        );


  if (answeredCount) {

    answeredCount.textContent =
      answered;

  }


  if (totalCount) {

    totalCount.textContent =
      total;

  }


  if (progressText) {

    progressText.textContent =
      `${percentage}%`;

  }


  if (progressFill) {

    progressFill.style.width =
      `${percentage}%`;

  }

}


/* =====================================================
   FİLTRELER
===================================================== */

function setupFilters() {

  document
    .querySelectorAll(
      ".filter-btn"
    )
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
   KALDIĞIM YERDEN DEVAM
===================================================== */

function continueFromWhereLeft() {

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
        () => element.focus(),
        500
      );

    }

    return;

  }


  const questionsSection =
    document.getElementById(
      "questions"
    );


  if (questionsSection) {

    questionsSection.scrollIntoView({

      behavior: "smooth"

    });

  }


  showToast(
    "Tüm soruları cevapladın! ❤️"
  );

}


/* =====================================================
   LOGIN EKRANI
===================================================== */

function showLoginScreen() {

  if (loginScreen) {

    loginScreen.classList.remove(
      "hidden"
    );

  }


  if (appShell) {

    appShell.classList.add(
      "hidden"
    );

  }


  currentUser = null;

  currentProfile = null;

  questions = [];

  answers = [];

  isLoadingApplication = false;


  clearLoginError();

}


/* =====================================================
   LOGIN HATASI
===================================================== */

function showLoginError(
  message
) {

  if (!loginError)
    return;


  loginError.textContent =
    message;

}


function clearLoginError() {

  if (loginError) {

    loginError.textContent =
      "";

  }

}


/* =====================================================
   LOGOUT
===================================================== */

async function logout() {

  try {

    const {
      error
    } =
      await supabaseClient.auth.signOut();


    if (error) {

      console.error(
        "Logout hatası:",
        error
      );

      showToast(
        "Çıkış yapılamadı: " +
        error.message
      );

      return;

    }


    currentUser = null;

    currentProfile = null;

    questions = [];

    answers = [];


    showLoginScreen();


    if (emailInput) {
      emailInput.value = "";
    }


    if (passwordInput) {
      passwordInput.value = "";
    }


    showToast(
      "Çıkış yapıldı."
    );

  } catch (error) {

    console.error(
      "Logout exception:",
      error
    );

  }

}


/* =====================================================
   TOAST
===================================================== */

let toastTimer;


function showToast(
  message
) {

  if (!toast)
    return;


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
      3000
    );

}


/* =====================================================
   HTML GÜVENLİĞİ
===================================================== */

function escapeHtml(
  value
) {

  return String(
    value ?? ""
  )

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
   AUTH DEĞİŞİKLİKLERİ
===================================================== */

supabaseClient.auth.onAuthStateChange(
  (event, session) => {

    console.log(
      "AUTH EVENT:",
      event
    );


    if (
      event === "SIGNED_OUT"
    ) {

      currentUser = null;

      currentProfile = null;

      questions = [];

      answers = [];


      if (
        !isLoadingApplication
      ) {

        showLoginScreen();

      }

    }

  }
);
