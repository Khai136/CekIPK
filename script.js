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
    
    // ===== ADVANCED ANALYSIS =====
    
    // 1. Grade Analysis
    const gradeCounts = { A: 0, B: 0, C: 0, D: 0 };
    let totalCourses = semester.courses.length;
    let totalPoints = 0;
    let worstCourse = semester.courses[0];
    let bestCourse = semester.courses[0];
    
    semester.courses.forEach(course => {
        totalPoints += course.grade * course.sks;
        
        if (course.grade < worstCourse.grade) worstCourse = course;
        if (course.grade > bestCourse.grade) bestCourse = course;
        
        if (course.grade >= 3.5) gradeCounts.A++;
        else if (course.grade >= 2.5) gradeCounts.B++;
        else if (course.grade >= 1.5) gradeCounts.C++;
        else gradeCounts.D++;
    });
    
    const percentA = ((gradeCounts.A / totalCourses) * 100).toFixed(0);
    const percentB = ((gradeCounts.B / totalCourses) * 100).toFixed(0);
    const percentC = ((gradeCounts.C / totalCourses) * 100).toFixed(0);
    
    // 2. Compare with other semesters
    const otherSemesters = semesters.filter((s, i) => i !== semesterIndex && s.ip > 0);
    let trendVsPrevious = '';
    let comparison = '';
    
    if (otherSemesters.length > 0) {
        const avgOtherIP = otherSemesters.reduce((sum, s) => sum + parseFloat(s.ip), 0) / otherSemesters.length;
        const currentIP = parseFloat(semester.ip);
        
        if (currentIP > avgOtherIP + 0.2) {
            comparison = `🌟 ABOVE AVERAGE! IP kamu ${(currentIP - avgOtherIP).toFixed(2)} poin lebih tinggi dari rata-rata semester lain (${avgOtherIP.toFixed(2)})`;
        } else if (currentIP < avgOtherIP - 0.2) {
            comparison = `⚠️ BELOW AVERAGE: IP kamu ${(avgOtherIP - currentIP).toFixed(2)} poin lebih rendah dari rata-rata semester lain (${avgOtherIP.toFixed(2)})`;
        } else {
            comparison = `📊 CONSISTENT: IP kamu konsisten dengan rata-rata semester lain (${avgOtherIP.toFixed(2)})`;
        }
        
        // Trend vs previous semester
        if (semesterIndex > 0) {
            const prevIP = parseFloat(semesters[semesterIndex - 1].ip);
            const diff = currentIP - prevIP;
            if (diff > 0.1) {
                trendVsPrevious = `📈 IMPROVING: IP naik ${diff.toFixed(2)} dari semester sebelumnya (${prevIP})`;
            } else if (diff < -0.1) {
                trendVsPrevious = `📉 DECLINING: IP turun ${Math.abs(diff).toFixed(2)} dari semester sebelumnya (${prevIP})`;
            } else {
                trendVsPrevious = `➡️ STABLE: IP relatif sama dengan semester sebelumnya (${prevIP})`;
            }
        }
    }
    
    // 3. Performance Level & Detailed Feedback
    const ip = parseFloat(semester.ip);
    let performance = '';
    let performanceIcon = '';
    let detailedFeedback = [];
    let actionPlan = [];
    let nextSemesterTarget = [];
    
    if (ip >= 3.75) {
        performance = 'EXCELLENT - CUM LAUDE LEVEL! 🏆';
        performanceIcon = '🌟';
        detailedFeedback = [
            `✨ Outstanding! IP ${ip} adalah prestasi luar biasa`,
            `🎯 ${percentA}% mata kuliah dapat A/A- - konsistensi sempurna`,
            `💪 Kamu sudah di top tier performance`,
            `🎓 Pertahankan ini sampai lulus untuk predikat Cum Laude`
        ];
        actionPlan = [
            '📚 MAINTAIN EXCELLENCE: Jaga pola belajar yang sudah terbukti berhasil',
            '🤝 SHARE KNOWLEDGE: Bantu teman yang struggle dengan study group',
            '🎯 AIM HIGHER: Challenge yourself dengan MK yang lebih advanced',
            '⚖️ BALANCE: Jangan burn out, jaga kesehatan mental & fisik'
        ];
        nextSemesterTarget = [
            `Target IP Semester Depan: 3.80+ (maintain excellence)`,
            `Strategi: Pertahankan ${semester.totalSKS} SKS, fokus quality over quantity`,
            `Risk: Jangan terlalu banyak ambil tanggung jawab di luar akademik`
        ];
    } else if (ip >= 3.50) {
        performance = 'GREAT JOB! ⭐';
        performanceIcon = '💪';
        detailedFeedback = [
            `👍 Bagus! IP ${ip} sudah sangat baik`,
            `🎯 ${percentA}% mata kuliah A/A-, tapi ada ruang untuk improvement`,
            `📊 Gap ke Cum Laude (3.75) hanya ${(3.75 - ip).toFixed(2)} poin`,
            `💡 With focused effort, IP 3.75+ sangat achievable!`
        ];
        actionPlan = [
            `🎯 TARGET A: Push ${gradeCounts.B} mata kuliah nilai B jadi A`,
            `📖 DEEPER STUDY: Alokasi 2-3 jam extra per minggu untuk MK utama`,
            `🤝 STUDY GROUP: Join atau buat study group untuk peer learning`,
            `📝 EARLY START: Mulai belajar dari minggu 1, jangan tunggu UTS/UAS`,
            `💬 OFFICE HOURS: Manfaatkan waktu konsultasi dosen lebih aktif`
        ];
        nextSemesterTarget = [
            `Target IP Semester Depan: 3.75-3.80 (push to excellence)`,
            `Strategi: Fokus di 3-4 MK inti, target semua A`,
            `Action: Identifikasi MK yang historically sulit, prepare lebih awal`
        ];
    } else if (ip >= 3.00) {
        performance = 'GOOD - SOLID PERFORMANCE 👍';
        performanceIcon = '📈';
        detailedFeedback = [
            `📊 IP ${ip} cukup baik, tapi potential belum maksimal`,
            `⚠️ ${percentC}% nilai C perlu attention`,
            `💡 Gap analysis: ${gradeCounts.A} MK excellent, ${gradeCounts.C} MK perlu improve`,
            `🎯 Target realistic: IP 3.5+ achievable dengan strategi yang tepat`
        ];
        actionPlan = [
            `🔍 IDENTIFY WEAKNESS: Analisa ${worstCourse.name} (${worstCourse.gradeLetter}) - kenapa nilai rendah?`,
            `📚 FOCUSED STUDY: 3-4 jam/hari focused study (pakai Pomodoro technique)`,
            `📝 ACTIVE LEARNING: Jangan cuma baca, practice dengan soal-soal`,
            `🤝 TUTOR SUPPORT: Cari tutor atau teman yang expert di MK sulit`,
            `⏰ TIME MANAGEMENT: Buat schedule study yang structured & stick to it`,
            `💬 ASK QUESTIONS: Jangan malu tanya ke dosen saat tidak paham`
        ];
        nextSemesterTarget = [
            `Target IP Semester Depan: 3.40-3.60 (significant improvement)`,
            `Strategi: Kurangi beban SKS kalau perlu, fokus kualitas`,
            `Red Flag: Hindari ambil >21 SKS kalau time management masih struggle`
        ];
    } else if (ip >= 2.50) {
        performance = 'NEEDS IMPROVEMENT ⚠️';
        performanceIcon = '💡';
        detailedFeedback = [
            `⚠️ IP ${ip} di bawah standar optimal`,
            `🚨 ${percentC + percentD}% mata kuliah nilai C/D - critical concern`,
            `💭 Possible causes: beban SKS terlalu berat, kurang fokus, atau metode belajar belum tepat`,
            `🎯 URGENT: Perlu strategi belajar yang totally different`
        ];
        actionPlan = [
            `🚨 EMERGENCY PLAN: Konsultasi dengan Dosen Pembimbing Akademik (PA) ASAP`,
            `📉 REDUCE LOAD: Semester depan ambil MAX 18 SKS, fokus quality`,
            `📚 BACK TO BASICS: Review fundamental concepts yang missed`,
            `⏰ DAILY ROUTINE: Minimal 4 jam focused study every single day`,
            `🤝 INTENSIVE TUTORING: Cari tutor profesional untuk MK yang struggle`,
            `📝 CHANGE METHOD: Coba metode belajar baru (visual, audio, practice-based)`,
            `💪 MINDSET SHIFT: Akademik = priority #1, kurangi distraction`,
            `📊 TRACK PROGRESS: Monitor kemajuan weekly, adjust strategi kalau perlu`
        ];
        nextSemesterTarget = [
            `Target IP Semester Depan: 3.00+ (minimum untuk recovery)`,
            `Strategi CRITICAL: Max 18 SKS, avoid MK sulit, ambil MK yang ada passion`,
            `Support System: Minta bantuan keluarga/teman untuk support & accountability`
        ];
    } else {
        performance = 'CRITICAL - IMMEDIATE ACTION REQUIRED! 🚨';
        performanceIcon = '🆘';
        detailedFeedback = [
            `🚨 ALERT: IP ${ip} sangat mengkhawatirkan`,
            `⛔ Status akademik dalam bahaya, risiko DO (Drop Out) tinggi`,
            `💭 This is a wake-up call - perlu perubahan drastis SEGERA`,
            `🆘 Jangan handle sendiri - butuh professional help`
        ];
        actionPlan = [
            `🚨 IMMEDIATE: Temui Dosen PA HARI INI - diskusikan academic probation`,
            `📞 CALL HOME: Bicara dengan orangtua/keluarga tentang situasi`,
            `🏥 CHECK HEALTH: Mungkin ada masalah kesehatan/mental yang unaddressed`,
            `📚 ACADEMIC WORKSHOP: Ikut workshop/kelas study skills & time management`,
            `💰 CONSIDER: Apakah perlu cuti kuliah untuk regroup & restart strong?`,
            `🤝 SUPPORT GROUP: Join academic support group atau counseling`,
            `⚡ MAJOR RESET: Reevaluate jurusan, metode belajar, life priorities`,
            `📊 INTERVENTION PLAN: Buat concrete action plan dengan target terukur`
        ];
        nextSemesterTarget = [
            `Target IP Semester Depan: 2.50+ (survival mode - prevent DO)`,
            `Strategi SURVIVAL: MAX 12-15 SKS, pilih MK termudah`,
            `CRITICAL: Semester depan make or break - all hands on deck`
        ];
    }
    
    // 4. SKS Analysis
    let sksComment = '';
    let sksAdvice = [];
    
    if (semester.totalSKS > 24) {
        sksComment = '🚨 OVERLOAD ALERT! SKS terlalu tinggi';
        sksAdvice = [
            `⚠️ ${semester.totalSKS} SKS is too much - quality suffered`,
            `📉 Correlation: High SKS often leads to lower IP`,
            `💡 Next sem: Turun ke 18-21 SKS untuk optimal performance`,
            `🎯 Better: IP 3.8 with 20 SKS than IP 3.2 with 26 SKS`
        ];
    } else if (semester.totalSKS >= 22) {
        sksComment = '⚠️ HEAVY LOAD - Be careful!';
        sksAdvice = [
            `📚 ${semester.totalSKS} SKS adalah beban berat`,
            `⏰ Needs 5-6 hours daily study untuk maintain quality`,
            `💡 Evaluate: Apakah all MK benar-benar necessary this sem?`,
            `🎯 Consider: Kalau IP turun, reduce SKS semester depan`
        ];
    } else if (semester.totalSKS >= 18 && semester.totalSKS <= 21) {
        sksComment = '✅ OPTIMAL LOAD - Perfect balance!';
        sksAdvice = [
            `💯 ${semester.totalSKS} SKS is the sweet spot`,
            `⚖️ Good balance: Manageable workload + good progress`,
            `🎯 Pertahankan range 18-21 SKS untuk consistent performance`,
            `📈 With proper time management, IP 3.5+ very achievable`
        ];
    } else {
        sksComment = '💡 LIGHT LOAD - Room to push!';
        sksAdvice = [
            `📚 ${semester.totalSKS} SKS cukup ringan`,
            `🎯 Opportunity: Could add 1-2 MK if confident`,
            `💪 Or: Use extra time untuk deeper mastery & side projects`,
            `⚖️ Balance: More MK vs better grades - choose wisely`
        ];
    }
    
    // 5. Grade Distribution Deep Dive
    let gradeInsights = [];
    if (percentA >= 70) {
        gradeInsights = [
            `🌟 EXCELLENT distribution: ${percentA}% A grades`,
            `💯 You're in top tier - consistency level expert`,
            `🎯 Keep this up for Cum Laude track`
        ];
    } else if (percentA >= 50) {
        gradeInsights = [
            `👍 Good distribution: ${percentA}% A, but room to grow`,
            `🎯 Target: Push 1-2 B grades to A next semester`,
            `💡 Focus on MK dengan potential: yang dapet B+ bisa jadi A`
        ];
    } else if (percentC > 30 || gradeCounts.D > 0) {
        gradeInsights = [
            `⚠️ ALERT: ${percentC}% C grades, ${gradeCounts.D} D grades`,
            `🚨 This pattern is concerning - need strategic intervention`,
            `💡 Problem solve: Identifikasi ROOT CAUSE (metode belajar? time mgmt? understand concept?)`,
            `🎯 Action: Fokus eliminate semua C/D, target minimal B di semua MK`
        ];
    } else {
        gradeInsights = [
            `📊 Balanced distribution dengan room for improvement`,
            `💡 ${gradeCounts.B} MK nilai B could become A with extra effort`,
            `🎯 Target next sem: 60%+ A grades untuk significant IPK boost`
        ];
    }
    
    // 6. Calculate IPK Impact
    const result = calculateIPK();
    const currentIPK = parseFloat(result.ipk);
    let ipkImpact = '';
    
    if (currentIPK > 0) {
        if (ip > currentIPK) {
            ipkImpact = `📈 POSITIVE IMPACT: Semester ini BOOST IPK kamu sebesar ${(ip - currentIPK).toFixed(3)} poin`;
        } else if (ip < currentIPK) {
            ipkImpact = `📉 NEGATIVE IMPACT: Semester ini TURUNKAN IPK sebesar ${(currentIPK - ip).toFixed(3)} poin`;
        } else {
            ipkImpact = `➡️ NEUTRAL: Semester ini maintain IPK di ${currentIPK}`;
        }
    }
    
    // Build comprehensive message
    let message = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 ADVANCED AI ANALYSIS
