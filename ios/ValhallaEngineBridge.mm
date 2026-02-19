#import "ValhallaEngineBridge.h"
#include <stdlib.h>
#include <string.h>

#ifdef VALHALLA_LINKED
#include <valhalla/tyr/actor.h>
#include <valhalla/config.h>
#include <boost/property_tree/ptree.hpp>
#include <memory>
#include <string>

static std::string g_tileDir;
static std::unique_ptr<valhalla::tyr::actor_t> g_actor;

static void ensureActor() {
  if (g_tileDir.empty()) return;
  boost::property_tree::ptree config;
  config.put("mjolnir.tile_dir", g_tileDir);
  config.put("mjolnir.tile_extract", "");
  config.put("loki.service_defaults.radius", 0);
  config.put("thor.service_defaults.max_distance", 500000.0);
  config.put("thor.service_defaults.max_matrix_distance", 500000.0);
  config.put("thor.service_defaults.max_matrix_locations", 100);
  config.put("meili.default.breaking", 0.5);
  config.put("meili.default.search_radius", 50);
  config.put("meili.default.turn_penalty_factor", 0.0);
  config.put("meili.default.gps_accuracy", 5.0);
  g_actor = std::make_unique<valhalla::tyr::actor_t>(config, true);
}
#endif

int ValhallaEngineBridge_Init(void) {
#ifdef VALHALLA_LINKED
  return 1;
#else
  return 1;
#endif
}

void ValhallaEngineBridge_LoadPack(const char* packPath, const char* checksum) {
  (void)checksum;
#ifdef VALHALLA_LINKED
  if (packPath) g_tileDir = packPath;
  g_actor.reset();
  ensureActor();
#endif
}

char* ValhallaEngineBridge_Route(const char* requestJson) {
#ifdef VALHALLA_LINKED
  if (!g_actor || !requestJson) return nullptr;
  try {
    std::string result = g_actor->route(std::string(requestJson), nullptr, nullptr);
    if (result.empty()) return nullptr;
    char* out = (char*)malloc(result.size() + 1);
    if (!out) return nullptr;
    memcpy(out, result.c_str(), result.size() + 1);
    return out;
  } catch (...) {
    return nullptr;
  }
#else
  (void)requestJson;
  return nullptr;
#endif
}

void ValhallaEngineBridge_FreeString(char* s) {
  free(s);
}

void ValhallaEngineBridge_Cancel(const char* requestId) {
  (void)requestId;
}
