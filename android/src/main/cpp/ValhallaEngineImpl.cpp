#include "ValhallaEngineImpl.h"
#include <cstdlib>
#include <cstring>

#ifdef USE_VALHALLA
#include <valhalla/tyr/actor.h>
#include <valhalla/config.h>
#include <boost/property_tree/json_parser.hpp>
#include <boost/property_tree/ptree.hpp>
#include <memory>
#include <stdexcept>
#include <string>

namespace pt = boost::property_tree;

static std::string g_tile_dir;

extern "C" {

void* ValhallaEngineImpl_Create(void) {
  try {
    pt::ptree config;
    config.put("mjolnir.tile_dir", g_tile_dir.empty() ? "/data/local/tmp/valhalla_tiles" : g_tile_dir);
    config.put("mjolnir.tile_extract", "");
    config.put("loki.service_defaults.radius", 0);
    config.put("thor.service_defaults.max_distance", 500000.0);
    config.put("thor.service_defaults.max_matrix_distance", 500000.0);
    config.put("thor.service_defaults.max_matrix_locations", 100);
    config.put("meili.default.breaking", 0.5);
    config.put("meili.default.search_radius", 50);
    config.put("meili.default.turn_penalty_factor", 0.0);
    config.put("meili.default.gps_accuracy", 5.0);
    config.put("meili.default.search_radius", 50);
    auto* actor = new valhalla::tyr::actor_t(config, true);
    return static_cast<void*>(actor);
  } catch (...) {
    return nullptr;
  }
}

void ValhallaEngineImpl_Destroy(void* engine) {
  if (engine) {
    delete static_cast<valhalla::tyr::actor_t*>(engine);
  }
}

int ValhallaEngineImpl_Init(void* engine) {
  return engine ? 1 : 0;
}

void ValhallaEngineImpl_LoadPack(void* engine, const char* packPath, const char* checksum) {
  (void)engine;
  (void)checksum;
  if (packPath) g_tile_dir = packPath;
}

char* ValhallaEngineImpl_Route(void* engine, const char* requestJson) {
  if (!engine || !requestJson) return nullptr;
  try {
    valhalla::tyr::actor_t* actor = static_cast<valhalla::tyr::actor_t*>(engine);
    std::string result = actor->route(std::string(requestJson), nullptr, nullptr);
    if (result.empty()) return nullptr;
    char* out = static_cast<char*>(malloc(result.size() + 1));
    if (!out) return nullptr;
    memcpy(out, result.c_str(), result.size() + 1);
    return out;
  } catch (const std::exception&) {
    return nullptr;
  } catch (...) {
    return nullptr;
  }
}

void ValhallaEngineImpl_FreeString(char* s) {
  free(s);
}

void ValhallaEngineImpl_Cancel(void* engine, const char* requestId) {
  (void)engine;
  (void)requestId;
}

}
#else

extern "C" {

void* ValhallaEngineImpl_Create(void) { return nullptr; }
void ValhallaEngineImpl_Destroy(void* engine) { (void)engine; }
int ValhallaEngineImpl_Init(void* engine) { (void)engine; return 1; }
void ValhallaEngineImpl_LoadPack(void* engine, const char* packPath, const char* checksum) {
  (void)engine; (void)packPath; (void)checksum;
}
char* ValhallaEngineImpl_Route(void* engine, const char* requestJson) {
  (void)engine; (void)requestJson; return nullptr;
}
void ValhallaEngineImpl_FreeString(char* s) { free(s); }
void ValhallaEngineImpl_Cancel(void* engine, const char* requestId) { (void)engine; (void)requestId; }

}
#endif
