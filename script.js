// ---------- DOM Elements ----------
const habitForm = document.getElementById("habit-form");
const habitInput = document.getElementById("habit-input");
const habitList = document.getElementById("habit-list");

// ---------- Local Storage ----------
let habits = JSON.parse(localStorage.getItem("habits")) || [];

// ---------- Helper Functions ----------
function saveHabits() {
    localStorage.setItem("habits", JSON.stringify(habits));
    localStorage.setItem("currentWeek", JSON.stringify(getISOWeek()));
}

function calcStreak(arr = []) {
    let cur = 0, best = 0;
    for (let done of arr) {
        if (done) {
            cur++;
            best = Math.max(best, cur);
        } else {
            cur = 0;
        }
    }
    return { cur, best };
}

function getISOWeek(date = new Date()) {
    const temp = new Date(date.valueOf());
    temp.setHours(0, 0, 0, 0);
    temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));
    const week1 = new Date(temp.getFullYear(), 0, 4);
    return 1 + Math.round(((temp - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

function checkWeekReset() {
    const savedWeek = JSON.parse(localStorage.getItem("currentWeek"));
    const currentWeek = getISOWeek();

    if (savedWeek !== currentWeek) {
        habits.forEach(habit => {
            habit.days = Array(7).fill(false);
        });
        localStorage.setItem("currentWeek", JSON.stringify(currentWeek));
        saveHabits();
    }
}

// ---------- UI Rendering ----------
function renderHabits() {
    habitList.innerHTML = "";

    habits.forEach((habit, index) => {
        const completed = (habit.days || []).filter(Boolean).length;
        const percent = Math.round((completed / 7) * 100);
        const { cur, best } = calcStreak(habit.days);

        let checkboxes = "";
        for (let i = 0; i < 7; i++) {
            const checked = habit.days[i] ? "checked" : "";
            checkboxes += `
                <input type="checkbox"
                       data-index="${index}"
                       data-day="${i}"
                       ${checked} />
            `;
        }

        const li = document.createElement("li");
        li.innerHTML = `
            <span class="habit-name">${habit.name}</span>

            <div class="days">${checkboxes}</div>

            <div class="progress">
                <div class="bar" style="width:${percent}%"></div>
                <span class="pct">${percent}%</span>
            </div>

            <span class="streak">🔥 ${cur} / Best ${best}</span>

            <button onclick="deleteHabit(${index})">❌</button>
        `;

        habitList.appendChild(li);
    });

    // Add checkbox change listeners
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener("change", e => {
            const hIdx = +e.target.dataset.index;
            const dIdx = +e.target.dataset.day;
            habits[hIdx].days[dIdx] = e.target.checked;
            saveHabits();
            renderHabits();
        });
    });
}

// ---------- Event Handlers ----------
habitForm.addEventListener("submit", e => {
    e.preventDefault();
    const name = habitInput.value.trim();
    if (!name) return;

    habits.push({ name, days: Array(7).fill(false) });
    habitInput.value = "";
    saveHabits();
    renderHabits();
});

document.getElementById("reset-button").addEventListener("click", () => {
    const confirmReset = confirm("Are you sure you want to reset all habit checkboxes?");
    if (!confirmReset) return;
  
    habits.forEach(habit => {
      habit.days = Array(7).fill(false);
    });
  
    saveHabits();
    renderHabits();
  });  
  

function deleteHabit(i) {
    habits.splice(i, 1);
    saveHabits();
    renderHabits();
}

// ---------- App Init ----------
checkWeekReset();
renderHabits();