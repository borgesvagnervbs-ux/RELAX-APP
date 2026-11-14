// user.js - Cliente com Autenticação completa, CPF, CEP e Data de Nascimento

// Elementos da UI
const loginScreen = document.getElementById('loginScreen');
const mainScreen = document.getElementById('mainScreen');
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const completeProfileModal = document.getElementById('completeProfileModal');
const sidebarUser = document.getElementById('sidebarUser');
const mainContent = document.getElementById('mainContent');
const selTypes = document.getElementById('massageType');
const priceDisplay = document.getElementById('priceDisplay');
const note = document.getElementById('note');
const calendarClient = document.getElementById('calendarClient');
const timeSlotsSection = document.getElementById('timeSlotsSection');
const timeSlotsList = document.getElementById('timeSlotsList');
const btnBook = document.getElementById('btnBook');
const greeting = document.getElementById('greeting');
const sidebarUserName = document.getElementById('sidebarUserName');
const sidebarUserEmail = document.getElementById('sidebarUserEmail');
const profileName = document.getElementById('profileName');
const profileCpf = document.getElementById('profileCpf');
const profileBirthdate = document.getElementById('profileBirthdate');
const profilePhone = document.getElementById('profilePhone');
const profileEmail = document.getElementById('profileEmail');
const profileCep = document.getElementById('profileCep');
const profileStreet = document.getElementById('profileStreet');
const profileNumber = document.getElementById('profileNumber');
const profileComplement = document.getElementById('profileComplement');
const profileNeighborhood = document.getElementById('profileNeighborhood');
const profileCity = document.getElementById('profileCity');
const profileState = document.getElementById('profileState');
const upcomingList = document.getElementById('upcomingList');
const emptyUpcoming = document.getElementById('emptyUpcoming');
const historyList = document.getElementById('historyList');
const emptyHistory = document.getElementById('emptyHistory');

// State
let allTypes = [];
let allAppointments = [];
let currentUser = null;
let userProfile = null;
let unsubscribeTypes = null;
let unsubscribeAppointments = null;
let selectedDate = null;
let selectedHour = null;
let selectedMinute = 0;
let currentMonth = new Date();
currentMonth.setDate(1);
let scheduleConfig = null;          // configuração de horários definida no painel admin
let isRegistering = false;          // evita abrir "Complete seu cadastro" durante o registro por email
let timeSlotsRenderToken = 0;       // descarta carregamentos de horários antigos
let isBooking = false;              // evita agendamento duplicado por clique duplo

// Frases motivacionais
const motivationalQuotes = [
  { text: "A paz vem de dentro. Não a procure fora.", author: "Buda" },
  { text: "Cuide do seu corpo. É o único lugar que você tem para viver.", author: "Jim Rohn" },
  { text: "O relaxamento é essencial para a mente criativa.", author: "Anaïs Nin" },
  { text: "Às vezes, a coisa mais produtiva que você pode fazer é relaxar.", author: "Mark Black" },
  { text: "O descanso não é um luxo, é uma necessidade.", author: "Arianna Huffington" },
  { text: "Tire um tempo para fazer sua alma feliz.", author: "Provérbio" },
  { text: "Sua saúde mental é uma prioridade. Sua felicidade é essencial.", author: "Anônimo" },
  { text: "Respire. Deixe ir. E lembre-se de que este momento é o único que você tem com certeza.", author: "Oprah Winfrey" },
  { text: "Quase tudo funcionará novamente se você desconectar por alguns minutos.", author: "Anne Lamott" },
  { text: "O autocuidado é dar ao mundo o melhor de você, não o que sobrou de você.", author: "Katie Reed" }
];

// ====================
// MÁSCARAS E VALIDAÇÕES
// ====================

function maskPhone(value) {
  value = value.replace(/\D/g, '');
  if (value.length <= 10) {
    value = value.replace(/(\d{2})(\d)/, '($1) $2');
    value = value.replace(/(\d{4})(\d)/, '$1-$2');
  } else {
    value = value.replace(/(\d{2})(\d)/, '($1) $2');
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
  }
  return value;
}

function unmaskPhone(value) {
  return value.replace(/\D/g, '');
}

function maskCpf(value) {
  value = value.replace(/\D/g, '');
  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  return value;
}

function unmaskCpf(value) {
  return value.replace(/\D/g, '');
}

function validateCpf(cpf) {
  cpf = unmaskCpf(cpf);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(9))) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i);
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(10))) return false;
  return true;
}

function maskDate(value) {
  value = value.replace(/\D/g, '');
  value = value.replace(/(\d{2})(\d)/, '$1/$2');
  value = value.replace(/(\d{2})(\d)/, '$1/$2');
  return value;
}

function validateDate(dateStr) {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return false;
  const day = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  const year = parseInt(parts[2]);
  if (year < 1900 || year > new Date().getFullYear()) return false;
  if (month < 1 || month > 12) return false;
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) return false;
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (age < 18 || (age === 18 && monthDiff < 0) || (age === 18 && monthDiff === 0 && today.getDate() < birthDate.getDate())) return false;
  return true;
}

function maskCep(value) {
  value = value.replace(/\D/g, '');
  value = value.replace(/(\d{5})(\d)/, '$1-$2');
  return value;
}

function unmaskCep(value) {
  return value.replace(/\D/g, '');
}

