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
