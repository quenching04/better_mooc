// ==UserScript== 
// @name 更好的慕课better_mooc
// @namespace https://github.com/quenching04/better_mooc
// @version 1.2_20251102
// @description 解除右键禁用、任意倍速播放、跳过开头秒数、跳过结尾秒数、画中画播放、快捷键功能
// @author quenching
// @match http*://www.icourse163.org/learn/*
// @match http*://www.icourse163.org/spoc/*
// @run-at document-end
// @grant GM_getValue
// @grant GM_setValue
// ==/UserScript==

/*
1.在以下油猴脚本的基础上修改而来，向原作者kakasearch表示感谢：https://greasyfork.org/zh-CN/scripts/411079-%E4%B8%AD%E5%9B%BD%E5%A4%A7%E5%AD%A6mooc-%E5%80%8D%E9%80%9F%E6%92%AD%E6%94%BE-%E8%B7%B3%E8%BF%87%E7%89%87%E5%A4%B4-%E7%94%BB%E4%B8%AD%E7%94%BB%E6%92%AD%E6%94%BE
2.不能和Youtube一样自动播放仍保持全屏的原因：https://stackoverflow.com/questions/66030076/how-to-persist-fullscreen-mode-in-browser-with-autoplay-like-youtube-playlist-do
3.想要自动播放后仍保持全屏可以下载AutoHotkey-v1.0软件来模拟持续输全屏快捷键（F键），AutoHotkey脚本如下：
#Persistent
#SingleInstance Force

toggle := false                     ; 开关变量（false=停止, true=运行）

; =====================================================
; 当按下F键时，仅在指定浏览器窗口生效
; =====================================================
#If ( WinActive("ahk_exe chrome.exe") || WinActive("ahk_exe msedge.exe") || WinActive("ahk_exe firefox.exe") )
F::
    toggle := !toggle               ; 每次按下 Enter 切换状态
    if toggle{
        SetTimer, PressKey, 1000    ; 每隔1秒执行一次PressKey函数，自动按键
        Tooltip, Auto-Press started ; 弹窗提示自动按键已开启
        SetTimer, RemoveTip, -1000  ; 1s后执行RemoveTip函数，关闭弹窗
    }
    else{
        SetTimer, PressKey, Off     ; 关闭自动按键
        Tooltip, Auto-Press stopped ; 弹窗提示自动按键已关闭
        SetTimer, RemoveTip, -1000  ; 1s后执行RemoveTip函数，关闭弹窗
    }
return

PressKey:                           ; 函数PressKey函数功能：按F键
    SendInput F
return

RemoveTip:                          ; 函数RemoveTip功能：关闭弹窗
    Tooltip
return
; AutoHotkey脚本如上为止，效果为按一次F键后每隔1s模拟输入一次F键保持全屏，再按一次F键关闭。（仅在指定浏览器窗口生效）
*/