// Escapa texto antes de inserir via innerHTML
function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Aplicar máscaras
document.getElementById('registerPhone').addEventListener('input', function() { this.value = maskPhone(this.value); });
document.getElementById('registerCpf').addEventListener('input', function() { this.value = maskCpf(this.value); });
document.getElementById('registerBirthdate').addEventListener('input', function() { this.value = maskDate(this.value); });
document.getElementById('registerCep').addEventListener('input', function() { this.value = maskCep(this.value); });
profilePhone.addEventListener('input', function() { this.value = maskPhone(this.value); });
profileCpf.addEventListener('input', function() { this.value = maskCpf(this.value); });
profileBirthdate.addEventListener('input', function() { this.value = maskDate(this.value); });
profileCep.addEventListener('input', function() { this.value = maskCep(this.value); });
document.getElementById('completeCpf').addEventListener('input', function() { this.value = maskCpf(this.value); });
document.getElementById('completeBirthdate').addEventListener('input', function() { this.value = maskDate(this.value); });
document.getElementById('completePhone').addEventListener('input', function() { this.value = maskPhone(this.value); });
document.getElementById('completeCep').addEventListener('input', function() { this.value = maskCep(this.value); });

// ====================
// BUSCAR CEP
// ====================

async function searchCep() {
  const cep = unmaskCep(document.getElementById('registerCep').value);
  if (cep.length !== 8) { alert('CEP inválido. Digite um CEP com 8 dígitos.'); return; }
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();
    if (data.erro) { alert('CEP não encontrado.'); return; }
    document.getElementById('registerStreet').value = data.logradouro || '';
    document.getElementById('registerNeighborhood').value = data.bairro || '';
    document.getElementById('registerCity').value = data.localidade || '';
    document.getElementById('registerState').value = data.uf || '';
    document.getElementById('registerNumber').focus();
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    alert('Erro ao buscar CEP. Tente novamente.');
  }
}

async function searchCepComplete() {
  const cep = unmaskCep(document.getElementById('completeCep').value);
  if (cep.length !== 8) { alert('CEP inválido. Digite um CEP com 8 dígitos.'); return; }
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();
    if (data.erro) { alert('CEP não encontrado.'); return; }
    document.getElementById('completeStreet').value = data.logradouro || '';
    document.getElementById('completeNeighborhood').value = data.bairro || '';
    document.getElementById('completeCity').value = data.localidade || '';
    document.getElementById('completeState').value = data.uf || '';
    document.getElementById('completeNumber').focus();
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    alert('Erro ao buscar CEP. Tente novamente.');
  }
}

async function searchCepProfile() {
  const cep = unmaskCep(profileCep.value);
  if (cep.length !== 8) { alert('CEP inválido. Digite um CEP com 8 dígitos.'); return; }
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();
    if (data.erro) { alert('CEP não encontrado.'); return; }
    profileStreet.value = data.logradouro || '';
    profileNeighborhood.value = data.bairro || '';
    profileCity.value = data.localidade || '';
    profileState.value = data.uf || '';
    profileNumber.focus();
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    alert('Erro ao buscar CEP. Tente novamente.');
  }
}

// ====================
// TABS DE AUTENTICAÇÃO
// ====================

function showLoginTab() {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelector('.auth-tab[data-tab="login"]').classList.add('active');
  loginTab.classList.add('active');
  registerTab.classList.remove('active');
}

function showRegisterTab() {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelector('.auth-tab[data-tab="register"]').classList.add('active');
  registerTab.classList.add('active');
  loginTab.classList.remove('active');
}

document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const tabName = tab.dataset.tab;
    document.querySelectorAll('.auth-tab-content').forEach(content => content.classList.remove('active'));
    if (tabName === 'login') {
      loginTab.classList.add('active');
    } else {
      registerTab.classList.add('active');
    }
  });
});

// ====================
// FUNÇÕES DE AUTENTICAÇÃO
// ====================

async function loginWithEmail() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  if (!email || !password) { alert('Preencha email e senha'); return; }
  try {
    await loginUser(email, password);
    // O resto é tratado pelo onAuthChange
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    let message = 'Erro ao fazer login';
    if (error.code === 'auth/user-not-found') message = 'Usuário não encontrado';
    else if (error.code === 'auth/wrong-password') message = 'Senha incorreta';
    else if (error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-login-credentials') message = 'Email ou senha incorretos';
    else if (error.code === 'auth/invalid-email') message = 'Email inválido';
    else if (error.code === 'auth/too-many-requests') message = 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
    else if (error.code === 'auth/network-request-failed') message = 'Sem conexão com a internet';
    alert(message);
  }
}

async function registerWithEmail() {
  const name = document.getElementById('registerName').value.trim();
  const cpf = document.getElementById('registerCpf').value.trim();
  const birthdate = document.getElementById('registerBirthdate').value.trim();
  const phone = document.getElementById('registerPhone').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  
  if (!name) { alert('Preencha seu nome completo'); return; }
  if (!cpf) { alert('Preencha seu CPF'); return; }
  if (!validateCpf(cpf)) { alert('CPF inválido. Verifique e tente novamente.'); return; }
  if (!birthdate) { alert('Preencha sua data de nascimento'); return; }
  if (!validateDate(birthdate)) { alert('Data de nascimento inválida ou você precisa ter mais de 18 anos.'); return; }
  if (!phone) { alert('Preencha seu telefone'); return; }
  const phoneNumbers = unmaskPhone(phone);
  if (phoneNumbers.length < 10) { alert('Telefone inválido. Digite um número completo com DDD.'); return; }
  
  const cep = document.getElementById('registerCep').value.trim();
  const street = document.getElementById('registerStreet').value.trim();
  const number = document.getElementById('registerNumber').value.trim();
  const neighborhood = document.getElementById('registerNeighborhood').value.trim();
  const city = document.getElementById('registerCity').value.trim();
  const state = document.getElementById('registerState').value.trim();
  
  if (!cep || !street || !number || !neighborhood || !city || !state) {
    alert('Preencha todos os campos de endereço obrigatórios.');
    return;
  }
  if (unmaskCep(cep).length !== 8) { alert('CEP inválido.'); return; }
  if (!email) { alert('Preencha seu email'); return; }
  if (!password || password.length < 6) { alert('Senha deve ter no mínimo 6 caracteres'); return; }
  
  try {
    const additionalData = {
      cpf: unmaskCpf(cpf),
      birthdate,
      address: {
        cep: unmaskCep(cep),
        street,
        number,
        complement: document.getElementById('registerComplement').value.trim(),
        neighborhood,
        city,
        state: state.toUpperCase()
      }
    };
    
    // Enquanto o perfil é gravado, o listener de login aguarda (senão abriria "Complete seu cadastro")
    isRegistering = true;
    const newUser = await registerUser(email, password, name, phone, additionalData);
    isRegistering = false;
    alert('✅ Conta criada com sucesso!');
    await handleAuthenticatedUser(newUser);
  } catch (error) {
    isRegistering = false;
    console.error('Erro ao registrar:', error);
    let message = 'Erro ao criar conta';
    if (error.code === 'auth/email-already-in-use') message = 'Este email já está em uso';
    else if (error.code === 'auth/invalid-email') message = 'Email inválido';
    else if (error.code === 'auth/weak-password') message = 'Senha muito fraca';
    alert(message);
    // Se a conta foi criada mas o perfil não foi salvo, o usuário completa o cadastro
    if (auth.currentUser) await handleAuthenticatedUser(auth.currentUser);
  }
}

