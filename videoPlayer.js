/* ───────────────────────────────────────────────────────────────────────────
   videoPlayer.js
   ─────────────────────────────────────────────────────────────────────────── */

// DOMContentLoaded 이후에 모든 로직 실행
document.addEventListener('DOMContentLoaded', function () {

    /****************************************************
     * (추가) 자동 래핑: <video>를 감싸고 컨트롤 UI 생성
     ****************************************************/
    const videoTag = document.querySelector('video:not(#myVideo)');
    if (!videoTag) return;  // <video>가 없으면 종료
  
    // 기본 컨트롤 숨기기 (커스텀 UI만 쓰고 싶다면)
    videoTag.removeAttribute('controls');
  
    // player-container 만들고 <video>를 안으로 이동
    const container = document.createElement('div');
    container.classList.add('player-container');
    container.id = 'playerContainer';
  
    videoTag.parentNode.insertBefore(container, videoTag);
    container.appendChild(videoTag);
  
    // 원본 코드가 'myVideo' id를 찾으므로 부여
    videoTag.id = 'myVideo';
  
    // .controls HTML 추가
    container.insertAdjacentHTML('beforeend', `
      <div class="controls">
        <div class="play-button" id="playBtn"></div>
        <div class="progress-container" id="progressBar">
          <div class="progress-buffered" id="progressBuffered"></div>
          <div class="progress-filled" id="progressFilled"></div>
          <div class="progress-thumb" id="progressThumb"></div>
        </div>
        <div class="time-label" id="timeLabel">0:00</div>
        <select class="speed-select" id="speedSelect">
          <option value="0.5">0.5x</option>
          <option value="1" selected>1x</option>
          <option value="1.5">1.5x</option>
          <option value="2">2x</option>
        </select>
        <button class="fullscreen-button" id="fullscreenBtn">
          <svg class="fullscreen-icon" viewBox="0 0 24 24" fill="none">
            <path d="M3 3H9V5H5V9H3V3Z" fill="#FFF" />
            <path d="M3 21H9V19H5V15H3V21Z" fill="#FFF" />
            <path d="M15 21H21V15H19V19H15V21Z" fill="#FFF" />
            <path d="M21 3H15V5H19V9H21V3Z" fill="#FFF" />
          </svg>
          <svg class="exit-fullscreen-icon" viewBox="0 0 24 24" fill="none">
            <path d="M9 9H3V7H7V3H9V9Z" fill="#FFF" />
            <path d="M9 15H3V17H7V21H9V15Z" fill="#FFF" />
            <path d="M21 15H15V21H17V17H21V15Z" fill="#FFF" />
            <path d="M15 9.00012H21V7.00012H17V3.00012H15V9.00012Z" fill="#FFF" />
          </svg>
        </button>
      </div>
    `);
  
    /****************************************************
     *                 (원본) 플레이어 로직
     ****************************************************/
    const video = document.getElementById('myVideo');
    const playBtn = document.getElementById('playBtn');
    const progressBar = document.getElementById('progressBar');
    const progressBuffered = document.getElementById('progressBuffered');
    const progressFilled = document.getElementById('progressFilled');
    const progressThumb = document.getElementById('progressThumb');
    const timeLabel = document.getElementById('timeLabel');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const playerContainer = document.getElementById('playerContainer');
    const speedSelect = document.getElementById('speedSelect');
  
    let isHoveringProgress = false;
    let isFullscreen = false;
  
    function togglePlay() {
      if (video.paused || video.ended) {
        video.play();
      } else {
        video.pause();
      }
    }
  
    function updatePlayButton() {
      if (video.paused) {
        playBtn.classList.remove('pause');
      } else {
        playBtn.classList.add('pause');
      }
    }
  
    function updateProgress() {
      if (!video.duration) return;
      const currentPercent = (video.currentTime / video.duration) * 100;
      progressFilled.style.width = currentPercent + '%';
      if (!isHoveringProgress) {
        progressThumb.style.left = currentPercent + '%';
      }
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const bufferedPercent = (bufferedEnd / video.duration) * 100;
        progressBuffered.style.width = bufferedPercent + '%';
      }
      timeLabel.textContent = formatTime(video.currentTime);
    }
  
    function seekVideo(e) {
      const rect = progressBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const seekTo = (clickX / width) * video.duration;
      video.currentTime = seekTo;
    }
  
    function handleProgressHover(e) {
      isHoveringProgress = true;
      const rect = progressBar.getBoundingClientRect();
      const hoverX = e.clientX - rect.left;
      const width = rect.width;
      const hoverPercent = (hoverX / width) * 100;
      progressThumb.style.left = hoverPercent + '%';
    }
  
    function handleProgressLeave() {
      isHoveringProgress = false;
      const currentPercent = (video.currentTime / video.duration) * 100;
      progressThumb.style.left = currentPercent + '%';
    }
  
    function handleSpeedChange() {
      const rate = parseFloat(speedSelect.value);
      video.playbackRate = rate;
    }
  
    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        playerContainer.classList.remove('exiting-fullscreen');
        playerContainer.classList.add('entering-fullscreen');
        setTimeout(() => {
          playerContainer.classList.remove('entering-fullscreen');
          if (playerContainer.requestFullscreen) {
            playerContainer.requestFullscreen();
          }
        }, 300);
        isFullscreen = true;
      } else {
        playerContainer.classList.remove('entering-fullscreen');
        playerContainer.classList.add('exiting-fullscreen');
        setTimeout(() => {
          playerContainer.classList.remove('exiting-fullscreen');
          if (document.exitFullscreen) {
            document.exitFullscreen();
          }
        }, 300);
        isFullscreen = false;
      }
    }
  
    document.addEventListener('fullscreenchange', () => {
      if (document.fullscreenElement) {
        fullscreenBtn.classList.add('fullscreen-active');
      } else {
        fullscreenBtn.classList.remove('fullscreen-active');
      }
    });
  
    function formatTime(sec) {
      if (!sec || isNaN(sec)) return "0:00";
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return m + ":" + (s < 10 ? "0" + s : s);
    }
  
    function handleMouseMove(e) {
      const rect = playerContainer.getBoundingClientRect();
      const bottomThreshold = rect.bottom - 80;
      if (e.clientY >= bottomThreshold && e.clientY <= rect.bottom) {
        playerContainer.classList.add('show-controls');
      } else {
        playerContainer.classList.remove('show-controls');
      }
    }
  
    // 이벤트 바인딩
    playBtn.addEventListener('click', togglePlay);
    video.addEventListener('play', updatePlayButton);
    video.addEventListener('pause', updatePlayButton);
    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('progress', updateProgress);
    video.addEventListener('loadedmetadata', updateProgress);
    progressBar.addEventListener('click', seekVideo);
    progressBar.addEventListener('mousemove', handleProgressHover);
    progressBar.addEventListener('mouseleave', handleProgressLeave);
    speedSelect.addEventListener('change', handleSpeedChange);
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    document.addEventListener('mousemove', handleMouseMove);
  
    // 초기화
    updatePlayButton();
    updateProgress();
    handleSpeedChange();
  });
  
  // (끝)
  