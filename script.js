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
// ========================================
// AI SMART ANALYSIS - ADDED
// ========================================

class AIAnalyzer {
    constructor(semesters) {
        this.semesters = semesters;
    }

    analyzeTrend() {
        if (this.semesters.length < 2) return { trend: 'insufficient_data', direction: 'neutral' };
        const ips = this.semesters.map(s => parseFloat(s.ip));
        let increases = 0, decreases = 0;
        for (let i = 1; i < ips.length; i++) {
            if (ips[i] > ips[i-1]) increases++;
            else if (ips[i] < ips[i-1]) decreases++;
        }
        if (increases > decreases) return { trend: 'improving', direction: 'up', strength: increases };
        if (decreases > increases) return { trend: 'declining', direction: 'down', strength: decreases };
        return { trend: 'stable', direction: 'neutral' };
    }

    findProblematicSemester() {
        if (this.semesters.length < 2) return null;
        let worstSem = this.semesters[0];
        let worstIP = parseFloat(worstSem.ip);
        this.semesters.forEach(sem => {
            const ip = parseFloat(sem.ip);
            if (ip < worstIP && ip > 0) {
                worstIP = ip;
                worstSem = sem;
            }
        });
        return worstSem;
    }

    findBestSemester() {
        if (this.semesters.length === 0) return null;
        let bestSem = this.semesters[0];
        let bestIP = parseFloat(bestSem.ip);
        this.semesters.forEach(sem => {
            const ip = parseFloat(sem.ip);
            if (ip > bestIP) {
                bestIP = ip;
                bestSem = sem;
            }
        });
        return bestSem;
    }

    analyzeSKSLoad() {
        const avgSKS = this.semesters.reduce((sum, s) => sum + s.totalSKS, 0) / this.semesters.length;
        const maxSKS = Math.max(...this.semesters.map(s => s.totalSKS));
        const minSKS = Math.min(...this.semesters.map(s => s.totalSKS));
        return { avgSKS: avgSKS.toFixed(1), maxSKS, minSKS };
    }

    analyzeGrades() {
        const gradeCounts = { A: 0, B: 0, C: 0, D: 0, E: 0 };
        let totalCourses = 0;
        this.semesters.forEach(sem => {
            sem.courses.forEach(course => {
                totalCourses++;
                if (course.grade >= 3.5) gradeCounts.A++;
                else if (course.grade >= 2.5) gradeCounts.B++;
                else if (course.grade >= 1.5) gradeCounts.C++;
                else if (course.grade >= 1.0) gradeCounts.D++;
                else gradeCounts.E++;
            });
        });
        return {
            A: ((gradeCounts.A / totalCourses) * 100).toFixed(1),
            B: ((gradeCounts.B / totalCourses) * 100).toFixed(1),
            C: ((gradeCounts.C / totalCourses) * 100).toFixed(1),
            D: ((gradeCounts.D / totalCourses) * 100).toFixed(1),
            E: ((gradeCounts.E / totalCourses) * 100).toFixed(1),
            total: totalCourses
        };
    }

