const data = JSON.parse(localStorage.getItem('ahPatientData') || '{}');
const patientSummary = document.getElementById('patientSummary');
const diagnosisSummary = document.getElementById('diagnosisSummary');

if (!data || !Object.keys(data).length) {
  patientSummary.innerHTML = '<p>Нет данных. Вернитесь на страницу ввода.</p>';
  diagnosisSummary.innerHTML = '';
} else {
  patientSummary.innerHTML = `
    <div class="summary-grid">
      <div class="summary-item"><strong>Возраст:</strong> ${data.age ?? '—'}</div>
      <div class="summary-item"><strong>Пол:</strong> ${data.sex ?? '—'}</div>
      <div class="summary-item"><strong>САД:</strong> ${data.sbp ?? '—'} мм рт. ст.</div>
      <div class="summary-item"><strong>ДАД:</strong> ${data.dbp ?? '—'} мм рт. ст.</div>
    </div>
  `;

  diagnosisSummary.innerHTML = `
    <div class="summary-grid">
      <div class="summary-item"><strong>Степень:</strong> ${data.grade || '—'}</div>
      <div class="summary-item"><strong>Стадия:</strong> ${data.stage || '—'}</div>
      <div class="summary-item"><strong>Риск:</strong> ${data.risk || '—'}</div>
    </div>
  `;
}
