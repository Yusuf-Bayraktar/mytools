(function () {
  const STORAGE_KEY = 'tools-web-courses';
  const form = document.querySelector('#grade-form');
  if (!form) return;
  const rows = document.querySelector('#course-rows');
  const error = document.querySelector('#grade-error');
  const result = document.querySelector('#grade-result');
  const management = document.querySelector('#course-management');
  let courses = {};

  function message(element, text) { element.textContent = text; element.hidden = !text; }
  function readSaved() { try { const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); return value && typeof value === 'object' ? value : {}; } catch { return {}; } }
  function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(courses)); }
  function unusedCourse() { const used = new Set([...rows.querySelectorAll('.course-select')].map((select) => select.value)); return Object.keys(courses).find((name) => !used.has(name)); }
  function refreshSelects() {
    rows.querySelectorAll('.course-select').forEach((select) => {
      const previous = select.value; select.replaceChildren();
      Object.keys(courses).forEach((name) => select.add(new Option(name, name)));
      select.value = Object.prototype.hasOwnProperty.call(courses, previous) ? previous : (unusedCourse() || Object.keys(courses)[0] || '');
    });
  }
  function addRow() {
    const next = unusedCourse();
    if (!next) { message(error, 'Tüm dersler zaten hesaplama satırlarında kullanılıyor. Önce yeni bir ders ekleyin.'); return; }
    const row = document.createElement('div'); row.className = 'data-row';
    row.innerHTML = `<div class="field"><label>Not</label><input class="grade-input" type="number" min="0" max="100" step="any" inputmode="decimal" value="1" required></div><div class="field"><label>Sözlü</label><input class="oral-input" type="number" min="0" max="100" step="any" inputmode="decimal" value="0" required></div><div class="field"><label>Ders</label><select class="course-select" required></select></div><button class="data-row__remove" type="button" aria-label="Dersi kaldır">Kaldır</button>`;
    const select = row.querySelector('.course-select'); Object.keys(courses).forEach((name) => select.add(new Option(name, name))); select.value = next;
    row.querySelector('.data-row__remove').addEventListener('click', () => { if (rows.children.length > 1) row.remove(); }); rows.append(row);
  }
  function calculate(event) {
    event.preventDefault(); message(error, ''); result.textContent = '—'; let weightedTotal = 0; let hourTotal = 0; const seen = new Set();
    for (const [index, row] of [...rows.children].entries()) {
      const gradeRaw = row.querySelector('.grade-input').value.trim(); const oralRaw = row.querySelector('.oral-input').value.trim(); const course = row.querySelector('.course-select').value;
      if (!gradeRaw || !oralRaw || !course) { message(error, `${index + 1}. satırdaki tüm alanları doldurun.`); return; }
      if (seen.has(course)) { message(error, `"${course}" birden fazla satırda yer alıyor. Bir dersi yalnızca bir kez ekleyin.`); return; } seen.add(course);
      const grade = Number(gradeRaw); const oral = Number(oralRaw); const hours = Number(courses[course]);
      if (![grade, oral, hours].every(Number.isFinite)) { message(error, `${index + 1}. satırda geçersiz bir sayı var.`); return; }
      if (grade < 0 || grade > 100 || oral < 0 || oral > 100) { message(error, `${index + 1}. satırdaki notlar 0 ile 100 arasında olmalıdır.`); return; }
      if (hours <= 0) { message(error, `${course} dersinin ders saati sıfırdan büyük olmalıdır.`); return; }
      weightedTotal += ((grade + oral) / 2) * hours; hourTotal += hours;
    }
    if (hourTotal === 0) { message(error, 'Toplam ders saati sıfır olamaz.'); return; }
    const average = Math.round((weightedTotal / hourTotal) * 1000) / 1000; result.textContent = Number.isInteger(average) ? String(average) : average.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
  }
  function renderManagement() {
    management.replaceChildren();
    Object.entries(courses).forEach(([name, hours]) => {
      const row = document.createElement('div'); row.className = 'management-row';
      row.innerHTML = `<div class="field"><label>Ders adı</label><input class="manage-name" type="text" maxlength="50" value="${name.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"></div><div class="field"><label>Ders saati</label><input class="manage-value" type="number" min="0.000001" step="any" value="${hours}"></div><button class="management-row__button manage-save" type="button">Kaydet</button><button class="management-row__button management-row__button--delete manage-delete" type="button">Sil</button>`;
      row.querySelector('.manage-save').addEventListener('click', () => updateCourse(name, row)); row.querySelector('.manage-delete').addEventListener('click', () => deleteCourse(name)); management.append(row);
    });
  }
  function updateCourse(oldName, row) {
    const newName = row.querySelector('.manage-name').value.trim(); const hours = Number(row.querySelector('.manage-value').value);
    if (!newName) { showRowStatus(row, 'Ders adı boş bırakılamaz.', false); return; }
    if (!Number.isFinite(hours) || hours <= 0) { showRowStatus(row, 'Ders saati geçerli ve sıfırdan büyük olmalıdır.', false); return; }
    if (newName !== oldName && Object.prototype.hasOwnProperty.call(courses, newName)) { showRowStatus(row, 'Bu isimde bir ders zaten var.', false); return; }
    const updated = {}; Object.entries(courses).forEach(([name, value]) => { updated[name === oldName ? newName : name] = name === oldName ? hours : value; }); courses = updated; persist(); refreshSelects(); row.querySelector('.manage-name').value = newName; showRowStatus(row, `${newName} güncellendi.`, true);
  }
  function showRowStatus(row, text, success) { const old = row.querySelector('.management-status'); if (old) old.remove(); const status = document.createElement('div'); status.className = `management-status${success ? '' : ' management-status--error'}`; status.textContent = text; row.append(status); }
  function deleteCourse(name) { const scroll = window.scrollY; delete courses[name]; persist(); refreshSelects(); renderManagement(); window.scrollTo(0, scroll); }
  async function init() {
    try { const response = await fetch('../data/courses.json'); if (!response.ok) throw new Error(); courses = { ...(await response.json()), ...readSaved() }; addRow(); renderManagement(); }
    catch { message(error, 'Ders listesi yüklenemedi. Sayfayı bir web sunucusu üzerinden açmayı deneyin.'); }
  }
  document.querySelector('#add-course').addEventListener('click', addRow); form.addEventListener('submit', calculate);
  document.querySelector('#custom-course-form').addEventListener('submit', (event) => {
    event.preventDefault(); const customError = document.querySelector('#course-error'); const success = document.querySelector('#course-success'); message(customError, ''); message(success, '');
    const name = document.querySelector('#course-name').value.trim(); const hoursRaw = document.querySelector('#course-hours').value.trim(); const hours = Number(hoursRaw);
    if (!name || !hoursRaw) { message(customError, 'Lütfen ders adı ve ders saatini doldurun.'); return; }
    if (!Number.isFinite(hours)) { message(customError, 'Ders saati geçerli bir sayı olmalıdır.'); return; }
    if (hours <= 0) { message(customError, 'Ders saati sıfırdan büyük olmalıdır; negatif veya sıfır olamaz.'); return; }
    if (Object.prototype.hasOwnProperty.call(courses, name)) { message(customError, 'Bu isimde bir ders zaten var.'); return; }
    courses[name] = hours; persist(); refreshSelects(); renderManagement(); event.target.reset(); message(success, `${name} dersi kaydedildi.`);
  });
  init();
})();
