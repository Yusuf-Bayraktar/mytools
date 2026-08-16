(function () {
  const STORAGE_KEY = 'tools-web-thermometers';
  const form = document.querySelector('#temperature-form');
  const customForm = document.querySelector('#custom-scale-form');
  if (!form || !customForm) return;
  const valueInput = document.querySelector('#temperature-value'); const sourceSelect = document.querySelector('#source-scale'); const targetSelect = document.querySelector('#target-scale'); const result = document.querySelector('#temperature-result'); const error = document.querySelector('#temperature-error'); const customError = document.querySelector('#custom-scale-error'); const customSuccess = document.querySelector('#custom-scale-success'); const management = document.querySelector('#thermometer-management');
  let thermometers = {};
  function showMessage(element, text) { element.textContent = text; element.hidden = !text; }
  function readSaved() { try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); return saved && typeof saved === 'object' ? saved : {}; } catch { return {}; } }
  function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(thermometers)); }
  function populateSelects() { const names = Object.keys(thermometers); [sourceSelect, targetSelect].forEach((select) => { const previous = select.value; select.replaceChildren(); names.forEach((name) => select.add(new Option(name, name))); if (names.includes(previous)) select.value = previous; }); if (!sourceSelect.value && names.length) sourceSelect.value = names[0]; if (!targetSelect.value && names.length > 1) targetSelect.value = names[1]; }
  function formatNumber(number) { return Number.isInteger(number) ? String(number) : String(number); }
  function calculate(event) {
    event.preventDefault(); showMessage(error, ''); result.textContent = '—';
    if (valueInput.value.trim() === '') { showMessage(error, 'Lütfen bir sıcaklık değeri girin.'); return; }
    const value = Number(valueInput.value); if (!Number.isFinite(value)) { showMessage(error, 'Sıcaklık değeri geçerli bir sayı olmalıdır.'); return; }
    const source = thermometers[sourceSelect.value]; const target = thermometers[targetSelect.value];
    if (!sourceSelect.value || !targetSelect.value || !source || !target) { showMessage(error, 'Lütfen kaynak ve hedef ölçekleri seçin.'); return; }
    if (source[0] === source[1] || target[0] === target[1]) { showMessage(error, 'Seçilen ölçeklerin donma ve kaynama noktaları eşit olamaz.'); return; }
    const converted = ((value - source[0]) * (target[1] - target[0])) / (source[1] - source[0]) + target[0]; if (!Number.isFinite(converted)) { showMessage(error, 'Bu değer için dönüşüm yapılamadı.'); return; } result.textContent = formatNumber(converted);
  }
  function renderManagement() {
    management.replaceChildren(); Object.entries(thermometers).forEach(([name, points]) => { const row = document.createElement('div'); row.className = 'management-row'; row.innerHTML = `<div class="field"><label>Ölçek adı</label><input class="manage-name" type="text" maxlength="50" value="${escapeAttribute(name)}"></div><div class="field"><label>Donma noktası</label><input class="manage-freezing" type="number" step="any" value="${points[0]}"></div><div class="field"><label>Kaynama noktası</label><input class="manage-boiling" type="number" step="any" value="${points[1]}"></div><button class="management-row__button manage-save" type="button">Kaydet</button><button class="management-row__button management-row__button--delete manage-delete" type="button">Sil</button>`; row.querySelector('.manage-save').addEventListener('click', () => updateThermometer(name, row)); row.querySelector('.manage-delete').addEventListener('click', () => deleteThermometer(name)); management.append(row); });
  }
  function escapeAttribute(value) { return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function updateThermometer(oldName, row) {
    const newName = row.querySelector('.manage-name').value.trim(); const freezing = Number(row.querySelector('.manage-freezing').value); const boiling = Number(row.querySelector('.manage-boiling').value);
    if (!newName) { showRowStatus(row, 'Ölçek adı boş bırakılamaz.', false); return; }
    if (![freezing, boiling].every(Number.isFinite)) { showRowStatus(row, 'Donma ve kaynama noktaları geçerli sayılar olmalıdır.', false); return; }
    if (freezing >= boiling) { showRowStatus(row, 'Kaynama noktası donma noktasından büyük olmalıdır.', false); return; }
    if (newName !== oldName && Object.prototype.hasOwnProperty.call(thermometers, newName)) { showRowStatus(row, 'Bu isimde bir termometre zaten var.', false); return; }
    const updated = {}; Object.entries(thermometers).forEach(([name, points]) => { updated[name === oldName ? newName : name] = name === oldName ? [freezing, boiling] : points; }); thermometers = updated; persist(); populateSelects(); row.querySelector('.manage-name').value = newName; showRowStatus(row, `${newName} güncellendi.`, true);
  }
  function deleteThermometer(name) { const scroll = window.scrollY; delete thermometers[name]; persist(); populateSelects(); renderManagement(); window.scrollTo(0, scroll); }
  function showRowStatus(row, text, success) { const old = row.querySelector('.management-status'); if (old) old.remove(); const status = document.createElement('div'); status.className = `management-status${success ? '' : ' management-status--error'}`; status.textContent = text; row.append(status); }
  function addCustomThermometer(event) {
    event.preventDefault(); showMessage(customError, ''); showMessage(customSuccess, ''); const name = document.querySelector('#custom-name').value.trim(); const freezingRaw = document.querySelector('#custom-freezing').value.trim(); const boilingRaw = document.querySelector('#custom-boiling').value.trim();
    if (!name || !freezingRaw || !boilingRaw) { showMessage(customError, 'Lütfen ölçek adı, donma noktası ve kaynama noktası alanlarını doldurun.'); return; }
    const freezing = Number(freezingRaw); const boiling = Number(boilingRaw); if (!Number.isFinite(freezing) || !Number.isFinite(boiling)) { showMessage(customError, 'Donma ve kaynama noktaları geçerli sayılar olmalıdır.'); return; } if (freezing >= boiling) { showMessage(customError, 'Kaynama noktası donma noktasından büyük olmalıdır; eşit veya küçük olamaz.'); return; } if (Object.prototype.hasOwnProperty.call(thermometers, name)) { showMessage(customError, 'Bu isimde bir termometre zaten var.'); return; }
    thermometers[name] = [freezing, boiling]; persist(); populateSelects(); renderManagement(); customForm.reset(); showMessage(customSuccess, `${name} ölçeği eklendi ve bu tarayıcıya kaydedildi.`);
  }
  async function init() { try { const response = await fetch('../data/thermometers.json'); if (!response.ok) throw new Error(); thermometers = { ...(await response.json()), ...readSaved() }; populateSelects(); renderManagement(); } catch { showMessage(error, 'Termometre listesi yüklenemedi. Sayfayı bir web sunucusu üzerinden açmayı deneyin.'); } }
  form.addEventListener('submit', calculate); customForm.addEventListener('submit', addCustomThermometer); init();
})();