SEMESTER ${semester.number}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

${performanceIcon} OVERALL PERFORMANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━
${performance}

📊 CORE STATISTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━
• IP Semester: ${ip}
• Total SKS: ${semester.totalSKS}
• Total Mata Kuliah: ${totalCourses}
• IPK Kumulatif: ${currentIPK}

${ipkImpact}

📈 GRADE DISTRIBUTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━
• A/A-: ${percentA}% (${gradeCounts.A} MK)
• B/B-: ${percentB}% (${gradeCounts.B} MK)
• C/C-: ${percentC}% (${gradeCounts.C} MK)
${gradeCounts.D > 0 ? `• D/E: ${((gradeCounts.D / totalCourses) * 100).toFixed(0)}% (${gradeCounts.D} MK)` : ''}

🏆 Best Performance: ${bestCourse.name} (${bestCourse.gradeLetter})
${worstCourse.grade < 3.0 ? `⚠️ Needs Attention: ${worstCourse.name} (${worstCourse.gradeLetter})` : ''}

${comparison ? `\n📊 COMPARISON\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${comparison}` : ''}
${trendVsPrevious ? `${trendVsPrevious}\n` : ''}

💡 DETAILED INSIGHTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━
${detailedFeedback.map(f => `${f}`).join('\n')}

