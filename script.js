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