const ageInput = document.getElementById('age');
const sexInput = document.getElementById('sex');
const sbpInput = document.getElementById('sbp');
const dbpInput = document.getElementById('dbp');
const gradeInput = document.getElementById('grade');
const stageMode = document.getElementById('stageMode');
const stageDefinitionBlock = document.getElementById('stageDefinitionBlock');
const autoRiskFactors = document.getElementById('autoRiskFactors');
const autoStageText = document.getElementById('autoStageText');
const riskMode = document.getElementById('riskMode');
const riskDefinitionBlock = document.getElementById('riskDefinitionBlock');
const score2Value = document.getElementById('score2Value');
const score2RiskText = document.getElementById('score2RiskText');
const clinicalRiskText = document.getElementById('clinicalRiskText');
const ckdStage = document.getElementById('ckdStage');
const form = document.getElementById('patientForm');

function getHypertensionGrade(sbp, dbp) {
  if (!sbp || !dbp) return '';
  if (sbp > 140 && dbp < 90) return 'Изолированная систолическая гипертензия';
  if (sbp < 140 && dbp >= 90) return 'Изолированная диастолическая гипертензия';
  if (sbp > 180 || dbp > 110) return 'АГ 3-й степени';
  if (sbp >= 160 || dbp >= 100) return 'АГ 2-й степени';
  if (sbp >= 140 || dbp >= 90) return 'АГ 1-й степени';
  if ((sbp >= 130 && sbp <= 139) || (dbp >= 85 && dbp <= 89)) return 'Высокое нормальное';
  if ((sbp >= 120 && sbp <= 129) || (dbp >= 80 && dbp <= 84)) return 'Нормальное';
  if (sbp < 120 && dbp < 80) return 'Оптимальное';
  return '';
}

function updateGrade() {
  const sbp = Number(sbpInput.value);
  const dbp = Number(dbpInput.value);
  gradeInput.value = getHypertensionGrade(sbp, dbp);
}

function renderAutoRiskFactors() {
  const age = Number(ageInput.value);
  const sex = sexInput.value;
  autoRiskFactors.innerHTML = '';

  if (sex === 'male') {
    autoRiskFactors.insertAdjacentHTML('beforeend', '<label class="checkbox"><input type="checkbox" checked disabled> Пол</label>');
  }

  if ((sex === 'male' && age > 55) || (sex === 'female' && age > 65)) {
    autoRiskFactors.insertAdjacentHTML('beforeend', '<label class="checkbox"><input type="checkbox" checked disabled> Возраст</label>');
  }

  document.querySelectorAll('.female-only').forEach(el => {
    el.classList.toggle('hidden', sex !== 'female');
    const cb = el.querySelector('input');
    if (sex !== 'female') cb.checked = false;
  });
}

function getChecked(groupName) {
  return Array.from(document.querySelectorAll(`input[data-group="${groupName}"]:checked`)).map(el => el.value);
}

function calculateStage() {
  const targetOrgan = getChecked('targetOrgan');
  const associated = getChecked('associated');
  const ckd = ckdStage.value;

  if (associated.length > 0 || ckd === 'c4' || ckd === 'c5') return 'Стадия III';
  if (targetOrgan.length > 0 || ckd === 'c3') return 'Стадия II';
  return 'Стадия I';
}

function updateStageUI() {
  stageDefinitionBlock.classList.toggle('hidden', stageMode.value !== 'auto');
  if (stageMode.value === 'auto') autoStageText.textContent = calculateStage();
}

function calculateScore2Risk(age, value) {
  if (Number.isNaN(value) || value < 0 || !age) return '—';
  if (value < 1) return 'Низкий';
  if (age < 50) {
    if (value < 2.5) return 'Умеренный';
    if (value >= 7.5) return 'Высокий';
    return 'Умеренный';
  }
  if (age <= 69) {
    if (value < 5) return 'Умеренный';
    if (value >= 10) return 'Высокий';
    return 'Умеренный';
  }
  if (value < 7.5) return 'Умеренный';
  if (value >= 15) return 'Высокий';
  return 'Умеренный';
}