    generateRecommendations() {
        const result = calculateIPK();
        const ipk = parseFloat(result.ipk);
        const trend = this.analyzeTrend();
        const sksLoad = this.analyzeSKSLoad();
        const grades = this.analyzeGrades();
        const recommendations = [];

        if (ipk >= 3.75) {
            recommendations.push({
                type: 'success',
                icon: 'fa-trophy',
                title: 'Excellent Performance! 🏆',
                message: 'IPK kamu sudah Cum Laude level! Pertahankan konsistensi ini sampai akhir.'
            });
        } else if (ipk >= 3.50) {
            recommendations.push({
                type: 'success',
                icon: 'fa-star',
                title: 'Great Job! ⭐',
                message: `IPK kamu ${ipk}, tinggal ${(3.75 - ipk).toFixed(2)} lagi untuk Cum Laude!`
            });
        } else if (ipk >= 3.00) {
            recommendations.push({
                type: 'warning',
                icon: 'fa-chart-line',
                title: 'Good Progress 📈',
                message: `IPK kamu ${ipk}. Fokus naikkan ke 3.5+ untuk predikat lebih baik.`
            });
        } else if (ipk > 0) {
            recommendations.push({
                type: 'danger',
                icon: 'fa-exclamation-triangle',
                title: 'Perlu Perhatian! ⚠️',
                message: `IPK ${ipk} perlu ditingkatkan. Focus, konsisten, dan jangan menyerah!`
            });
        }

        if (trend.direction === 'down') {
            recommendations.push({
                type: 'warning',
                icon: 'fa-arrow-trend-down',
                title: 'IP Menurun',
                message: `IP kamu turun di ${trend.strength} semester terakhir.`,
                suggestions: [
                    'Kurangi beban SKS semester depan (max 20 SKS)',
                    'Identifikasi mata kuliah sulit dan fokus di sana',
                    'Join study group atau cari tutor',
                    'Atur jadwal belajar lebih terstruktur'
                ]
            });
        } else if (trend.direction === 'up') {
            recommendations.push({
                type: 'success',
                icon: 'fa-arrow-trend-up',
                title: 'Tren Positif! 📈',
                message: `IP kamu naik di ${trend.strength} semester terakhir. Pertahankan!`
            });
        }

        if (sksLoad.maxSKS > 24) {
            recommendations.push({
                type: 'warning',
                icon: 'fa-book',
                title: 'Beban SKS Terlalu Tinggi',
                message: `Max SKS kamu ${sksLoad.maxSKS} - terlalu banyak! Ideal: 18-21 SKS.`,
                suggestions: [
                    'Kurangi SKS semester depan jadi 18-21 SKS',
                    'Prioritas kualitas daripada kuantitas'
                ]
            });
        }

        if (parseFloat(grades.C) > 20 || parseFloat(grades.D) > 5) {
            recommendations.push({
                type: 'warning',
                icon: 'fa-chart-pie',
                title: 'Distribusi Nilai Perlu Diperbaiki',
                message: `${grades.C}% nilai C dan ${grades.D}% nilai D.`,
                suggestions: [
                    'Fokus di 3-4 mata kuliah inti per semester',
                    'Mulai belajar dari awal, jangan SKS (Sistem Kebut Semalam)',
                    'Aktif bertanya ke dosen saat tidak paham'
                ]
            });
        } else if (parseFloat(grades.A) > 60) {
            recommendations.push({
                type: 'success',
                icon: 'fa-medal',
                title: 'Distribusi Nilai Excellent!',
                message: `${grades.A}% nilai A/A- - Luar biasa konsisten!`
            });
        }

        return recommendations;
    }

    analyze() {
        if (this.semesters.length === 0) {
            return { status: 'no_data', message: 'Belum ada data untuk dianalisis.' };
        }
        return {
            status: 'success',
            trend: this.analyzeTrend(),
            sksLoad: this.analyzeSKSLoad(),
            grades: this.analyzeGrades(),
            recommendations: this.generateRecommendations(),
            worstSem: this.findProblematicSemester(),
            bestSem: this.findBestSemester()
        };
    }
}

