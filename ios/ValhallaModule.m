#import <React/RCTBridgeModule.h>
#import <React/RCTLog.h>
#import "EngineManagerBridge.h"

@interface ValhallaModule : NSObject <RCTBridgeModule>
@end

@implementation ValhallaModule

RCT_EXPORT_MODULE(ValhallaModule)

RCT_EXPORT_METHOD(init:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  BOOL ok = [EngineManagerBridge initEngine];
  if (ok) {
    resolve(nil);
  } else {
    reject(@"ENGINE_INIT_FAILED", @"Native engine failed to initialize", nil);
  }
}

RCT_EXPORT_METHOD(loadPack:(NSString *)packPath
                  options:(NSDictionary *)options
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  NSString *checksum = options[@"checksum"];
  NSError *error = nil;
  [EngineManagerBridge loadPack:packPath checksum:checksum error:&error];
  if (error) {
    NSString *code = error.userInfo[@"code"] ?: @"UNKNOWN";
    reject(code, error.localizedDescription, error);
  } else {
    resolve(nil);
  }
}

RCT_EXPORT_METHOD(routeJson:(NSString *)requestId
                  requestJson:(NSString *)requestJson
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  NSError *error = nil;
  NSString *result = [EngineManagerBridge routeJson:requestId requestJson:requestJson error:&error];
  if (error) {
    NSString *code = error.userInfo[@"code"] ?: @"UNKNOWN";
    reject(code, error.localizedDescription, error);
    return;
  }
  if (result == nil || result.length == 0) {
    reject(@"ROUTE_NOT_FOUND", @"No route found", nil);
    return;
  }
  resolve(@{ @"result": result });
}

RCT_EXPORT_METHOD(cancel:(NSString *)requestId
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [EngineManagerBridge cancel:requestId];
  resolve(nil);
}

@end
