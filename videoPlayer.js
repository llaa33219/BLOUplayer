document.addEventListener('DOMContentLoaded', function() {

    /************************************************************
     * (1) <video> 자동 래핑
     ************************************************************/
    const videoTag = document.querySelector('video:not(#myVideo)');
    if (videoTag) {
      // 기본 controls 제거 -> 커스텀 UI만 표시
      videoTag.removeAttribute('controls');
  
      // .player-container 생성
      const container = document.createElement('div');
      container.classList.add('player-container');
      container.id = 'playerContainer';
  
      // video를 container로 감싸기
      videoTag.parentNode.insertBefore(container, videoTag);
      container.appendChild(videoTag);
  
      // id="myVideo"를 붙여서, 원본 코드가 찾을 수 있게 함
      videoTag.id = 'myVideo';
  
      // .controls HTML (볼륨 버튼, 팝업, 아이콘 path ID 등)
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
  
          <!-- 볼륨 버튼/아이콘 -->
          <button class="volume-button" id="volumeBtn">
            <!-- 스피커 + 파동/슬래시를 위해 한 개의 <path>만 동적으로 바꿀 것 -->
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path id="volumeIconPath" d="" fill="#FFF"/>
            </svg>
  
            <!-- 팝업(세로 슬라이더) -->
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
     * (2) DOM 요소 가져오기
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
  
    // 볼륨 버튼/팝업/슬라이더 + 아이콘 Path
    const volumeBtn = document.getElementById('volumeBtn');
    const volumePopup = document.getElementById('volumePopup');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeIconPath = document.getElementById('volumeIconPath');
  
    let isHoveringProgress = false;
    let isFullscreen = false;
  
  
    /************************************************************
     * (3) 볼륨 아이콘 Path 데이터 (스피커 본체 + 파동/슬래시)
     *     - line 굵기가 최대한 일정하도록 다듬음
     ************************************************************/
    // 스피커 본체는 "M7 9v6h4l5 5V4l-5 5H7z" 로 고정
    // 기존 스피커 본체는 유지하고 파동 부분을 수정
    const PATH_SPEAKER = "M7 9v6h4l5 5V4l-5 5H7z";

    // 음소거 (스피커 + 대각선 슬래시)
    const PATH_MUTE = PATH_SPEAKER + " M15 9 9 15"; 

    // 낮은 파동 (부드러운 곡선)
    const PATH_LOW = PATH_SPEAKER + " M19 12q-0.5 1.4-2 1.4";

    // 중간 파동 (매끄러운 S자 곡선)
    const PATH_MEDIUM = PATH_SPEAKER + 
    " M17 9.2c1.5 2.3 1.5 5.1 0 7.4";

    // 큰 파동 (더 긴 부드러운 곡선)
    const PATH_HIGH = PATH_SPEAKER + 
    " M17 9.2c1.5 2.3 1.5 5.1 0 7.4" +
    " M21 6.5c2 3.2 2 7.2 0 10.5";
  
  
    // 볼륨(0~1)에 따라 아이콘 path 변경
    function updateVolumeIcon() {
      if (!video || !volumeIconPath) return;
      const v = video.volume;
  
      let pathData = "";
      if (v === 0) {
        // 뮤트
        pathData = PATH_MUTE;
      } else if (v < 0.3) {
        // 낮은 파동
        pathData = PATH_LOW;
      } else if (v < 0.7) {
        // 중간 파동
        pathData = PATH_MEDIUM;
      } else {
        // 높은 파동
        pathData = PATH_HIGH;
      }
  
      volumeIconPath.setAttribute("d", pathData);
    }
  
  
    /************************************************************
     * (4) 원본(재생/전체화면/진행바) 로직
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
     * (5) 볼륨 팝업/슬라이더
     ************************************************************/
    function toggleVolumePopup() {
      if (!volumePopup) return;
      volumePopup.classList.toggle('show');
    }
  
    function handleVolumeChange(e) {
      if (!video) return;
      video.volume = parseFloat(e.target.value);
      updateVolumeIcon(); // 볼륨 값 바뀔 때마다 아이콘 갱신
    }
  
  
    /************************************************************
     * (6) 마우스 이동 -> 컨트롤 표시/숨김
     *   - 하단 80px or 볼륨 버튼/팝업 위면 .show-controls
     ************************************************************/
    function handleMouseMove(e) {
      if (!playerContainer) return;
      const rect = playerContainer.getBoundingClientRect();
      const bottomThreshold = rect.bottom - 80;
  
      // 하단 범위
      const isOverBottom = (e.clientY >= bottomThreshold && e.clientY <= rect.bottom);
  
      // 볼륨 버튼/팝업 영역
      let isOverVolume = false;
      if (volumeBtn) {
        const vb = volumeBtn.getBoundingClientRect();
        if (
          e.clientX >= vb.left && e.clientX <= vb.right &&
          e.clientY >= vb.top && e.clientY <= vb.bottom
        ) {
          isOverVolume = true;
        }
      }
      if (volumePopup?.classList.contains('show')) {
        const vp = volumePopup.getBoundingClientRect();
        if (
          e.clientX >= vp.left && e.clientX <= vp.right &&
          e.clientY >= vp.top && e.clientY <= vp.bottom
        ) {
          isOverVolume = true;
        }
      }
  
      // 둘 중 하나라도 true면 show-controls 유지
      if (isOverBottom || isOverVolume) {
        playerContainer.classList.add('show-controls');
      } else {
        playerContainer.classList.remove('show-controls');
        // 필요 시 volumePopup?.classList.remove('show');
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
      video.volume = 1.0;  // 기본 볼륨 100%
      updateVolumeIcon();  // 초기 아이콘 갱신
    }
    updatePlayButton();
    updateProgress();
    handleSpeedChange();
  });
  