📚 SKS ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━
${sksComment}
${sksAdvice.map(a => `${a}`).join('\n')}

🎯 GRADE INSIGHTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━
${gradeInsights.join('\n')}

🚀 ACTION PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━
${actionPlan.map((tip, i) => `${i + 1}. ${tip}`).join('\n\n')}

🎯 NEXT SEMESTER STRATEGY
━━━━━━━━━━━━━━━━━━━━━━━━━━━
${nextSemesterTarget.join('\n')}

💡 FINAL NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Success = Consistency + Smart Work
• Track progress weekly, adjust strategy monthly
• Don't compare with others, compare with your past self
• Remember: GPA is important, but not everything
• Health (mental & physical) > Grades
• You got this! 💪

━━━━━━━━━━━━━━━━━━━━━━━━━━━
Powered by Gradify AI ✨
━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

// ========================================
// FEATURE 1: INTERACTIVE CHARTS
// ========================================

let ipChartInstance = null;
let gradeChartInstance = null;

function showCharts() {
    if (semesters.length === 0) {
        alert('Belum ada data untuk ditampilkan!\n\nTambahkan semester terlebih dahulu.');
        return;
    }
    
    document.getElementById('chartsModal').classList.add('show');
    
    // Delay untuk memastikan canvas sudah terlihat
    setTimeout(() => {
        renderCharts();
    }, 100);
}

