#include <jni.h>
#include <string>
#include "EngineManager.h"

extern "C" {

static std::string jstringToStd(JNIEnv* env, jstring jstr) {
  if (!jstr) return "";
  const char* utf = env->GetStringUTFChars(jstr, nullptr);
  if (!utf) return "";
  std::string s(utf);
  env->ReleaseStringUTFChars(jstr, utf);
  return s;
}

JNIEXPORT jboolean JNICALL
Java_com_jansoft_mbukanji_valhalla_ValhallaModule_nativeInit(JNIEnv* env, jobject thiz) {
  (void)env;
  (void)thiz;
  bool ok = EngineManager::instance().init();
  return static_cast<jboolean>(ok ? JNI_TRUE : JNI_FALSE);
}

JNIEXPORT void JNICALL
Java_com_jansoft_mbukanji_valhalla_ValhallaModule_nativeLoadPack(JNIEnv* env, jobject thiz,
                                                                 jstring packPath, jstring checksum) {
  (void)thiz;
  std::string path = jstringToStd(env, packPath);
  std::string* cs = nullptr;
  std::string checksumStr;
  if (checksum) {
    checksumStr = jstringToStd(env, checksum);
    cs = &checksumStr;
  }
  EngineManager::instance().loadPack(path, cs);
}

JNIEXPORT jstring JNICALL
Java_com_jansoft_mbukanji_valhalla_ValhallaModule_nativeRouteJson(JNIEnv* env, jobject thiz,
                                                                  jstring requestId, jstring requestJson) {
  (void)thiz;
  std::string id = jstringToStd(env, requestId);
  std::string json = jstringToStd(env, requestJson);
  std::string result = EngineManager::instance().routeJson(id, json);
  return env->NewStringUTF(result.c_str());
}

JNIEXPORT void JNICALL
Java_com_jansoft_mbukanji_valhalla_ValhallaModule_nativeCancel(JNIEnv* env, jobject thiz,
                                                               jstring requestId) {
  (void)thiz;
  std::string id = jstringToStd(env, requestId);
  EngineManager::instance().cancel(id);
}

}  // extern "C"
