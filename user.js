// user.js - Cliente com Autenticação e Menu Lateral

// Elementos da UI
const loginScreen = document.getElementById('loginScreen');
const mainScreen = document.getElementById('mainScreen');
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
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
const profilePhone = document.getElementById('profilePhone');
const profileEmail = document.getElementById('profileEmail');
const registerPhone = document.getElementById('registerPhone');
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

// ====================
// TABS DE AUTENTICAÇÃO
// ====================

document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    const tabName = tab.dataset.tab;
    document.querySelectorAll('.auth-tab-content').forEach(content => {
      content.classList.remove('active');
    });
    
    if (tabName === 'login') {
      loginTab.classList.add('active');
    } else {
      registerTab.classList.add('active');
    }
  });
});

// Máscara de telefone
registerPhone.addEventListener('input', function() {
  this.value = maskPhone(this.value);
});

profilePhone.addEventListener('input', function() {
  this.value = maskPhone(this.value);
});

// ====================
// FUNÇÕES DE AUTENTICAÇÃO
// ====================

async function loginWithEmail() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  
  if (!email || !password) {
    alert('Preencha email e senha');
    return;
  }
  
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
  const phone = document.getElementById('registerPhone').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  
  if (!name) { alert('Preencha seu nome'); return; }
  if (!phone) { alert('Preencha seu telefone'); return; }
  
  const phoneNumbers = unmaskPhone(phone);
  if (phoneNumbers.length < 10) {
    alert('Telefone inválido. Digite um número completo com DDD.');
    return;
  }
  
  if (!email) { alert('Preencha seu email'); return; }
  if (!password || password.length < 6) {
    alert('Senha deve ter no mínimo 6 caracteres');
    return;
  }
  
  try {
    await registerUser(email, password, name, phone);
    alert('Conta criada com sucesso!');
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
// FUNÇÕES AUXILIARES DE STATUS (PADRONIZADO)
// ====================

function getStatusBadgeClass(status) {
  const statusLower = status.toLowerCase();
  return `status-badge status-${statusLower}`;
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
  document.querySelectorAll('section[id^="tab-"]').forEach(section => {
    section.classList.add('hidden');
  });
  
  const targetTab = document.getElementById(`tab-${tab}`);
  if (targetTab) {
    targetTab.classList.remove('hidden');
  }
  
  if (tab === 'booking') {
    renderCalendar();
  } else if (tab === 'upcoming') {
    loadUpcomingAppointments();
  } else if (tab === 'history') {
    loadHistoryAppointments();
  } else if (tab === 'profile') {
    loadProfileTab();
  }
}

// ====================
// PERFIL
// ====================

function loadProfileTab() {
  if (!userProfile) return;
  
  profileName.value = userProfile.name || '';
  profilePhone.value = userProfile.phone || '';
  profileEmail.value = userProfile.email || '';
}

async function saveProfile() {
  const name = profileName.value.trim();
  const phone = profilePhone.value.trim();
  
  if (!name) { alert('Nome é obrigatório'); return; }
  if (!phone) { alert('Telefone é obrigatório'); return; }
  
  const phoneNumbers = unmaskPhone(phone);
  if (phoneNumbers.length < 10) {
    alert('Telefone inválido. Digite um número completo com DDD.');
    return;
  }
  
  try {
    await updateUserProfile(currentUser.uid, { name, phone });
    
    userProfile.name = name;
    userProfile.phone = phone;
    
    greeting.textContent = `Olá, ${name.split(' ')[0]}!`;
    sidebarUserName.textContent = name.split(' ')[0];
    
    alert('Perfil atualizado com sucesso!');
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
    selTypes.innerHTML = '<option>Carregando...</option>';
    allTypes = await getAllTypes();
    
    selTypes.innerHTML = '';
    if (allTypes.length === 0) {
      selTypes.innerHTML = '<option value="">Nenhum tipo cadastrado</option>';
      priceDisplay.textContent = 'R$ 0,00';
      return;
    }
    
    allTypes.sort((a, b) => a.name.localeCompare(b.name));
    allTypes.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.name;
      opt.dataset.price = t.price;
      selTypes.appendChild(opt);
    });
    
    updatePrice();
  } catch (error) {
    console.error('Erro ao carregar tipos:', error);
    selTypes.innerHTML = '<option value="">Erro ao carregar</option>';
  }
}