function closeChartsModal() {
    document.getElementById('chartsModal').classList.remove('show');
}

function renderCharts() {
    // Data preparation
    const semesterLabels = semesters.map(s => `Sem ${s.number}`);
    const ipData = semesters.map(s => parseFloat(s.ip));
    
    // Count grades per semester
    const gradeData = {
        A: [],
        B: [],
        C: []
    };
    
    semesters.forEach(sem => {
        let countA = 0, countB = 0, countC = 0;
        sem.courses.forEach(course => {
            if (course.grade >= 3.5) countA++;
            else if (course.grade >= 2.5) countB++;
            else countC++;
        });
        gradeData.A.push(countA);
        gradeData.B.push(countB);
        gradeData.C.push(countC);
    });
    
    // Chart 1: IP Progress Line Chart
    const ctx1 = document.getElementById('ipChart').getContext('2d');
    
    if (ipChartInstance) {
        ipChartInstance.destroy();
    }
    
    ipChartInstance = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: semesterLabels,
            datasets: [{
                label: 'IP per Semester',
                data: ipData,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99,102,241,0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointBackgroundColor: '#6366f1',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '📈 Progress IP per Semester',
                    font: {
                        size: 18,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 0,
                    max: 4.0,
                    ticks: {
                        stepSize: 0.5
                    }
                }
            }
        }
    });
    
    // Chart 2: Grade Distribution Bar Chart
    const ctx2 = document.getElementById('gradeChart').getContext('2d');
    
    if (gradeChartInstance) {
        gradeChartInstance.destroy();
    }
    
    gradeChartInstance = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: semesterLabels,
            datasets: [
                {
                    label: 'A/A-',
                    data: gradeData.A,
                    backgroundColor: '#10b981',
                    borderRadius: 8
                },
                {
                    label: 'B',
                    data: gradeData.B,
                    backgroundColor: '#3b82f6',
                    borderRadius: 8
                },
                {
                    label: 'C/D',
                    data: gradeData.C,
                    backgroundColor: '#f59e0b',
                    borderRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '📊 Distribusi Nilai per Semester',
                    font: {
                        size: 18,
                        weight: 'bold'
                    }
                }
            },
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    stacked: true,
                    beginAtZero: true
                }
            }
        }
    });
}

