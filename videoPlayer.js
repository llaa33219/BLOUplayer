document.addEventListener('DOMContentLoaded', function() {

    /** (1) 자동 래핑 **/
    const videoTag = document.querySelector('video:not(#myVideo)');
    if (videoTag) {
      // 기본 컨트롤 제거
      videoTag.removeAttribute('controls');
  
      // 래퍼 생성
      const container = document.createElement('div');
      container.classList.add('player-container');
      container.id = 'playerContainer';
  
      // video를 container로 감싸기
      videoTag.parentNode.insertBefore(container, videoTag);
      container.appendChild(videoTag);
  
      // myVideo id 부여
      videoTag.id = 'myVideo';
  
      // .controls + 볼륨 버튼/팝업
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
  
          <button class="volume-button" id="volumeBtn">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M7 9v6h4l5 5V4l-5 5H7z" fill="#FFF"/>
            </svg>
            <div class="volume-popup" id="volumePopup">
              <input
                type="range"
                id="volumeSlider"
                class="volume-slider-vertical"
                min="0"
                max="1"
                step="0.05"
                value="1" />
            </div>
          </button>
  
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
  
    /** (2) 기존 요소들 가져오기 **/
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
  
    // 볼륨 버튼/팝업
    const volumeBtn = document.getElementById('volumeBtn');
    const volumePopup = document.getElementById('volumePopup');
    const volumeSlider = document.getElementById('volumeSlider');
  
    let isHoveringProgress = false;
    let isFullscreen = false;
  
    /** (3) 원본 플레이어 로직 + 볼륨 기능 **/
  
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
  
    /** 볼륨 관련 **/
    function toggleVolumePopup() {
      if (!volumePopup) return;
      volumePopup.classList.toggle('show');
    }
    function handleVolumeChange(e) {
      if (!video) return;
      video.volume = parseFloat(e.target.value);
    }
  
    /**
     * (4) 마우스 이동 시 컨트롤 표시/숨김
     *  - 하단 80px 범위 안이거나
     *  - 볼륨 버튼/팝업 영역 위에 마우스가 있으면 -> show-controls 유지
     */
    function handleMouseMove(e) {
      if (!playerContainer) return;
  
      const containerRect = playerContainer.getBoundingClientRect();
      const bottomThreshold = containerRect.bottom - 80;
  
      // ① 하단 범위 안인지 확인
      let isOverBottomArea = ( 
        e.clientY >= bottomThreshold && 
        e.clientY <= containerRect.bottom 
      );
  
      // ② "볼륨 팝업" 또는 "볼륨 버튼" 위에 있는지 확인
      let isOverVolume = false;
      if (volumePopup?.classList.contains('show')) {
        // volumePopup 사각영역
        const vpRect = volumePopup.getBoundingClientRect();
        if (
          e.clientX >= vpRect.left && e.clientX <= vpRect.right &&
          e.clientY >= vpRect.top && e.clientY <= vpRect.bottom
        ) {
          isOverVolume = true;
        }
      }
      // volumeBtn 사각영역도 포함 (팝업 열려있지 않아도 버튼 위면 숨기지 않음)
      if (volumeBtn) {
        const vbRect = volumeBtn.getBoundingClientRect();
        if (
          e.clientX >= vbRect.left && e.clientX <= vbRect.right &&
          e.clientY >= vbRect.top && e.clientY <= vbRect.bottom
        ) {
          isOverVolume = true;
        }
      }
  
      // 둘 중 하나라도 true면 컨트롤 보이기
      if (isOverBottomArea || isOverVolume) {
        playerContainer.classList.add('show-controls');
      } else {
        playerContainer.classList.remove('show-controls');
        // 필요하다면 볼륨 팝업도 자동 닫기
        // volumePopup?.classList.remove('show');
      }
    }
  
    /** (5) 이벤트 연결 **/
    playBtn?.addEventListener('click', togglePlay);
    video?.addEventListener('play', updatePlayButton);
    video?.addEventListener('pause', updatePlayButton);
    video?.addEventListener('timeupdate', updateProgress);
    video?.addEventListener('progress', updateProgress);
    video?.addEventListener('loadedmetadata', updateProgress);
  
    progressBar?.addEventListener('click', seekVideo);
    progressBar?.addEventListener('mousemove', handleProgressHover);
    progressBar?.addEventListener('mouseleave', handleProgressLeave);
  
    speedSelect?.addEventListener('change', handleSpeedChange);
  
    volumeBtn?.addEventListener('click', toggleVolumePopup);
    volumeSlider?.addEventListener('input', handleVolumeChange);
  
    fullscreenBtn?.addEventListener('click', toggleFullscreen);
  
    document.addEventListener('mousemove', handleMouseMove);
  
    // 초기값
    updatePlayButton();
    updateProgress();
    handleSpeedChange();
    if (video) video.volume = 1.0;
  });
  