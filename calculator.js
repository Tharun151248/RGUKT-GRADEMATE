/* ============================
   SGPA Calculator — Core Engine
   ============================ */

const GRADES = [
    { label: 'Ex (10)', value: 10 },
    { label: 'A (9)',   value: 9 },
    { label: 'B (8)',   value: 8 },
    { label: 'C (7)',   value: 7 },
    { label: 'D (6)',   value: 6 },
    { label: 'E (5)',   value: 5 },
];

let currentSemester = 0;

/* ---- Render semester tabs ---- */
function renderSemTabs(semesters) {
    const wrap = document.getElementById('semTabs');
    if (!wrap) return;
    wrap.innerHTML = semesters.map((sem, i) => `
        <button class="sem-tab${i === 0 ? ' active' : ''}" onclick="switchSemester(${i})" id="tab-${i}">
            ${sem.label}
        </button>
    `).join('');
}

/* ---- Switch semester ---- */
function switchSemester(idx) {
    currentSemester = idx;
    document.querySelectorAll('.sem-tab').forEach((t, i) => {
        t.classList.toggle('active', i === idx);
    });
    renderSubjects(window._semesters[idx]);
    hideResult();
}

/* ---- Render subject cards ---- */
function renderSubjects(semester) {
    const grid = document.getElementById('subjectsGrid');
    grid.innerHTML = semester.subjects.map((sub, i) => `
        <div class="subject-card" id="card-${i}" style="animation-delay:${i * 0.04}s">
            <div class="card-top">
                <div class="sub-name">${sub.name}</div>
                <div class="credit-pill">${sub.credit} Cr</div>
            </div>
            <div class="select-wrap">
                <select class="grade-select" id="grade-${i}" aria-label="Grade for ${sub.name}">
                    <option value="" disabled selected>Select Grade</option>
                    ${GRADES.map(g => `<option value="${g.value}">${g.label}</option>`).join('')}
                </select>
            </div>
        </div>
    `).join('');

    // Update total credits display
    const totalEl = document.getElementById('totalCredits');
    if (totalEl) {
        const total = semester.subjects.reduce((s, sub) => s + sub.credit, 0);
        totalEl.textContent = total;
    }
}

/* ---- Calculate SGPA ---- */
function calculateSGPA() {
    const semester = window._semesters[currentSemester];
    const subjects = semester.subjects;
    let weightedSum = 0;
    let totalCredits = 0;
    let allSelected = true;
    const rows = [];

    subjects.forEach((sub, i) => {
        const sel = document.getElementById(`grade-${i}`);
        const card = document.getElementById(`card-${i}`);

        if (!sel.value) {
            allSelected = false;
            card.style.borderColor = 'rgba(253,121,168,0.5)';
            card.style.boxShadow = '0 0 18px rgba(253,121,168,0.1)';
            setTimeout(() => {
                card.style.borderColor = '';
                card.style.boxShadow = '';
            }, 2200);
        } else {
            const gradeVal = parseInt(sel.value);
            const points = gradeVal * sub.credit;
            weightedSum += points;
            totalCredits += sub.credit;
            card.style.borderColor = '';
            card.style.boxShadow = '';

            const gradeName = GRADES.find(g => g.value === gradeVal).label.split(' ')[0];
            rows.push({ name: sub.name, grade: gradeName, credit: sub.credit, points });
        }
    });

    if (!allSelected) {
        // Focus the first unselected
        for (let i = 0; i < subjects.length; i++) {
            if (!document.getElementById(`grade-${i}`).value) {
                document.getElementById(`grade-${i}`).focus();
                break;
            }
        }
        return;
    }

    const sgpa = weightedSum / totalCredits;
    showResult(sgpa, rows, totalCredits, weightedSum);
}

/* ---- Show Result ---- */
function showResult(sgpa, rows, totalCredits, weightedSum) {
    const section = document.getElementById('resultArea');
    section.classList.remove('show');
    void section.offsetWidth; // force reflow

    document.getElementById('sgpaValue').textContent = sgpa.toFixed(2);

    let remark = '';
    if (sgpa >= 9.5) remark = '<span class="emoji">🏆</span> Outstanding! Top performer!';
    else if (sgpa >= 9) remark = '<span class="emoji">🌟</span> Excellent performance!';
    else if (sgpa >= 8) remark = '<span class="emoji">🔥</span> Great job! Keep it up!';
    else if (sgpa >= 7) remark = '<span class="emoji">👍</span> Good work! Room to grow.';
    else if (sgpa >= 6) remark = '<span class="emoji">💪</span> Decent. Push harder next sem!';
    else remark = '<span class="emoji">📚</span> Keep studying, you\'ll get there!';

    document.getElementById('sgpaRemark').innerHTML = remark;

    const tbody = document.getElementById('breakdownBody');
    tbody.innerHTML = rows.map(r => `
        <tr>
            <td>${r.name}</td>
            <td>${r.grade}</td>
            <td>${r.credit}</td>
            <td>${r.points.toFixed(1)}</td>
        </tr>
    `).join('') + `
        <tr class="total-row">
            <td>Total</td>
            <td></td>
            <td>${totalCredits}</td>
            <td>${weightedSum.toFixed(1)}</td>
        </tr>
    `;

    section.classList.add('show');
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---- Hide Result ---- */
function hideResult() {
    const section = document.getElementById('resultArea');
    if (section) section.classList.remove('show');
}

/* ---- Reset All ---- */
function resetAll() {
    const semester = window._semesters[currentSemester];
    semester.subjects.forEach((_, i) => {
        const sel = document.getElementById(`grade-${i}`);
        if (sel) sel.selectedIndex = 0;
        const card = document.getElementById(`card-${i}`);
        if (card) { card.style.borderColor = ''; card.style.boxShadow = ''; }
    });
    hideResult();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---- Init branch page ---- */
function initBranchPage(semesters) {
    window._semesters = semesters;
    renderSemTabs(semesters);
    renderSubjects(semesters[0]);
}

/* ---- Navigation scroll effect ---- */
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.top-nav');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
});

/* ---- Hamburger toggle ---- */
function toggleNav() {
    document.querySelector('.nav-links')?.classList.toggle('open');
}
