document.addEventListener('DOMContentLoaded', function() {
  // 플레이어마다 고유 식별자로 사용
  let videoPlayerCounter = 0;

  // (A) 각 플레이어 컨테이너 내부의 요소들을 참조하고 이벤트를 등록하는 함수
  function initializePlayer(container, uid) {
    const video = container.querySelector('video');
    const playBtn = container.querySelector(`#playBtn-${uid}`);
    const progressBar = container.querySelector(`#progressBar-${uid}`);
    const progressBuffered = container.querySelector(`#progressBuffered-${uid}`);
    const progressFilled = container.querySelector(`#progressFilled-${uid}`);
    const progressThumb = container.querySelector(`#progressThumb-${uid}`);
    const timeLabel = container.querySelector(`#timeLabel-${uid}`);
    const speedSelect = container.querySelector(`#speedSelect-${uid}`);
    const volumeBtn = container.querySelector(`#volumeBtn-${uid}`);
    const volumePopup = container.querySelector(`#volumePopup-${uid}`);
    const volumeSlider = container.querySelector(`#volumeSlider-${uid}`);
    const fullscreenBtn = container.querySelector(`#fullscreenBtn-${uid}`);

    const speakerPath = container.querySelector(`#speaker-${uid}`);
    const wave1Path = container.querySelector(`#wave1-${uid}`);
    const wave2Path = container.querySelector(`#wave2-${uid}`);
    const wave3Path = container.querySelector(`#wave3-${uid}`);
    const slashPath = container.querySelector(`#slash-${uid}`);

    let isHoveringProgress = false;
    let isFullscreen = false;

    function updateVolumeIcon() {
      try {
        if (!video) return;
        const v = video.volume;

        // 항상 스피커 본체는 보이도록
        if (speakerPath) speakerPath.style.display = "block";

        if (v === 0) {
          if (slashPath) slashPath.style.display = "block";
          if (wave1Path) wave1Path.style.display = "none";
          if (wave2Path) wave2Path.style.display = "none";
          if (wave3Path) wave3Path.style.display = "none";
        } else if (v < 0.3) {
          if (slashPath) slashPath.style.display = "none";
          if (wave1Path) wave1Path.style.display = "block";
          if (wave2Path) wave2Path.style.display = "none";
          if (wave3Path) wave3Path.style.display = "none";
        } else if (v < 0.7) {
          if (slashPath) slashPath.style.display = "none";
          if (wave1Path) wave1Path.style.display = "block";
          if (wave2Path) wave2Path.style.display = "block";
          if (wave3Path) wave3Path.style.display = "none";
        } else {
          if (slashPath) slashPath.style.display = "none";
          if (wave1Path) wave1Path.style.display = "block";
          if (wave2Path) wave2Path.style.display = "block";
          if (wave3Path) wave3Path.style.display = "block";
        }
      } catch (e) {
        console.error(e);
      }
    }

    function togglePlay() {
      try {
        if (!video) return;
        if (video.paused || video.ended) {
          video.play();
        } else {
          video.pause();
        }
      } catch (e) {
        console.error(e);
      }
    }

    function updatePlayButton() {
      try {
        if (!video || !playBtn) return;
        if (video.paused) {
          playBtn.classList.remove('pause');
        } else {
          playBtn.classList.add('pause');
        }
      } catch (e) {
        console.error(e);
      }
    }

    function updateProgress() {
      try {
        if (!video || !video.duration) return;
        const currentPercent = (video.currentTime / video.duration) * 100;
        if (progressFilled) progressFilled.style.width = currentPercent + '%';
        if (!isHoveringProgress && progressThumb) {
          progressThumb.style.left = currentPercent + '%';
        }
        if (video.buffered.length > 0) {
          const bufferedEnd = video.buffered.end(video.buffered.length - 1);
          const bufferedPercent = (bufferedEnd / video.duration) * 100;
          if (progressBuffered) progressBuffered.style.width = bufferedPercent + '%';
        }
        if (timeLabel) timeLabel.textContent = formatTime(video.currentTime);
      } catch (e) {
        console.error(e);
      }
    }

    function seekVideo(e) {
      try {
        if (!video || !progressBar) return;
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const seekTo = (clickX / width) * video.duration;
        video.currentTime = seekTo;
      } catch (e) {
        console.error(e);
      }
    }

    function handleProgressHover(e) {
      try {
        isHoveringProgress = true;
        if (!progressBar) return;
        const rect = progressBar.getBoundingClientRect();
        const hoverX = e.clientX - rect.left;
        const width = rect.width;
        const hoverPercent = (hoverX / width) * 100;
        if (progressThumb) progressThumb.style.left = hoverPercent + '%';
      } catch (e) {
        console.error(e);
      }
    }

    function handleProgressLeave() {
      try {
        isHoveringProgress = false;
        if (!video || !video.duration) return;
        const currentPercent = (video.currentTime / video.duration) * 100;
        if (progressThumb) progressThumb.style.left = currentPercent + '%';
      } catch (e) {
        console.error(e);
      }
    }

    function handleSpeedChange() {
      try {
        if (!video || !speedSelect) return;
        const rate = parseFloat(speedSelect.value);
        video.playbackRate = rate;
      } catch (e) {
        console.error(e);
      }
    }

    function toggleFullscreen() {
      try {
        if (!container) return;
        if (!document.fullscreenElement) {
          container.classList.remove('exiting-fullscreen');
          container.classList.add('entering-fullscreen');
          setTimeout(() => {
            container.classList.remove('entering-fullscreen');
            if (container.requestFullscreen) {
              container.requestFullscreen();
            }
          }, 300);
          isFullscreen = true;
        } else {
          container.classList.remove('entering-fullscreen');
          container.classList.add('exiting-fullscreen');
          setTimeout(() => {
            container.classList.remove('exiting-fullscreen');
            if (document.exitFullscreen) {
              document.exitFullscreen();
            }
          }, 300);
          isFullscreen = false;
        }
      } catch (e) {
        console.error(e);
      }
    }

    document.addEventListener('fullscreenchange', () => {
      try {
        if (document.fullscreenElement === container) {
          fullscreenBtn?.classList.add('fullscreen-active');
        } else {
          fullscreenBtn?.classList.remove('fullscreen-active');
        }
      } catch (e) {
        console.error(e);
      }
    });

    function formatTime(sec) {
      if (!sec || isNaN(sec)) return "0:00";
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return m + ":" + (s < 10 ? "0" + s : s);
    }

    function toggleVolumePopup() {
      try {
        volumePopup?.classList.toggle('show');
      } catch (e) {
        console.error(e);
      }
    }

    function handleVolumeChange(e) {
      try {
        if (!video) return;
        video.volume = parseFloat(e.target.value);
        updateVolumeIcon();
      } catch (e) {
        console.error(e);
      }
    }

    function handleMouseMove(e) {
      try {
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const bottomThreshold = rect.bottom - 80;
        let isOverBottom = (e.clientY >= bottomThreshold && e.clientY <= rect.bottom);
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
        if (isOverBottom || isOverVolume) {
          container.classList.add('show-controls');
        } else {
          container.classList.remove('show-controls');
        }
      } catch (e) {
        console.error(e);
      }
    }

    // 이벤트 연결
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
    container.addEventListener('mousemove', handleMouseMove);

    // 초기화
    if (video) {
      video.volume = 1.0;
      updateVolumeIcon();
    }
    updatePlayButton();
    updateProgress();
    handleSpeedChange();
  }

  // (B) 새로 생성되는 <video> 요소를 자동 래핑하는 함수
  function wrapVideoElement(newVideoTag) {
    try {
      if (!newVideoTag) return;
      // 이미 래핑된 경우 건너뜀
      if (newVideoTag.parentElement && newVideoTag.parentElement.classList.contains('player-container')) return;

      videoPlayerCounter++;
      const uid = videoPlayerCounter; // 고유 접미사

      newVideoTag.removeAttribute('controls');

      const container = document.createElement('div');
      container.classList.add('player-container');
      container.id = `playerContainer-${uid}`;

      // video에 inline style이 있으면 container로 이동
      const inlineStyle = newVideoTag.getAttribute('style');
      if (inlineStyle) {
        container.setAttribute('style', inlineStyle);
        newVideoTag.removeAttribute('style');
      }

      // video에 클래스가 있으면 container로 이동
      const videoClasses = newVideoTag.className.trim();
      if (videoClasses) {
        container.className += ' ' + videoClasses;
        newVideoTag.className = '';
      }

      newVideoTag.parentNode.insertBefore(container, newVideoTag);
      container.appendChild(newVideoTag);
      // 중복 래핑 방지를 위해 클래스 추가
      newVideoTag.classList.add('wrapped');

      newVideoTag.id = `myVideo-${uid}`;

      container.insertAdjacentHTML('beforeend', `
        <div class="controls">
          <div class="play-button" id="playBtn-${uid}"></div>
          <div class="progress-container" id="progressBar-${uid}">
            <div class="progress-buffered" id="progressBuffered-${uid}"></div>
            <div class="progress-filled" id="progressFilled-${uid}"></div>
            <div class="progress-thumb" id="progressThumb-${uid}"></div>
          </div>
          <div class="time-label" id="timeLabel-${uid}">0:00</div>
          <select class="speed-select" id="speedSelect-${uid}">
                <option value="0.1">0.1x</option>
                <option value="0.2">0.2x</option>
                <option value="0.3">0.3x</option>
                <option value="0.4">0.4x</option>
                <option value="0.5">0.5x</option>
                <option value="0.6">0.6x</option>
                <option value="0.7">0.7x</option>
                <option value="0.8">0.8x</option>
                <option value="0.9">0.9x</option>
                <option value="1.0" selected>1x</option>
                <option value="1.1">1.1x</option>
                <option value="1.2">1.2x</option>
                <option value="1.3">1.3x</option>
                <option value="1.4">1.4x</option>
                <option value="1.5">1.5x</option>
                <option value="1.6">1.6x</option>
                <option value="1.7">1.7x</option>
                <option value="1.8">1.8x</option>
                <option value="1.9">1.9x</option>
                <option value="2.0">2x</option>
                <option value="2.1">2.1x</option>
                <option value="2.2">2.2x</option>
                <option value="2.3">2.3x</option>
                <option value="2.4">2.4x</option>
                <option value="2.5">2.5x</option>
                <option value="2.6">2.6x</option>
                <option value="2.7">2.7x</option>
                <option value="2.8">2.8x</option>
                <option value="2.9">2.9x</option>
                <option value="3.0">3x</option>
                <option value="3.1">3.1x</option>
                <option value="3.2">3.2x</option>
                <option value="3.3">3.3x</option>
                <option value="3.4">3.4x</option>
                <option value="3.5">3.5x</option>
                <option value="3.6">3.6x</option>
                <option value="3.7">3.7x</option>
                <option value="3.8">3.8x</option>
                <option value="3.9">3.9x</option>
                <option value="4.0">4x</option>
          </select>
          <button class="volume-button" id="volumeBtn-${uid}">
            <svg width="24" height="24" viewBox="0 0 56 56">
              <path fill="#FFF" id="speaker-${uid}"
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
                   Z"/>
              <path fill="#FFF" id="wave1-${uid}"
                d="M 32.6360 38.4233
                   C 33.2941 38.8878 34.2426 38.7330 34.8039 37.9781
                     C 36.3139 35.9456 37.2238 32.9646 37.2238 29.9255
                     C 37.2238 26.8865 36.2945 23.9249 34.8039 21.8536
                     C 34.2426 21.0987 33.3135 20.9439 32.6360 21.4084
                     C 31.7843 21.9698 31.6875 22.9570 32.3069 23.8087
                     C 33.4296 25.3185 34.1071 27.6221 34.1071 29.9255
                     C 34.1071 32.2290 33.3909 34.5325 32.2876 36.0617
                     C 31.7068 36.8941 31.8037 37.8426 32.6360 38.4233
                   Z"/>
              <path fill="#FFF" id="wave2-${uid}"
                d="M 40.3595 43.6497
                   C 41.1143 44.1530 42.0436 43.9594 42.5855 43.1851
                     C 45.1405 39.6234 46.6117 34.8809 46.6117 29.9255
                     C 46.6117 24.9508 45.1599 20.2083 42.5855 16.6466
                     C 42.0242 15.8917 41.1143 15.6981 40.3595 16.2014
                     C 39.6238 16.7047 39.5076 17.6532 40.0884 18.4855
                     C 42.1982 21.5826 43.4953 25.6476 43.4953 29.9255
                     C 43.4953 34.2034 42.2370 38.3072 40.0690 41.3656
                     C 39.5270 42.1979 39.6238 43.1464 40.3595 43.6497
                   Z"/>
              <path fill="#FFF" id="wave3-${uid}"
                d="M 48.1605 48.9342
                   C 48.8765 49.4181 49.8252 49.2245 50.3865 48.4309
                     C 53.9286 43.3593 56.0000 36.8360 56.0000 29.9255
                     C 56.0000 23.0151 53.9096 16.4724 50.3865 11.4008
                     C 49.8252 10.6072 48.8765 10.4136 48.1605 10.9169
                     C 47.4248 11.4202 47.3086 12.3880 47.8700 13.2010
                     C 50.9863 17.7887 52.9221 23.6732 52.9221 29.9255
                     C 52.9221 36.1779 51.0446 42.1398 47.8700 46.6500
                     C 47.3086 47.4437 47.4248 48.4115 48.1605 48.9342
                   Z"/>
              <path
                id="slash-${uid}"
                fill="none"
                stroke="#FFF"
                stroke-width="3"
                stroke-linecap="round"
                d="M 10 10 L 46 46"
                style="display: none;"
              />
            </svg>
            <div class="volume-popup" id="volumePopup-${uid}">
              <input
                type="range"
                id="volumeSlider-${uid}"
                class="volume-slider-vertical"
                min="0" max="1" step="0.05" value="1"
              />
            </div>
          </button>
          <button class="fullscreen-button" id="fullscreenBtn-${uid}">
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

      // 플레이어 초기화 (이벤트 연결 및 초기 설정)
      initializePlayer(container, uid);
    } catch (e) {
      console.error(e);
    }
  }

  // 문서 내 기존 <video> (아직 래핑되지 않은)에 대해 래핑 수행
  const initialVideo = document.querySelector('video:not(.wrapped)');
  if (initialVideo) {
    wrapVideoElement(initialVideo);
  }

  // (C) 새로 추가되는 노드 중 <video>에 대해 래핑 처리 (충돌 방지)
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (
            typeof node.matches === 'function' &&
            node.matches('video:not(.wrapped)')
          ) {
            wrapVideoElement(node);
          } else if (typeof node.querySelectorAll === 'function') {
            const videos = node.querySelectorAll('video:not(.wrapped)');
            videos.forEach(function(v) {
              wrapVideoElement(v);
            });
          }
        }
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
});
