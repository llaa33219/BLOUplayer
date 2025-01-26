/************************************************************
 * videoPlayer.js
 *  - 자동 래핑 + 볼륨 슬라이더 + 기존 플레이어 로직
 *  - 전부 DOMContentLoaded 안에서 실행하여 null 오류 해결
 ************************************************************/
document.addEventListener('DOMContentLoaded', function() {
  
    /************************************************************
     * (1) 자동 래핑 코드
     *   - <video>를 감싸서 .player-container, .controls 등 자동 생성
     ************************************************************/
    const videoTag = document.querySelector('video:not(#myVideo)');
    if (videoTag) {
      // (A) 커스텀 컨트롤을 쓸 거라면, 기본 controls 제거
      videoTag.removeAttribute('controls');
      
      // (B) .player-container 생성 후 <video> 감싸기
      const container = document.createElement('div');
      container.classList.add('player-container');
      container.id = 'playerContainer';
      videoTag.parentNode.insertBefore(container, videoTag);
      container.appendChild(videoTag);
  
      // (C) 원본 코드가 id="myVideo"를 찾으므로, 여기서 부여
      videoTag.id = 'myVideo';
  
      // (D) .controls HTML 추가 (볼륨 슬라이더 포함)
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
          <!-- (추가) 볼륨 슬라이더 -->
          <div class="volume-container">
            <input type="range" id="volumeSlider" class="volume-slider" min="0" max="1" step="0.05" value="1" />
          </div>
          <button class="fullscreen-button" id="fullscreenBtn">
            <svg class="fullscreen-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 3H9V5H5V9H3V3Z" fill="#FFF" />
              <path d="M3 21H9V19H5V15H3V21Z" fill="#FFF" />
              <path d="M15 21H21V15H19V19H15V21Z" fill="#FFF" />
              <path d="M21 3H15V5H19V9H21V3Z" fill="#FFF" />
            </svg>
            <svg class="exit-fullscreen-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 9H3V7H7V3H9V9Z" fill="#FFF" />
              <path d="M9 15H3V17H7V21H9V15Z" fill="#FFF" />
              <path d="M21 15H15V21H17V17H21V15Z" fill="#FFF" />
              <path d="M15 9.00012H21V7.00012H17V3.00012H15V9.00012Z" fill="#FFF" />
            </svg>
          </button>
        </div>
      `);
    }
  
    
    /************************************************************
     * (2) 원본 플레이어 로직 + 볼륨슬라이더 이벤트
     ************************************************************/
  
    // 이제 DOM에 #myVideo, #playerContainer 등이 생성된 상태이므로, 여기서부터 가져옴
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
    const volumeSlider = document.getElementById('volumeSlider');
  
    let isHoveringProgress = false;
    let isFullscreen = false;
  
    function togglePlay() {
      if (!video) return;
      if (video.paused || video.ended) {
        video.play();
      } else {
        video.pause();
      }
    }
  
    function updatePlayButton() {
      if (!video) return;
      if (video.paused) {
        playBtn.classList.remove('pause');
      } else {
        playBtn.classList.add('pause');
      }
    }
  
    function updateProgress() {
      if (!video || !video.duration) return;
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
      if (!video) return;
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
      if (!video || !video.duration) return;
      const currentPercent = (video.currentTime / video.duration) * 100;
      progressThumb.style.left = currentPercent + '%';
    }
  
    function handleSpeedChange() {
      if (!video) return;
      const rate = parseFloat(speedSelect.value);
      video.playbackRate = rate;
    }
  
    function toggleFullscreen() {
      if (!playerContainer) return;
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
      // playerContainer가 없을 때(래핑 실패 시) 예외처리
      if (!playerContainer) return;
  
      const rect = playerContainer.getBoundingClientRect();
      const bottomThreshold = rect.bottom - 80;
      if (e.clientY >= bottomThreshold && e.clientY <= rect.bottom) {
        playerContainer.classList.add('show-controls');
      } else {
        playerContainer.classList.remove('show-controls');
      }
    }
  
    /***********************************************************
     * (추가) 볼륨 슬라이더
     ***********************************************************/
    function handleVolumeChange(e) {
      if (!video) return;
      const newVolume = parseFloat(e.target.value); // 0~1
      video.volume = newVolume;
    }
  
    /***********************************************************
     * (3) 이벤트 리스너 연결
     ***********************************************************/
    if (playBtn)    playBtn.addEventListener('click', togglePlay);
    if (video) {
      video.addEventListener('play', updatePlayButton);
      video.addEventListener('pause', updatePlayButton);
      video.addEventListener('timeupdate', updateProgress);
      video.addEventListener('progress', updateProgress);
      video.addEventListener('loadedmetadata', updateProgress);
    }
    if (progressBar) {
      progressBar.addEventListener('click', seekVideo);
      progressBar.addEventListener('mousemove', handleProgressHover);
      progressBar.addEventListener('mouseleave', handleProgressLeave);
    }
    if (speedSelect)  speedSelect.addEventListener('change', handleSpeedChange);
    if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);
    document.addEventListener('mousemove', handleMouseMove);
  
    if (volumeSlider) {
      volumeSlider.addEventListener('input', handleVolumeChange);
    }
  
    // (4) 초기화 호출
    updatePlayButton();
    updateProgress();
    handleSpeedChange();
  });
  