#include "EngineManager.h"
#include "ValhallaEngineImpl.h"

EngineManager& EngineManager::instance() {
  static EngineManager inst;
  return inst;
}

EngineManager::EngineManager() : initialized_(false), workerRunning_(true), valhallaEngine_(nullptr) {
  worker_ = std::thread(&EngineManager::workerLoop, this);
}

EngineManager::~EngineManager() {
#ifdef USE_VALHALLA
  if (valhallaEngine_) {
    ValhallaEngineImpl_Destroy(valhallaEngine_);
    valhallaEngine_ = nullptr;
  }
#endif
  workerRunning_.store(false);
  post([]() {});
  if (worker_.joinable()) worker_.join();
}

void EngineManager::workerLoop() {
  while (workerRunning_.load()) {
    std::function<void()> task;
    {
      std::lock_guard<std::mutex> lock(mutex_);
      if (queue_.empty()) continue;
      task = std::move(queue_.front());
      queue_.pop();
    }
    if (task) task();
  }
}

void EngineManager::post(std::function<void()> task) {
  std::lock_guard<std::mutex> lock(mutex_);
  queue_.push(std::move(task));
}

bool EngineManager::init() {
#ifdef USE_VALHALLA
  valhallaEngine_ = ValhallaEngineImpl_Create();
  if (!ValhallaEngineImpl_Init(valhallaEngine_)) {
    if (valhallaEngine_) ValhallaEngineImpl_Destroy(valhallaEngine_);
    valhallaEngine_ = nullptr;
    return false;
  }
#endif
  initialized_.store(true);
  return true;
}

void EngineManager::loadPack(const std::string& packPath, const std::string* checksum) {
  std::lock_guard<std::mutex> lock(mutex_);
#ifdef USE_VALHALLA
  if (valhallaEngine_) {
    ValhallaEngineImpl_Destroy(valhallaEngine_);
    valhallaEngine_ = nullptr;
  }
  ValhallaEngineImpl_LoadPack(nullptr, packPath.c_str(), checksum ? checksum->c_str() : nullptr);
  valhallaEngine_ = ValhallaEngineImpl_Create();
#endif
  activePackPath_ = packPath;
}

std::string EngineManager::routeJson(const std::string& requestId, const std::string& requestJson) {
  (void)requestId;
  if (!initialized_.load()) return "";
  std::lock_guard<std::mutex> lock(mutex_);
  if (activePackPath_.empty()) return "";
#ifdef USE_VALHALLA
  if (valhallaEngine_) {
    char* result = ValhallaEngineImpl_Route(valhallaEngine_, requestJson.c_str());
    if (result) {
      std::string s(result);
      ValhallaEngineImpl_FreeString(result);
      return s;
    }
  }
#endif
  return "";
}

void EngineManager::cancel(const std::string& requestId) {
#ifdef USE_VALHALLA
  if (valhallaEngine_) ValhallaEngineImpl_Cancel(valhallaEngine_, requestId.c_str());
#endif
  (void)requestId;
}
