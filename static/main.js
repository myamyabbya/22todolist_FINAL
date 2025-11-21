document.addEventListener('DOMContentLoaded', () => {
    const scheduleBtn = document.getElementById('scheduleBtn');
    const memoBtn = document.getElementById('memoBtn');
    const scheduleView = document.getElementById('scheduleView');
    const memoView = document.getElementById('memoView');
    const globalAddBtn = document.getElementById('globalAddBtn');

    // 요소들 없으면 (다른 페이지) 그냥 종료
    if (!scheduleBtn || !memoBtn || !scheduleView || !memoView || !globalAddBtn) return;

    // 뷰 전환
    scheduleBtn.addEventListener('click', () => {
        scheduleView.classList.add('active');
        memoView.classList.remove('active');
        scheduleBtn.classList.add('active');
        memoBtn.classList.remove('active');
    });

    memoBtn.addEventListener('click', () => {
        memoView.classList.add('active');
        scheduleView.classList.remove('active');
        memoBtn.classList.add('active');
        scheduleBtn.classList.remove('active');
    });

    // 사이드바 '추가' 버튼
    globalAddBtn.addEventListener('click', () => {
        if (scheduleView.classList.contains('active')) {
            window.openScheduleModal && window.openScheduleModal();
        } else if (memoView.classList.contains('active')) {
            window.openMemoModal && window.openMemoModal();
        }
    });

});
