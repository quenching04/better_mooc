; 想要自动播放后仍保持全屏可以下载AutoHotkey-v1.0软件来模拟持续输全屏快捷键（Enter），AutoHotkey脚本如下：
#Persistent
#SingleInstance Force
toggle := false    ; 开关变量（false=停止, true=运行）
; =====================================================
; 当按下 Enter 时，仅在指定浏览器窗口生效
; =====================================================
Enter::
    ; 判断当前活动窗口是否是浏览器
    if WinActive("ahk_exe chrome.exe") or WinActive("ahk_exe msedge.exe") or WinActive("ahk_exe firefox.exe")
    {
        toggle := !toggle             ; 每次按下 Enter 切换状态
        if (toggle) {
            SetTimer, PressEnter, 1000   ; 开启定时器，每隔1秒执行一次
        } else {
            SetTimer, PressEnter, Off    ; 停止定时器
        }
    }
return
; =====================================================
; 定时执行函数：模拟按下 Enter 键
; =====================================================
PressEnter:
    Send, {Enter}
return
AutoHotkey脚本如上为止，效果为按一次Enter后每隔1s模拟输入一次Enter保持全屏，再按一次Enter关闭。
*/