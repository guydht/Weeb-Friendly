import { CacheLocalStorage } from "../utils/general";

function asd(AnimeName, elementContainer, videoURL) {
    var container = document.createElement("div"),
        style = document.createElement("style");
    style.innerHTML = `#guydhtVideoWrapper *{transition: inherit;}#guydhtVideoSlider *:not(path){user-select: none; position: relative; display: block;}#guydhtVideoSlider *:hover, #guydhtVideoSlider *:active{opacity: 1;}#guydhtVideoMyVideo{outline: none; position: absolute; width: 100%; height: 100%; top: 0; left: 0;}#guydhtVideoWrapper{box-sizing: border-box; outline: none; top: 0; left: 0; transition: all 0.5s, border 0s, margin: 0s; position: absolute;width: 100%;height: 100%; background: black;}#guydhtVideoInfo{position: absolute;top: 5px;left: 10px;color: white;font-size: 20px;z-index: 2;background-color: rgba(0, 0, 0, 0.15);box-shadow: 0 0 15px 5px rgba(0, 0, 0, 0.3);}#guydhtVideoVolume{opacity: 0;display: inline-block;}#guydhtVideoTimer{display: inline;}span.guydhtVideoClear{display: inline-block;width: 10px;pointer-events: none;}#guydhtVideoSlider{transition: all 0.35s;position: absolute;width: 100%;cursor: auto;height: 40px;left: 0;font-size: 16px;bottom: 0;color:white;background : linear-gradient(to bottom,rgba(0,0,0,0) 0%,rgba(0,0,0,0.45) 95%,rgb(0,0,0) 100%);}#guydhtVideoSlider:hover, #guydhtVideoSlider:active, #guydhtVideoUpperSlider:hover, #guydhtVideoUpperSlider:active{opacity: 1 !important;}#guydhtVideoProgress, #guydhtVideoShadowLineForProgress{transform-origin: 0; transform: translate(0); background : rgb(255,0,0);position: absolute !important;height: 2px;left: 0;width: 100%;top: 50%; z-index: 4;transition: all 0s}#guydhtVideoProgress{transform: scale(0); will-change: transform;}#guydhtVideoProgressContainer:active #guydhtVideoProgress{transition: all 0.1s !important;}#guydhtVideoProgressContainer:hover #guydhtVideoProgress{background: rgb(255, 0, 0);}#guydhtVideoProgressContainer:hover #guydhtVideoProgressCircle, #guydhtVideoProgressContainer:active #guydhtVideoProgressCircle{opacity: 1;}#guydhtVideoProgressCircle{position: absolute !important;opacity: 0;transition: all 0s;z-index: 7;border-radius: 50%;width: 10px;height: 10px;display: inline-block;background: rgb(255, 0, 0);top: calc(50% - 5px);margin-left: -5px;}#guydhtVideoShadowLineForProgress{width: 100%;background: rgb(100, 100, 100);z-index: 2;}#guydhtVideoProgressContainer{width: calc(100% - 20px);left: 10px;height: 100%;}#guydhtVideoPlayPauseButton{cursor: pointer; float: left; left: 5px;height: 100%;width: 35px;}#guydhtVideoAnotherTimerContainer{font-size: 100%; float: left; left: 10px; height: 100%;}#guydhtVideoAnotherTimer{cursor: default; user-select: text !important; top: 50%; transform: translateY(-50%);}#guydhtVideoMiddleTooltiper{pointer-events: none; position: absolute; transition: all 1s; height: 60px; width: 60px; background: rgb(0,0,0); opacity: 0; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; border-radius: 50%;}#guydhtVideoMiddleText{transition: all 0s;}#guydhtVideoFullscreen{cursor: pointer; position:relative;float:right;width:40px;height: 100%;margin-left: -6px;}#guydhtVideoWidthLimiter{overflow: hidden;left: 10px;position: relative;height: 100%;}#guydhtVideoTimeTooltip{position: absolute !important;top:-25%;opacity:0;display: none;color:white;background: black;font-size: 13px;width: 47px;transform: translate(-50%, -50%);transition: all 0s;box-shadow: 0 0 15px 2px rgba(180, 180, 180, 0.4);text-align: center;padding: 4px;}#guydhtVideoTimeTooltip:after{content: " ";position: absolute;top: 100%;left: 50%;margin-left: -5px;border-width: 5px;border-style: solid;border-color: black transparent transparent transparent;}#guydhtVideoProgressContainer:hover #guydhtVideoShadowLineForProgress, #guydhtVideoProgressContainer:active #guydhtVideoShadowLineForProgress{background: rgba(200, 200, 200, 0.8);}.guydhtVideoBuffered{top: 50%; background: rgb(255,255,255); position: absolute !important; height:2px; z-index: 3; transition: all 0s !important; transform: translate(0,0) !important;}.guydhtVideoLoading{pointer-events: none; box-sizing: content-box; height: 0; width: 6vh; padding-bottom: 6vh; top: 50%; left: 50%; transform: translate(-50%, -50%); position: absolute; border-radius:50%; border: 10px solid rgb(40,40,40);}.guydhtVideoLoading:before, .guydhtVideoLoading:after{border: 10px solid transparent; border-top-color:rgb(100,100,100); animation: spin 1.2s cubic-bezier(0.6,0.2,0,0.8) infinite, fadeSpinner 1.2s cubic-bezier(0.6,0.2,0,0.8) infinite; border-radius:50%; position:absolute; left:50%; top:50%; content:""; width:100%; height:100%; transform: translate(-50%, -50%);}.guydhtVideoLoading:before{animation-delay: 0.35s;}@keyframes spin{0%{transform: translate(-50%, -50%) rotate(0deg);} 100%{transform : translate(-50%, -50%) rotate(360deg);}}@keyframes fadeSpinner{15%{border-top-color: rgb(100,100,100)} 35%{border-top-color: rgb(255,255,255)} 60%{border-top-color: rgb(100,100,100);}}}{}#guydhtVideoVolumeSlider{overflow: hidden; width: 0; float: left; height: 100%;}#guydhtVideoVolumeControl{cursor: pointer; height: 100%; width: 35px; float: left; margin-left: 5px;}#guydhtVideoVolumeHandle{cursor: pointer; margin-left: -6px; left: 100%; height: 12px; width: 12px; border-radius: 50%; background: white;top: calc(50% - 8px);}#guydhtVideoVolumeHandle:before, #guydhtVideoVolumeHandle:after{background: rgba(255, 255, 255, 0.2); height: 3px; width: 100px; content: ""; position: absolute; top: 6px; left: 6px;}#guydhtVideoVolumeHandle:before{background: white; left: -100px;}#guydhtVideoVolumeControl:hover ~ #guydhtVideoVolumeSlider, #guydhtVideoVolumeSlider:hover, #guydhtVideoVolumeSlider:active{width: 50px;}#guydhtVideoWrapper svg:hover{fill: rgb(255, 255, 255);}#guydhtVideoWrapper svg{fill: rgb(200, 200, 200); opacity: .9; transition: all .25s !important;}#guydhtVideoWrapper svg:hover{opacity: 1;}#guydhtVideoMiddleText svg{opacity:1 !important;}#guydhtVideoStretchVideo{float: right; border: rgba(255, 255, 255, 0.5) 2px solid; height: 20px; width: 20px ; margin: 0 10px -5px 0;}#guydhtVideoStretchText{margin: 0 5px; font-size: 11.5px;}.guydhtVideoSVGText{font-size: 10px; top: 53%; left: 50%; position: absolute; transform: translate(-50%, -50%);}#guydhtThumbnailContainer canvas{height: 100px; width: 177px; transform: translate(-50%, -50%);}#guydhtThumbnailContainer{height: 0; width: 0; background: rgba(0, 0, 0, 0.7); position: absolute !important; top: -110%; transition: all 0s; display: none; opacity: 0;}#guydhtVideoUpperSlider{pointer-events: none; background: linear-gradient(to top,rgba(0,0,0,0) 0%,rgba(0,0,0,0.45) 95%,rgb(0,0,0) 100%); position: absolute; overflow: hidden; transition: all 0.35s; height: 40px; top: 0; color: white; width: 100%;}#guydhtVideoName{user-select: none; text-overflow: ellipsis;white-space: nowrap;overflow: hidden;padding-right: 40px;margin: 10px; margin-top: 0; position: relative; font: normal normal normal normal 175% Roboto, Arial, Helvetica, sans-serif; cursor: pointer; border: 0; color: white; width: 100%;}#guydhtVideoWrapper.fullscreened #guydhtVideoName{font-size: 27px;}#guydhtVideoUpperSlider:hover{z-index: 99999999999999999999999999999999999999;}#guydhtVideoUpperSlider.opacityOn{opacity: 1 !important;}.guydhtVideoDontShow{opacity: 0 !important; visibility: hidden !important; pointer-events: none;}#guydhtVideoSettings svg{float: right; cursor: pointer;}#guydhtVideoSettings svg:hover{transform:rotate(60deg);}#guydhtVideoSettingsWindow > ul{margin: 10px 0 10px 0;}#guydhtVideoSettingsWindow:hover{background: black;}#guydhtVideoSettingsWindow{overflow: hidden; opacity: 0; position: absolute !important; right: 2%; bottom: 5px; background: rgba(0, 0, 0, 0.8); border-radius: 8%; pointer-events: none;}#guydhtVideoSettings{outline: none;}#guydhtVideoSettings li:hover{background: rgba(255, 255, 255, 0.3);}#guydhtVideoSettings li{display: table; cursor: pointer; width: calc(100% - 10px); padding: 10px 0 10px 10px;}#guydhtVideoSettings li div{display: table-cell; width:50%; padding: 5px 0;}#guydhtVideoSettings li div:nth-child(2){background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMTAwJSIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgMzIgMzIiIHdpZHRoPSIxMDAlIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZmZmIiAvPjwvc3ZnPg==); background-position-x: right; background-repeat: no-repeat;}#guydhtVideoSettingsList{padding: 0 10px 0 15px;}#guydhtVideoSettingWindowHead div{background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMTAwJSIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgMzIgMzIiIHdpZHRoPSIxMDAlIj48cGF0aCBkPSJNIDE5LjQxLDIwLjA5IDE0LjgzLDE1LjUgMTkuNDEsMTAuOTEgMTgsOS41IGwgLTYsNiA2LDYgeiIgZmlsbD0iI2ZmZiIgLz48L3N2Zz4=); background-position: left center; background-repeat: no-repeat; padding-left: 27px !important;}#guydhtVideoSettingWindowHead{border-bottom: rgba(255, 255, 255, 0.6) solid 1px;}
    .libassjs-canvas-parent{
        height: 100%;
        width: 100%;
        top: 0px;
        left: 0px;
        transition: all 0s;
    }
    .libassjs-canvas{
        transition: all 0s;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
    }
    #guydhtVideoSettingsList2{transform: translateX(100%); max-height: 0;}#guydhtVideoSettingWindowHead{border-bottom: rgba(255, 255, 255, 0.6) solid 1px;}
    `;
    container.innerHTML = '<div id="guydhtVideoWrapper"><video tabIndex="1" id="guydhtVideoMyVideo"></video><div id="guydhtVideoInfo" style="display: none;"><div id="guydhtVideoTimer"></div><span class="guydhtVideoClear"></span><div id="guydhtVideoVolume"></div><span class="guydhtVideoClear"></span></div><div id="guydhtVideoUpperSlider"><div id="guydhtVideoName">' + AnimeName + '</div></div><div id="guydhtVideoSlider"><div id="guydhtVideoPlayPauseButton" class="guydhtVideoPlay"></div><div id="guydhtVideoVolumeControl"><svg height="100%" viewBox="0 0 100 100" width="100%"><path></path></svg></div><div id="guydhtVideoVolumeSlider"><div id="guydhtVideoVolumeHandle"></div></div><div id="guydhtVideoAnotherTimerContainer"><div id="guydhtVideoAnotherTimer"></div></div><div id="guydhtVideoFullscreen"><svg height="100%" width="100%"><path d="m 10,16 2,0 0,-4 4,0 0,-2 L 10,10 l 0,6 0,0 z"></path><path d="m 20,10 0,2 4,0 0,4 2,0 L 26,10 l -6,0 0,0 z"></path><path d="m 24,24 -4,0 0,2 L 26,26 l 0,-6 -2,0 0,4 0,0 z"></path><path d="M 12,20 10,20 10,26 l 6,0 0,-2 -4,0 0,-4 0,0 z"></path></svg></div><div id="guydhtVideoSettings"><svg viewbox="0 0 36 36" height="100%" width="35px"><path d="m 23.94,18.78 c .03,-0.25 .05,-0.51 .05,-0.78 0,-0.27 -0.02,-0.52 -0.05,-0.78 l 1.68,-1.32 c .15,-0.12 .19,-0.33 .09,-0.51 l -1.6,-2.76 c -0.09,-0.17 -0.31,-0.24 -0.48,-0.17 l -1.99,.8 c -0.41,-0.32 -0.86,-0.58 -1.35,-0.78 l -0.30,-2.12 c -0.02,-0.19 -0.19,-0.33 -0.39,-0.33 l -3.2,0 c -0.2,0 -0.36,.14 -0.39,.33 l -0.30,2.12 c -0.48,.2 -0.93,.47 -1.35,.78 l -1.99,-0.8 c -0.18,-0.07 -0.39,0 -0.48,.17 l -1.6,2.76 c -0.10,.17 -0.05,.39 .09,.51 l 1.68,1.32 c -0.03,.25 -0.05,.52 -0.05,.78 0,.26 .02,.52 .05,.78 l -1.68,1.32 c -0.15,.12 -0.19,.33 -0.09,.51 l 1.6,2.76 c .09,.17 .31,.24 .48,.17 l 1.99,-0.8 c .41,.32 .86,.58 1.35,.78 l .30,2.12 c .02,.19 .19,.33 .39,.33 l 3.2,0 c .2,0 .36,-0.14 .39,-0.33 l .30,-2.12 c .48,-0.2 .93,-0.47 1.35,-0.78 l 1.99,.8 c .18,.07 .39,0 .48,-0.17 l 1.6,-2.76 c .09,-0.17 .05,-0.39 -0.09,-0.51 l -1.68,-1.32 0,0 z m -5.94,2.01 c -1.54,0 -2.8,-1.25 -2.8,-2.8 0,-1.54 1.25,-2.8 2.8,-2.8 1.54,0 2.8,1.25 2.8,2.8 0,1.54 -1.25,2.8 -2.8,2.8 l 0,0 z" /></svg><div id="guydhtVideoSettingsWindow"><ul id="guydhtVideoSettingsList"><li><div id="guydhtVideoStretch">Stretch Video</div><span id="guydhtVideoStretchVideo"></span></li><li><div id="guydhtChooseSubs">Choose Subtitle Track</div></li></ul><ul id="guydhtVideoSettingsList2" style="margin: 0;"><li id="guydhtVideoSettingWindowHead"><div>back</div></li></ul></div></div><div id="guydhtThumbnailContainer"><img></img></div><div id="guydhtVideoTimeTooltip"></div><div id="guydhtVideoWidthLimiter"><div id="guydhtVideoProgressContainer"><div id="guydhtVideoShadowLineForProgress"></div><div id="guydhtVideoProgress"></div><div id="guydhtVideoProgressCircle"></div></div></div></div><div id="guydhtVideoMiddleTooltiper"><div id="guydhtVideoMiddleText"></div></div></div>';
    container.appendChild(style);
    container.style = "background: none;";
    // eslint-disable-next-line
    AnimeName = AnimeName.replace(" (Sub)", "").replace(" (Dub)", "").replace(/\s0+(?=[0-9])/g, " ").trim().replace(/[:/]/g, "-").replace(/["]/g, "'").replace(/[\]\[<>\|\\*?_]/g, "").replace(".mp4", "").replace(/\s+/g, " ");
    container.querySelector("video").src = videoURL;
    elementContainer.innerHTML = "";
    elementContainer.style.background = "none";
    elementContainer.appendChild(container);
    asdf(AnimeName);
    return container;

    async function asdf(AnimeName) {
        var video = container.querySelector("#guydhtVideoMyVideo"),
            wrapper = container.querySelector("#guydhtVideoWrapper"),
            Timer = container.querySelector("#guydhtVideoTimer"),
            volume = container.querySelector("#guydhtVideoVolume"),
            info = container.querySelector("#guydhtVideoInfo"),
            slider = container.querySelector("#guydhtVideoSlider"),
            progressBar = container.querySelector("#guydhtVideoProgress"),
            progressBarCircle = container.querySelector("#guydhtVideoProgressCircle"),
            progressContainer = progressBar.parentNode,
            fullscreen = container.querySelector("#guydhtVideoFullscreen"),
            sliderLocker = true,
            middleTooltip = container.querySelector("#guydhtVideoMiddleTooltiper"),
            volumeControl = container.querySelector("#guydhtVideoVolumeControl"),
            volumeSlider = container.querySelector("#guydhtVideoVolumeSlider"),
            stretch = container.querySelector("#guydhtVideoStretchVideo"),
            settings = container.querySelector("#guydhtVideoSettings"),
            settingsButton = container.querySelector("#guydhtVideoSettings svg"),
            settingsWindow = container.querySelector("#guydhtVideoSettingsWindow"),
            secondSettingsList = container.querySelector("#guydhtVideoSettingsList2"),
            settingsList = container.querySelector("#guydhtVideoSettingsList"),
            chooseSubs = container.querySelector("#guydhtChooseSubs"),
            thumbnailContainer = container.querySelector("#guydhtThumbnailContainer"),
            upperName = container.querySelector("#guydhtVideoUpperSlider");
        let subtitleTracks = []
        container.setSubtitleTracksNames = tracksNames => {
            subtitleTracks = [...tracksNames];
            subtitleTracks[0] += " - active";
        };
        chooseSubs.onclick = () => setSecondScreen(subtitleTracks.map(function handleSubs(trackName, i) {
            return [trackName, () => {
                subtitleTracks = subtitleTracks.map(name => name.replace(/\s-\sactive/g, ""));
                container.dispatchEvent(new CustomEvent("guydhtChangeSubs", { detail: subtitleTracks[i] }));
                subtitleTracks[i] += " - active";
                setSecondScreen(subtitleTracks.map(handleSubs));
            }];
        }));
        function setSecondScreen(arr) { //[["text", onclick]]
            [...secondSettingsList.children].slice(1).forEach(ele => ele.remove());
            for (var i of arr) {
                var li = document.createElement("li");
                li.append(new Text(i[0]));
                li.onclick = i[1];
                secondSettingsList.append(li);
            }
            changeSettingsWindow();
        }
        settings.addEventListener("blur", function () {
            secondSettingsList.children[0].click();
        });

        function changeSettingsWindow() {
            settingsList.style = "transform: translateX(-100%); max-height: 0;";
            secondSettingsList.style = "transform: none; max-height: fit-content;";
        }
        secondSettingsList.children[0].onclick = function () {
            settingsList.style = "";
            secondSettingsList.style = "margin: 0;";
        }
        video.currentTime = (new CacheLocalStorage("videoLastTime").getItem(AnimeName) || {}).currentTime || 0;
        video.focus();
        video.dataset.guydhtVideoName = AnimeName + ".mp4";
        video.addEventListener("error", function (e) {
            var eve = new CustomEvent("guydhtVideoError", {
                detail: video.error,
                bubbles: true
            });
            e.target.dispatchEvent(eve);
        });
        container.style.background = "black";
        volumeControl.children[0].innerHTML = '<path d="M22,58 L33,58 L47,72 L47,27 L33,41 L22,41 L22,58 Z M52,38 L52,61 C56,59 59,54 59,50 C59,45 56,40 52,38 Z M52,31 C60,33 66,41 66,50 C66,58 60,66 52,68 L52,74 C63,71 72,61 72,50 C72,38 63,28 52,25 L52,31 Z"></path>';

        stretch.parentNode.onclick = function () {
            if (stretch.checked) {
                video.style.objectFit = "fill";
                stretch.style = "background: rgba(255, 255, 255, 0.5); border: 2px solid transparent;";
                stretch.checked = false;
            } else {
                video.style.objectFit = "";
                stretch.style = "";
                stretch.checked = true;
            }
        };
        settings.tabIndex = 1;
        settings.onfocus = function () {
            settingsWindow.style.opacity = 1;
            settingsWindow.style.pointerEvents = "auto";
            settingsButton.style.transform = "rotate(60deg)";
        };
        settings.onblur = function () {
            setTimeout(function () {
                if (!settings.contains(document.activeElement)) {
                    settingsWindow.style.opacity = 0;
                    settingsWindow.style.pointerEvents = "none";
                    settingsButton.style.transform = "";
                }
            });
        };
        var settingsFocused = false;
        settingsButton.onmousedown = function () {
            if (document.activeElement === settings)
                settingsFocused = true;
        };
        settingsButton.onmouseup = function () {
            if (settingsFocused) {
                settingsFocused = false;
                settings.blur();
            }
        };
        container.querySelector("#guydhtVideoPlayPauseButton").innerHTML = '<svg height="100%" viewBox="0 0 36 36" width="100%"><path d="M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z"></path></svg>';
        volumeControl.onclick = function () {
            if (video.muted) muteVideo();
            else unmuteVideo();
        };
        volumeSlider.onmouseover = function () {
            volumeControl.children[0].style.opacity = 1;
        };
        volumeSlider.onleave = function () {
            volumeControl.children[0].style.opacity = "";
        };

        function muted() {
            volumeControl.children[0].innerHTML = "<path d='M22,58 L33,58 L47,72 L47,27 L33,41 L22,41 L22,58 Z M52,38 L52,61 C56,59 59,54 59,50 C59,45 56,40 52,38 Z M52,31 C60,33 66,41 66,50 C66,58 60,66 52,68 L52,74 C63,71 72,61 72,50 C72,38 63,28 52,25 L52,31 Z'></path><path d='M3,0 L0,3'><animate attributeName='d' from='M3,0 L0,3' to='M3,0 L100,97 L97,100 L0,3 Z' dur='5s' fill='freeze'></animate></path>";
        }

        function notMuted() {
            volumeControl.children[0].innerHTML = "<path d='M22,58 L33,58 L47,72 L47,27 L33,41 L22,41 L22,58 Z M52,38 L52,61 C56,59 59,54 59,50 C59,45 56,40 52,38 Z M52,31 C60,33 66,41 66,50 C66,58 60,66 52,68 L52,74 C63,71 72,61 72,50 C72,38 63,28 52,25 L52,31 Z'></path>";
        }

        function muteVideo() {
            video.muted = true;
            displayMiddleTooltip("mute");
            volumeSlider.children[0].style.left = "6px";
            var event = new CustomEvent("guydhtVideoMuteChange", {
                detail: {
                    prevState: false,
                    state: true
                }
            });
            video.dispatchEvent(event);
        }

        function unmuteVideo() {
            video.muted = false;
            displayMiddleTooltip("volumeRaise");
            if (video.volume * parseInt(getComputedStyle(volumeSlider.parentNode).width.replace("px", "")) - 6 > 6) volumeSlider.children[0].style.left = (video.volume * parseInt(getComputedStyle(volumeSlider).width.replace("px", "")) - 6) + "px";
            else volumeSlider.children[0].style.left = "6px";
            var event = new CustomEvent("guydhtVideoMuteChange", {
                detail: {
                    prevState: true,
                    state: false
                }
            });
            video.dispatchEvent(event);
        }
        volumeSlider.onmousedown = function (e) {
            if (e.button !== 0) return;
            setVideoVolume(e);
            setStartFunction(setVideoVolume, e);
        };
        var setVideoVolumeTimeout;

        function setVideoVolume(e) {
            clearTimeout(setVideoVolumeTimeout);
            volumeSlider.children[0].style.transition = "all 0s";
            var sliderStyle = volumeSlider.getBoundingClientRect(),
                value = ((e.clientX - sliderStyle.left) - 6) / (volumeSlider.clientWidth - volumeSlider.children[0].clientWidth);
            value = value >= 0 ? value : 0;
            if (value <= 1) video.volume = value;
            else video.volume = 1;
            setVideoVolumeTimeout = setTimeout(function () {
                volumeSlider.children[0].style.transition = "";
            }, 10);
            if (video.volume <= 0) volumeSlider.children[0].style.left = "6px";
            else volumeSlider.children[0].style.left = (video.volume * (volumeSlider.clientWidth - volumeSlider.children[0].clientWidth) + 6) + "px";
            if (video.volume === 0) muted();
            else notMuted();
        };
        window.addEventListener("blur", function (e) {
            if (!document.pointerLockElement) return;
            slider.style.display = "";
            upperName.style.display = "";
            info.style.display = "none";
            wrapper.classList.remove("fullscreened");
        });
        document.onwebkitfullscreenchange = function () {
            if (!document.webkitFullscreenElement && wrapper.style.position === "fixed") exitFullscreenMode();
        };

        function toggleFullscreen() {
            if (document.webkitFullscreenElement === container) exitFullscreenMode();
            else enterFullscreenMode();
        }
        var previousPosition = {}, containerStyle = {}, fullScreenRect = {}, fullscreenWait, finishFullscreenExitTimeout;


        function enterFullscreenMode() {
            clearInterval(fullscreenWait);
            clearTimeout(finishFullscreenExitTimeout);
            previousPosition = wrapper.getBoundingClientRect().toJSON();
            containerStyle = absPosition(wrapper);
            wrapper.style.transition = "all 0s";
            wrapper.style.height = previousPosition.height + "px";
            wrapper.style.width = previousPosition.width + "px";
            wrapper.style.left = containerStyle.left + "px";
            wrapper.style.top = containerStyle.top + "px";
            container.webkitRequestFullscreen();
            fullscreenWait = waitFor(function () {
                return document.webkitFullscreenElement != null;
            }, function () {
                wrapper.style = "left: 0; top: 0; bottom: 0; right: 0; width: 100%; height: 100%; z-index: 999999; position: fixed; transition: all 0.5s; border: none;";
                finishFullscreenExitTimeout = setTimeout(() => fullScreenRect = wrapper.getBoundingClientRect().toJSON(), 500);
            }, 1);
            wrapper.classList.add("fullscreened");
        }

        function exitFullscreenMode() {
            clearInterval(fullscreenWait);
            clearTimeout(finishFullscreenExitTimeout);
            wrapper.style.position = "fixed";
            wrapper.style.transition = "all 0s";
            for (var i in containerStyle) {
                wrapper.style[i] = (previousPosition[i] - containerStyle[i]) + "px";
            }
            wrapper.style.height = fullScreenRect.height + "px";
            wrapper.style.width = fullScreenRect.width + "px";
            wrapper.style.border = "1px solid rgba(20, 80, 170, 0.7)";
            document.exitPointerLock();
            slider.style.display = "";
            upperName.style.display = "";
            info.style.display = "none";
            wrapper.classList.remove("fullscreened");
            if (document.webkitFullscreenElement != null) document.webkitExitFullscreen();
            setTimeout(function () {
                wrapper.style.transition = "all 0.5s";
                for (var i in previousPosition)
                    wrapper.style[i] = previousPosition[i] + "px";
            });
            finishFullscreenExitTimeout = setTimeout(function () {
                wrapper.style = "transition: all 0s; border: 1px solid rgba(20, 80, 170, 0.7);";
            }, 500);
        }
        var timerTimeout;

        function displayTimerText() {
            checkInfoText(true);
            clearTimeout(timerTimeout);
            Timer.style.opacity = 1;
            info.style.opacity = 1;
            timerTimeout = setTimeout(function () {
                Timer.style.opacity = 0;
                timerTimeout = setTimeout(function () {
                    Timer.innerHTML = "";
                }, 500);
            }, 1500);
        }
        var sliderTimeout;

        function displaySlider(select) {
            clearTimeout(sliderTimeout);
            if (select !== "upper") slider.style.opacity = 1;
            if (select !== "bottom") upperName.style.opacity = 1;
            sliderTimeout = setTimeout(function () {
                slider.style.opacity = 0;
                upperName.style.opacity = 0;
            }, video.paused === false ? 2000 : 3000);
        }
        document.body.addEventListener("keydown", onkeydown);

        function onkeydown(e) {
            if (e.target.tagName.toLowerCase() !== "input" && e.code === "Backquote" && !document.webkitFullscreenElement && !document.pointerLockElement) {
                if (wrapper === document.activeElement || wrapper.contains(document.activeElement)) {
                    document.activeElement.blur();
                    wrapper.onblur();
                } else
                    wrapper.focus();
            }
        }
        wrapper.tabIndex = 0;
        wrapper.onfocus = function () {
            this.style.border = "1px solid rgba(20, 20, 150, 0.7)";
            this.style.margin = "";
        };
        wrapper.onblur = function () {
            setTimeout(() => {
                if (!wrapper.contains(document.activeElement) && document.activeElement !== wrapper) {
                    this.style.border = "";
                    this.style.margin = "1px";
                }
            });
        };
        wrapper.onkeydown = function (e) {
            if (e.target.tagName === "INPUT") return;
            var multiplier = 0,
                ctrlShiftAlt = !e.ctrlKey && !e.shiftKey && !e.altKey;
            if (e.ctrlKey) multiplier += 10;
            if (e.altKey) multiplier += 2.5;
            if (e.shiftKey) multiplier += 0.5;
            multiplier = multiplier !== 0 ? multiplier : 1;
            setTimeout(function () {
                checkInfoText(true);
            }, 10);
            if (e.code === "KeyF" && ctrlShiftAlt && !e.guydhtSentThis) {
                if (container !== document.webkitFullscreenElement) enterFullscreenMode();
                else exitFullscreenMode();
            } else if (e.code === "Slash" && ctrlShiftAlt) {
                if (!document.pointerLockElement) {
                    wrapper.requestPointerLock();
                    displayMiddleTooltip("lock");
                    toggleInfoSlider();
                } else {
                    document.exitPointerLock();
                    displayMiddleTooltip("unlock");
                    toggleInfoSlider();
                }
            } else if (e.code === "KeyM" && ctrlShiftAlt) {
                if (!video.muted) muteVideo();
                else unmuteVideo();
            } else if (e.code === "KeyR" && ctrlShiftAlt) {
                var temp = video.currentTime,
                    paused = video.paused,
                    videoLink = video.src;
                video.src = videoLink;
                thumbnailsObj = {};
                video.currentTime = temp;
                if (!paused) video.play();
            } else if ((e.key === " " || e.code === "KeyK" || e.code === "KeyP") && ctrlShiftAlt)
                if (video.paused) video.play();
                else video.pause();
            else if (!isNaN(e.key) && ctrlShiftAlt) {
                setTimer();
                displayTimerText();
                displaySlider();
                video.currentTime = (parseInt(e.key) * video.duration / 10);
            } else if ((e.code === "KeyT" || e.code === "KeyI") && ctrlShiftAlt) {
                displayTimerText();
            } else if (e.key === "ArrowDown") {
                if (video.volume - 0.1 > 0) {
                    video.volume = (parseInt(video.volume * 1000) / 100 - 1) / 10;
                    displayMiddleTooltip("volumeLower");
                } else {
                    video.volume = 0;
                    displayMiddleTooltip("mute");
                }
                displayVolumeText();
            } else if (e.key === "ArrowUp") {
                if (video.volume + 0.1 <= 1) video.volume = (parseInt(video.volume * 1000) / 100 + 1) / 10;
                else video.volume = 1;
                displayMiddleTooltip("volumeRaise");
                displayVolumeText();
            } else if (e.key === "ArrowRight") {
                displayTimerText();
                video.currentTime += 4 * multiplier;
                displayMiddleTooltip(4 * multiplier);
            } else if (e.key === "ArrowLeft") {
                displayTimerText();
                video.currentTime += -4 * multiplier;
                displayMiddleTooltip(-4 * multiplier);
            } else if (e.code === "KeyS" && ctrlShiftAlt) {
                if (video.volume - 0.05 > 0) {
                    displayMiddleTooltip("volumeLower");
                    video.volume = (parseInt(video.volume * 1000) / 100 - 0.5) / 10;
                } else {
                    displayMiddleTooltip("mute");
                    video.volume = 0;
                }
                displayVolumeText();
            } else if (e.code === "KeyW" && ctrlShiftAlt) {
                if (video.volume + 0.05 <= 1) video.volume = (parseInt(video.volume * 1000) / 100 + 0.5) / 10;
                else video.volume = 1;
                displayMiddleTooltip("volumeRaise");
                displayVolumeText();
            } else if (e.code === "KeyD" && ctrlShiftAlt) {
                displayTimerText();
                video.currentTime += 5 * multiplier;
                displayMiddleTooltip(5 * multiplier);
            } else if (e.code === "KeyA" && ctrlShiftAlt) {
                displayTimerText();
                video.currentTime += -5 * multiplier;
                displayMiddleTooltip(-5 * multiplier);
            } else if (e.code === "KeyV") {
                displaySlider("upper");
            } else if (e.code === "KeyL" && ctrlShiftAlt) {
                displayTimerText();
                video.currentTime += 10 * multiplier;
                displayMiddleTooltip(10 * multiplier);
            } else if (e.code === "KeyJ" && ctrlShiftAlt) {
                displayTimerText();
                video.currentTime += -10 * multiplier;
                displayMiddleTooltip(-10 * multiplier);
            } else return;
            e.preventDefault();
            e.stopPropagation();
            if (slider.style.opacity === upperName.style.opacity && upperName.style.opacity === 0) displaySlider();
        };

        function toggleInfoSlider() {
            if (!document.pointerLockElement) {
                info.style.display = "";
                slider.style.display = "none";
                upperName.style.display = "none";
            } else {
                info.style.display = "none";
                slider.style.display = "";
                upperName.style.display = "";
            }
        }
        wrapper.onmouseleave = function () {
            if (sliderLocker) {
                slider.style.opacity = 0;
                upperName.style.opacity = 0;
            }
        };
        let updateProgress = () => {
            setTimeout(function () {
                progressBar.style.transform = "scaleX(" + (video.currentTime / video.duration) + ")";
                progressBarCircle.style.left = (video.currentTime / video.duration) * 100 + "%";
            });
        };
        video.addEventListener("timeupdate", updateProgress);
        video.onload = setTimer;
        video.onloadedmetadata = setTimer;
        setInterval(setTimer, 250);
        var previousTime, mone = 0;

        function setTimer() {
            var currentTime = video.currentTime,
                totalTime = video.duration;
            var buffered = video.buffered,
                currentParts = progressContainer.querySelectorAll(".guydhtVideoBuffered");
            if (currentParts.length < buffered.length)
                for (var i = currentParts.length; i < buffered.length; i++) {
                    var Buffered = document.createElement("div"),
                        start = parseInt(buffered.start(i));
                    Buffered.className = "guydhtVideoBuffered";
                    progressContainer.appendChild(Buffered);
                }
            currentParts.forEach(ele => {
                if (ele.style === "") return ele.remove();
                var start = Number(ele.style.left.replace("%", "")) / 100 * totalTime;
                for (var i = 0; i < buffered.length; i++)
                    if (Math.abs(Math.round(buffered.start(i) - start)) < 2)
                        return;
                ele.remove();
            });
            currentParts = progressContainer.querySelectorAll(".guydhtVideoBuffered");
            for (i = 0; i < buffered.length; i++) {
                start = buffered.start(i) * 100 / totalTime;
                var size = (buffered.end(i) - buffered.start(i)) * 100 / totalTime;
                start = buffered.start(i) === 0 ? 0 : start.toPrecision(4);
                if (buffered.end(i) < currentTime) continue;
                try {
                    currentParts[i].style = "width: " + size.toPrecision(4) + "%; left: " + start + "%;";
                } catch (e) { }
            }
            if (mone > 9) {
                mone = 0;
                if (previousTime === currentTime && video.paused === false) previousTime = currentTime
                previousTime = currentTime;
            }
            mone++;
            if (Timer.style.opacity !== 0) Timer.innerHTML = secondsToTimeDisplay(currentTime) + "/" + secondsToTimeDisplay(totalTime);
            var text = secondsToTimeDisplay(currentTime) + "/" + secondsToTimeDisplay(totalTime),
                anotherTimer = container.querySelector("#guydhtVideoAnotherTimer");
            if (anotherTimer.innerHTML !== text)
                anotherTimer.innerHTML = text;
            new CacheLocalStorage("videoLastTime").setItem(AnimeName, { currentTime: video.currentTime, progress: video.currentTime / video.duration });
        }
        progressContainer.onmousedown = function (e) {
            if (e.button !== 0) return;
            setVideoTime(e);
            setStartFunction(setVideoTime, e);
            e.stopPropagation();
        };

        function setVideoTime(e) {
            slider.style.opacity = 1;
            upperName.style.opacity = 1;
            progressContainer.onmousemove(e);
            var style = progressContainer.getBoundingClientRect(),
                position = (e.clientX - parseInt(style.left)) / parseInt(style.width);
            video.currentTime = video.duration * position;
            progressBar.style.transition = "all 0s";
            progressBar.style = "transform: scaleX(" + position + ")";
            progressBarCircle.style.left = position * 100 + "%";
            // eslint-disable-next-line
            clearTimeout(setTransition);
            var setTransition = setTimeout(function () {
                progressBar.style.transition = "";
            }, 10);
        }
        var tooltip = container.querySelector("#guydhtVideoTimeTooltip"),
            previousThumbSec = 0,
            thumbnailsObj = {},
            thumbnailTime,
            cheapFactor;
        progressContainer.onmousemove = function (e) {
            var style = progressContainer.getBoundingClientRect();
            if (e.clientX < style.left || e.clientX > (style.left + style.width)) {
                tooltip.style.opacity = 0;
                thumbnailContainer.style.opacity = 0;
                return;
            }
            tooltip.style.opacity = 1;
            style = progressContainer.getBoundingClientRect();
            var position = e.clientX - parseInt(style.left),
                time = parseInt((position / parseInt(style.width)) * video.duration);
            tooltip.style.display = "initial";
            tooltip.style.left = (position + (parseInt(style.left) - parseInt(slider.getBoundingClientRect().left))) + "px";
            tooltip.innerHTML = secondsToTimeDisplay(time);
            if (video.src.includes("http")) return;
            if (thumbnailTime < 1) thumbnailTime = video.duration * thumbnailTime;
            let thumbnailSec = time - time % thumbnailTime;
            thumbnailContainer.style.left = tooltip.style.left;
            thumbnailContainer.style.display = tooltip.style.display;
            thumbnailContainer.style.opacity = tooltip.style.opacity;
            if (isNaN(thumbnailSec)) return;
            if (thumbnailSec !== previousThumbSec) {
                previousThumbSec = thumbnailSec;
                if (!thumbnailsObj[thumbnailSec] || thumbnailsObj[thumbnailSec] === "waiting") {
                    frameAt(video, thumbnailSec !== 0 ? thumbnailSec : 20, function (canvas) {
                        thumbnailsObj[thumbnailSec] = canvas;
                        if (previousThumbSec === thumbnailSec) {
                            thumbnailContainer.children[0].remove();
                            thumbnailContainer.appendChild(canvas);
                        }
                    });
                    thumbnailsObj[thumbnailSec] = "waiting";
                } else if (thumbnailsObj[thumbnailSec] !== "waiting") {
                    thumbnailContainer.children[0].remove();
                    thumbnailContainer.appendChild(thumbnailsObj[thumbnailSec]);
                }
            } else if (thumbnailSec === 0 && previousThumbSec !== thumbnailSec) {
                previousThumbSec = thumbnailSec;
                if (!thumbnailsObj[thumbnailSec]) {
                    thumbnailsObj[thumbnailSec] = "waiting";
                    frameAt(video, thumbnailSec + 20, function (canvas) {
                        thumbnailsObj[thumbnailSec] = canvas;
                    });
                }
            }
        };
        var clonedVideo = !!video ? video.cloneNode(true) : null,
            queue = [];
        cheapFactor = true;
        clonedVideo.pause();
        //cheapFactor = true ======> isRich
        if (clonedVideo)
            clonedVideo.addEventListener("seeked", loadFrameToQueue);

        function loadFrameToQueue() {
            clonedVideo.pause();
            var canvas = document.createElement("canvas");
            canvas.height = 100;
            canvas.width = 177;
            canvas.getContext("2d").drawImage(clonedVideo, 0, 0, 177, 100);
            if (queue.length === 0) return;
            queue[cheapFactor ? queue.length - 1 : 0][2](canvas);
            cheapFactor ? queue.pop()[1]() : queue.shift()[1]();
        };

        function frameAt(v, time, callback, stop) {
            queue = queue.filter(function (ele) {
                return ele[0] !== time;
            });
            time = parseFloat(time);
            if (!clonedVideo) {
                clonedVideo = v.cloneNode(true);
                clonedVideo.addEventListener("seekend", loadFrameToQueue);
            }
            if (stop !== true)
                queue.push([time, function () {
                    frameAt(v, time, callback, true);
                }, callback]);
            if (clonedVideo.readyState > 0)
                isLoaded();
            else
                clonedVideo.onloadedmetadata = isLoaded;

            function isLoaded() {
                clonedVideo.pause();
                if (queue.length === 0 && stop !== true)
                    queue.push([time, function () {
                        frameAt(v, time, callback, true);
                    }, callback]);
                else if (queue.length === 0) return;
                clonedVideo.currentTime = parseInt(queue[cheapFactor ? queue.length - 1 : 0][0]) || 0;
            }
        }

        progressContainer.onmouseover = progressContainer.onmousemove;
        progressContainer.onmouseleave = function () {
            this.className = "";
            tooltip.style.display = "none";
            thumbnailContainer.style.display = "none";
        };
        var Body = document.createElement("div"),
            mouseIsDown = false;

        function setStartFunction(myFunction, ...param) {
            mouseIsDown = true;
            var tempVal = document.body.style.getPropertyValue("user-select"),
                tempP = document.body.style.getPropertyPriority("user-select");
            document.body.style.setProperty("user-select", "none", "important");
            if (Body !== window) (document.webkitFullscreenElement || document.body).appendChild(Body);
            Body.style = "position: fixed; top:0; left:0; height: 100%; width:100%; z-index: 999999999999999999999999999; -webkit-user-select: none; cursor: auto;";
            Body.onmousemove = function (e) {
                myFunction(e, ...param);
            };
            window.addEventListener("mouseup", function abcde(e) {
                mouseIsDown = false;
                if (Body !== window) Body.remove();
                document.body.style.setProperty(tempVal, tempP);
                window.removeEventListener("mouseup", abcde)
            }, {
                once: true
            });
        }
        containerStyle = container.style;
        var dontTogglePauseNextTime = false,
            pauseTimeout, pauseFlag = false,
            longPauseFlag = false;
        wrapper.oncontextmenu = function (e) {
            if (!!document.pointerLockElement) return false;
        };
        wrapper.onmouseup = function (e) {
            if (e.button !== 0 || !!document.pointerLockElement) return false;
            setTimeout(function () {
                longPauseFlag = false;
            }, 400);
            if (longPauseFlag) toggleFullscreen();
            if (pauseFlag) {
                clearTimeout(pauseTimeout);
                pauseFlag = false;
                return;
            }
            pauseFlag = longPauseFlag = true;
            pauseTimeout = setTimeout(function () {
                onmouseup(e);
                pauseFlag = false;
            }, 175);
        };

        function onmouseup(e) {
            if (e.button !== 0) {
                dontTogglePauseNextTime = true;
                return;
            }
            if (dontTogglePauseNextTime) {
                dontTogglePauseNextTime = false;
                return;
            }
            if (e.clientY > slider.getBoundingClientRect().top) return false;
            if (video.paused) video.play();
            else video.pause()
        };
        var volumeTimeout, firstPlayOK = true;
        video.addEventListener("guydhtVideoMuteChange", function (e) {
            if (!!e.detail && e.detail.state === true) {
                video.addEventListener("guydhtVideoVolumeChange", tempFunction);

                function tempFunction(ce) {
                    displayVolumeText(e);
                    this.muted = false;
                    this.onvolumechange = displayVolumeText;
                };
            }
        });
        setTimeout(function () {
            volumeSlider.children[0].style.left = (video.volume * ((volumeSlider.clientWidth || 50) - volumeSlider.children[0].clientWidth) + 6) + "px";
        });

        function displayVolumeText(e) {
            displaySlider();
            clearTimeout(volumeTimeout);
            volume.style.opacity = 1;
            info.style.opacity = 1;
            volume.innerHTML = parseInt(video.volume * 100) + "%";
            volumeTimeout = setTimeout(function () {
                volume.style.opacity = 0;
                volumeTimeout = setTimeout(function () {
                    volume.innerHTML = "";
                }, 500);
            }, 1000);
            if (video.muted) {
                return;
            }
            var arr = [],
                element = volumeSlider.children[0];
            while (element !== document.body) {
                arr.push(element.style.display);
                element.style.display = "";
                element = element.parentNode;
            }
            volumeSlider.style.width = "50px";
            if (video.volume === 0) volumeSlider.children[0].style.left = "6px";
            else volumeSlider.children[0].style.left = (video.volume * ((volumeSlider.clientWidth || 50) - volumeSlider.children[0].clientWidth) + 6) + "px";
            volumeSlider.style.width = "";
            element = volumeSlider.children[0];
            while (element !== document.body) {
                element.style.display = arr.shift();
                element = element.parentNode;
            }
        }
        var seekTimeout;
        video.onseeking = function () {
            displayMiddleTooltip("loading");
        };
        video.onseeked = function () {
            displayMiddleTooltip();
            clearTimeout(seekTimeout);
        };
        var middleTooltipTimeout;

        function displayMiddleTooltip(text) {
            if (mouseIsDown || text === "" || !text) {
                setTimeout(function () {
                    try {
                        wrapper.getElementsByClassName("guydhtVideoLoading")[0].remove();
                    } catch (e) { }
                }, 200);
                return;
            }
            if (text === "loading" && wrapper.getElementsByClassName("guydhtVideoLoading").length === 0) {
                var MiddleTooltip = document.createElement("div");
                middleTooltip.parentNode.appendChild(MiddleTooltip);
                MiddleTooltip.className = "guydhtVideoLoading";
                MiddleTooltip.innerHTML = "";
                video.onplaying = function () {
                    try {
                        for (var i = 0; i < video.buffered.length; i++)
                            if (video.buffered.start(i) <= video.currentTime && video.buffered.end(i) >= video.currentTime) wrapper.getElementsByClassName("guydhtVideoLoading")[0].remove();
                    } catch (e) { }
                };
                middleTooltip.style = "transition: all 0s;";
            } else if (text === "pause") middleTooltip.children[0].innerHTML = '<svg height="100%" width="100%" viewBox="0 0 36 36"><path d="M 12,26 16,26 16,10 12,10 z M 21,26 25,26 25,10 21,10 z"></path></svg>';
            else if (text === "play") middleTooltip.children[0].innerHTML = '<svg height="100%" viewBox="0 0 36 36" width="100%"><path d="M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z" id="ytp-svg-176"></path></svg>'
            else if (text === "mute") {
                middleTooltip.children[0].innerHTML = '<svg height="100%" viewBox="0 0 36 36" width="100%"><path d="M8,21 L12,21 L17,26 L17,10 L12,15 L8,15 L8,21 Z"></path><path d="M 26.11,15.73 24.85,14.5 22.52,16.76 20.20,14.5 18.94,15.73 21.26,18 18.94,20.26 20.20,21.5 22.52,19.23 24.85,21.5 26.11,20.26 23.79,18 l 2.32,-2.26 0,0 z"></path></svg>';
                muted();
            } else if (text === "volumeRaise") {
                middleTooltip.children[0].innerHTML = '<svg height="100%" viewBox="0 0 36 36" width="100%"><path d="M8,21 L12,21 L17,26 L17,10 L12,15 L8,15 L8,21 Z M19,14 L19,22 C20.48,21.32 21.5,19.77 21.5,18 C21.5,16.26 20.48,14.74 19,14 Z M19,11.29 C21.89,12.15 24,14.83 24,18 C24,21.17 21.89,23.85 19,24.71 L19,26.77 C23.01,25.86 26,22.28 26,18 C26,13.72 23.01,10.14 19,9.23 L19,11.29 Z"></path></svg>';
                if (video.volume > 0) notMuted();
                let event = new CustomEvent("guydhtVideoVolumeChange", {
                    detail: video.volume
                });
                video.dispatchEvent(event);
            } else if (text === "volumeLower") {
                middleTooltip.children[0].innerHTML = '<svg height="100%" viewBox="0 0 36 36" width="100%"><path d="M8,21 L12,21 L17,26 L17,10 L12,15 L8,15 L8,21 Z M19,14 L19,22 C20.48,21.32 21.5,19.77 21.5,18 C21.5,16.26 20.48,14.74 19,14 Z"></path></svg>';
                if (video.volume > 0) notMuted();
                else muted();
                let event = new CustomEvent("guydhtVideoVolumeChange", {
                    detail: video.volume
                });
                video.dispatchEvent(event);
            } else if (text === "lock") {
                middleTooltip.children[0].innerHTML = '<svg height="100%" width="100%" style="transform: scale(0.7)" viewBox="0 0 500 500"><path d="M131.889,150.061v63.597h-27.256  c-20.079,0-36.343,16.263-36.343,36.342v181.711c0,20.078,16.264,36.34,36.343,36.34h290.734c20.078,0,36.345-16.262,36.345-36.34  V250c0-20.079-16.267-36.342-36.345-36.342h-27.254v-63.597c0-65.232-52.882-118.111-118.112-118.111  S131.889,84.828,131.889,150.061z M177.317,213.658v-63.597c0-40.157,32.525-72.685,72.683-72.685  c40.158,0,72.685,32.528,72.685,72.685v63.597H177.317z M213.658,313.599c0-20.078,16.263-36.341,36.342-36.341  s36.341,16.263,36.341,36.341c0,12.812-6.634,24.079-16.625,30.529c0,0,3.55,21.446,7.542,46.699  c0,7.538-6.087,13.625-13.629,13.625h-27.258c-7.541,0-13.627-6.087-13.627-13.625l7.542-46.699  C220.294,337.678,213.658,326.41,213.658,313.599z"></path></svg>';
            } else if (text === "unlock") {
                middleTooltip.children[0].innerHTML = '<svg height="100%" width="100%" style="transform: scale(0.7)" viewBox="0 0 500 500"><path d="M68.29,431.711c0,20.078,16.264,36.34,36.343,36.34h290.734  c20.078,0,36.345-16.262,36.345-36.34V250c0-20.079-16.267-36.342-36.345-36.342H177.317v-63.597  c0-40.157,32.525-72.685,72.683-72.685c40.158,0,72.685,32.528,72.685,72.685v4.541c0,12.538,10.176,22.715,22.711,22.715  c12.537,0,22.717-10.177,22.717-22.715v-4.541c0-65.232-52.882-118.111-118.112-118.111c-65.24,0-118.111,52.879-118.111,118.111  v63.597h-27.256c-20.079,0-36.343,16.263-36.343,36.342V431.711z M213.658,313.599c0-20.078,16.263-36.341,36.342-36.341  s36.341,16.263,36.341,36.341c0,12.812-6.634,24.079-16.625,30.529c0,0,3.55,21.446,7.542,46.699  c0,7.538-6.087,13.625-13.629,13.625h-27.258c-7.541,0-13.627-6.087-13.627-13.625l7.542-46.699  C220.294,337.678,213.658,326.41,213.658,313.599z"></path></svg>';
            } else if (!isNaN(text)) {
                if (text > 0) middleTooltip.children[0].innerHTML = '<svg height="100%" viewBox="0 0 36 36" width="100%"><path d="m 10,19 c 0,4.4 3.6,8 8,8 4.4,0 8,-3.6 8,-8 h -2 c 0,3.3 -2.7,6 -6,6 -3.3,0 -6,-2.7 -6,-6 0,-3.3 2.7,-6 6,-6 v 4 l 5,-5 -5,-5 v 4 c -4.4,0 -8,3.6 -8, 8 z m 6.7 8"></path></svg><span class="guydhtVideoSVGText">' + Math.abs(text) + '</span>';
                else middleTooltip.children[0].innerHTML = '<svg height="100%" viewBox="0 0 36 36" width="100%"><path d="M 18,11 V 7 l -5,5 5,5 v -4 c 3.3,0 6,2.7 6,6 0,3.3 -2.7,6 -6,6 -3.3,0 -6,-2.7 -6,-6 h -2 c 0,4.4 3.6,8 8,8 4.4,0 8,-3.6 8,-8 0,-4.4 -3.6,-8 -8,-8 z M 16.9 8"></path></svg><span class="guydhtVideoSVGText">' + Math.abs(text) + '</span>';
            }
            clearTimeout(middleTooltipTimeout);
            middleTooltip.style = "";
            middleTooltip.style.transition = "all 0s";
            middleTooltip.style.opacity = 0.7;
            middleTooltipTimeout = setTimeout(function () {
                middleTooltip.style.transition = "";
                middleTooltip.style.opacity = 0;
                middleTooltip.style.transform += "translate(-50%, -50%) scale(2, 2)";
                middleTooltipTimeout = setTimeout(function () {
                    middleTooltip.style = "transition: all 0s;";
                }, 1000);
            }, 10);
        }
        video.onplay = function () {
            displayMiddleTooltip("play");
            transitionSVG(container.querySelector("#guydhtVideoPlayPauseButton svg path"), "M 12,26 16,26 16,10 12,10 z M 21,26 25,26 25,10 21,10 z", 0.5, "0 0 0 1");
            clearTimeout(volumeTimeout);
            volume.style.opacity = 1;
            info.style.opacity = 1;
            if (firstPlayOK) {
                volume.innerHTML = "Resumed";
            }
            volumeTimeout = setTimeout(function () {
                volume.style.opacity = 0;
                volumeTimeout = setTimeout(function () {
                    volume.style.innerHTML = "";
                }, 500);
            }, 1000);
        };
        video.onpause = function () {
            displayMiddleTooltip("pause");
            transitionSVG(container.querySelector("#guydhtVideoPlayPauseButton svg path"), "M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z", 0.5, "0 0 0 1");
            clearTimeout(volumeTimeout);
            volume.style.opacity = 1;
            volume.innerHTML = "Paused";
            volumeTimeout = setTimeout(function () {
                volume.style.opacity = 0;
                volumeTimeout = setTimeout(function () {
                    volume.style.innerHTML = "";
                }, 500);
            }, 1000);
        };
        fullscreen.onclick = function () {
            if (container !== document.webkitFullscreenElement) {
                enterFullscreenMode();
            } else {
                exitFullscreenMode();
            }
        };
        container.querySelector("#guydhtVideoPlayPauseButton").onclick = function () {
            if (this.className === "guydhtVideoPlay") {
                this.className = "guydhtVideoPause";
                video.pause();
            } else {
                this.className = "guydhtVideoPlay";
                video.play();
            }
        };
        window.onbeforeunload = function () {
            sessionStorage.setItem(AnimeName, video.currentTime);
        }
        var killingDisappearing;

        function checkInfoText(again) {
            clearTimeout(killingDisappearing);
            var ok = true,
                arrayOfDisappearing = [];
            for (var i = 0; i < info.children.length; i++) {
                if (info.children[i].style.opacity > 0) ok = false;
                else arrayOfDisappearing.push(i);
            }
            killingDisappearing = setTimeout(function () {
                for (var i = 0; i < arrayOfDisappearing.length; i++) info.children[arrayOfDisappearing[i]].innerHTML = "";
            }, 500);
            if (ok) info.style.opacity = 0;
            else info.style.opcity = 1;
            if (again) {
                setTimeout(checkInfoText, 500);
                setTimeout(checkInfoText, 1000);
                setTimeout(checkInfoText, 1500);
            }
        }
        var temp = container.querySelector("#guydhtVideoFullscreen").innerHTML;
        window.onresize = function () {
            setTimeout(function () {
                checkInfoText(true);
            }, 10);
            displayTimerText();
            if (!!document.webkitFullscreenElement) {
                slider.className = "guydhtVideoFullscreened";
                container.querySelector("#guydhtVideoFullscreen").innerHTML = '<svg height="100%"width="100%"><path d="m 14,14 -4,0 0,2 6,0 0,-6 -2,0 0,4 0,0 z"></path><path d="m 22,14 0,-4 -2,0 0,6 6,0 0,-2 -4,0 0,0 z"></path><path d="m 20,26 2,0 0,-4 4,0 0,-2 -6,0 0,6 0,0 z"></path><path d="m 10,22 4,0 0,4 2,0 0,-6 -6,0 0,2 0,0 z" ></path></svg>';
            } else {
                if (wrapper.style.height === "100%") exitFullscreenMode();
                slider.className = "";
                container.querySelector("#guydhtVideoFullscreen").innerHTML = temp;
            }
        };
        slider.onmousedown = slider.onmouseup = slider.onclick = function (e) {
            e.stopPropagation();
        };
        slider.onmouseover = function () {
            this.style.opacity = 1;
            sliderLocker = false;
        };
        slider.onmousemove = slider.onmouseover;
        slider.onmouseleave = function () {
            this.style.opacity = 0;
            sliderLocker = true;
        }
        var sliderFadeoutTimeout, previousX;
        wrapper.onmousemove = function (e) {
            if (previousX - e.clientX === 0) {
                return;
            }
            if (e.clientY > slider.getBoundingClientRect().top) return;
            previousX = e.clientX;
            if (sliderLocker === true) {
                slider.style.opacity = 1;
                upperName.style.opacity = 1;
            }
            wrapper.style.cursor = "initial";
            clearTimeout(sliderFadeoutTimeout);
            sliderFadeoutTimeout = setTimeout(function () {
                if (targetIsNotThis(e, slider) && sliderLocker === true) {
                    slider.style.opacity = 0;
                    upperName.style.opacity = 0;
                    wrapper.style.cursor = "none";
                }
            }, video.paused === false ? 1000 : 2000);
        };
    }
}

function absPosition(element) {
    var bound = element.getBoundingClientRect().toJSON();
    var windowHeight = Number(window.outerHeight),
        windowWidth = Number(window.outerWidth);
    var windowTop = Number(window.screenY),
        windowLeft = Number(window.screenX),
        windowRight = Number(window.screen.width - (windowLeft + windowWidth)),
        windowBottom = Number(window.screen.height - (windowTop + windowHeight));
    return {
        left: windowLeft + bound.left,
        top: windowTop + bound.top,
        right: windowRight + bound.right,
        bottom: bound.bottom + windowBottom
    };
}

function waitFor(condition, myFunction, amount, ...args) {
    var interval;
    if (condition()) myFunction();
    else interval = setInterval(check, !!amount ? amount : 500, condition, myFunction, ...args);

    function check(condition, myFunction, ...args) {
        if (condition()) {
            clearInterval(interval);
            myFunction(...args);
        }
    }
    return interval;
}

function secondsToTimeDisplay(time, sendWithWords) {
    var seconds = parseInt(time);
    var years = Math.floor(seconds / 31536000),
        days = Math.floor((seconds % 31536000) / 86400),
        hours = Math.floor(((seconds % 31536000) % 86400) / 3600),
        minutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
    seconds = (((seconds % 31536000) % 86400) % 3600) % 60;
    var arr = [years, days, hours, minutes, seconds],
        output = ":";
    arr.forEach(function (e) {
        if ((e > 0 && e < 10) || (output.length > 1 && e === 0)) output += "0" + e + ":";
        else if (e > 0) output += e + ":";
    });
    output = output.slice(1, -1);
    if (!isNaN(output)) output = "00:" + (output || "00");
    if (!sendWithWords)
        return output;
    var names = {
        y: years,
        d: days,
        h: hours,
        m: minutes,
        s: seconds
    };
    if (sendWithWords === "Full") names = {
        years: years,
        days: days,
        hours: hours,
        minutes: minutes,
        seconds: seconds
    };
    return arr.filter(function (a) {
        return a > 0;
    }).map(function (a, i, arr) {
        var letter = Object.keys(names).find(function (ele) {
            return names[ele] === a;
        });
        delete names[letter];
        return a + letter;
    }).join(", ");
}

function targetIsNotThis(e, element) {
    var ok = true,
        tar = e.target;
    while (tar) {
        if (tar === element) {
            ok = false;
            tar = null;
        } else tar = tar.parentNode;
    }
    return ok;
}

function transitionSVG(current, newPath, time, transition) {
    current.innerHTML = '<animate attributeName="d" from="' + current.getAttribute("d") + '" to="' + newPath + '" dur="' + time + '" keyTimes="0; 1" fill="freeze" calcMode="spline" keySplines="' + (transition || "0 0 1 1") + '" />';
    let timeout = setTimeout(function () {
        if (current) {
            current.setAttribute("d", newPath);
            if (current.children.length) current.children[0].remove();
        }
    }, time * 1000);
    current.children[0].beginElement();
    return timeout;
}

export { asd, waitFor };