async function loginWithGoogle() {
  try {
    await loginWithGoogleProvider();
    // O resto é tratado pelo onAuthChange
  } catch (error) {
    console.error('Erro ao fazer login com Google:', error);
    if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
      alert('Erro ao fazer login com Google. Tente novamente.');
    }
  }
}

async function completeProfile() {
  const name = document.getElementById('completeName').value.trim();
  const cpf = document.getElementById('completeCpf').value.trim();
  const birthdate = document.getElementById('completeBirthdate').value.trim();
  const phone = document.getElementById('completePhone').value.trim();
  
  if (!name) { alert('Preencha seu nome completo'); return; }
  if (!cpf) { alert('Preencha seu CPF'); return; }
  if (!validateCpf(cpf)) { alert('CPF inválido. Verifique e tente novamente.'); return; }
  if (!birthdate) { alert('Preencha sua data de nascimento'); return; }
  if (!validateDate(birthdate)) { alert('Data de nascimento inválida ou você precisa ter mais de 18 anos.'); return; }
  if (!phone) { alert('Preencha seu telefone'); return; }
  const phoneNumbers = unmaskPhone(phone);
  if (phoneNumbers.length < 10) { alert('Telefone inválido. Digite um número completo com DDD.'); return; }
  
  const cep = document.getElementById('completeCep').value.trim();
  const street = document.getElementById('completeStreet').value.trim();
  const number = document.getElementById('completeNumber').value.trim();
  const neighborhood = document.getElementById('completeNeighborhood').value.trim();
  const city = document.getElementById('completeCity').value.trim();
  const state = document.getElementById('completeState').value.trim();
  
  if (!cep || !street || !number || !neighborhood || !city || !state) {
    alert('Preencha todos os campos de endereço obrigatórios.');
    return;
  }
  if (unmaskCep(cep).length !== 8) { alert('CEP inválido.'); return; }
  
  try {
    const userData = {
      name,
      cpf: unmaskCpf(cpf),
      birthdate,
      phone,
      address: {
        cep: unmaskCep(cep),
        street,
        number,
        complement: document.getElementById('completeComplement').value.trim(),
        neighborhood,
        city,
        state: state.toUpperCase()
      }
    };
    
    await updateUserProfile(currentUser.uid, userData);
    
    // Atualizar o perfil local
    userProfile = { ...(userProfile || {}), email: (userProfile && userProfile.email) || currentUser.email || '', ...userData };
    
    // Fechar modal e inicializar app
    completeProfileModal.classList.add('hidden');
    await initializeApp();
    
    alert('✅ Cadastro completado com sucesso!');
  } catch (error) {
    console.error('Erro ao completar perfil:', error);
    alert('Erro ao salvar dados. Tente novamente.');
  }
}

async function logout() {
  if (confirm('Deseja sair da sua conta?')) {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      alert('Erro ao sair da conta');
    }
  }
}

// ====================
// FUNÇÕES AUXILIARES
// ====================

function getStatusBadgeClass(status) {
  return `status-badge status-${String(status || 'PENDENTE').toLowerCase()}`;
}

function getStatusDisplay(status) {
  const displays = {
    'PENDENTE': { icon: '⏳', text: 'PENDENTE' },
    'CONFIRMADO': { icon: '✓', text: 'CONFIRMADO' },
    'REALIZADO': { icon: '✓', text: 'REALIZADO' },
    'CANCELADO': { icon: '✗', text: 'CANCELADO' }
  };
  return displays[status] || { icon: '', text: status };
}

// ====================
// MENU LATERAL
// ====================

function toggleSidebar() {
  sidebarUser.classList.toggle('open');
  mainContent.classList.toggle('shift');
}

document.querySelectorAll('.sb-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.sb-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    const tab = item.dataset.tab;
    openTab(tab);
    sidebarUser.classList.remove('open');
    mainContent.classList.remove('shift');
  });
});

function openTab(tab) {
  document.querySelectorAll('section[id^="tab-"]').forEach(section => section.classList.add('hidden'));
  const targetTab = document.getElementById(`tab-${tab}`);
  if (targetTab) targetTab.classList.remove('hidden');
  
  if (tab === 'home') loadHomeTab();
  else if (tab === 'booking') initBookingTab();
  else if (tab === 'upcoming') loadUpcomingAppointments();
  else if (tab === 'history') loadHistoryAppointments();
  else if (tab === 'profile') loadProfileTab();
}

async function initBookingTab() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  await loadScheduleConfig();
  await selectDate(today);
}

// ====================
// TELA INICIAL
// ====================

function getDailyQuote() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  return motivationalQuotes[dayOfYear % motivationalQuotes.length];
}

