// IPK Calculator - Complete Logic
let semesters = [];
let currentSemesterIndex = null;

// Grade mapping
const gradeMap = {
    '4.0': 'A',
    '3.7': 'A-',
    '3.3': 'B+',
    '3.0': 'B',
    '2.7': 'B-',
    '2.3': 'C+',
    '2.0': 'C',
    '1.7': 'C-',
    '1.3': 'D+',
    '1.0': 'D',
    '0.0': 'E'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    render();
    checkTheme();
});

// Load data from localStorage
function loadData() {
    const saved = localStorage.getItem('ipk_semesters');
    if (saved) {
        semesters = JSON.parse(saved);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('ipk_semesters', JSON.stringify(semesters));
}

// Add new semester
function addSemester() {
    const semesterNumber = semesters.length + 1;
    const newSemester = {
        id: Date.now(),
        number: semesterNumber,
        courses: [],
        ip: 0,
        totalSKS: 0
    };
    semesters.push(newSemester);
    saveData();
    render();
    
    // Show notification
    showNotification('Semester ' + semesterNumber + ' ditambahkan!', 'success');
}

// Delete semester
function deleteSemester(index) {
    if (!confirm('Hapus Semester ' + semesters[index].number + '?\n\nSemua data mata kuliah akan hilang!')) {
        return;
    }
    
    semesters.splice(index, 1);
    
    // Renumber semesters
    semesters.forEach((sem, idx) => {
        sem.number = idx + 1;
    });
    
    saveData();
    render();
    showNotification('Semester dihapus!', 'success');
}

// Open course modal
function openCourseModal(semesterIndex) {
    currentSemesterIndex = semesterIndex;
    document.getElementById('courseModal').classList.add('show');
    document.getElementById('courseName').value = '';
    document.getElementById('courseSKS').value = '';
    document.getElementById('courseGrade').value = '';
    document.getElementById('courseName').focus();
}

// Close course modal
function closeCourseModal() {
    document.getElementById('courseModal').classList.remove('show');
    currentSemesterIndex = null;
}

// Save course
function saveCourse() {
    const name = document.getElementById('courseName').value.trim();
    const sks = parseInt(document.getElementById('courseSKS').value);
    const grade = parseFloat(document.getElementById('courseGrade').value);
    
    // Validation
    if (!name) {
        alert('Nama mata kuliah harus diisi!');
        return;
    }
    
    if (!sks || sks < 1 || sks > 6) {
        alert('SKS harus antara 1-6!');
        return;
    }
    
    if (grade === '' || isNaN(grade)) {
        alert('Pilih nilai mata kuliah!');
        return;
    }
    
    // Add course
    const course = {
        id: Date.now(),
        name: name,
        sks: sks,
        grade: grade,
        gradeLetter: gradeMap[grade.toFixed(1)]
    };
    
    semesters[currentSemesterIndex].courses.push(course);
    
    // Recalculate IP
    calculateSemesterIP(currentSemesterIndex);
    
    saveData();
    render();
    closeCourseModal();
    
    showNotification('Mata kuliah ditambahkan!', 'success');
}

// Delete course
function deleteCourse(semesterIndex, courseIndex) {
    semesters[semesterIndex].courses.splice(courseIndex, 1);
    calculateSemesterIP(semesterIndex);
    saveData();
    render();
    showNotification('Mata kuliah dihapus!', 'success');
}

// Calculate IP for a semester
function calculateSemesterIP(index) {
    const semester = semesters[index];
    
    if (semester.courses.length === 0) {
        semester.ip = 0;
        semester.totalSKS = 0;
        return;
    }
    
    let totalPoints = 0;
    let totalSKS = 0;
    
    semester.courses.forEach(course => {
        totalPoints += course.grade * course.sks;
        totalSKS += course.sks;
    });
    
    semester.ip = (totalPoints / totalSKS).toFixed(2);
    semester.totalSKS = totalSKS;
}

// Calculate cumulative IPK
function calculateIPK() {
    if (semesters.length === 0) {
        return {
            ipk: 0,
            totalSKS: 0,
            predikat: '-'
        };
    }
    
    let totalPoints = 0;
    let totalSKS = 0;
    
    semesters.forEach(semester => {
        semester.courses.forEach(course => {
            totalPoints += course.grade * course.sks;
            totalSKS += course.sks;
        });
    });
    
    const ipk = totalSKS > 0 ? (totalPoints / totalSKS).toFixed(2) : 0;
    const predikat = getPredikat(parseFloat(ipk));
    
    return {
        ipk: ipk,
        totalSKS: totalSKS,
        predikat: predikat
    };
}

// Get predikat
function getPredikat(ipk) {
    if (ipk >= 3.75) return 'Cum Laude';
    if (ipk >= 3.50) return 'Superior';
    if (ipk >= 3.00) return 'gratify';
    if (ipk >= 2.00) return 'Lulus';
    if (ipk > 0) return 'Tidak Lulus';
    return '-';
}

// Render everything
function render() {
    renderSummary();
    renderSemesters();
}

// Render summary card
function renderSummary() {
    const result = calculateIPK();
    
    document.getElementById('totalIPK').textContent = result.ipk;
    document.getElementById('totalSKS').textContent = result.totalSKS;
    document.getElementById('totalSemesters').textContent = semesters.length;
    document.getElementById('predikat').textContent = result.predikat;
}

// Render semesters list
function renderSemesters() {
    const container = document.getElementById('semestersList');
    const emptyState = document.getElementById('emptyState');
    
    if (semesters.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    let html = '';
    
    semesters.forEach((semester, index) => {
        html += `
            <div class="semester-card">
                <div class="semester-header">
                    <div class="semester-title">
                        <h3>📝 Semester ${semester.number}</h3>
                    </div>
                    <div class="semester-stats">
                        <span>
                            <i class="fa-solid fa-chart-line"></i>
                            IP: <span class="ip-value">${semester.ip}</span>
                        </span>
                        <span>
                            <i class="fa-solid fa-book"></i>
                            SKS: ${semester.totalSKS}
                        </span>
                    </div>
                    <div class="semester-actions">
                        <button onclick="showSemesterAI(${index})" class="btn-small btn-ai">
                            <i class="fa-solid fa-brain"></i> AI
                        </button>
                        <button onclick="openCourseModal(${index})" class="btn-small btn-add">
                            <i class="fa-solid fa-plus"></i> Tambah MK
                        </button>
                        <button onclick="deleteSemester(${index})" class="btn-small btn-delete">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                ${semester.courses.length > 0 ? `
                    <table class="courses-table">
                        <thead>
                            <tr>
                                <th>Mata Kuliah</th>
                                <th style="text-align: center;">SKS</th>
                                <th style="text-align: center;">Nilai</th>
                                <th style="text-align: center;">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${semester.courses.map((course, courseIndex) => `
                                <tr>
                                    <td class="course-name">${course.name}</td>
                                    <td style="text-align: center;">${course.sks}</td>
                                    <td style="text-align: center;" class="course-grade">
                                        ${course.gradeLetter} (${course.grade.toFixed(1)})
                                    </td>
                                    <td style="text-align: center;">
                                        <button onclick="deleteCourse(${index}, ${courseIndex})" class="btn-delete-course">
                                            <i class="fa-solid fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                ` : `
                    <div class="empty-state" style="padding: 40px 20px;">
                        <i class="fa-solid fa-book-open" style="font-size: 3rem;"></i>
                        <p style="margin-top: 10px; color: var(--gray-500);">
                            Belum ada mata kuliah. Klik "Tambah MK" untuk menambahkan.
                        </p>
                    </div>
                `}
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Theme toggle
function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    localStorage.setItem('ipk_theme', next);
    document.getElementById('themeIcon').className = next === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

function checkTheme() {
    const saved = localStorage.getItem('ipk_theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    document.getElementById('themeIcon').className = saved === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

// Export PDF
function exportPDF() {
    if (semesters.length === 0) {
        alert('Belum ada data untuk di-export!');
        return;
    }
    
    const result = calculateIPK();
    
    let text = '=' .repeat(50) + '\n';
    text += 'TRANSKRIP NILAI AKADEMIK\n';
    text += '='.repeat(50) + '\n\n';
    
    text += `IPK Kumulatif: ${result.ipk}\n`;
    text += `Total SKS: ${result.totalSKS}\n`;
    text += `Predikat: ${result.predikat}\n`;
    text += `Tanggal: ${new Date().toLocaleDateString('id-ID')}\n\n`;
    
    text += '='.repeat(50) + '\n\n';
    
    semesters.forEach(semester => {
        text += `SEMESTER ${semester.number}\n`;
        text += `IP: ${semester.ip} | SKS: ${semester.totalSKS}\n`;
        text += '-'.repeat(50) + '\n';
        
        if (semester.courses.length > 0) {
            semester.courses.forEach(course => {
                text += `${course.name.padEnd(30)} ${course.sks} SKS  ${course.gradeLetter} (${course.grade.toFixed(1)})\n`;
            });
        } else {
            text += 'Belum ada mata kuliah\n';
        }
        
        text += '\n';
    });
    
    text += '='.repeat(50) + '\n';
    text += 'Generated by IPK Calculator\n';
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transkrip_${new Date().getTime()}.txt`;
    a.click();
    
    showNotification('Transkrip berhasil di-download!', 'success');
}

// Reset all data
function resetAll() {
    if (!confirm('Reset SEMUA data?\n\nSemua semester dan mata kuliah akan dihapus!\n\nTidak bisa dibatalkan!')) {
        return;
    }
    
    if (!confirm('Yakin 100%? Data tidak bisa dikembalikan!')) {
        return;
    }
    
    semesters = [];
    saveData();
    render();
    
    showNotification('Semua data telah dihapus!', 'success');
}

// Show notification
function showNotification(message, type = 'success') {
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.textContent = message;
    notif.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// Close modal on outside click
window.onclick = (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
};

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Esc to close modal
    if (e.key === 'Escape') {
        closeCourseModal();
    }
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
// ========================================
// AI ANALYSIS PER SEMESTER
// ========================================

function showSemesterAI(semesterIndex) {
    const semester = semesters[semesterIndex];
    
    if (semester.courses.length === 0) {
        alert('Semester ini belum ada mata kuliah!\n\nTambahkan mata kuliah dulu.');
        return;
    }
    
    // Analyze grades
    const gradeCounts = { A: 0, B: 0, C: 0, D: 0 };
    let totalCourses = semester.courses.length;
    
    semester.courses.forEach(course => {
        if (course.grade >= 3.5) gradeCounts.A++;
        else if (course.grade >= 2.5) gradeCounts.B++;
        else if (course.grade >= 1.5) gradeCounts.C++;
        else gradeCounts.D++;
    });
    
    const percentA = ((gradeCounts.A / totalCourses) * 100).toFixed(0);
    const percentB = ((gradeCounts.B / totalCourses) * 100).toFixed(0);
    const percentC = ((gradeCounts.C / totalCourses) * 100).toFixed(0);
    const percentD = ((gradeCounts.D / totalCourses) * 100).toFixed(0);
    
    // Performance level
    const ip = parseFloat(semester.ip);
    let performance = '';
    let performanceIcon = '';
    let tips = [];
    
    if (ip >= 3.75) {
        performance = 'EXCELLENT! 🏆';
        performanceIcon = '🌟';
        tips = [
            'IP sempurna! Pertahankan konsistensi ini',
            'Kamu adalah role model untuk teman-teman',
            'Jaga keseimbangan antara akademik dan kesehatan'
        ];
    } else if (ip >= 3.50) {
        performance = 'GREAT! ⭐';
        performanceIcon = '💪';
        tips = [
            'Tinggal sedikit lagi untuk IP 3.75+',
            'Fokus di mata kuliah yang masih bisa ditingkatkan',
            'Pertahankan pola belajar yang sudah berhasil'
        ];
    } else if (ip >= 3.00) {
        performance = 'GOOD 👍';
        performanceIcon = '📈';
        tips = [
            'IP sudah bagus, tapi bisa lebih baik',
            'Identifikasi mata kuliah yang bisa dipush',
            'Tingkatkan konsistensi belajar'
        ];
    } else if (ip >= 2.50) {
        performance = 'NEED IMPROVEMENT ⚠️';
        performanceIcon = '💡';
        tips = [
            'Semester ini perlu perhatian khusus',
            'Fokus di 3-4 mata kuliah inti',
            'Jangan ragu minta bantuan dosen/teman'
        ];
    } else {
        performance = 'CRITICAL! ⚠️';
        performanceIcon = '🚨';
        tips = [
            'Butuh action plan segera!',
            'Kurangi beban SKS semester depan',
            'Konsultasi dengan dosen pembimbing akademik'
        ];
    }
    
    // SKS Analysis
    let sksComment = '';
    if (semester.totalSKS > 24) {
        sksComment = '⚠️ Beban SKS terlalu tinggi! Ideal: 18-21 SKS';
    } else if (semester.totalSKS >= 18 && semester.totalSKS <= 21) {
        sksComment = '✅ Beban SKS ideal untuk performa optimal';
    } else if (semester.totalSKS < 18) {
        sksComment = '💡 SKS cukup ringan, bisa tambah 1-2 MK';
    } else {
        sksComment = '👍 Beban SKS cukup baik';
    }
    
    // Grade distribution comment
    let gradeComment = '';
    if (percentA >= 70) {
        gradeComment = '🌟 Distribusi nilai sangat bagus! Mayoritas A/A-';
    } else if (percentA >= 50) {
        gradeComment = '👍 Distribusi nilai bagus, tapi bisa lebih optimal';
    } else if (percentC > 30 || percentD > 10) {
        gradeComment = '⚠️ Terlalu banyak nilai C/D. Perlu strategi belajar baru';
    } else {
        gradeComment = '💡 Distribusi nilai cukup, ada ruang untuk improvement';
    }
    
    // Build message
    let message = `
━━━━━━━━━━━━━━━━━━━━━
🧠 AI ANALYSIS
SEMESTER ${semester.number}
━━━━━━━━━━━━━━━━━━━━━

${performanceIcon} PERFORMANCE: ${performance}

📊 STATISTIK:
• IP Semester: ${ip}
• Total SKS: ${semester.totalSKS}
• Total Mata Kuliah: ${totalCourses}

📈 DISTRIBUSI NILAI:
• A/A-: ${percentA}% (${gradeCounts.A} MK)
• B: ${percentB}% (${gradeCounts.B} MK)
• C: ${percentC}% (${gradeCounts.C} MK)
${gradeCounts.D > 0 ? `• D: ${percentD}% (${gradeCounts.D} MK)` : ''}

${gradeComment}

📚 BEBAN SKS:
${sksComment}

💡 REKOMENDASI:
${tips.map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━
Generated by Gradify AI ✨
━━━━━━━━━━━━━━━━━━━━━
    `.trim();
    
    alert(message);
}

// ========================================
// FEATURE 1: QUICK STATS DASHBOARD
// ========================================

function toggleQuickStats() {
    const statsCard = document.getElementById('quickStats');
    if (statsCard.style.display === 'none' || !statsCard.style.display) {
        calculateQuickStats();
        statsCard.style.display = 'block';
    } else {
        statsCard.style.display = 'none';
    }
}

function calculateQuickStats() {
    if (semesters.length === 0) {
        alert('Belum ada data untuk ditampilkan!');
        return;
    }
    
    // Calculate stats
    const ips = semesters.map(s => parseFloat(s.ip)).filter(ip => ip > 0);
    const highestIP = Math.max(...ips);
    const lowestIP = Math.min(...ips);
    const avgIP = (ips.reduce((a, b) => a + b, 0) / ips.length).toFixed(2);
    
    // Count A grades
    let totalA = 0;
    let totalCourses = 0;
    semesters.forEach(sem => {
        sem.courses.forEach(course => {
            totalCourses++;
            if (course.grade >= 3.5) totalA++;
        });
    });
    
    const percentA = totalCourses > 0 ? ((totalA / totalCourses) * 100).toFixed(0) : 0;
    
    // Find which semester
    const highestSem = semesters.find(s => parseFloat(s.ip) === highestIP);
    const lowestSem = semesters.find(s => parseFloat(s.ip) === lowestIP);
    
    // Update display
    document.getElementById('highestIP').textContent = `${highestIP} (Sem ${highestSem.number})`;
    document.getElementById('lowestIP').textContent = `${lowestIP} (Sem ${lowestSem.number})`;
    document.getElementById('avgIP').textContent = avgIP;
    document.getElementById('totalA').textContent = `${totalA} (${percentA}%)`;
}

// ========================================
// FEATURE 2: EDIT MATA KULIAH
// ========================================

let editingSemesterIndex = null;
let editingCourseIndex = null;

function openEditCourseModal(semesterIndex, courseIndex) {
    editingSemesterIndex = semesterIndex;
    editingCourseIndex = courseIndex;
    
    const course = semesters[semesterIndex].courses[courseIndex];
    
    document.getElementById('editCourseName').value = course.name;
    document.getElementById('editCourseSKS').value = course.sks;
    document.getElementById('editCourseGrade').value = course.grade.toFixed(1);
    
    document.getElementById('editCourseModal').classList.add('show');
    document.getElementById('editCourseName').focus();
}

function closeEditCourseModal() {
    document.getElementById('editCourseModal').classList.remove('show');
    editingSemesterIndex = null;
    editingCourseIndex = null;
}

function saveEditCourse() {
    const name = document.getElementById('editCourseName').value.trim();
    const sks = parseInt(document.getElementById('editCourseSKS').value);
    const grade = parseFloat(document.getElementById('editCourseGrade').value);
    
    // Validation
    if (!name) {
        alert('Nama mata kuliah harus diisi!');
        return;
    }
    
    if (!sks || sks < 1 || sks > 6) {
        alert('SKS harus antara 1-6!');
        return;
    }
    
    if (grade === '' || isNaN(grade)) {
        alert('Pilih nilai mata kuliah!');
        return;
    }
    
    // Update course
    semesters[editingSemesterIndex].courses[editingCourseIndex] = {
        id: semesters[editingSemesterIndex].courses[editingCourseIndex].id,
        name: name,
        sks: sks,
        grade: grade,
        gradeLetter: gradeMap[grade.toFixed(1)]
    };
    
    // Recalculate IP
    calculateSemesterIP(editingSemesterIndex);
    
    saveData();
    render();
    closeEditCourseModal();
    
    showNotification('Mata kuliah berhasil diupdate!', 'success');
}

// ========================================
// FEATURE 3: SEMESTER NOTES & TAGS
// ========================================

let editingNotesSemesterIndex = null;

function openNotesModal(semesterIndex) {
    editingNotesSemesterIndex = semesterIndex;
    const semester = semesters[semesterIndex];
    
    document.getElementById('notesSemesterNum').textContent = semester.number;
    
    // Load existing notes if any
    document.getElementById('semesterNote').value = semester.note || '';
    document.getElementById('semesterTags').value = semester.tags ? semester.tags.join(', ') : '';
    document.getElementById('semesterLesson').value = semester.lesson || '';
    
    document.getElementById('notesModal').classList.add('show');
    document.getElementById('semesterNote').focus();
}

function closeNotesModal() {
    document.getElementById('notesModal').classList.remove('show');
    editingNotesSemesterIndex = null;
}

function saveSemesterNotes() {
    const note = document.getElementById('semesterNote').value.trim();
    const tagsStr = document.getElementById('semesterTags').value.trim();
    const lesson = document.getElementById('semesterLesson').value.trim();
    
    // Parse tags
    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(t => t) : [];
    
    // Save to semester
    semesters[editingNotesSemesterIndex].note = note;
    semesters[editingNotesSemesterIndex].tags = tags;
    semesters[editingNotesSemesterIndex].lesson = lesson;
    
    saveData();
    render();
    closeNotesModal();
    
    showNotification('Catatan semester berhasil disimpan!', 'success');
}

// Update renderSemesters to include edit buttons and notes display
const originalRenderSemesters = renderSemesters;
renderSemesters = function() {
    const container = document.getElementById('semestersList');
    const emptyState = document.getElementById('emptyState');
    
    if (semesters.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    let html = '';
    
    semesters.forEach((semester, index) => {
        html += `
            <div class="semester-card">
                <div class="semester-header">
                    <div class="semester-title">
                        <h3>📝 Semester ${semester.number}</h3>
                    </div>
                    <div class="semester-stats">
                        <span>
                            <i class="fa-solid fa-chart-line"></i>
                            IP: <span class="ip-value">${semester.ip}</span>
                        </span>
                        <span>
                            <i class="fa-solid fa-book"></i>
                            SKS: ${semester.totalSKS}
                        </span>
                    </div>
                    <div class="semester-actions">
                        <button onclick="showSemesterAI(${index})" class="btn-small btn-ai">
                            <i class="fa-solid fa-brain"></i> AI
                        </button>
                        <button onclick="openNotesModal(${index})" class="btn-small btn-notes">
                            <i class="fa-solid fa-note-sticky"></i> Notes
                        </button>
                        <button onclick="openCourseModal(${index})" class="btn-small btn-add">
                            <i class="fa-solid fa-plus"></i> Tambah MK
                        </button>
                        <button onclick="deleteSemester(${index})" class="btn-small btn-delete">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                ${(semester.note || semester.tags || semester.lesson) ? `
                    <div class="semester-notes-display">
                        ${semester.note ? `<div class="note-text">📝 ${semester.note}</div>` : ''}
                        ${semester.tags && semester.tags.length > 0 ? `
                            <div class="note-tags">
                                ${semester.tags.map(tag => `<span class="note-tag">#${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                        ${semester.lesson ? `<div class="note-lesson">💡 ${semester.lesson}</div>` : ''}
                    </div>
                ` : ''}
                
                ${semester.courses.length > 0 ? `
                    <table class="courses-table">
                        <thead>
                            <tr>
                                <th>Mata Kuliah</th>
                                <th style="text-align: center;">SKS</th>
                                <th style="text-align: center;">Nilai</th>
                                <th style="text-align: center;">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${semester.courses.map((course, courseIndex) => `
                                <tr>
                                    <td class="course-name">${course.name}</td>
                                    <td style="text-align: center;">${course.sks}</td>
                                    <td style="text-align: center;" class="course-grade">
                                        ${course.gradeLetter} (${course.grade.toFixed(1)})
                                    </td>
                                    <td style="text-align: center;">
                                        <button onclick="openEditCourseModal(${index}, ${courseIndex})" class="btn-delete-course" style="color: #3b82f6; margin-right: 8px;" title="Edit">
                                            <i class="fa-solid fa-pen-to-square"></i>
                                        </button>
                                        <button onclick="deleteCourse(${index}, ${courseIndex})" class="btn-delete-course" title="Delete">
                                            <i class="fa-solid fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                ` : `
                    <div class="empty-state" style="padding: 40px 20px;">
                        <i class="fa-solid fa-book-open" style="font-size: 3rem;"></i>
                        <p style="margin-top: 10px; color: var(--gray-500);">
                            Belum ada mata kuliah. Klik "Tambah MK" untuk menambahkan.
                        </p>
                    </div>
                `}
            </div>
        `;
    });
    
    container.innerHTML = html;
};

// Call updated render on load
render();