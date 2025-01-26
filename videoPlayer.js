document.addEventListener('DOMContentLoaded', function() {

    /************************************************************
     * (1) 자동 래핑
     ************************************************************/
    const videoTag = document.querySelector('video:not(#myVideo)');
    if (videoTag) {
      videoTag.removeAttribute('controls'); // 기본 브라우저 controls 제거
  
      // .player-container 생성
      const container = document.createElement('div');
      container.classList.add('player-container');
      container.id = 'playerContainer';
  
      // video를 container로 감싸기
      videoTag.parentNode.insertBefore(container, videoTag);
      container.appendChild(videoTag);
  
      // id="myVideo"를 붙여서 기존 코드가 찾을 수 있게 함
      videoTag.id = 'myVideo';
  
      // .controls 영역 + 볼륨 버튼/팝업 + 볼륨 아이콘 path
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
  
          <!-- 볼륨 버튼/팝업 -->
          <button class="volume-button" id="volumeBtn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <!-- 여기서 <path>만 갈아끼우도록, id="volumeIconPath" 부여 -->
              <path id="volumeIconPath" d="" fill="#FFF" />
            </svg>
            <div class="volume-popup" id="volumePopup">
              <input
                type="range"
                id="volumeSlider"
                class="volume-slider-vertical"
                min="0" max="1" step="0.05" value="1"
              />
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
  
    /************************************************************
     * (2) DOM 요소 참조
     ************************************************************/
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
  
    // 볼륨 관련
    const volumeBtn = document.getElementById('volumeBtn');
    const volumePopup = document.getElementById('volumePopup');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeIconPath = document.getElementById('volumeIconPath');
  
    let isHoveringProgress = false;
    let isFullscreen = false;
  
    /************************************************************
     * (3) 볼륨 아이콘 Path 데이터 (단순 예시)
     ************************************************************/
    const PATH_MUTE   = "M7 9v6h4l5 5V4l-5 5H7z";
    // 작게 파동(대충 만든 예)
    const PATH_LOW    = "M7 9v6h4l5 5V4l-5 5H7z M19 12c0 .5-.2 1-.5 1.4";
    // 중간 파동
    const PATH_MEDIUM = "M7 9v6h4l5 5V4l-5 5H7z M19 9.23c.81 1.19 1.3 2.61 1.3 4.18s-.49 3-1.3 4.18";
    // 큰 파동
    const PATH_HIGH   = "M7 9v6h4l5 5V4l-5 5H7z M19 9.23c.81 1.19 1.3 2.61 1.3 4.18s-.49 3-1.3 4.18 M22 7c1.35 2.1 2.05 4.5 2.05 6.82s-.7 4.73-2.05 6.82";
  
    // 현재 비디오 볼륨(v) = 0~1에 따라 아이콘을 변경
    function updateVolumeIcon() {
      if (!video || !volumeIconPath) return;
      const v = video.volume;
      let pathData = "";
  
      if (v === 0) {
        pathData = PATH_MUTE;
      } else if (v < 0.3) {
        pathData = PATH_LOW;
      } else if (v < 0.7) {
        pathData = PATH_MEDIUM;
      } else {
        pathData = PATH_HIGH;
      }
      volumeIconPath.setAttribute("d", pathData);
    }
  
    /************************************************************
     * (4) 기존 플레이어 로직
     ************************************************************/
    function togglePlay() {
      if (!video) return;
      if (video.paused || video.ended) {
        video.play();
      } else {
        video.pause();
      }
    }
  
    function updatePlayButton() {
      if (!video || !playBtn) return;
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
      if (!video || !progressBar) return;
      const rect = progressBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const seekTo = (clickX / width) * video.duration;
      video.currentTime = seekTo;
    }
  
    function handleProgressHover(e) {
      isHoveringProgress = true;
      if (!progressBar) return;
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
      if (!video || !speedSelect) return;
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
        fullscreenBtn?.classList.add('fullscreen-active');
      } else {
        fullscreenBtn?.classList.remove('fullscreen-active');
      }
    });
  
    function formatTime(sec) {
      if (!sec || isNaN(sec)) return "0:00";
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return m + ":" + (s < 10 ? "0" + s : s);
    }
  
    /************************************************************
     * (5) 볼륨 팝업 / 슬라이더
     ************************************************************/
    function toggleVolumePopup() {
      if (!volumePopup) return;
      volumePopup.classList.toggle('show');
    }
    function handleVolumeChange(e) {
      if (!video) return;
      video.volume = parseFloat(e.target.value);
      updateVolumeIcon(); // 볼륨 변경 → 아이콘 갱신
    }
  
    /************************************************************
     * (6) 마우스 이동 -> 컨트롤 표시/숨김
     *     하단 80px 범위 or 볼륨 버튼/팝업 위이면 보이게
     ************************************************************/
    function handleMouseMove(e) {
      if (!playerContainer) return;
  
      const rect = playerContainer.getBoundingClientRect();
      const bottomThreshold = rect.bottom - 80;
  
      // (1) 하단 영역에 있는지
      const isOverBottom = (e.clientY >= bottomThreshold && e.clientY <= rect.bottom);
  
      // (2) 볼륨 버튼/팝업 영역에 있는지
      let isOverVolume = false;
      // 볼륨 버튼 범위
      if (volumeBtn) {
        const vb = volumeBtn.getBoundingClientRect();
        if (
          e.clientX >= vb.left && e.clientX <= vb.right &&
          e.clientY >= vb.top && e.clientY <= vb.bottom
        ) {
          isOverVolume = true;
        }
      }
      // 볼륨 팝업이 열려 있다면, 그 영역도 확인
      if (volumePopup?.classList.contains('show')) {
        const vp = volumePopup.getBoundingClientRect();
        if (
          e.clientX >= vp.left && e.clientX <= vp.right &&
          e.clientY >= vp.top && e.clientY <= vp.bottom
        ) {
          isOverVolume = true;
        }
      }
  
      // (3) 둘 중 하나라도 true면 show-controls 유지
      if (isOverBottom || isOverVolume) {
        playerContainer.classList.add('show-controls');
      } else {
        playerContainer.classList.remove('show-controls');
        // 필요 시 볼륨 팝업도 닫기 => volumePopup?.classList.remove('show');
      }
    }
  
    /************************************************************
     * (7) 이벤트 연결
     ************************************************************/
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
  
    /************************************************************
     * (8) 초기화
     ************************************************************/
    if (video) {
      video.volume = 1.0;         // 초기 볼륨 100%
      updateVolumeIcon();         // 아이콘도 갱신
    }
    updatePlayButton();
    updateProgress();
    handleSpeedChange();
  });
  