function loadHomeTab() {
  if (!currentUser) return;
  const quoteContainer = document.getElementById('dailyQuote');
  const lastSessionContainer = document.getElementById('lastSessionInfo');
  const nextSessionContainer = document.getElementById('nextSessionInfo');
  
  const quote = getDailyQuote();
  quoteContainer.innerHTML = `<div class="quote-text">"${quote.text}"</div><div class="quote-author">— ${quote.author}</div>`;
  
  const lastSession = allAppointments.filter(ap => ap.userId === currentUser.uid && ap.paid && ap.start < Date.now()).sort((a, b) => b.start - a.start)[0];
  if (lastSession) {
    const d = new Date(lastSession.start);
    lastSessionContainer.innerHTML = `<div class="session-type">${escapeHtml(lastSession.typeName)}</div><div class="session-date">📅 ${d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div><div class="session-time">🕐 ${d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div><div class="session-price">${formatMoney(lastSession.price)}</div>`;
  } else {
    lastSessionContainer.innerHTML = '<div class="no-session">Nenhuma sessão realizada ainda</div>';
  }
  
  const nextSession = allAppointments.filter(ap => ap.userId === currentUser.uid && ap.start > Date.now() && ap.status !== 'CANCELADO').sort((a, b) => a.start - b.start)[0];
  if (nextSession) {
    const d = new Date(nextSession.start);
    const statusDisplay = getStatusDisplay(nextSession.status);
    nextSessionContainer.innerHTML = `<div class="session-type">${escapeHtml(nextSession.typeName)}</div><div class="session-date">📅 ${d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div><div class="session-time">🕐 ${d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div><div class="session-price">${formatMoney(nextSession.price)}</div><div style="margin-top: 12px;"><span class="${getStatusBadgeClass(nextSession.status)}">${statusDisplay.icon} ${statusDisplay.text}</span></div>`;
  } else {
    nextSessionContainer.innerHTML = '<div class="no-session">Nenhuma sessão agendada</div><button class="btn btn-primary" onclick="openBookingTab()" style="margin-top: 16px; width: 100%;">Agendar Agora</button>';
  }
}

// Função para abrir a tela de agendamento
function openBookingTab() {
  // Ativar o item do menu lateral
  document.querySelectorAll('.sb-item').forEach(i => i.classList.remove('active'));
  document.querySelector('.sb-item[data-tab="booking"]').classList.add('active');
  
  // Abrir a tab de agendamento
  openTab('booking');
  
  // Scroll suave para o topo
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ====================
// PERFIL
// ====================

function loadProfileTab() {
  if (!userProfile) return;
  profileName.value = userProfile.name || '';
  profileCpf.value = userProfile.cpf ? maskCpf(userProfile.cpf) : '';
  profileBirthdate.value = userProfile.birthdate || '';
  profilePhone.value = userProfile.phone ? maskPhone(userProfile.phone) : '';
  profileEmail.value = userProfile.email || '';
  if (userProfile.address) {
    profileCep.value = userProfile.address.cep ? maskCep(userProfile.address.cep) : '';
    profileStreet.value = userProfile.address.street || '';
    profileNumber.value = userProfile.address.number || '';
    profileComplement.value = userProfile.address.complement || '';
    profileNeighborhood.value = userProfile.address.neighborhood || '';
    profileCity.value = userProfile.address.city || '';
    profileState.value = userProfile.address.state || '';
  }
}

async function saveProfile() {
  const name = profileName.value.trim();
  const cpf = profileCpf.value.trim();
  const birthdate = profileBirthdate.value.trim();
  const phone = profilePhone.value.trim();
  
  if (!name) { alert('Nome é obrigatório'); return; }
  if (!cpf) { alert('CPF é obrigatório'); return; }
  if (!validateCpf(cpf)) { alert('CPF inválido. Verifique e tente novamente.'); return; }
  if (!birthdate) { alert('Data de nascimento é obrigatória'); return; }
  if (!validateDate(birthdate)) { alert('Data de nascimento inválida ou você precisa ter mais de 18 anos.'); return; }
  if (!phone) { alert('Telefone é obrigatório'); return; }
  const phoneNumbers = unmaskPhone(phone);
  if (phoneNumbers.length < 10) { alert('Telefone inválido. Digite um número completo com DDD.'); return; }
  
  const cep = profileCep.value.trim();
  const street = profileStreet.value.trim();
  const number = profileNumber.value.trim();
  const neighborhood = profileNeighborhood.value.trim();
  const city = profileCity.value.trim();
  const state = profileState.value.trim();
  
  if (!cep || !street || !number || !neighborhood || !city || !state) {
    alert('Preencha todos os campos de endereço obrigatórios.');
    return;
  }
  if (unmaskCep(cep).length !== 8) { alert('CEP inválido.'); return; }
  
  try {
    const userData = {
      name,
      cpf: unmaskCpf(cpf),
      birthdate,
      phone,
      address: {
        cep: unmaskCep(cep),
        street,
        number,
        complement: profileComplement.value.trim(),
        neighborhood,
        city,
        state: state.toUpperCase()
      }
    };
    await updateUserProfile(currentUser.uid, userData);
    userProfile = { ...userProfile, ...userData };
    greeting.textContent = `Olá, ${name.split(' ')[0]}!`;
    sidebarUserName.textContent = name.split(' ')[0];
    alert('✅ Perfil atualizado com sucesso!');
  } catch (error) {
    console.error('Erro ao salvar perfil:', error);
    alert('Erro ao salvar perfil');
  }
}

// ====================
// TIPOS DE MASSAGEM
// ====================

// Monta a lista de tipos a partir de allTypes, mantendo a seleção atual do cliente
function renderTypesSelect() {
  const previous = selTypes.value;
  if (allTypes.length === 0) {
    selTypes.innerHTML = '<option value="">Nenhum tipo cadastrado</option>';
    priceDisplay.textContent = 'R$ 0,00';
    return;
  }
  selTypes.innerHTML = '<option value="">Selecione o tipo de massagem</option>';
  allTypes.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'));
  allTypes.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = t.name;
    opt.dataset.price = t.price;
    selTypes.appendChild(opt);
  });
  // Se o tipo escolhido ainda existe, continua selecionado (antes a escolha era apagada)
  if (previous && allTypes.some(t => t.id === previous)) {
    selTypes.value = previous;
  }
  updatePrice();
}

