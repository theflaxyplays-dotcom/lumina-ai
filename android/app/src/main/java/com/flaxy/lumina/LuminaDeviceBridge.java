package com.flaxy.lumina;

import android.content.Context;
import android.content.Intent;
import android.hardware.camera2.CameraManager;
import android.media.AudioManager;
import android.net.Uri;
import android.webkit.JavascriptInterface;
import com.flaxy.lumina.services.LuminaAccessibilityService;

public class LuminaDeviceBridge {
    private Context context;

    public LuminaDeviceBridge(Context context) {
        this.context = context;
    }

    @JavascriptInterface
    public boolean clickText(String targetText) {
        if (LuminaAccessibilityService.instance != null) {
            return LuminaAccessibilityService.instance.clickByText(targetText);
        }
        return false;
    }

    @JavascriptInterface
    public boolean typeText(String text, String viewId) {
        if (LuminaAccessibilityService.instance != null) {
            return LuminaAccessibilityService.instance.setInputText(text, viewId);
        }
        return false;
    }

    @JavascriptInterface
    public boolean setTorch(boolean enabled) {
        try {
            CameraManager cm = (CameraManager) context.getSystemService(Context.CAMERA_SERVICE);
            String cameraId = cm.getCameraIdList()[0];
            cm.setTorchMode(cameraId, enabled);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @JavascriptInterface
    public boolean setVolumePercent(int percent) {
        try {
            AudioManager am = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
            int max = am.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
            int target = (int) (max * (Math.max(0, Math.min(100, percent)) / 100.0));
            am.setStreamVolume(AudioManager.STREAM_MUSIC, target, AudioManager.FLAG_SHOW_UI);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @JavascriptInterface
    public boolean dialPhone(String phoneNumber) {
        try {
            Intent intent = new Intent(Intent.ACTION_CALL, Uri.parse("tel:" + phoneNumber));
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @JavascriptInterface
    public boolean openWhatsApp(String phoneNumber, String messageText) {
        try {
            String clean = phoneNumber.replace("+", "").replace(" ", "");
            String url = "https://api.whatsapp.com/send?phone=" + clean + "&text=" + Uri.encode(messageText);
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
