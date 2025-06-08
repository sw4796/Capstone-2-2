import { useEffect, useRef, useState } from "react";
import axios from "axios";

const BACKEND_URL = "http://localhost:4000";

function App() {
  const [step, setStep] = useState("main"); // main, ad, download
  const [adWatched, setAdWatched] = useState(false);
  const videoRef = useRef();

  // 방문자 기록
  useEffect(() => {
    axios.post(`${BACKEND_URL}/api/visit`).catch(console.error);
  }, []);

  // 광고 시청 구간(진행도) 기록
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const currentTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    if (Math.floor(currentTime) !== window.lastSentSec) {
      window.lastSentSec = Math.floor(currentTime);
      axios
        .post(`${BACKEND_URL}/api/ad-progress`, { currentTime, duration })
        .catch(() => {});
    }
  };

  // 광고 끝까지 시청 완료 기록
  const handleAdEnded = () => {
    setAdWatched(true);
    axios.post(`${BACKEND_URL}/api/ad-finished`).catch(console.error);
  };

  return (
    <div
      style={{
        width: "100%", 
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#f6f8fa",
        textAlign: "center",
      }}
    >
      {step === "main" && (
        <>
          <h1 style={{ textAlign: "center" }}>필기 정리본 받기</h1>
          <button
            style={{
              padding: "14px 36px",
              fontSize: "1.2em",
              fontWeight: "bold",
              borderRadius: "8px",
              border: "none",
              background: "#4f8cff",
              color: "white",
              marginTop: "30px",
              cursor: "pointer",
              display: "block",
              marginLeft: "auto",
              marginRight: "auto",
            }}
            onClick={() => setStep("ad")}
          >
            필기 정리본 받기
          </button>
        </>
      )}

      {step === "ad" && (
        <>
          <h2 style={{ textAlign: "center" }}>광고를 끝까지 보면 정리본 다운로드가 가능합니다</h2>
          <video
            ref={videoRef}
            width="480"
            controls={false}
            autoPlay
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleAdEnded}
            src="/ad.mp4"
            style={{
              margin: "36px 0 20px 0",
              borderRadius: "18px",
              background: "#222",
              boxShadow: "0 4px 18px #aaa5",
              display: "block",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          />
          <button
            disabled={!adWatched}
            onClick={() => setStep("download")}
            style={{
              padding: "12px 32px",
              fontSize: "1.1em",
              fontWeight: "bold",
              borderRadius: "8px",
              border: "none",
              background: adWatched ? "#4f8cff" : "#bfc7d0",
              color: adWatched ? "white" : "#4e5a6c",
              cursor: adWatched ? "pointer" : "not-allowed",
              display: "block",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {adWatched ? "다운로드 받기" : "광고를 끝까지 시청하세요"}
          </button>
        </>
      )}

      {step === "download" && (
        <>
          <h2 style={{ textAlign: "center" }}>운영체제 6장 필기 정리본 다운로드</h2>
          <a href="/운영체제 6장 정리본.pdf" download style={{ display: "block", textAlign: "center" }}>
            <button
              style={{
                padding: "14px 36px",
                fontSize: "1.2em",
                fontWeight: "bold",
                borderRadius: "8px",
                border: "none",
                background: "#36b97e",
                color: "white",
                marginTop: "30px",
                cursor: "pointer",
                display: "inline-block",
              }}
            >
              다운로드
            </button>
          </a>
        </>
      )}
    </div>
  );
}

export default App;
