document.addEventListener('DOMContentLoaded', () => {
    const scheduleView = document.getElementById('scheduleView');
    if (!scheduleView) return;

    const userId = localStorage.getItem("loggedInUser") || "guest";
    const STORAGE_KEY = `domado-schedule-${userId}`;

    let schedules = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const currentDateEl = document.getElementById("scheduleCurrentDate");
    const listEl        = document.getElementById("scheduleList");

    const scheduleModal      = document.getElementById("scheduleModal");
    const scheduleTimeInput  = document.getElementById("scheduleTime");
    const scheduleTextInput  = document.getElementById("scheduleText");
    const scheduleSaveBtn    = document.getElementById("scheduleSaveBtn");
    const scheduleCancelBtn  = document.getElementById("scheduleCancelBtn");

    if ( !currentDateEl || !listEl || !scheduleModal || !scheduleTimeInput || !scheduleTextInput || !scheduleSaveBtn || !scheduleCancelBtn) {
        console.error('schedule.js: 필수 요소를 찾지 못했습니다.'); return;
    }
    

    // ✅ 현재 선택된 날짜를 공용 dateBar에서 읽어오기
    function getSelectedDate() {
        const selectedBtn = document.querySelector('#dateBar .date-btn.selected');
        if (selectedBtn && selectedBtn.dataset.date) {
            return selectedBtn.dataset.date; // YYYY-MM-DD
        }
        // 혹시 없으면 오늘 날짜 fallback
        const d = new Date();
        return d.toISOString().slice(0,10);
    }

    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
    }

    // ✅ 현재 선택된 날짜 기준으로 일정 리스트 렌더
    function renderScheduleForCurrentDate() {
    const currentDate = getSelectedDate();

    const d = new Date(currentDate);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[d.getDay()];

    currentDateEl.textContent = `${y}년 ${m}월 ${day}일 (${dayName})`;

    listEl.innerHTML = "";

    // ✅ 오늘 날짜의 일정 배열
    const list = schedules[currentDate] || [];

    // 일정이 하나도 없을 때
    if (!list.length) {
        const li = document.createElement("li");
        li.textContent = "일정을 추가해 보세요.";
        li.className = "hint-text";
        listEl.appendChild(li);
        return;
    }

    // ✅ 여기서 한 번만 정렬: 미완료 → 완료, 그리고 시간순
    list.sort((a, b) => {
        // 1) done 기준: 완료(true)는 아래로
        if (a.done !== b.done) {
            return a.done ? 1 : -1;  // a가 완료면 뒤로
        }

        // 2) 둘 다 같은 done 상태면 시간 기준
        if (!a.time && !b.time) return 0;
        if (!a.time) return 1;      // 시간 없는 건 아래로
        if (!b.time) return -1;
        return a.time.localeCompare(b.time); // "HH:MM" 문자열 비교
    });

    // ✅ 정렬된 순서대로 렌더링
    list.forEach((item, i) => {
        const li = document.createElement("li");
        li.className = "schedule-item";
        li.classList.toggle("done", item.done);

        const time = document.createElement("div");
        time.className = "schedule-time";
        time.textContent = item.time || "-";

        const text = document.createElement("div");
        text.className = "schedule-text";
        text.textContent = item.text;
        text.classList.toggle("done", item.done);

        const doneBtn = document.createElement("button");
        doneBtn.className = "btn-icon btn-check";
        doneBtn.textContent = item.done ? "🍅" : "✔";
        doneBtn.onclick = () => {
            item.done = !item.done;     // 상태 토글
            save();
            renderScheduleForCurrentDate(); // 다시 렌더 → 정렬 다시 적용
        };

        const delBtn = document.createElement("button");
        delBtn.className = "btn-icon btn-delete";
        delBtn.textContent = "🗑";
        delBtn.onclick = () => {
            list.splice(i, 1);
            save();
            renderScheduleForCurrentDate();
        };

        li.append(time, text, doneBtn, delBtn);
        listEl.appendChild(li);
    });
    }
    

    // ✅ 일정 추가 모달
    function openScheduleModal() {
        scheduleTimeInput.value = "";
        scheduleTextInput.value = "";
        scheduleModal.classList.remove("hidden");
        scheduleTimeInput.focus();
    }

    function closeScheduleModal() {
        scheduleModal.classList.add("hidden");
    }

    scheduleSaveBtn.addEventListener("click", () => {
    console.log('[schedule] save clicked');

    const currentDate = getSelectedDate();
    const time = scheduleTimeInput.value;
    const text = scheduleTextInput.value.trim();
    if (!text) {
        alert("일정 내용을 입력하세요.");
        return;
    }

    if (!schedules[currentDate]) {
        schedules[currentDate] = [];
    }

    // 새 일정 추가
    schedules[currentDate].push({
        time: time || "",
        text,
        done: false
    });

    // ✅ 시간 기준 정렬 (빈 시간은 맨 아래로)
    schedules[currentDate].sort((a, b) => {
        if (!a.time && !b.time) return 0;   // 둘 다 시간 없음
        if (!a.time) return 1;              // a만 없음 → 아래로
        if (!b.time) return -1;             // b만 없음 → 아래로
        return a.time.localeCompare(b.time); // "HH:MM" 문자열 비교
    });

    save();
    renderScheduleForCurrentDate();
    closeScheduleModal();
    });
    

    scheduleCancelBtn.addEventListener("click", closeScheduleModal);
    scheduleModal.addEventListener("click", (e) => {
        if (e.target === scheduleModal) closeScheduleModal();
    });

    // 메모 쪽에서 쓰는 전역 함수
    window.openScheduleModal = openScheduleModal;

    // 🔗 메모 스크립트에서 부를 콜백 등록
    window.renderScheduleForCurrentDate = renderScheduleForCurrentDate;

    renderScheduleForCurrentDate();
    
});
