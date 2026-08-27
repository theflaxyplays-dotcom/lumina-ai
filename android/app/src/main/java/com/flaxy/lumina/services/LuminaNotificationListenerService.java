package com.flaxy.lumina.services;

import android.app.Notification;
import android.os.Bundle;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import com.flaxy.lumina.MainActivity;
import org.json.JSONObject;

public class LuminaNotificationListenerService extends NotificationListenerService {
    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        super.onNotificationPosted(sbn);
        if (sbn == null) return;
        String pkg = sbn.getPackageName();
        if (pkg != null && (pkg.contains("whatsapp") || pkg.contains("telegram") || pkg.contains("messaging"))) {
            Notification n = sbn.getNotification();
            if (n == null || n.extras == null) return;
            Bundle extras = n.extras;
            String title = extras.getString(Notification.EXTRA_TITLE, "");
            CharSequence textSeq = extras.getCharSequence(Notification.EXTRA_TEXT);
            String text = textSeq != null ? textSeq.toString() : "";

            if (!title.isEmpty() && !text.isEmpty()) {
                try {
                    JSONObject json = new JSONObject();
                    json.put("package", pkg);
                    json.put("sender", title);
                    json.put("message", text);
                    json.put("timestamp", System.currentTimeMillis());

                    if (MainActivity.instance != null) {
                        MainActivity.instance.runOnUiThread(() -> {
                            MainActivity.instance.dispatchNotificationToWebView(json.toString());
                        });
                    }
                } catch (Exception ignored) {}
            }
        }
    }
}