// ========================================
// FEATURE 2: ACHIEVEMENT SYSTEM
// ========================================

const achievements = [
    {
        id: 'perfect_semester',
        icon: '🥇',
        name: 'Perfect Semester',
        desc: 'IP 4.0 di satu semester',
        check: () => semesters.some(s => parseFloat(s.ip) === 4.0)
    },
    {
        id: 'cum_laude',
        icon: '🎓',
        name: 'Cum Laude Track',
        desc: 'IPK 3.75 atau lebih',
        check: () => {
            const result = calculateIPK();
            return parseFloat(result.ipk) >= 3.75;
        }
    },
    {
        id: 'bookworm',
        icon: '📚',
        name: 'Bookworm',
        desc: 'Total 50+ mata kuliah',
        check: () => {
            let total = 0;
            semesters.forEach(s => total += s.courses.length);
            return total >= 50;
        }
    },
    {
        id: 'hot_streak',
        icon: '🔥',
        name: 'Hot Streak',
        desc: 'IP naik 3 semester berturut-turut',
        check: () => {
            let streak = 0;
            for (let i = 1; i < semesters.length; i++) {
                if (parseFloat(semesters[i].ip) > parseFloat(semesters[i-1].ip)) {
                    streak++;
                    if (streak >= 3) return true;
                } else {
                    streak = 0;
                }
            }
            return false;
        }
    },
    {
        id: 'all_as',
        icon: '⭐',
        name: "All A's",
        desc: 'Semua A di satu semester',
        check: () => semesters.some(s => {
            if (s.courses.length === 0) return false;
            return s.courses.every(c => c.grade >= 3.7);
        })
    },
    {
        id: 'consistency',
        icon: '💎',
        name: 'Consistency King',
        desc: 'IP stabil ±0.1 selama 4 semester',
        check: () => {
            if (semesters.length < 4) return false;
            const last4 = semesters.slice(-4).map(s => parseFloat(s.ip));
            const avg = last4.reduce((a,b) => a+b) / 4;
            return last4.every(ip => Math.abs(ip - avg) <= 0.1);
        }
    },
    {
        id: 'comeback',
        icon: '🚀',
        name: 'Comeback Kid',
        desc: 'IP naik 0.5+ setelah turun',
        check: () => {
            for (let i = 2; i < semesters.length; i++) {
                const prev = parseFloat(semesters[i-2].ip);
                const dropped = parseFloat(semesters[i-1].ip);
                const current = parseFloat(semesters[i].ip);
                if (dropped < prev && current >= dropped + 0.5) {
                    return true;
                }
            }
            return false;
        }
    },
    {
        id: 'overachiever',
        icon: '🎯',
        name: 'Overachiever',
        desc: '24+ SKS dengan IP 3.5+',
        check: () => semesters.some(s => s.totalSKS >= 24 && parseFloat(s.ip) >= 3.5)
    },
    {
        id: 'rising_star',
        icon: '🌟',
        name: 'Rising Star',
        desc: 'IP naik 0.5+ dari semester pertama',
        check: () => {
            if (semesters.length < 2) return false;
            const first = parseFloat(semesters[0].ip);
            const latest = parseFloat(semesters[semesters.length - 1].ip);
            return latest >= first + 0.5;
        }
    },
    {
        id: 'century',
        icon: '💯',
        name: 'Century Club',
        desc: '100+ SKS total',
        check: () => {
            const result = calculateIPK();
            return result.totalSKS >= 100;
        }
    },
    {
        id: 'brain',
        icon: '🧠',
        name: 'The Brain',
        desc: '10+ nilai A total',
        check: () => {
            let countA = 0;
            semesters.forEach(s => {
                s.courses.forEach(c => {
                    if (c.grade >= 3.7) countA++;
                });
            });
            return countA >= 10;
        }
    },
    {
        id: 'legendary',
        icon: '🏆',
        name: 'Legendary',
        desc: 'IPK 3.90+',
        check: () => {
            const result = calculateIPK();
            return parseFloat(result.ipk) >= 3.90;
        }
    }
];