async function loadTypes() {
  try {
    allTypes = await getAllTypes();
    renderTypesSelect();
  } catch (error) {
    console.error('Erro ao carregar tipos:', error);
    selTypes.innerHTML = '<option value="">Erro ao carregar</option>';
  }
}

function updatePrice() {
  const sel = selTypes.value;
  if (!sel) { priceDisplay.textContent = 'R$ 0,00'; return; }
  const opt = selTypes.options[selTypes.selectedIndex];
  const price = opt ? Number(opt.dataset.price) || 0 : 0;
  priceDisplay.textContent = formatMoney(price);
}

selTypes.addEventListener('change', updatePrice);

// ====================
// CALENDÁRIO
// ====================

function renderCalendar() {
  calendarClient.innerHTML = '';
  const header = document.createElement('div');
  header.className = 'calendar-header';
  const btnPrev = document.createElement('button');
  btnPrev.className = 'btn-nav';
  btnPrev.innerHTML = '◀';
  btnPrev.onclick = () => { currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1); renderCalendar(); };
  const monthTitle = document.createElement('div');
  monthTitle.className = 'month-title';
  monthTitle.textContent = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const btnNext = document.createElement('button');
  btnNext.className = 'btn-nav';
  btnNext.innerHTML = '▶';
  btnNext.onclick = () => { currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1); renderCalendar(); };
  header.appendChild(btnPrev);
  header.appendChild(monthTitle);
  header.appendChild(btnNext);
  calendarClient.appendChild(header);
  
  const weekDays = document.createElement('div');
  weekDays.className = 'weekdays-header';
  ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].forEach(day => {
    const dayEl = document.createElement('div');
    dayEl.className = 'weekday-label';
    dayEl.textContent = day;
    weekDays.appendChild(dayEl);
  });
  calendarClient.appendChild(weekDays);
  
  const daysGrid = document.createElement('div');
  daysGrid.className = 'calendar-grid';
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const firstWeekDay = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  
  for (let i = 0; i < firstWeekDay; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'calendar-day empty';
    daysGrid.appendChild(emptyCell);
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    dayDate.setHours(0, 0, 0, 0);
    const dayCell = document.createElement('div');
    dayCell.className = 'calendar-day';
    
    if (dayDate < today) {
      dayCell.classList.add('past');
      dayCell.textContent = day;
    } else {
      dayCell.classList.add('available');
      dayCell.textContent = day;
      if (dayDate.getTime() === today.getTime()) dayCell.classList.add('today');
      if (selectedDate && dayDate.getTime() === selectedDate.getTime()) dayCell.classList.add('selected');
      dayCell.onclick = () => selectDate(dayDate);
    }
    daysGrid.appendChild(dayCell);
  }
  calendarClient.appendChild(daysGrid);
}

async function selectDate(date) {
  selectedDate = new Date(date);
  selectedDate.setHours(0, 0, 0, 0);
  selectedHour = null;
  selectedMinute = 0;
  renderCalendar();
  await loadTimeSlots();
}

// ====================
// CONFIGURAÇÃO DE HORÁRIOS (definida no painel admin)
// ====================

const DEFAULT_SCHEDULE_CONFIG = {
  sessionDuration: 60,
  enabledDays: [1, 2, 3, 4, 5],
  schedules: {
    0: { enabled: false, start: '08:00', end: '18:00', intervals: [] },
    1: { enabled: true, start: '08:00', end: '18:00', intervals: [] },
    2: { enabled: true, start: '08:00', end: '18:00', intervals: [] },
    3: { enabled: true, start: '08:00', end: '18:00', intervals: [] },
    4: { enabled: true, start: '08:00', end: '18:00', intervals: [] },
    5: { enabled: true, start: '08:00', end: '18:00', intervals: [] },
    6: { enabled: false, start: '08:00', end: '18:00', intervals: [] }
  }
};

function normalizeScheduleConfig(data) {
  const base = JSON.parse(JSON.stringify(DEFAULT_SCHEDULE_CONFIG));
  if (!data) return base;
  const config = {
    sessionDuration: parseInt(data.sessionDuration, 10) || base.sessionDuration,
    enabledDays: Array.isArray(data.enabledDays) ? data.enabledDays.map(Number) : base.enabledDays,
    schedules: {}
  };
  for (let i = 0; i < 7; i++) {
    const src = (data.schedules && (data.schedules[i] || data.schedules[String(i)])) || base.schedules[i];
    config.schedules[i] = {
      enabled: config.enabledDays.includes(i),
      start: src.start || '08:00',
      end: src.end || '18:00',
      intervals: Array.isArray(src.intervals) ? src.intervals.filter(it => it && it.start && it.end) : []
    };
  }
  return config;
}

async function loadScheduleConfig() {
  try {
    const doc = await db.collection('system_config').doc('schedule').get();
    scheduleConfig = normalizeScheduleConfig(doc.exists ? doc.data() : null);
  } catch (error) {
    console.error('Erro ao carregar configuração de horários:', error);
    if (!scheduleConfig) scheduleConfig = normalizeScheduleConfig(null);
  }
  updatePriceLabel();
}

function getSessionMinutes() {
  return scheduleConfig ? scheduleConfig.sessionDuration : 60;
}

// Atualiza o texto "Valor da sessão (1 hora)" conforme a duração configurada
function updatePriceLabel() {
  const label = document.querySelector('#priceDisplayBox .small');
  if (!label) return;
  const minutes = getSessionMinutes();
  label.textContent = minutes === 60 ? 'Valor da sessão (1 hora):' : `Valor da sessão (${minutes} min):`;
}

