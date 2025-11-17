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
let currentMonth = new Date();

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
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    let message = 'Erro ao fazer login';
    if (error.code === 'auth/user-not-found') message = 'Usuário não encontrado';
    else if (error.code === 'auth/wrong-password') message = 'Senha incorreta';
    else if (error.code === 'auth/invalid-email') message = 'Email inválido';
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
    const userData = {
      name,
      cpf: unmaskCpf(cpf),
      birthdate,
      phone,
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
    await registerUser(email, password, userData.name, userData.phone, userData);
    alert('✅ Conta criada com sucesso!');
  } catch (error) {
    console.error('Erro ao registrar:', error);
    let message = 'Erro ao criar conta';
    if (error.code === 'auth/email-already-in-use') message = 'Este email já está em uso';
    else if (error.code === 'auth/invalid-email') message = 'Email inválido';
    else if (error.code === 'auth/weak-password') message = 'Senha muito fraca';
    alert(message);
  }
}

async function loginWithGoogle() {
  try {
    await loginWithGoogleProvider();
  } catch (error) {
    console.error('Erro ao fazer login com Google:', error);
    if (error.code !== 'auth/popup-closed-by-user') {
      alert('Erro ao fazer login com Google');
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
    userProfile = { ...userProfile, ...userData };
    completeProfileModal.classList.add('hidden');
    const firstName = name.split(' ')[0];
    greeting.textContent = `Olá, ${firstName}!`;
    sidebarUserName.textContent = firstName;
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
  return `status-badge status-${status.toLowerCase()}`;
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
  renderCalendar();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  currentMonth = new Date(today);
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
  const quoteContainer = document.getElementById('dailyQuote');
  const lastSessionContainer = document.getElementById('lastSessionInfo');
  const nextSessionContainer = document.getElementById('nextSessionInfo');
  
  const quote = getDailyQuote();
  quoteContainer.innerHTML = `<div class="quote-text">"${quote.text}"</div><div class="quote-author">— ${quote.author}</div>`;
  
  const lastSession = allAppointments.filter(ap => ap.userId === currentUser.uid && ap.paid && ap.start < Date.now()).sort((a, b) => b.start - a.start)[0];
  if (lastSession) {
    const d = new Date(lastSession.start);
    lastSessionContainer.innerHTML = `<div class="session-type">${lastSession.typeName}</div><div class="session-date">📅 ${d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div><div class="session-time">🕐 ${d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div><div class="session-price">${formatMoney(lastSession.price)}</div>`;
  } else {
    lastSessionContainer.innerHTML = '<div class="no-session">Nenhuma sessão realizada ainda</div>';
  }
  
  const nextSession = allAppointments.filter(ap => ap.userId === currentUser.uid && ap.start > Date.now() && ap.status !== 'CANCELADO').sort((a, b) => a.start - b.start)[0];
  if (nextSession) {
    const d = new Date(nextSession.start);
    const statusDisplay = getStatusDisplay(nextSession.status);
    nextSessionContainer.innerHTML = `<div class="session-type">${nextSession.typeName}</div><div class="session-date">📅 ${d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div><div class="session-time">🕐 ${d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div><div class="session-price">${formatMoney(nextSession.price)}</div><div style="margin-top: 12px;"><span class="${getStatusBadgeClass(nextSession.status)}">${statusDisplay.icon} ${statusDisplay.text}</span></div>`;
  } else {
    nextSessionContainer.innerHTML = '<div class="no-session">Nenhuma sessão agendada</div><button class="btn btn-primary" onclick="document.querySelector(\'[data-tab=\\"booking\\"]\').click()" style="margin-top: 16px; width: 100%;">Agendar Agora</button>';
  }
}

// ====================
// PERFIL
// ====================

function loadProfileTab() {
  if (!userProfile) return;
  profileName.value = userProfile.name || '';
  profileCpf.value = userProfile.cpf ? maskCpf(userProfile.cpf) : '';
  profileBirthdate.value = userProfile.birthdate || '';
  profilePhone.value = userProfile.phone || '';
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

async function loadTypes() {
  try {
    allTypes = await getAllTypes();
    if (allTypes.length === 0) {
      selTypes.innerHTML = '<option value="">Nenhum tipo cadastrado</option>';
      priceDisplay.textContent = 'R$ 0,00';
      return;
    }
    selTypes.innerHTML = '<option value="">Selecione o tipo de massagem</option>';
    allTypes.sort((a, b) => a.name.localeCompare(b.name));
    allTypes.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.name;
      opt.dataset.price = t.price;
      selTypes.appendChild(opt);
    });
    priceDisplay.textContent = 'R$ 0,00';
  } catch (error) {
    console.error('Erro ao carregar tipos:', error);
    selTypes.innerHTML = '<option value="">Erro ao carregar</option>';
  }
}

function updatePrice() {
  const sel = selTypes.value;
  if (!sel) { priceDisplay.textContent = 'R$ 0,00'; return; }
  const opt = selTypes.querySelector(`option[value="${sel}"]`);
  const price = opt ? opt.dataset.price || 0 : 0;
  priceDisplay.textContent = formatMoney(price || 0);
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
  btnPrev.onclick = () => { currentMonth.setMonth(currentMonth.getMonth() - 1); renderCalendar(); };
  const monthTitle = document.createElement('div');
  monthTitle.textContent = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const btnNext = document.createElement('button');
  btnNext.className = 'btn-nav';
  btnNext.innerHTML = '▶';
  btnNext.onclick = () => { currentMonth.setMonth(currentMonth.getMonth() + 1); renderCalendar(); };
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
  renderCalendar();
  await loadTimeSlots();
}

async function loadTimeSlots() {
  if (!selectedDate) { timeSlotsSection.classList.add('hidden'); return; }
  timeSlotsSection.classList.remove('hidden');
  timeSlotsList.innerHTML = '<div class="loading">Carregando horários...</div>';
  
  try {
    const dateStr = toDateStr(selectedDate);
    const dayAvailability = await getDayAvailability(dateStr);
    const dayAppointments = allAppointments.filter(ap => {
      const apDate = new Date(ap.start);
      return apDate.toDateString() === selectedDate.toDateString();
    });
    
    timeSlotsList.innerHTML = '';
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();
    const currentHour = now.getHours();
    let hasAvailableSlots = false;
    
    for (let hour = 8; hour <= 22; hour++) {
      const slotDate = new Date(selectedDate);
      slotDate.setHours(hour, 0, 0, 0);
      if (isToday && hour <= currentHour) continue;
      if (dayAvailability[hour] === false) continue;
      const isBooked = dayAppointments.some(ap => {
        const apDate = new Date(ap.start);
        return apDate.getHours() === hour;
      });
      if (isBooked) continue;
      
      hasAvailableSlots = true;
      const slot = document.createElement('div');
      slot.className = 'time-slot';
      if (selectedHour === hour) slot.classList.add('selected');
      
      const timeLabel = document.createElement('div');
      timeLabel.className = 'time-label';
      timeLabel.textContent = `${hour.toString().padStart(2, '0')}:00`;
      const statusLabel = document.createElement('div');
      statusLabel.className = 'status-label available';
      statusLabel.textContent = 'Disponível';
      slot.appendChild(timeLabel);
      slot.appendChild(statusLabel);
      slot.onclick = () => selectTimeSlot(hour);
      timeSlotsList.appendChild(slot);
    }
    
    if (!hasAvailableSlots) {
      timeSlotsList.innerHTML = '<div class="no-slots">Nenhum horário disponível neste dia</div>';
    }
  } catch (error) {
    console.error('Erro ao carregar horários:', error);
    timeSlotsList.innerHTML = '<div class="error">Erro ao carregar horários</div>';
  }
}

function selectTimeSlot(hour) {
  selectedHour = hour;
  document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));
  event.currentTarget.classList.add('selected');
  setTimeout(() => { btnBook.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 100);
}