function showAchievements() {
    document.getElementById('achievementsModal').classList.add('show');
    renderAchievements();
}

function closeAchievementsModal() {
    document.getElementById('achievementsModal').classList.remove('show');
}

function renderAchievements() {
    const unlockedAchievements = achievements.filter(a => a.check());
    const lockedAchievements = achievements.filter(a => !a.check());
    
    let html = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="font-size: 1.5rem; margin-bottom: 10px;">
                🏆 ${unlockedAchievements.length}/${achievements.length} Unlocked
            </h3>
            <div style="background: var(--gray-100); height: 12px; border-radius: 999px; overflow: hidden;">
                <div style="width: ${(unlockedAchievements.length/achievements.length*100)}%; height: 100%; background: linear-gradient(90deg, var(--success), var(--primary)); transition: width 1s;"></div>
            </div>
        </div>
        <div class="achievements-grid">
    `;
    
    // Unlocked first
    unlockedAchievements.forEach(ach => {
        html += `
            <div class="achievement-item unlocked">
                <div class="achievement-icon">${ach.icon}</div>
                <div class="achievement-name">${ach.name}</div>
                <div class="achievement-desc">${ach.desc}</div>
                <div class="achievement-unlocked-badge">✅ Unlocked</div>
            </div>
        `;
    });
    
    // Then locked
    lockedAchievements.forEach(ach => {
        html += `
            <div class="achievement-item locked">
                <div class="achievement-icon">${ach.icon}</div>
                <div class="achievement-name">${ach.name}</div>
                <div class="achievement-desc">${ach.desc}</div>
                <div class="achievement-progress">🔒 Locked</div>
            </div>
        `;
    });
    
    html += '</div>';
    
    document.getElementById('achievementsList').innerHTML = html;
}

function checkNewAchievements() {
    // Check if new achievement unlocked
    const savedAchievements = JSON.parse(localStorage.getItem('ipk_achievements') || '[]');
    const currentUnlocked = achievements.filter(a => a.check()).map(a => a.id);
    
    // Find newly unlocked
    const newUnlocked = currentUnlocked.filter(id => !savedAchievements.includes(id));
    
    if (newUnlocked.length > 0) {
        // Show popup & confetti for first new achievement
        const achievement = achievements.find(a => a.id === newUnlocked[0]);
        showAchievementPopup(achievement);
        triggerConfetti();
    }
    
    // Save current state
    localStorage.setItem('ipk_achievements', JSON.stringify(currentUnlocked));
}

function showAchievementPopup(achievement) {
    const popup = document.createElement('div');
    popup.className = 'achievement-popup';
    popup.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <h2>Achievement Unlocked!</h2>
        <p><strong>${achievement.name}</strong></p>
        <p>${achievement.desc}</p>
    `;
    document.body.appendChild(popup);
    
    setTimeout(() => {
        popup.remove();
    }, 4000);
}

