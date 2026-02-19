#ifndef VALHALLA_ENGINE_IMPL_H
#define VALHALLA_ENGINE_IMPL_H

#include <cstddef>

/**
 * Opaque C-style API for Valhalla engine. When USE_VALHALLA is defined and
 * Valhalla lib is linked, these call into valhalla::tyr::actor_t. Otherwise stubs.
 * EngineManager uses this so it never includes Valhalla headers.
 */
extern "C" {

void* ValhallaEngineImpl_Create(void);
void ValhallaEngineImpl_Destroy(void* engine);
int ValhallaEngineImpl_Init(void* engine);
void ValhallaEngineImpl_LoadPack(void* engine, const char* packPath, const char* checksum);
/** Returns JSON route string; caller must call ValhallaEngineImpl_FreeString. Returns nullptr if no route. */
char* ValhallaEngineImpl_Route(void* engine, const char* requestJson);
void ValhallaEngineImpl_FreeString(char* s);
void ValhallaEngineImpl_Cancel(void* engine, const char* requestId);

}

#endif