// Mesma regra do painel admin: dias, horário de início/fim, duração e intervalos
function generateTimeSlotsForDay(date) {
  const config = scheduleConfig || normalizeScheduleConfig(null);
  const daySchedule = config.schedules[date.getDay()];
  if (!daySchedule || !daySchedule.enabled) return [];

  const slots = [];
  const sessionDuration = config.sessionDuration;
  const [startHour, startMin] = daySchedule.start.split(':').map(Number);
  const [endHour, endMin] = daySchedule.end.split(':').map(Number);
  let currentMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  while (currentMinutes + sessionDuration <= endMinutes) {
    const hour = Math.floor(currentMinutes / 60);
    const minute = currentMinutes % 60;
    const isInInterval = daySchedule.intervals.some(interval => {
      const [ish, ism] = interval.start.split(':').map(Number);
      const [ieh, iem] = interval.end.split(':').map(Number);
      return currentMinutes >= ish * 60 + ism && currentMinutes < ieh * 60 + iem;
    });
    if (!isInInterval) {
      slots.push({ hour, minute, time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}` });
    }
    currentMinutes += sessionDuration;
  }
  return slots;
}

async function loadTimeSlots() {
  if (!selectedDate) { timeSlotsSection.classList.add('hidden'); return; }
  const token = ++timeSlotsRenderToken;
  const day = new Date(selectedDate);
  timeSlotsSection.classList.remove('hidden');
  timeSlotsList.innerHTML = '<div class="loading">Carregando horários...</div>';
  
  try {
    if (!scheduleConfig) await loadScheduleConfig();
    const slots = generateTimeSlotsForDay(day);
    
    if (slots.length === 0) {
      if (token === timeSlotsRenderToken) {
        timeSlotsList.innerHTML = '<div class="no-slots">Nenhum horário disponível neste dia</div>';
      }
      return;
    }
    
    const dateStr = toDateStr(day);
    const dayStart = new Date(day);
    const dayEnd = new Date(day);
    dayEnd.setDate(dayEnd.getDate() + 1);
    
    // Busca os horários bloqueados pelo admin e TODOS os agendamentos do dia
    // (antes só os do próprio cliente eram considerados, então horários já ocupados apareciam livres)
    const [dayAvailability, dayAppointments] = await Promise.all([
      getDayAvailability(dateStr),
      getAppointmentsInRange(dayStart.getTime(), dayEnd.getTime())
    ]);
    
    if (token !== timeSlotsRenderToken) return;
    
    const sessionMs = getSessionMinutes() * 60 * 1000;
    const activeAppointments = dayAppointments.filter(ap => ap.status !== 'CANCELADO');
    
    timeSlotsList.innerHTML = '';
    const now = Date.now();
    let hasAvailableSlots = false;
    
    slots.forEach(slot => {
      const slotDate = new Date(day);
      slotDate.setHours(slot.hour, slot.minute, 0, 0);
      const slotStart = slotDate.getTime();
      
      // Horário passado
      if (slotStart <= now) return;
      
      // Bloqueado pelo admin (formato atual "8:30" e formato antigo "8")
      const availability = dayAvailability || {};
      if (availability[`${slot.hour}:${slot.minute}`] === false) return;
      if (slot.minute === 0 && availability[slot.hour] === false) return;
      
      // Ocupado por outro agendamento
      const isBooked = activeAppointments.some(ap =>
        ap.start < slotStart + sessionMs && (ap.end || ap.start + 60 * 60 * 1000) > slotStart
      );
      if (isBooked) return;
      
      hasAvailableSlots = true;
      const slotEl = document.createElement('div');
      slotEl.className = 'time-slot';
      if (selectedHour === slot.hour && selectedMinute === slot.minute) slotEl.classList.add('selected');
      
      const timeLabel = document.createElement('div');
      timeLabel.className = 'time-label';
      timeLabel.textContent = slot.time;
      const statusLabel = document.createElement('div');
      statusLabel.className = 'status-label available';
      statusLabel.textContent = 'Disponível';
      slotEl.appendChild(timeLabel);
      slotEl.appendChild(statusLabel);
      slotEl.onclick = () => selectTimeSlot(slot.hour, slot.minute, slotEl);
      timeSlotsList.appendChild(slotEl);
    });
    
    // O horário escolhido pode ter sido ocupado enquanto a tela estava aberta
    if (selectedHour !== null && !timeSlotsList.querySelector('.time-slot.selected')) {
      selectedHour = null;
      selectedMinute = 0;
    }
    
    if (!hasAvailableSlots) {
      timeSlotsList.innerHTML = '<div class="no-slots">Nenhum horário disponível neste dia</div>';
    }
  } catch (error) {
    console.error('Erro ao carregar horários:', error);
    if (token === timeSlotsRenderToken) {
      timeSlotsList.innerHTML = '<div class="error">Erro ao carregar horários</div>';
    }
  }
}

function selectTimeSlot(hour, minute, slotEl) {
  selectedHour = hour;
  selectedMinute = minute || 0;
  document.querySelectorAll('#timeSlotsList .time-slot').forEach(slot => slot.classList.remove('selected'));
  if (slotEl) slotEl.classList.add('selected');
  setTimeout(() => { btnBook.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 100);
}

// ====================
// AGENDAR
// ====================

async function bookAppointment() {
  if (isBooking) return;
  if (!currentUser || !userProfile) { alert('Erro: usuário não autenticado'); return; }
  if (!userProfile.name || !userProfile.phone || !userProfile.cpf || !userProfile.birthdate) {
    alert('Complete seu perfil antes de agendar. Vá em "Perfil" no menu lateral.');
    openProfileTab();
    return;
  }
  
  const typeId = selTypes.value;
  if (!typeId) { alert('Por favor, escolha um tipo de massagem.'); selTypes.focus(); return; }
  if (!selectedDate) { alert('Por favor, selecione uma data no calendário.'); return; }
  if (selectedHour === null) { alert('Por favor, selecione um horário disponível.'); return; }
  
  const t = allTypes.find(x => x.id === typeId);
  if (!t) { alert('Tipo inválido. Por favor, recarregue a página.'); return; }
  
  const startTs = new Date(selectedDate);
  startTs.setHours(selectedHour, selectedMinute || 0, 0, 0);
  const endTs = startTs.getTime() + getSessionMinutes() * 60 * 1000;
  
  if (startTs.getTime() <= Date.now()) {
    alert('Este horário já passou. Por favor, escolha outro horário.');
    await loadTimeSlots();
    return;
  }
  
  isBooking = true;
  btnBook.disabled = true;
  btnBook.textContent = 'Agendando...';
  
  try {
    const conflict = await checkConflict(startTs.getTime(), endTs);
    if (conflict) {
      alert('Este horário acabou de ser reservado. Por favor, escolha outro horário.');
      selectedHour = null;
      selectedMinute = 0;
      await loadTimeSlots();
      return;
    }
    
    const appointment = {
      id: uid(),
      userId: currentUser.uid,
      clientName: userProfile.name,
      clientPhone: userProfile.phone,
      typeId: t.id,
      typeName: t.name,
      price: Number(t.price),
      start: startTs.getTime(),
      end: endTs,
      note: note.value.trim() || '',
      status: 'PENDENTE',
      paid: false,
      createdAt: Date.now()
    };
    
    await saveAppointment(appointment);
    alert('🎉 Agendamento realizado com sucesso!\n\nStatus: PENDENTE\n\nAguarde a confirmação do estabelecimento.');
    resetForm();
  } catch (error) {
    console.error('Erro ao agendar:', error);
    alert('Erro ao realizar agendamento. Tente novamente.');
  } finally {
    isBooking = false;
    btnBook.disabled = false;
    btnBook.textContent = 'Confirmar Agendamento';
  }
}

// Abre a aba Perfil marcando o item correto no menu
function openProfileTab() {
  document.querySelectorAll('.sb-item').forEach(i => i.classList.remove('active'));
  const item = document.querySelector('.sb-item[data-tab="profile"]');
  if (item) item.classList.add('active');
  openTab('profile');
}

function resetForm() {
  note.value = '';
  selectedDate = null;
  selectedHour = null;
  selectedMinute = 0;
  selTypes.value = '';
  priceDisplay.textContent = 'R$ 0,00';
  timeSlotsSection.classList.add('hidden');
  renderCalendar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ====================
// PRÓXIMOS AGENDAMENTOS
// ====================

async function loadUpcomingAppointments() {
  try {
    const now = Date.now();
    const upcoming = allAppointments.filter(ap => ap.userId === currentUser.uid && ap.start > now && !ap.paid).sort((a, b) => a.start - b.start);
    upcomingList.innerHTML = '';
    if (upcoming.length === 0) { emptyUpcoming.classList.remove('hidden'); return; }
    emptyUpcoming.classList.add('hidden');
    upcoming.forEach(ap => {
      const card = createAppointmentCard(ap, true);
      upcomingList.appendChild(card);
    });
  } catch (error) {
    console.error('Erro ao carregar próximos agendamentos:', error);
  }
}

// ====================
// HISTÓRICO
// ====================

async function loadHistoryAppointments() {
  try {
    const history = allAppointments.filter(ap => ap.userId === currentUser.uid && (ap.paid || ap.status === 'REALIZADO')).sort((a, b) => b.start - a.start);
    historyList.innerHTML = '';
    if (history.length === 0) { emptyHistory.classList.remove('hidden'); return; }
    emptyHistory.classList.add('hidden');
    history.forEach(ap => {
      const card = createAppointmentCard(ap, false);
      historyList.appendChild(card);
    });
  } catch (error) {
    console.error('Erro ao carregar histórico:', error);
  }
}

// ====================
// CRIAR CARD DE AGENDAMENTO
// ====================

function createAppointmentCard(ap, showCancel) {
  const card = document.createElement('div');
  card.className = 'card app-card';
  const info = document.createElement('div');
  info.className = 'app-info';
  const title = document.createElement('div');
  title.className = 'app-title';
  title.textContent = `${ap.typeName} • ${formatMoney(ap.price)}`;
  const meta = document.createElement('div');
  meta.className = 'app-meta';
  const d = new Date(ap.start);
  meta.textContent = `📅 ${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'})}`;
  info.appendChild(title);
  info.appendChild(meta);
  
  const statusWrap = document.createElement('div');
  statusWrap.style.marginTop = '8px';
  const statusDisplay = getStatusDisplay(ap.status);
  const status = document.createElement('span');
  status.className = getStatusBadgeClass(ap.status);
  status.textContent = `${statusDisplay.icon} ${statusDisplay.text}`;
  statusWrap.appendChild(status);
  
  if (ap.paid) {
    const paid = document.createElement('span');
    paid.className = 'status-badge status-realizado';
    paid.style.marginLeft = '8px';
    paid.textContent = '✓ PAGO';
    statusWrap.appendChild(paid);
  }
  
  if (ap.cancellationReason) {
    const reasonDiv = document.createElement('div');
    reasonDiv.className = 'small';
    reasonDiv.style.marginTop = '8px';
    reasonDiv.style.color = '#991b1b';
    reasonDiv.innerHTML = `<strong>Motivo do cancelamento:</strong> ${escapeHtml(ap.cancellationReason)}`;
    info.appendChild(reasonDiv);
  }
  
  info.appendChild(statusWrap);
  card.appendChild(info);
  
  if (showCancel && !ap.paid && ap.start > Date.now() && ap.status !== 'CANCELADO') {
    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.flexDirection = 'column';
    actions.style.gap = '8px';
    const btnCancel = document.createElement('button');
    btnCancel.className = 'btn btn-ghost btn-sm';
    btnCancel.textContent = 'Cancelar';
    btnCancel.onclick = async () => {
      const reason = prompt('Informe o motivo do cancelamento (obrigatório):');
      if (reason && reason.trim()) {
        const previous = { status: ap.status, cancellationReason: ap.cancellationReason };
        btnCancel.disabled = true;
        try {
          ap.status = 'CANCELADO';
          ap.cancellationReason = reason.trim();
          await saveAppointment(ap);
          alert('✅ Agendamento cancelado com sucesso!');
          loadUpcomingAppointments();
        } catch (error) {
          ap.status = previous.status;
          if (previous.cancellationReason === undefined) delete ap.cancellationReason;
          else ap.cancellationReason = previous.cancellationReason;
          console.error('Erro ao cancelar:', error);
          alert('Erro ao cancelar agendamento.');
        } finally {
          btnCancel.disabled = false;
        }
      } else if (reason !== null) {
        alert('O motivo do cancelamento é obrigatório!');
      }
    };
    actions.appendChild(btnCancel);
    card.appendChild(actions);
  }
  return card;
}

// ====================
// INICIALIZAÇÃO DO APP
// ====================

function unsubscribeAllListeners() {
  if (unsubscribeTypes) { unsubscribeTypes(); unsubscribeTypes = null; }
  if (unsubscribeAppointments) { unsubscribeAppointments(); unsubscribeAppointments = null; }
}

async function initializeApp() {
  try {
    console.log('🚀 Inicializando aplicação...');
    
    // Mostrar tela principal
    loginScreen.classList.add('hidden');
    completeProfileModal.classList.add('hidden');
    mainScreen.classList.remove('hidden');
    
    // Configurar informações do usuário
    const firstName = (userProfile.name || currentUser.displayName || 'Cliente').split(' ')[0];
    greeting.textContent = `Olá, ${firstName}!`;
    sidebarUserName.textContent = firstName;
    sidebarUserEmail.textContent = userProfile.email || currentUser.email || '';
    
    // Carregar dados
    await Promise.all([loadTypes(), loadScheduleConfig()]);
    allAppointments = await getUserAppointments(currentUser.uid);
    
    // Abrir tela inicial
    document.querySelectorAll('.sb-item').forEach(i => i.classList.toggle('active', i.dataset.tab === 'home'));
    openTab('home');
    
    // Configurar listeners em tempo real
    unsubscribeAllListeners();
    unsubscribeTypes = onTypesChange(types => { 
      allTypes = types; 
      renderTypesSelect(); 
    });
    
    unsubscribeAppointments = onUserAppointmentsChange(currentUser.uid, appointments => {
      allAppointments = appointments;
      loadUpcomingAppointments();
      loadHistoryAppointments();
      loadHomeTab();
      if (selectedDate) loadTimeSlots();
    });
    
    console.log('✅ Aplicação inicializada com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar aplicação:', error);
    alert('Erro ao inicializar aplicação. Por favor, recarregue a página.');
  }
}

// ====================
// LISTENER DE AUTENTICAÇÃO
// ====================

// Decide se abre o app ou o modal "Complete seu Cadastro"
async function handleAuthenticatedUser(user) {
  currentUser = user;
  
  try {
    // Buscar perfil do usuário
    userProfile = await getUserProfile(user.uid);
    
    // Verificar se o perfil está completo
    const profileComplete = await isProfileComplete(user.uid);
    
    if (!profileComplete) {
      // Preencher dados já disponíveis no modal
      const p = userProfile || {};
      const addr = p.address || {};
      document.getElementById('completeName').value = p.name || user.displayName || '';
      document.getElementById('completeCpf').value = p.cpf ? maskCpf(p.cpf) : '';
      document.getElementById('completeBirthdate').value = p.birthdate || '';
      document.getElementById('completePhone').value = p.phone ? maskPhone(p.phone) : '';
      document.getElementById('completeCep').value = addr.cep ? maskCep(addr.cep) : '';
      document.getElementById('completeStreet').value = addr.street || '';
      document.getElementById('completeNumber').value = addr.number || '';
      document.getElementById('completeComplement').value = addr.complement || '';
      document.getElementById('completeNeighborhood').value = addr.neighborhood || '';
      document.getElementById('completeCity').value = addr.city || '';
      document.getElementById('completeState').value = addr.state || '';
      
      // Mostrar modal de completar perfil
      loginScreen.classList.add('hidden');
      mainScreen.classList.add('hidden');
      completeProfileModal.classList.remove('hidden');
    } else {
      // Perfil completo - inicializar aplicação
      await initializeApp();
    }
  } catch (error) {
    console.error('❌ Erro ao processar autenticação:', error);
    alert('Erro ao carregar dados do usuário. Por favor, tente novamente.');
    await logoutUser();
  }
}

onAuthChange(async (user) => {
  if (user) {
    // Durante o registro por email, quem continua o fluxo é o registerWithEmail
    if (isRegistering) return;
    await handleAuthenticatedUser(user);
  } else {
    // Limpar estado
    currentUser = null;
    userProfile = null;
    allAppointments = [];
    selectedDate = null;
    selectedHour = null;
    selectedMinute = 0;
    
    // Cancelar listeners
    unsubscribeAllListeners();
    
    // Mostrar tela de login (sempre na aba "Login")
    showLoginTab();
    document.getElementById('loginPassword').value = '';
    loginScreen.classList.remove('hidden');
    mainScreen.classList.add('hidden');
    completeProfileModal.classList.add('hidden');
  }
});

// Enter nos campos de login aciona o botão "Entrar"
['loginEmail', 'loginPassword'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') loginWithEmail(); });
});

// Cleanup ao sair da página
window.addEventListener('beforeunload', () => {
  unsubscribeAllListeners();
});