function triggerConfetti() {
    const canvas = document.getElementById('confetti');
    const ctx = canvas.getContext('2d');
    canvas.style.display = 'block';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const confettiPieces = [];
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];
    
    for (let i = 0; i < 100; i++) {
        confettiPieces.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 10 + 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedX: Math.random() * 4 - 2,
            speedY: Math.random() * 3 + 2,
            rotation: Math.random() * 360
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        confettiPieces.forEach((piece, index) => {
            ctx.save();
            ctx.translate(piece.x, piece.y);
            ctx.rotate((piece.rotation * Math.PI) / 180);
            ctx.fillStyle = piece.color;
            ctx.fillRect(-piece.size/2, -piece.size/2, piece.size, piece.size);
            ctx.restore();
            
            piece.x += piece.speedX;
            piece.y += piece.speedY;
            piece.rotation += 5;
            
            if (piece.y > canvas.height) {
                confettiPieces.splice(index, 1);
            }
        });
        
        if (confettiPieces.length > 0) {
            requestAnimationFrame(animate);
        } else {
            canvas.style.display = 'none';
        }
    }
    
    animate();
}

// ========================================
// FEATURE 3: SHARE CARDS GENERATOR
// ========================================

function showShareCard() {
    if (semesters.length === 0) {
        alert('Belum ada data untuk dibagikan!\n\nTambahkan semester terlebih dahulu.');
        return;
    }
    
    document.getElementById('shareModal').classList.add('show');
    renderShareCard();
}

function closeShareModal() {
    document.getElementById('shareModal').classList.remove('show');
}

function renderShareCard() {
    const result = calculateIPK();
    const ipk = parseFloat(result.ipk);
    
    // Count A grades
    let totalA = 0;
    semesters.forEach(s => {
        s.courses.forEach(c => {
            if (c.grade >= 3.5) totalA++;
        });
    });
    
    const html = `
        <div class="share-card-content">
            <h2>🎓 MY GPA CARD</h2>
            <div class="share-card-label">IPK Kumulatif</div>
            <div class="share-card-ipk">${ipk}</div>
            <div class="share-card-label">${result.predikat}</div>
            
            <div class="share-card-stats">
                <div class="share-card-stat">
                    <span class="share-card-stat-value">${result.totalSKS}</span>
                    <span class="share-card-stat-label">Total SKS</span>
                </div>
                <div class="share-card-stat">
                    <span class="share-card-stat-value">${semesters.length}</span>
                    <span class="share-card-stat-label">Semesters</span>
                </div>
                <div class="share-card-stat">
                    <span class="share-card-stat-value">${totalA}</span>
                    <span class="share-card-stat-label">A Grades</span>
                </div>
            </div>
            
            <div class="share-card-footer">
                Made with Gradify ✨
            </div>
        </div>
    `;
    
    document.getElementById('shareCard').innerHTML = html;
}

function downloadShareCard() {
    const card = document.getElementById('shareCard');
    
    html2canvas(card, {
        backgroundColor: null,
        scale: 2
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `gradify-gpa-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
        
        showNotification('Share card downloaded!', 'success');
    });
}

function copyShareText() {
    const result = calculateIPK();
    
    let text = `🎓 MY ACADEMIC PROGRESS\n\n`;
    text += `IPK: ${result.ipk}\n`;
    text += `Predikat: ${result.predikat}\n`;
    text += `Total SKS: ${result.totalSKS}\n`;
    text += `Semesters: ${semesters.length}\n\n`;
    
    semesters.forEach(s => {
        text += `Semester ${s.number}: IP ${s.ip} (${s.totalSKS} SKS)\n`;
    });
    
    text += `\nMade with Gradify ✨`;
    
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Text copied to clipboard!', 'success');
    });
}

// Hook into existing functions to check achievements
const originalSaveCourse = saveCourse;
saveCourse = function() {
    originalSaveCourse();
    setTimeout(checkNewAchievements, 500);
};

const originalSaveEditCourse = saveEditCourse;
saveEditCourse = function() {
    originalSaveEditCourse();
    setTimeout(checkNewAchievements, 500);
};