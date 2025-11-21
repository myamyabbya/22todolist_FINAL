let selectedDate = new Date().toISOString().split('T')[0];
const userId = localStorage.getItem("loggedInUser") || "guest";
const STORAGE_KEY = `domado-memo-${userId}`;
let memosByDate = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

document.addEventListener('DOMContentLoaded', () => {
    const memoView = document.getElementById('memoView');
    if (!memoView) return;

    const dateBar = document.getElementById('dateBar');
    const memoInputBox = document.getElementById('memoInputBox');
    const saveBtn = document.getElementById('saveMemo');
    const cancelBtn = document.getElementById('cancelMemo');
    const memoListDiv = document.getElementById('memoList');
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');

    const toggleMonthBtn = document.getElementById('toggleMonth');
    const monthCalendar = document.getElementById('monthCalendar');
    const monthLabel = document.getElementById('monthLabel');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const calendarGrid = document.getElementById('calendarGrid');

    const globalAddBtn = document.getElementById('globalAddBtn');

    let currentMonth = new Date(selectedDate);

    function saveMemos() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(memosByDate));
    }

    function renderWeekDates() {
        if (!dateBar) return;
        dateBar.innerHTML = '';
        const today = new Date(selectedDate);
        const dayOfWeek = today.getDay(); 
        const sunday = new Date(today);
        sunday.setDate(today.getDate() - dayOfWeek);

        for (let i = 0; i < 7; i++) {
            const d = new Date(sunday);
            d.setDate(sunday.getDate() + i);

            const btn = document.createElement('button');
            btn.className = 'date-btn';

            const month = String(d.getMonth() + 1).padStart(2, '0');
            const date = String(d.getDate()).padStart(2, '0');
            btn.textContent = `${month}-${date}`;

            const dateStr = `${d.getFullYear()}-${month}-${date}`;
            if (dateStr === selectedDate) btn.classList.add('selected');

            btn.addEventListener('click', () => {
                selectedDate = dateStr;
                renderWeekDates();
                renderMemos();
            });

            dateBar.appendChild(btn);
        }
    }

    function saveNewMemo() {
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        if (!title) return alert('제목을 입력하세요.');

        if (!memosByDate[selectedDate]) memosByDate[selectedDate] = [];
        memosByDate[selectedDate].push({ title, content });

        saveMemos();
        memoInputBox.classList.add('hidden');
        renderMemos();
    }

function renderMemos() {
    memoListDiv.innerHTML = '';
    const memos = memosByDate[selectedDate] || [];
    memos.forEach((m, index) => {
        const div = document.createElement('div');
        div.className = 'memo-item';

        const tomatoImg = document.createElement('img');
        tomatoImg.src = '/static/img/memopin.png';
        tomatoImg.className = 'tomato-img';
        div.appendChild(tomatoImg);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'memo-content-wrap';
        contentDiv.innerHTML = `<strong>${m.title}</strong><br>${m.content || ''}`;
        div.appendChild(contentDiv);

        // 삭제 버튼 추가
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑';
        deleteBtn.className = 'delete-btn';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // 부모 클릭 이벤트 방지
            if (confirm('이 메모를 삭제하시겠습니까?')) {
                memosByDate[selectedDate].splice(index, 1);
                saveMemos();
                renderMemos();
            }
        });
        div.appendChild(deleteBtn);

        // 클릭하면 수정
        div.addEventListener('click', () => {
            memoInputBox.classList.remove('hidden');
            titleInput.value = m.title;
            contentInput.value = m.content;

            saveBtn.onclick = () => {
                m.title = titleInput.value.trim();
                m.content = contentInput.value.trim();
                saveMemos();
                memoInputBox.classList.add('hidden');
                renderMemos();
            };

            // 입력창 닫기만
            cancelBtn.onclick = () => {
                memoInputBox.classList.add('hidden');
            };
        });

        memoListDiv.appendChild(div);
    });
}


    function renderMonthCalendar() {
        if (!monthCalendar || !calendarGrid || !monthLabel) return;
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        monthLabel.textContent = `${year}년 ${month+1}월`;

        calendarGrid.innerHTML = '';
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month+1,0).getDate();

        for (let i=0; i<firstDay; i++) calendarGrid.appendChild(document.createElement('div'));
        for (let day=1; day<=daysInMonth; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'calendar-day';
            dayDiv.textContent = day;
            const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            if (dateStr===selectedDate) dayDiv.classList.add('selected');

            dayDiv.addEventListener('click', () => {
                selectedDate = dateStr;
                renderWeekDates();
                renderMemos();
                monthCalendar.classList.add('hidden');
                toggleMonthBtn.classList.remove('active');
            });

            calendarGrid.appendChild(dayDiv);
        }
    }

    toggleMonthBtn?.addEventListener('click', () => {
        monthCalendar.classList.toggle('hidden');
        toggleMonthBtn.classList.toggle('active');
        renderMonthCalendar();
    });

    prevMonthBtn?.addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth()-1);
        renderMonthCalendar();
    });

    nextMonthBtn?.addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth()+1);
        renderMonthCalendar();
    });

    function openMemoInput() {
        memoInputBox.classList.remove('hidden');
        titleInput.value = '';
        contentInput.value = '';
        titleInput.focus();

        saveBtn.onclick = saveNewMemo;
        cancelBtn.onclick = () => memoInputBox.classList.add('hidden');
    }

    globalAddBtn?.addEventListener('click', () => {
        const activeView = document.querySelector('.view.active');
        if (activeView.id === "memoView") openMemoInput();
        else if (activeView.id === "scheduleView") window.openScheduleModal();
    });

    window.openMemoModal = openMemoInput;

    renderWeekDates();
    renderMemos();
});
