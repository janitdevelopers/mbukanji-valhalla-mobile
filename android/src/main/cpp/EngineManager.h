#ifndef ENGINE_MANAGER_H
#define ENGINE_MANAGER_H

#include <string>
#include <mutex>
#include <atomic>
#include <functional>
#include <queue>
#include <thread>

/**
 * Process-level singleton. Owns one Valhalla engine instance (stub until Valhalla lib is linked).
 * All init, loadPack, and route work runs on a worker thread; never on UI thread.
 */
class EngineManager {
 public:
  static EngineManager& instance();

  EngineManager(const EngineManager&) = delete;
  EngineManager& operator=(const EngineManager&) = delete;

  void post(std::function<void()> task);

  bool init();
  void loadPack(const std::string& packPath, const std::string* checksum);
  std::string routeJson(const std::string& requestId, const std::string& requestJson);
  void cancel(const std::string& requestId);

  bool isInitialized() const { return initialized_.load(); }

 private:
  EngineManager();
  ~EngineManager();

  void workerLoop();

  std::mutex mutex_;
  std::atomic<bool> initialized_;
  std::atomic<bool> workerRunning_;
  std::queue<std::function<void()>> queue_;
  std::thread worker_;
  std::string activePackPath_;
  void* valhallaEngine_;  /* ValhallaEngineImpl when USE_VALHALLA; otherwise nullptr */
};

#endif