function updateScore2Risk() {
  const age = Number(ageInput.value);
  const value = Number(score2Value.value);
  const hint = document.getElementById('score2ImageHint');
  if (!age) {
    hint.textContent = 'Сначала введите возраст пациента.';
  } else if (age >= 40 && age <= 69) {
    hint.textContent = 'Показывать изображение 1 (для возраста 40–69 лет).';
  } else if (age >= 70) {
    hint.textContent = 'Показывать изображение 2 (для возраста 70+ лет).';
  } else {
    hint.textContent = 'Возраст младше 40 лет — SCORE2 в текущем прототипе не предназначен для расчёта.';
  }
  score2RiskText.textContent = calculateScore2Risk(age, value);
}

function calculateClinicalRisk() {
  const tiers = Array.from(document.querySelectorAll('[data-clinical-tier]:checked')).map(el => Number(el.dataset.clinicalTier));
  if (tiers.includes(4)) return 'Экстремальный';
  if (tiers.includes(3)) return 'Очень высокий';
  if (tiers.includes(2)) return 'Высокий';
  if (tiers.includes(1)) return 'Умеренный';
  return '—';
}

function updateClinicalRisk() {
  clinicalRiskText.textContent = calculateClinicalRisk();
}

function updateRiskUI() {
  riskDefinitionBlock.classList.toggle('hidden', riskMode.value !== 'auto');
}

function getFinalStage() {
  if (stageMode.value === 'auto') return calculateStage();
  if (stageMode.value === 'stage1') return 'Стадия I';
  if (stageMode.value === 'stage2') return 'Стадия II';
  if (stageMode.value === 'stage3') return 'Стадия III';
  return '';
}

function getFinalRisk() {
  if (riskMode.value !== 'auto') {
    const map = {
      low: 'Низкий',
      moderate: 'Умеренный',
      high: 'Высокий',
      'very-high': 'Очень высокий',
      extreme: 'Экстремальный'
    };
    return map[riskMode.value] || '';
  }
  const activeTab = document.querySelector('.toggle-btn.active')?.dataset.riskTab;
  return activeTab === 'clinical' ? calculateClinicalRisk() : calculateScore2Risk(Number(ageInput.value), Number(score2Value.value));
}

function bindRiskTabs() {
  const buttons = document.querySelectorAll('.toggle-btn');
  const score2Tab = document.getElementById('score2Tab');
  const clinicalTab = document.getElementById('clinicalTab');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.riskTab;
      score2Tab.classList.toggle('hidden', tab !== 'score2');
      clinicalTab.classList.toggle('hidden', tab !== 'clinical');
    });
  });
}

[ageInput, sexInput, sbpInput, dbpInput].forEach(el => {
  el.addEventListener('input', () => {
    updateGrade();
    renderAutoRiskFactors();
    updateStageUI();
    updateScore2Risk();
  });
});

stageMode.addEventListener('change', updateStageUI);
riskMode.addEventListener('change', updateRiskUI);
score2Value.addEventListener('input', updateScore2Risk);
ckdStage.addEventListener('change', updateStageUI);
document.querySelectorAll('input[data-group="targetOrgan"], input[data-group="associated"]').forEach(el => el.addEventListener('change', updateStageUI));
document.querySelectorAll('[data-clinical-tier]').forEach(el => el.addEventListener('change', updateClinicalRisk));

bindRiskTabs();
updateGrade();
renderAutoRiskFactors();
updateStageUI();
updateRiskUI();
updateScore2Risk();
updateClinicalRisk();

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = {
    age: Number(ageInput.value),
    sex: sexInput.value === 'male' ? 'Мужской' : 'Женский',
    sbp: Number(sbpInput.value),
    dbp: Number(dbpInput.value),
    grade: gradeInput.value,
    stage: getFinalStage(),
    risk: getFinalRisk()
  };
  localStorage.setItem('ahPatientData', JSON.stringify(data));
  window.location.href = 'result.html';
});
