package com.flaxy.lumina.services;

import android.accessibilityservice.AccessibilityService;
import android.os.Bundle;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import java.util.List;

public class LuminaAccessibilityService extends AccessibilityService {
    public static LuminaAccessibilityService instance;

    @Override
    protected void onServiceConnected() {
        super.onServiceConnected();
        instance = this;
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {}

    @Override
    public void onInterrupt() {
        instance = null;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        instance = null;
    }

    public boolean clickByText(String targetText) {
        AccessibilityNodeInfo root = getRootInActiveWindow();
        if (root == null) return false;
        List<AccessibilityNodeInfo> nodes = root.findAccessibilityNodeInfosByText(targetText);
        for (AccessibilityNodeInfo node : nodes) {
            if (node.isClickable() && node.performAction(AccessibilityNodeInfo.ACTION_CLICK)) return true;
            AccessibilityNodeInfo parent = node.getParent();
            while (parent != null) {
                if (parent.isClickable() && parent.performAction(AccessibilityNodeInfo.ACTION_CLICK)) return true;
                parent = parent.getParent();
            }
        }
        return false;
    }

    public boolean setInputText(String text, String viewId) {
        AccessibilityNodeInfo root = getRootInActiveWindow();
        if (root == null) return false;
        AccessibilityNodeInfo target = null;
        if (viewId != null) {
            List<AccessibilityNodeInfo> nodes = root.findAccessibilityNodeInfosByViewId(viewId);
            if (!nodes.isEmpty()) target = nodes.get(0);
        } else {
            target = findFocusedNode(root);
        }
        if (target != null) {
            Bundle args = new Bundle();
            args.putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, text);
            return target.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, args);
        }
        return false;
    }

    private AccessibilityNodeInfo findFocusedNode(AccessibilityNodeInfo node) {
        if (node.isEditable() && (node.isFocused() || node.isSelected())) return node;
        for (int i = 0; i < node.getChildCount(); i++) {
            AccessibilityNodeInfo child = node.getChild(i);
            if (child != null) {
                AccessibilityNodeInfo found = findFocusedNode(child);
                if (found != null) return found;
            }
        }
        return null;
    }

    public boolean performGlobal(String actionType) {
        if ("home".equalsIgnoreCase(actionType)) return performGlobalAction(GLOBAL_ACTION_HOME);
        if ("back".equalsIgnoreCase(actionType)) return performGlobalAction(GLOBAL_ACTION_BACK);
        if ("notifications".equalsIgnoreCase(actionType)) return performGlobalAction(GLOBAL_ACTION_NOTIFICATIONS);
        if ("lock".equalsIgnoreCase(actionType)) return performGlobalAction(GLOBAL_ACTION_LOCK_SCREEN);
        return false;
    }
}