// ====================
// AGENDAR
// ====================

async function bookAppointment() {
  if (!currentUser || !userProfile) { alert('Erro: usuário não autenticado'); return; }
  if (!userProfile.name || !userProfile.phone || !userProfile.cpf || !userProfile.birthdate) {
    alert('Complete seu perfil antes de agendar. Vá em "Perfil" no menu lateral.');
    openTab('profile');
    return;
  }
  
  const typeId = selTypes.value;
  if (!typeId) { alert('Por favor, escolha um tipo de massagem.'); selTypes.focus(); return; }
  if (!selectedDate) { alert('Por favor, selecione uma data no calendário.'); return; }
  if (selectedHour === null) { alert('Por favor, selecione um horário disponível.'); return; }
  
  const t = allTypes.find(x => x.id === typeId);
  if (!t) { alert('Tipo inválido. Por favor, recarregue a página.'); return; }
  
  const startTs = new Date(selectedDate);
  startTs.setHours(selectedHour, 0, 0, 0);
  const endTs = startTs.getTime() + 60 * 60 * 1000;
  
  try {
    const conflict = await checkConflict(startTs.getTime(), endTs);
    if (conflict) {
      alert('Este horário acabou de ser reservado. Por favor, escolha outro horário.');
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
    
    btnBook.disabled = true;
    btnBook.textContent = 'Agendando...';
    await saveAppointment(appointment);
    alert('🎉 Agendamento realizado com sucesso!\n\nStatus: PENDENTE\n\nAguarde a confirmação do estabelecimento.');
    resetForm();
  } catch (error) {
    console.error('Erro ao agendar:', error);
    alert('Erro ao realizar agendamento. Tente novamente.');
  } finally {
    btnBook.disabled = false;
    btnBook.textContent = 'Confirmar Agendamento';
  }
}

function resetForm() {
  note.value = '';
  selectedDate = null;
  selectedHour = null;
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
  meta.textContent = `📅 ${d.toLocaleDateString()} às ${d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;
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
    reasonDiv.innerHTML = `<strong>Motivo do cancelamento:</strong> ${ap.cancellationReason}`;
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
        try {
          ap.status = 'CANCELADO';
          ap.cancellationReason = reason.trim();
          await saveAppointment(ap);
          alert('✅ Agendamento cancelado com sucesso!');
          loadUpcomingAppointments();
        } catch (error) {
          console.error('Erro ao cancelar:', error);
          alert('Erro ao cancelar agendamento.');
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
// INICIALIZAÇÃO
// ====================

onAuthChange(async (user) => {
  if (user) {
    currentUser = user;
    userProfile = await getUserProfile(user.uid);
    if (userProfile && (!userProfile.cpf || !userProfile.birthdate || !userProfile.address)) {
      document.getElementById('completeName').value = userProfile.name || user.displayName || '';
      document.getElementById('completePhone').value = userProfile.phone || '';
      completeProfileModal.classList.remove('hidden');
      return;
    }
    if (userProfile) {
      const firstName = userProfile.name.split(' ')[0];
      greeting.textContent = `Olá, ${firstName}!`;
      sidebarUserName.textContent = firstName;
      sidebarUserEmail.textContent = userProfile.email;
    }
    loginScreen.classList.add('hidden');
    mainScreen.classList.remove('hidden');
    await loadTypes();
    allAppointments = await getUserAppointments(user.uid);
    openTab('home');
    if (unsubscribeTypes) unsubscribeTypes();
    unsubscribeTypes = onTypesChange(types => { allTypes = types; loadTypes(); });
    if (unsubscribeAppointments) unsubscribeAppointments();
    unsubscribeAppointments = onUserAppointmentsChange(user.uid, appointments => {
      allAppointments = appointments;
      loadUpcomingAppointments();
      loadHistoryAppointments();
      loadHomeTab();
      if (selectedDate) loadTimeSlots();
    });
    console.log('✅ Usuário autenticado e sincronização ativada!');
  } else {
    currentUser = null;
    userProfile = null;
    if (unsubscribeTypes) unsubscribeTypes();
    if (unsubscribeAppointments) unsubscribeAppointments();
    loginScreen.classList.remove('hidden');
    mainScreen.classList.add('hidden');
    completeProfileModal.classList.add('hidden');
  }
});

window.addEventListener('beforeunload', () => {
  if (unsubscribeTypes) unsubscribeTypes();
  if (unsubscribeAppointments) unsubscribeAppointments();
});
