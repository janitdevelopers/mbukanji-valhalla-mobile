#ifndef ValhallaEngineBridge_h
#define ValhallaEngineBridge_h

#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

/** Initialize; returns 1 on success, 0 on failure. */
int ValhallaEngineBridge_Init(void);
/** Set tile directory (pack path). Call before Route. */
void ValhallaEngineBridge_LoadPack(const char* packPath, const char* checksum);
/** Route request JSON; returns malloc'd JSON string or NULL. Caller frees. */
char* ValhallaEngineBridge_Route(const char* requestJson);
void ValhallaEngineBridge_FreeString(char* s);
void ValhallaEngineBridge_Cancel(const char* requestId);

#ifdef __cplusplus
}
#endif

#endif