function updatePrice() {
  const sel = selTypes.value;
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
  btnPrev.onclick = () => {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    renderCalendar();
  };
  
  const monthTitle = document.createElement('div');
  monthTitle.className = 'month-title';
  monthTitle.textContent = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  
  const btnNext = document.createElement('button');
  btnNext.className = 'btn-nav';
  btnNext.innerHTML = '▶';
  btnNext.onclick = () => {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    renderCalendar();
  };
  
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
      
      if (dayDate.getTime() === today.getTime()) {
        dayCell.classList.add('today');
      }
      
      if (selectedDate && dayDate.getTime() === selectedDate.getTime()) {
        dayCell.classList.add('selected');
      }
      
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
  if (!selectedDate) {
    timeSlotsSection.classList.add('hidden');
    return;
  }
  
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
      
      if (selectedHour === hour) {
        slot.classList.add('selected');
      }
      
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
  
  document.querySelectorAll('.time-slot').forEach(slot => {
    slot.classList.remove('selected');
  });
  
  event.currentTarget.classList.add('selected');
  
  setTimeout(() => {
    btnBook.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

// ====================
// AGENDAR
// ====================

async function bookAppointment() {
  if (!currentUser || !userProfile) {
    alert('Erro: usuário não autenticado');
    return;
  }
  
  if (!userProfile.name || !userProfile.phone) {
    alert('Complete seu perfil antes de agendar. Vá em "Perfil" no menu lateral.');
    openTab('profile');
    return;
  }
  
  const typeId = selTypes.value;
  
  if (!typeId) {
    alert('Por favor, escolha um tipo de massagem.');
    selTypes.focus();
    return;
  }
  
  if (!selectedDate) {
    alert('Por favor, selecione uma data no calendário.');
    return;
  }
  
  if (selectedHour === null) {
    alert('Por favor, selecione um horário disponível.');
    return;
  }
  
  const t = allTypes.find(x => x.id === typeId);
  if (!t) {
    alert('Tipo inválido. Por favor, recarregue a página.');
    return;
  }
  
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
    const upcoming = allAppointments
      .filter(ap => ap.userId === currentUser.uid && ap.start > now && !ap.paid)
      .sort((a, b) => a.start - b.start);
    
    upcomingList.innerHTML = '';
    
    if (upcoming.length === 0) {
      emptyUpcoming.classList.remove('hidden');
      return;
    }
    
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
    const history = allAppointments
      .filter(ap => ap.userId === currentUser.uid && (ap.paid || ap.status === 'REALIZADO'))
      .sort((a, b) => b.start - a.start);
    
    historyList.innerHTML = '';
    
    if (history.length === 0) {
      emptyHistory.classList.remove('hidden');
      return;
    }
    
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
// CRIAR CARD DE AGENDAMENTO (PADRONIZADO)
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
    
    renderCalendar();
    loadUpcomingAppointments();
    
    if (unsubscribeTypes) unsubscribeTypes();
    unsubscribeTypes = onTypesChange(types => {
      allTypes = types;
      loadTypes();
    });
    
    if (unsubscribeAppointments) unsubscribeAppointments();
    unsubscribeAppointments = onUserAppointmentsChange(user.uid, appointments => {
      allAppointments = appointments;
      loadUpcomingAppointments();
      loadHistoryAppointments();
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
  }
});

window.addEventListener('beforeunload', () => {
  if (unsubscribeTypes) unsubscribeTypes();
  if (unsubscribeAppointments) unsubscribeAppointments();
});
