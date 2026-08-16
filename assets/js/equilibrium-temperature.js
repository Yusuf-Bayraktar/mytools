(function () {
  const STORAGE_KEY = 'tools-web-materials'; const form = document.querySelector('#equilibrium-form'); if (!form) return;
  const rows = document.querySelector('#material-rows'); const error = document.querySelector('#equilibrium-error'); const result = document.querySelector('#equilibrium-result'); const management = document.querySelector('#material-management'); let materials = {};
  function message(element, text) { element.textContent = text; element.hidden = !text; }
  function readSaved() { try { const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); return value && typeof value === 'object' ? value : {}; } catch { return {}; } }
  function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(materials)); }
  function refreshSelects() { rows.querySelectorAll('.material-select').forEach((select) => { const previous = select.value; select.replaceChildren(); Object.keys(materials).forEach((name) => select.add(new Option(name, name))); select.value = Object.prototype.hasOwnProperty.call(materials, previous) ? previous : (Object.keys(materials)[0] || ''); }); }
  function addRow() {
    const next = Object.keys(materials)[0] || ''; if (!next) { message(error, 'Önce en az bir madde ekleyin.'); return; }
    const row = document.createElement('div'); row.className = 'data-row'; row.innerHTML = `<div class="field"><label>Kütle (g)</label><input class="mass-input" type="number" min="0.000001" step="any" inputmode="decimal" value="1" required></div><div class="field"><label>Sıcaklık (°C)</label><input class="temperature-input" type="number" step="any" inputmode="decimal" value="0" required></div><div class="field"><label>Madde</label><select class="material-select" required></select></div><button class="data-row__remove" type="button" aria-label="Maddeyi kaldır">Kaldır</button>`;
    const select = row.querySelector('.material-select'); Object.keys(materials).forEach((name) => select.add(new Option(name, name))); select.value = next; row.querySelector('.data-row__remove').addEventListener('click', () => { if (rows.children.length > 1) row.remove(); }); rows.append(row);
  }
  function calculate(event) {
    event.preventDefault(); message(error, ''); result.textContent = '—'; let numerator = 0; let denominator = 0; const seen = new Set();
    for (const [index, row] of [...rows.children].entries()) {
      const massRaw = row.querySelector('.mass-input').value.trim(); const tempRaw = row.querySelector('.temperature-input').value.trim(); const material = row.querySelector('.material-select').value;
      if (!massRaw || !tempRaw || !material) { message(error, `${index + 1}. satırdaki tüm alanları doldurun.`); return; }
      const mass = Number(massRaw); const temperature = Number(tempRaw); const heat = Number(materials[material]);
      if (![mass, temperature, heat].every(Number.isFinite)) { message(error, `${index + 1}. satırda geçersiz bir sayı var.`); return; }
      if (mass <= 0) { message(error, `${index + 1}. satırdaki kütle sıfırdan büyük olmalıdır; negatif veya sıfır olamaz.`); return; }
      if (heat <= 0) { message(error, `${material} maddesinin öz ısısı sıfırdan büyük olmalıdır.`); return; }
      numerator += mass * heat * temperature; denominator += mass * heat;
    }
    if (denominator === 0) { message(error, 'Toplam ısı kapasitesi sıfır olamaz.'); return; }
    const equilibrium = numerator / denominator; result.textContent = `${Number.isInteger(equilibrium) ? equilibrium : equilibrium.toFixed(6).replace(/0+$/, '').replace(/\.$/, '')} °C`;
  }
  function renderManagement() {
    management.replaceChildren(); Object.entries(materials).forEach(([name, heat]) => { const row = document.createElement('div'); row.className = 'management-row'; row.innerHTML = `<div class="field"><label>Madde adı</label><input class="manage-name" type="text" maxlength="50" value="${name.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"></div><div class="field"><label>Öz ısı</label><input class="manage-value" type="number" min="0.000001" step="any" value="${heat}"></div><button class="management-row__button manage-save" type="button">Kaydet</button><button class="management-row__button management-row__button--delete manage-delete" type="button">Sil</button>`; row.querySelector('.manage-save').addEventListener('click', () => updateMaterial(name, row)); row.querySelector('.manage-delete').addEventListener('click', () => deleteMaterial(name)); management.append(row); });
  }
  function updateMaterial(oldName, row) { const newName = row.querySelector('.manage-name').value.trim(); const heat = Number(row.querySelector('.manage-value').value); if (!newName) { showRowStatus(row, 'Madde adı boş bırakılamaz.', false); return; } if (!Number.isFinite(heat) || heat <= 0) { showRowStatus(row, 'Öz ısı geçerli ve sıfırdan büyük olmalıdır.', false); return; } if (newName !== oldName && Object.prototype.hasOwnProperty.call(materials, newName)) { showRowStatus(row, 'Bu isimde bir madde zaten var.', false); return; } const updated = {}; Object.entries(materials).forEach(([name, value]) => { updated[name === oldName ? newName : name] = name === oldName ? heat : value; }); materials = updated; persist(); refreshSelects(); row.querySelector('.manage-name').value = newName; showRowStatus(row, `${newName} güncellendi.`, true); }
  function showRowStatus(row, text, success) { const old = row.querySelector('.management-status'); if (old) old.remove(); const status = document.createElement('div'); status.className = `management-status${success ? '' : ' management-status--error'}`; status.textContent = text; row.append(status); }
  function deleteMaterial(name) { const scroll = window.scrollY; delete materials[name]; persist(); refreshSelects(); renderManagement(); window.scrollTo(0, scroll); }
  async function init() { try { const response = await fetch('../data/materials.json'); if (!response.ok) throw new Error(); materials = { ...(await response.json()), ...readSaved() }; addRow(); renderManagement(); } catch { message(error, 'Madde listesi yüklenemedi. Sayfayı bir web sunucusu üzerinden açmayı deneyin.'); } }
  document.querySelector('#add-material').addEventListener('click', addRow); form.addEventListener('submit', calculate);
  document.querySelector('#custom-material-form').addEventListener('submit', (event) => { event.preventDefault(); const customError = document.querySelector('#material-error'); const success = document.querySelector('#material-success'); message(customError, ''); message(success, ''); const name = document.querySelector('#material-name').value.trim(); const heatRaw = document.querySelector('#material-heat').value.trim(); const heat = Number(heatRaw); if (!name || !heatRaw) { message(customError, 'Lütfen madde adı ve öz ısı alanlarını doldurun.'); return; } if (!Number.isFinite(heat)) { message(customError, 'Öz ısı geçerli bir sayı olmalıdır.'); return; } if (heat <= 0) { message(customError, 'Öz ısı sıfırdan büyük olmalıdır; negatif veya sıfır olamaz.'); return; } if (Object.prototype.hasOwnProperty.call(materials, name)) { message(customError, 'Bu isimde bir madde zaten var.'); return; } materials[name] = heat; persist(); refreshSelects(); renderManagement(); event.target.reset(); message(success, `${name} maddesi kaydedildi.`); });
  init();
})();
