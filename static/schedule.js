document.addEventListener('DOMContentLoaded', () => {
    const scheduleView = document.getElementById('scheduleView');
    if (!scheduleView) return;

    const userId = localStorage.getItem("loggedInUser") || "guest";
    const STORAGE_KEY = `domado-schedule-${userId}`;

    let schedules = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    let currentDate = getToday();

    const dateBarEl = document.getElementById("scheduleDateBar");
    const currentDateEl = document.getElementById("scheduleCurrentDate");
    const listEl = document.getElementById("scheduleList");

    const scheduleModal = document.getElementById("scheduleModal");
    const scheduleTimeInput = document.getElementById("scheduleTime");
    const scheduleTextInput = document.getElementById("scheduleText");
    const scheduleSaveBtn = document.getElementById("scheduleSaveBtn");
    const scheduleCancelBtn = document.getElementById("scheduleCancelBtn");

    if (!dateBarEl || !currentDateEl || !listEl ||
        !scheduleModal || !scheduleTimeInput || !scheduleTextInput ||
        !scheduleSaveBtn || !scheduleCancelBtn) return;

    function getToday() {
        const d = new Date();
        return d.toISOString().slice(0, 10);
    }

    function createDatePills() {
        dateBarEl.innerHTML = "";
        const base = new Date(currentDate);
        for (let offset = -3; offset <= 3; offset++) {
            const d = new Date(base);
            d.setDate(d.getDate() + offset);
            const key = d.toISOString().slice(0, 10);

            const pill = document.createElement("button");
            pill.className = "date-btn";
            pill.dataset.date = key;
            pill.textContent = key.slice(5);
            if (key === currentDate) pill.classList.add("selected");

            pill.onclick = () => {
                currentDate = key;
                render();
            };
            dateBarEl.appendChild(pill);
        }
    }

    function render() {
        document.querySelectorAll("#scheduleDateBar .date-btn").forEach(p => {
            p.classList.toggle("selected", p.dataset.date === currentDate);
        });

        currentDateEl.textContent = currentDate;
        listEl.innerHTML = "";
        const list = schedules[currentDate] || [];

        if (!list.length) {
            const li = document.createElement("li");
            li.textContent = "일정을 추가해 보세요.";
            li.className = "hint-text";
            listEl.appendChild(li);
            return;
        }

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
            doneBtn.textContent = item.done ? "✅" : "✔";
            doneBtn.onclick = () => {
                item.done = !item.done;
                save();
                render();
            };

            const delBtn = document.createElement("button");
            delBtn.className = "btn-icon btn-delete";
            delBtn.textContent = "🗑";
            delBtn.onclick = () => {
                list.splice(i, 1);
                save();
                render();
            };

            li.append(time, text, doneBtn, delBtn);
            listEl.appendChild(li);
        });
    }

    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
    }

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
        const time = scheduleTimeInput.value;
        const text = scheduleTextInput.value.trim();
        if (!text) return alert("일정 내용을 입력하세요.");

        if (!schedules[currentDate]) schedules[currentDate] = [];
        schedules[currentDate].push({ time: time || "", text, done: false });
        save();
        render();
        closeScheduleModal();
    });

    scheduleCancelBtn.addEventListener("click", closeScheduleModal);
    scheduleModal.addEventListener("click", (e) => {
        if (e.target === scheduleModal) closeScheduleModal();
    });

    window.openScheduleModal = openScheduleModal;

    createDatePills();
    render();
});
