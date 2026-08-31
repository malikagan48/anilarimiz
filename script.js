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

/*
  Varsayılan kişi Gül.
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

const logoutBtn =
  document.getElementById("logoutBtn");


/* =====================================================
   BAŞLANGIÇ
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  init
);


async function init() {

  /*
    Başlangıçta güvenli olarak
    sadece login ekranını göster.
  */

  loginScreen.classList.remove(
    "hidden"
  );

  appShell.classList.add(
    "hidden"
  );


  document.getElementById(
    "heroYear"
  ).textContent =
    CURRENT_YEAR;


  document.getElementById(
    "yearDisplay"
  ).textContent =
    CURRENT_YEAR;


  setupPersonButtons();

  setupFilters();


  loginBtn.addEventListener(
    "click",
    login
  );


  passwordInput.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter"
      ) {

        login();

      }

    }
  );


  logoutBtn.addEventListener(
    "click",
    logout
  );


  continueBtn.addEventListener(
    "click",
    continueFromWhereLeft
  );


  /*
    Supabase mevcut oturumu kontrol eder.
  */

  const {
    data: {
      session
    }
  } =
    await supabaseClient.auth.getSession();


  if (session) {

    currentUser =
      session.user;

    await enterApplication();

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


  if (!buttons.length) {
    return;
  }


  /*
    Her iki butona da tıklama olayını
    doğrudan bağlıyoruz.
  */

  buttons.forEach(
    button => {

      button.addEventListener(
        "click",
        function (event) {

          event.preventDefault();
          event.stopPropagation();


          /*
            Tüm butonlardan active kaldır.
          */

          buttons.forEach(
            btn => {

              btn.classList.remove(
                "active"
              );

            }
          );


          /*
            Tıklanan butonu aktif yap.
          */

          this.classList.add(
            "active"
          );


          /*
            Seçilen kişiyi kaydet.
          */

          selectedPerson =
            this.dataset.person;


          updateLoginButton();


          console.log(
            "Seçilen kişi:",
            selectedPerson
          );

        }
      );

    }
  );


  /*
    Başlangıçta Gül seçili.
  */

  selectPerson(
    "gul"
  );

}


/* =====================================================
   KİŞİ SEÇ
===================================================== */

function selectPerson(person) {

  const buttons =
    document.querySelectorAll(
      ".person-btn"
    );


  selectedPerson =
    person;


  buttons.forEach(
    button => {

      const isSelected =
        button.dataset.person ===
        person;


      button.classList.toggle(
        "active",
        isSelected
      );

    }
  );


  updateLoginButton();

}


/* =====================================================
   GİRİŞ BUTONU YAZISI
===================================================== */

function updateLoginButton() {

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

  loginError.textContent =
    "";


  const email =
    emailInput.value.trim();


  const password =
    passwordInput.value;


  if (!email || !password) {

    loginError.textContent =
      "E-posta ve şifre alanlarını doldurmalısın.";

    return;

  }


  loginBtn.disabled =
    true;


  loginBtn.innerHTML =
    "Giriş yapılıyor...";


  const {
    data,
    error
  } =
    await supabaseClient.auth
      .signInWithPassword({

        email,
        password

      });


  if (error) {

    console.error(
      "Giriş hatası:",
      error
    );


    loginError.textContent =
      "E-posta veya şifre hatalı. Lütfen tekrar dene.";


    loginBtn.disabled =
      false;


    updateLoginButton();


    return;

  }


  currentUser =
    data.user;


  await enterApplication();

}


/* =====================================================
   UYGULAMAYA GİR
===================================================== */

async function enterApplication() {

  /*
    Giriş ekranını gizle.
  */

  loginScreen.classList.add(
    "hidden"
  );


  appShell.classList.remove(
    "hidden"
  );


  await loadProfile();

  await loadQuestions();

  await loadAnswers();


  /*
    Kullanıcının gerçek profil adına
    göre Gül / Kağan seçimini güncelle.
  */

  syncPersonWithProfile();


  renderQuestions();

  updateStats();

  updateUserInterface();

}


/* =====================================================
   PROFİL
===================================================== */

async function loadProfile() {

  if (!currentUser) {
    return;
  }


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
      .single();


  if (error) {

    console.error(
      "Profil hatası:",
      error
    );


    showToast(
      "Profil bilgisi alınamadı."
    );


    return;

  }


  currentProfile =
    data;

}


/* =====================================================
   PROFİLE GÖRE KİŞİ SEÇİMİ
===================================================== */

function syncPersonWithProfile() {

  if (!currentProfile) {
    return;
  }


  if (
    currentProfile.name === "Gül"
  ) {

    selectPerson(
      "gul"
    );

  } else {

    selectPerson(
      "kagan"
    );

  }

}


/* =====================================================
   SORULAR
===================================================== */

async function loadQuestions() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("questions")
      .select("*")
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
      "Soru hatası:",
      error
    );


    showToast(
      "Sorular yüklenemedi."
    );


    return;

  }


  questions =
    data || [];

}


/* =====================================================
   CEVAPLAR
===================================================== */

async function loadAnswers() {

  if (!currentUser) {
    return;
  }


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
      "Cevap hatası:",
      error
    );


    showToast(
      "Cevaplar yüklenemedi."
    );


    return;

  }


  answers =
    data || [];

}


/* =====================================================
   KULLANICI ARAYÜZÜ
===================================================== */

function updateUserInterface() {

  if (!currentProfile) {
    return;
  }


  const name =
    currentProfile.name;


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


  if (
    !visibleQuestions.length
  ) {

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
    .forEach(
      button => {

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

      }
    );

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


  if (!button) {
    return;
  }


  const originalText =
    button.textContent;


  button.disabled =
    true;


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
      "Cevap kayıt hatası:",
      error
    );


    showToast(
      "Cevap kaydedilemedi."
    );


    button.disabled =
      false;


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
   KENDİ CEVABI
===================================================== */

function getMyAnswer(
  questionId
) {

  if (!currentUser) {
    return null;
  }


  return (
    answers.find(
      answer =>

        answer.user_id ===
          currentUser.id &&

        answer.question_id ===
          questionId &&

        answer.year ===
          CURRENT_YEAR

    ) || null
  );

}


/* =====================================================
   PARTNER CEVABI
===================================================== */

function getPartnerAnswer(
  questionId
) {

  if (!currentUser) {
    return null;
  }


  return (
    answers.find(
      answer =>

        answer.user_id !==
          currentUser.id &&

        answer.question_id ===
          questionId &&

        answer.year ===
          CURRENT_YEAR

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
          (answered / total) * 100
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
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            document
              .querySelectorAll(
                ".filter-btn"
              )
              .forEach(
                btn =>
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

      }
    );

}


/* =====================================================
   KALDIĞIM YERDEN
===================================================== */

function continueFromWhereLeft() {

  if (!currentUser) {
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
        () => element.focus(),
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


  appShell.classList.add(
    "hidden"
  );


  loginScreen.classList.remove(
    "hidden"
  );


  emailInput.value = "";
  passwordInput.value = "";


  loginError.textContent =
    "";


  selectPerson(
    "gul"
  );


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
  async (
    event,
    session
  ) => {

    if (
      event ===
        "SIGNED_IN" &&
      session
    ) {

      currentUser =
        session.user;

    }


    if (
      event ===
        "SIGNED_OUT"
    ) {

      currentUser =
        null;

      currentProfile =
        null;


      appShell.classList.add(
        "hidden"
      );


      loginScreen.classList.remove(
        "hidden"
      );


      selectPerson(
        "gul"
      );

    }

  }
);
