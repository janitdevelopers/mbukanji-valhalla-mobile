#import "EngineManagerBridge.h"
#import "ValhallaEngineBridge.h"
#import <Foundation/Foundation.h>

static BOOL _initialized = NO;
static NSString *_activePackPath = @"";

@implementation EngineManagerBridge

+ (BOOL)initEngine {
  if (ValhallaEngineBridge_Init()) {
    _initialized = YES;
    return YES;
  }
  return NO;
}

+ (void)loadPack:(NSString *)packPath checksum:(NSString *)checksum error:(NSError **)error {
  (void)error;
  _activePackPath = packPath ?: @"";
  ValhallaEngineBridge_LoadPack(_activePackPath.UTF8String, checksum.UTF8String);
}

+ (NSString *)routeJson:(NSString *)requestId requestJson:(NSString *)requestJson error:(NSError **)error {
  (void)requestId;
  (void)error;
  if (!_initialized || _activePackPath.length == 0) {
    return nil;
  }
  char* result = ValhallaEngineBridge_Route(requestJson.UTF8String);
  if (!result) return nil;
  NSString* ns = [NSString stringWithUTF8String:result];
  ValhallaEngineBridge_FreeString(result);
  return ns;
}

+ (void)cancel:(NSString *)requestId {
  ValhallaEngineBridge_Cancel(requestId.UTF8String);
}

@end
