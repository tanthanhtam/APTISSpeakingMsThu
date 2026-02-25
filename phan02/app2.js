const urlParams = new URLSearchParams(window.location.search);
const testId = parseInt(urlParams.get("test")) || 1;

const data = part2Data.find(t => t.id === testId);

const timerEl = document.getElementById("timer");
const questionBox = document.getElementById("questionBox");
const startBtn = document.getElementById("startBtn");
const resultBox = document.getElementById("resultBox");

document.getElementById("testTitle").textContent = data.title;
document.getElementById("testImage").src = data.image;

let currentQuestion = 0;
let timeLeft = 45;
let timerInterval;
let mediaRecorder;
let chunks = [];
let recordings = [];

/* ===== START TEST ===== */
startBtn.addEventListener("click", async () => {

    startBtn.style.display = "none";
    currentQuestion = 0;
    recordings = [];

    await startQuestion();

});

/* ===== START EACH QUESTION ===== */
async function startQuestion(){

    if(currentQuestion >= 3){
        showResults();
        return;
    }

    questionBox.textContent = data.questions[currentQuestion];

    timeLeft = 45;
    timerEl.textContent = timeLeft;

    const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
    mediaRecorder = new MediaRecorder(stream);

    chunks = [];

    mediaRecorder.ondataavailable = e => chunks.push(e.data);

    mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type:"audio/webm" });
        recordings.push(blob);
        currentQuestion++;
        startQuestion();
    };

    mediaRecorder.start();

    timerInterval = setInterval(()=>{
        timeLeft--;
        timerEl.textContent = timeLeft;

        if(timeLeft <= 0){
            clearInterval(timerInterval);
            mediaRecorder.stop();
        }
    },1000);

}

/* ===== SHOW FINAL RESULTS ===== */
function showResults(){

    questionBox.textContent = "Test Completed!";
    timerEl.textContent = "✔";

    resultBox.innerHTML = "<h2>Your Recordings</h2>";

    recordings.forEach((blob,index)=>{

        const url = URL.createObjectURL(blob);

        resultBox.innerHTML += `
            <div>
                <p>Question ${index+1}</p>
                <audio controls src="${url}"></audio>
                <br>
                <a href="${url}" download="Part2_Q${index+1}.webm">Download</a>
            </div>
        `;
    });
}