function showAIAnalysis() {
    if (semesters.length === 0) {
        alert('Belum ada data!\n\nTambahkan semester dan mata kuliah dulu.');
        return;
    }
    document.getElementById('aiModal').classList.add('show');
    document.getElementById('aiAnalysisContent').innerHTML = `
        <div class="ai-loading">
            <div class="ai-loading-spinner"></div>
            <p>AI sedang menganalisis data kamu...</p>
        </div>
    `;
    setTimeout(() => {
        const analyzer = new AIAnalyzer(semesters);
        const analysis = analyzer.analyze();
        if (analysis.status === 'no_data') {
            document.getElementById('aiAnalysisContent').innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-inbox"></i>
                    <h3>Belum Ada Data</h3>
                    <p>${analysis.message}</p>
                </div>
            `;
            return;
        }
        renderAIAnalysis(analysis);
    }, 1500);
}

function closeAIModal() {
    document.getElementById('aiModal').classList.remove('show');
}

function renderAIAnalysis(analysis) {
    const result = calculateIPK();
    const ipk = parseFloat(result.ipk);
    let html = `
        <div class="ai-section ${ipk >= 3.5 ? 'success' : ipk >= 3.0 ? 'warning' : 'danger'}">
            <div class="ai-section-header">
                <div class="ai-section-icon"><i class="fa-solid fa-graduation-cap"></i></div>
                <span>Status Akademik Overall</span>
            </div>
            <div class="ai-section-content">
                <div class="ai-stats-grid">
                    <div class="ai-stat-item">
                        <span class="ai-stat-value">${result.ipk}</span>
                        <span class="ai-stat-label">IPK Kumulatif</span>
                    </div>
                    <div class="ai-stat-item">
                        <span class="ai-stat-value">${result.totalSKS}</span>
                        <span class="ai-stat-label">Total SKS</span>
                    </div>
                    <div class="ai-stat-item">
                        <span class="ai-stat-value">${result.predikat}</span>
                        <span class="ai-stat-label">Predikat</span>
                    </div>
                </div>
                ${ipk < 3.75 ? `
                    <div class="ai-progress-bar">
                        <div class="ai-progress-fill" style="width: ${(ipk / 4.0) * 100}%"></div>
                    </div>
                    <p style="text-align: center; margin-top: 10px;">
                        Progress ke Cum Laude: ${((ipk / 3.75) * 100).toFixed(1)}%
                    </p>
                ` : ''}
            </div>
        </div>
    `;

    if (analysis.trend.direction !== 'neutral') {
        html += `
            <div class="ai-section ${analysis.trend.direction === 'up' ? 'success' : 'warning'}">
                <div class="ai-section-header">
                    <div class="ai-section-icon">
                        <i class="fa-solid fa-chart-${analysis.trend.direction === 'up' ? 'line' : 'line-down'}"></i>
                    </div>
                    <span>Tren Performa</span>
                </div>
                <div class="ai-section-content">
                    <p>${analysis.trend.direction === 'up' ? 
                        `✅ IP menunjukkan tren NAIK di ${analysis.trend.strength} semester terakhir!` :
                        `⚠️ IP menunjukkan tren TURUN di ${analysis.trend.strength} semester terakhir.`
                    }</p>
                    ${analysis.bestSem ? `<p style="margin-top:10px;"><strong>IP Tertinggi:</strong> ${analysis.bestSem.ip} (Sem ${analysis.bestSem.number})</p>` : ''}
                    ${analysis.worstSem ? `<p><strong>IP Terendah:</strong> ${analysis.worstSem.ip} (Sem ${analysis.worstSem.number})</p>` : ''}
                </div>
            </div>
        `;
    }

    html += `
        <div class="ai-section">
            <div class="ai-section-header">
                <div class="ai-section-icon"><i class="fa-solid fa-chart-pie"></i></div>
                <span>Distribusi Nilai</span>
            </div>
            <div class="ai-section-content">
                <p>Dari <strong>${analysis.grades.total}</strong> mata kuliah:</p>
                <div style="margin: 15px 0;">
                    <span class="ai-badge success">A/A-: ${analysis.grades.A}%</span>
                    <span class="ai-badge">B: ${analysis.grades.B}%</span>
                    <span class="ai-badge warning">C: ${analysis.grades.C}%</span>
                    ${parseFloat(analysis.grades.D) > 0 ? `<span class="ai-badge danger">D: ${analysis.grades.D}%</span>` : ''}
                </div>
            </div>
        </div>
    `;

    html += `
        <div class="ai-section">
            <div class="ai-section-header">
                <div class="ai-section-icon"><i class="fa-solid fa-book-open"></i></div>
                <span>Beban SKS</span>
            </div>
            <div class="ai-section-content">
                <p><strong>Rata-rata:</strong> ${analysis.sksLoad.avgSKS} SKS | <strong>Max:</strong> ${analysis.sksLoad.maxSKS} SKS</p>
                ${parseFloat(analysis.sksLoad.avgSKS) > 21 ? 
                    `<p style="margin-top:10px;">⚠️ Beban SKS tinggi. Ideal: 18-21 SKS/semester.</p>` :
                    `<p style="margin-top:10px;">✅ Beban SKS ideal!</p>`
                }
            </div>
        </div>
    `;

    analysis.recommendations.forEach(rec => {
        html += `
            <div class="ai-section ${rec.type}">
                <div class="ai-section-header">
                    <div class="ai-section-icon"><i class="fa-solid ${rec.icon}"></i></div>
                    <span>${rec.title}</span>
                </div>
                <div class="ai-section-content">
                    <p>${rec.message}</p>
                    ${rec.suggestions ? `<ul class="ai-list ${rec.type}">
                        ${rec.suggestions.map(s => `<li>${s}</li>`).join('')}
                    </ul>` : ''}
                </div>
            </div>
        `;
    });

    html += `
        <div class="ai-tip-box">
            <i class="fa-solid fa-lightbulb"></i>
            <div>
                <div class="ai-tip-title">💡 Pro Tip</div>
                <div class="ai-tip-text">
                    Konsistensi = Kunci! Belajar rutin lebih efektif daripada SKS (Sistem Kebut Semalam). 📚✨
                </div>
            </div>
        </div>
    `;

    document.getElementById('aiAnalysisContent').innerHTML = html;
}