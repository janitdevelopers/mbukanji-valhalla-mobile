package com.jansoft.mbukanji.valhalla;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;

/**
 * React Native native module for Valhalla routing.
 * Exposes init(), loadPack(packPath), routeJson(requestId, request), cancel(requestId).
 * All routing work runs on a native worker thread (EngineManager).
 */
public class ValhallaModule extends ReactContextBaseJavaModule {

  private static final String TAG = "ValhallaModule";

  public ValhallaModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "ValhallaModule";
  }

  @ReactMethod
  public void init(Promise promise) {
    try {
      boolean ok = nativeInit();
      if (ok) {
        promise.resolve(null);
      } else {
        rejectWithCode(promise, "ENGINE_INIT_FAILED", "Native engine failed to initialize");
      }
    } catch (Exception e) {
      Log.e(TAG, "init failed", e);
      rejectWithCode(promise, "ENGINE_INIT_FAILED", e.getMessage() != null ? e.getMessage() : "Init failed");
    }
  }

  @ReactMethod
  public void loadPack(String packPath, ReadableMap options, Promise promise) {
    try {
      String checksum = options != null && options.hasKey("checksum") ? options.getString("checksum") : null;
      nativeLoadPack(packPath, checksum);
      promise.resolve(null);
    } catch (Exception e) {
      String msg = e.getMessage() != null ? e.getMessage() : "Load pack failed";
      if (msg.contains("checksum") || msg.contains("corrupt")) {
        rejectWithCode(promise, "PACK_CORRUPT", msg);
      } else if (msg.contains("compat") || msg.contains("version")) {
        rejectWithCode(promise, "PACK_INCOMPATIBLE", msg);
      } else {
        rejectWithCode(promise, "UNKNOWN", msg);
      }
    }
  }

  @ReactMethod
  public void routeJson(String requestId, String requestJson, Promise promise) {
    try {
      String resultJson = nativeRouteJson(requestId, requestJson);
      if (resultJson == null || resultJson.isEmpty()) {
        rejectWithCode(promise, "ROUTE_NOT_FOUND", "No route found", requestId);
        return;
      }
      WritableMap map = Arguments.createMap();
      map.putString("result", resultJson);
      promise.resolve(map);
    } catch (Exception e) {
      String msg = e.getMessage() != null ? e.getMessage() : "Route failed";
      String code = mapExceptionToErrorCode(msg);
      rejectWithCode(promise, code, msg, requestId);
    }
  }

  @ReactMethod
  public void cancel(String requestId, Promise promise) {
    try {
      nativeCancel(requestId);
      promise.resolve(null);
    } catch (Exception e) {
      Log.e(TAG, "cancel failed", e);
      rejectWithCode(promise, "UNKNOWN", e.getMessage() != null ? e.getMessage() : "Cancel failed");
    }
  }

  private void rejectWithCode(Promise promise, String code, String message) {
    rejectWithCode(promise, code, message, null);
  }

  private void rejectWithCode(Promise promise, String code, String message, String requestId) {
    WritableMap err = Arguments.createMap();
    err.putString("code", code);
    err.putString("message", message);
    if (requestId != null) err.putString("requestId", requestId);
    promise.reject(code, message, null, err);
  }

  private static String mapExceptionToErrorCode(String message) {
    if (message == null) return "UNKNOWN";
    if (message.contains("cancel")) return "CANCELLED";
    if (message.contains("timeout")) return "TIMEOUT";
    if (message.contains("not found") || message.contains("No route")) return "ROUTE_NOT_FOUND";
    if (message.contains("invalid") || message.contains("malformed")) return "INVALID_REQUEST";
    return "UNKNOWN";
  }

  private static native boolean nativeInit();
  private static native void nativeLoadPack(String packPath, String checksum);
  private static native String nativeRouteJson(String requestId, String requestJson);
  private static native void nativeCancel(String requestId);

  static {
    try {
      System.loadLibrary("valhalla-jni");
    } catch (UnsatisfiedLinkError e) {
      Log.e(TAG, "Failed to load valhalla-jni", e);
    }
  }
}