(function() {
    'use strict';

    // 默认播放倍速
    let speed = 1;
    console.log(`播放倍数已设置为${speed}x`, new Date().toLocaleTimeString());

    // 跳过开头秒数（可在页面输入框修改），默认值为20s
    let skip_start = GM_getValue('skip_start') ?? 20;
    console.log(`跳过开头秒数已设置为${skip_start}s`, new Date().toLocaleTimeString());

    // 跳过结尾秒数（可在页面输入框修改），默认值为8s
    let skip_end = GM_getValue('skip_end') ?? 8;
    console.log(`跳过结尾秒数已设置为${skip_end}s`, new Date().toLocaleTimeString());

    // 函数auto_jump功能：暂停时自动点击“继续播放”按钮（防止中途暂停）
    function auto_jump() {
        console.log('调用auto_jump函数', new Date().toLocaleTimeString());
        let video = document.getElementsByTagName('video');
        const videoE1 = video[0]
        videoE1.onpause = function() {
            let jump = setInterval(function() {
                let con = document.querySelector(".u-btn.u-btn-default.cont.j-continue");
                if (con) {
                    con.click();
                    clearInterval(jump);
                }
            }, 100);
        };
    }

    // 函数FullScreen功能：全屏播放
    function FullScreen() {
        console.log('调用FullScreen函数', new Date().toLocaleTimeString());
        let ele = document.getElementsByTagName('video')[0];
        if (ele.requestFullscreen) {
            ele.requestFullscreen();
        } else if (ele.mozRequestFullScreen) {
            ele.mozRequestFullScreen();
        } else if (ele.webkitRequestFullScreen) {
            ele.webkitRequestFullScreen();
        }
    }

    // 函数show功能：及时显示当前倍速（在输入框占位符中显示）
    function show(i) {
        console.log('调用show函数', new Date().toLocaleTimeString());
        document.querySelector("#SpeedText").value = '';
        document.querySelector("#SpeedText").placeholder = String(i.toFixed(1));
        GM_setValue('speed', i);
    }

    // 主逻辑函数
    let main = () => {
        console.log('调用主函数', new Date().toLocaleTimeString());
        if (/content/.test(window.location.href)) {
            
            // 解除右键禁用，并阻止后续脚本再绑定事件
            setTimeout(() => {
                document.oncontextmenu = null;
                document.addEventListener('contextmenu', e => e.stopImmediatePropagation(), true);
                console.log('已解除右键禁用', new Date().toLocaleTimeString());
            }, 1000);

            // 解除某些自动按键屏蔽
            document.body.onkeydown = function(event) {
                if (window.event) return event;
                console.log('已解除按键屏蔽', new Date().toLocaleTimeString());
            };

            // 监控视频加载完成，并将auto_jump函数绑定到事件处理器上长期存在。每次视频被暂停时，函数里的onpause回调都会被触发
            let pass = setInterval(function() {
                let video = document.getElementsByTagName('video');
                const videoE1 = video[0]
                if (video.length > 0) {
                    clearInterval(pass);
                    auto_jump();

                    // 恢复上次的倍速设置
                    let has_value = GM_getValue('speed');
                    if (has_value && has_value !== "undefined") {
                        speed = has_value;
                        console.log(`恢复上次设置的播放速度：${speed}x`, new Date().toLocaleTimeString());
                    }
                    
                    // 删除慕课自带的倍速按钮
                    (document.querySelector(".controlbar_btn.ratebtn.j-ratebtn") || {}).style.display = "none";

                    // 应用倍速
                    videoE1.playbackRate = speed;
                    
                    // 跳过开头秒数并播放
                    videoE1.currentTime = Number(skip_start) || 0;
                    console.log('已跳过开头', new Date().toLocaleTimeString());
                    videoE1.play();

                    // 跳过结尾秒数（自动解除）
                    videoE1.addEventListener("timeupdate", () => {
                     if (videoE1.duration && videoE1.currentTime >= videoE1.duration - Number(skip_end)) {
                           videoE1.currentTime = videoE1.duration;
                           console.log('已跳过结尾', new Date().toLocaleTimeString());
                        }
                    });

                    // 添加操作UI（倍速、跳过开头秒数、跳过结尾秒数）
                    if (!document.querySelector("#StartTime")) {
                        let otest = document.querySelector("div.j-unitctBar.unitctBar.f-cb");

                        // UI结构
                        let nodestr = `
                        <br>
                        <div>
                          <div><a id="PinP" class="u-btn u-btn-default">画中画播放</a><a id="HelpBtn" class="u-btn u-btn-default" style="margin-left:10px;">使用说明</a></div>
                          <div><b>播放速度：</b><input type="text" id="SpeedText" style="border:black;outline:auto;padding-left:3px;"></div>
                          <div><b>跳过开头秒数（刷新生效）：</b><input type="text" id="StartTime" placeholder="${skip_start}" style="border:black;outline:auto;padding-left:3px;"></div>
                          <div><b>跳过结尾秒数（刷新生效）：</b><input type="text" id="EndTime" placeholder="${skip_end}" style="border:black;outline:auto;padding-left:3px;"></div>
                        </div>`;

                        // 插入到页面
                        let newnode = document.createRange().createContextualFragment(nodestr);
                        otest.insertBefore(newnode, document.querySelector(".j-report-bug"));
                        console.log('已添加操作UI', new Date().toLocaleTimeString());

                        // 画中画播放按钮
                        document.querySelector("#PinP").onclick = function() {
                            if (!document.pictureInPictureElement) {
                                video[0].requestPictureInPicture();
                                this.innerText = "恢复";
                            } else {
                                document.exitPictureInPicture();
                                this.innerText = "画中画播放";
                            }
                        };
                        // 使用说明按钮
                        document.querySelector("#HelpBtn").onclick = function() {
                            alert("快捷键（若失效，请在倍速栏输入任意速度后点击空白处再试）\n空格：播放/暂停（阻止页面滚动）\nF键：全屏\n→键：快进5秒\n←键：后退5秒\n1或Z：1倍速\nX键：减速0.1x\nC键：加速0.1x\n2：2倍速\n3：3倍速\n4：4倍速");
                            alert("默认倍速为1x\n默认跳过开头时间为20s\n默认跳过结尾时间为8s\n以上更改后会保存在cookies\n跳过开头和结尾时间修改后需要刷新页面生效\n\n已解除右键禁用和按键屏蔽\n已删除慕课自带的倍速按钮\n\n不能和Youtube一样自动播放仍保持全屏的原因和浏览器外的解决办法详见脚本代码，有问题请在Github联系quenching04")
                        }

                        // 倍速输入框
                        document.querySelector("#SpeedText").onblur = function() {
                            video[0].playbackRate = parseFloat(this.value);
                            GM_setValue('speed', video[0].playbackRate);
                            GM_setValue('is_focus', 0);
                            show(video[0].playbackRate);
                        };
                        document.querySelector("#SpeedText").onfocus = function() {
                            GM_setValue('is_focus', 1);
                        };

                        // 跳过开头秒数输入框
                        document.querySelector("#StartTime").onblur = function() {
                            GM_setValue('skip_start', Number(this.value));
                            GM_setValue('is_focus', 0);
                        };
                        document.querySelector("#StartTime").onfocus = function() {
                            GM_setValue('is_focus', 1);
                        };

                        // 跳过结尾秒数输入框
                        document.querySelector("#EndTime").onblur = function() {
                            GM_setValue('skip_end', Number(this.value));
                            GM_setValue('is_focus', 0);
                        };
                        document.querySelector("#EndTime").onfocus = function() {
                            GM_setValue('is_focus', 1);
                        };
                    }

                    show(video[0].playbackRate);

                    // 键盘快捷键控制
                    document.body.onkeydown = function(ev) {
                        if (GM_getValue('is_focus')) {
                            return ev;
                        } else {
                            let e = ev || event;
                            let video = document.getElementsByTagName('video')[0];
                            switch (e.keyCode) {
                                case 32: e.preventDefault(); video.paused ? video.play() : video.pause(); break;    // 空格：播放/暂停（阻止页面滚动）
                                case 70: FullScreen(); break;                                                       // F键：全屏
                                case 39: video.currentTime += 5; break;                                             // →键：快进5秒
                                case 37: video.currentTime -= 5; break;                                             // ←键：后退5秒
                                case 49: case 90: video.playbackRate = 1; break;                                    // 1 或 Z：1倍速
                                case 88: video.playbackRate -= 0.1; break;                                          // X键：减速0.1x
                                case 67: video.playbackRate += 0.1; break;                                          // C键：加速0.1x
                                case 50: video.playbackRate = 2; break;                                             // 2：2倍速
                                case 51: video.playbackRate = 3; break;                                             // 3：3倍速
                                case 52: video.playbackRate = 4; break;                                             // 4：4倍速
                                默认: return e;
                            }
                            GM_setValue('speed', video.playbackRate);
                            show(video.playbackRate);
                        }
                    };
                }
            }, 100);
        }
    };

    // 监听页面变化，防止切换章节失效
    let obser = setInterval(function() {
        let video = document.querySelector(".j-unitct.unitct");
        if (video) {
            clearInterval(obser);
            main();
            let observer = new MutationObserver(main);
            observer.observe(video, { attributes: true, childList: true });
        }
    }, 200);

})();
