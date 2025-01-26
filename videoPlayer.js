document.addEventListener('DOMContentLoaded', function() {

    /************************************************************
     * (1) <video> 자동 래핑
     ************************************************************/
    const videoTag = document.querySelector('video:not(#myVideo)');
    if (videoTag) {
      // 브라우저 기본 컨트롤 숨기기
      videoTag.removeAttribute('controls');
  
      // .player-container
      const container = document.createElement('div');
      container.classList.add('player-container');
      container.id = 'playerContainer';
  
      // video를 감싸기
      videoTag.parentNode.insertBefore(container, videoTag);
      container.appendChild(videoTag);
  
      // id="myVideo" 부여
      videoTag.id = 'myVideo';
  
      // .controls (스피커 아이콘을 여러 path로 분리)
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
  
          <!-- 볼륨 버튼 -->
          <button class="volume-button" id="volumeBtn">
            <svg width="24" height="24" viewBox="0 0 56 56">
              <!-- (a) 스피커 본체 -->
              <path
                id="speaker"
                d="M 21.6412 47.5985
                   C 22.9575 47.5985 23.9060 46.6307 23.9060 45.3338
                     L 23.9060 14.4592
                   C 23.9060 13.1623 22.9575 12.0783 21.6025 12.0783
                     C 20.6540 12.0783 20.0152 12.5042 18.9893 13.4720
                     L 10.4528 21.5439
                   C 10.3173 21.6601 10.1431 21.7181 9.9495 21.7181
                     L 4.2005 21.7181
                   C 1.4711 21.7181 0 23.2086 0 26.1122
                     L 0 33.6227
                   C 0 36.5263 1.4711 38.0168 4.2005 38.0168
                     L 9.9495 38.0168
                   C 10.1431 38.0168 10.3173 38.0748 10.4528 38.1910
                     L 18.9893 46.3403
                   C 19.9184 47.2114 20.6927 47.5985 21.6412 47.5985
                   Z"
              />
              <!-- (b) 파동1 (가장 안쪽) -->
              <path
                id="wave1"
                d="M 32.6360 38.4233
                   C 33.2941 38.8878 34.2426 38.7330 34.8039 37.9781
                     C 36.3139 35.9456 37.2238 32.9646 37.2238 29.9255
                     C 37.2238 26.8865 36.2945 23.9249 34.8039 21.8536
                     C 34.2426 21.0987 33.3135 20.9439 32.6360 21.4084
                     C 31.7843 21.9698 31.6875 22.9570 32.3069 23.8087
                     C 33.4296 25.3185 34.1071 27.6221 34.1071 29.9255
                     C 34.1071 32.2290 33.3909 34.5325 32.2876 36.0617
                     C 31.7068 36.8941 31.8037 37.8426 32.6360 38.4233
                   Z"
              />
              <!-- (c) 파동2 (중간) -->
              <path
                id="wave2"
                d="M 40.3595 43.6497
                   C 41.1143 44.1530 42.0436 43.9594 42.5855 43.1851
                     C 45.1405 39.6234 46.6117 34.8809 46.6117 29.9255
                     C 46.6117 24.9508 45.1599 20.2083 42.5855 16.6466
                     C 42.0242 15.8917 41.1143 15.6981 40.3595 16.2014
                     C 39.6238 16.7047 39.5076 17.6532 40.0884 18.4855
                     C 42.1982 21.5826 43.4953 25.6476 43.4953 29.9255
                     C 43.4953 34.2034 42.2370 38.3072 40.0690 41.3656
                     C 39.5270 42.1979 39.6238 43.1464 40.3595 43.6497
                   Z"
              />
              <!-- (d) 파동3 (가장 바깥) -->
              <path
                id="wave3"
                d="M 48.1605 48.9342
                   C 48.8765 49.4181 49.8252 49.2245 50.3865 48.4309
                     C 53.9286 43.3593 56.0000 36.8360 56.0000 29.9255
                     C 56.0000 23.0151 53.9096 16.4724 50.3865 11.4008
                     C 49.8252 10.6072 48.8765 10.4136 48.1605 10.9169
                     C 47.4248 11.4202 47.3086 12.3880 47.8700 13.2010
                     C 50.9863 17.7887 52.9221 23.6732 52.9221 29.9255
                     C 52.9221 36.1779 51.0446 42.1398 47.8700 46.6500
                     C 47.3086 47.4437 47.4248 48.4115 48.1605 48.9342
                   Z"
              />
              <!-- (e) 슬래시(음소거 표시) -->
              <path
                id="slash"
                fill="none"
                stroke="#FFF"
                stroke-width="3"
                stroke-linecap="round"
                d="M 10 10 L 46 46"
                style="display: none;"
              />
            </svg>
  
            <!-- 볼륨 팝업 (세로 슬라이더) -->
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
     * (2) 요소 참조
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
  
    // 볼륨
    const volumeBtn = document.getElementById('volumeBtn');
    const volumePopup = document.getElementById('volumePopup');
    const volumeSlider = document.getElementById('volumeSlider');
  
    // 각각의 path
    const speakerPath = document.getElementById('speaker');
    const wave1Path = document.getElementById('wave1');
    const wave2Path = document.getElementById('wave2');
    const wave3Path = document.getElementById('wave3');
    const slashPath = document.getElementById('slash');
  
    let isHoveringProgress = false;
    let isFullscreen = false;
  
    /************************************************************
     * (3) 볼륨 아이콘 표시 로직
     *     - 볼륨별로 wave1, wave2, wave3, slash 숨기거나 보임
     ************************************************************/
    function updateVolumeIcon() {
      if (!video) return;
      const v = video.volume;
  
      // 항상 스피커 본체(speaker)는 보이게 한다면:
      speakerPath.style.display = "block";
  
      if (v === 0) {
        // 뮤트 → slash 보이기, wave 전부 숨김
        slashPath.style.display = "block";
        wave1Path.style.display = "none";
        wave2Path.style.display = "none";
        wave3Path.style.display = "none";
      } else if (v < 0.3) {
        // 낮은 볼륨 → wave1만 보이게
        slashPath.style.display = "none";
        wave1Path.style.display = "block";
        wave2Path.style.display = "none";
        wave3Path.style.display = "none";
      } else if (v < 0.7) {
        // 중간 볼륨 → wave1 + wave2
        slashPath.style.display = "none";
        wave1Path.style.display = "block";
        wave2Path.style.display = "block";
        wave3Path.style.display = "none";
      } else {
        // 높은 볼륨 → wave1 + wave2 + wave3
        slashPath.style.display = "none";
        wave1Path.style.display = "block";
        wave2Path.style.display = "block";
        wave3Path.style.display = "block";
      }
    }
  
    /************************************************************
     * (4) 기존(재생/전체화면/진행바) 로직
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
     * (5) 볼륨 슬라이더 이벤트
     ************************************************************/
    function toggleVolumePopup() {
      if (!volumePopup) return;
      volumePopup.classList.toggle('show');
    }
  
    function handleVolumeChange(e) {
      if (!video) return;
      video.volume = parseFloat(e.target.value);
      updateVolumeIcon();  // 볼륨 바뀔 때마다 아이콘 갱신
    }
  
    /************************************************************
     * (6) 마우스 이동 -> 컨트롤 표시/숨김
     ************************************************************/
    function handleMouseMove(e) {
      if (!playerContainer) return;
  
      const rect = playerContainer.getBoundingClientRect();
      const bottomThreshold = rect.bottom - 80;
  
      // (A) 하단 80px 영역
      let isOverBottom = (e.clientY >= bottomThreshold && e.clientY <= rect.bottom);
  
      // (B) 볼륨 버튼/팝업
      let isOverVolume = false;
      if (volumeBtn) {
        const vb = volumeBtn.getBoundingClientRect();
        if (e.clientX >= vb.left && e.clientX <= vb.right &&
            e.clientY >= vb.top && e.clientY <= vb.bottom) {
          isOverVolume = true;
        }
      }
      if (volumePopup?.classList.contains('show')) {
        const vp = volumePopup.getBoundingClientRect();
        if (e.clientX >= vp.left && e.clientX <= vp.right &&
            e.clientY >= vp.top && e.clientY <= vp.bottom) {
          isOverVolume = true;
        }
      }
  
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
      video.volume = 1.0;
      updateVolumeIcon();  // 초기 아이콘 갱신
    }
    updatePlayButton();
    updateProgress();
    handleSpeedChange();
  });
  