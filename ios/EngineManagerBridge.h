#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface EngineManagerBridge : NSObject

+ (BOOL)initEngine;
+ (void)loadPack:(NSString *)packPath checksum:(nullable NSString *)checksum error:(NSError **)error;
+ (nullable NSString *)routeJson:(NSString *)requestId requestJson:(NSString *)requestJson error:(NSError **)error;
+ (void)cancel:(NSString *)requestId;

@end

NS_ASSUME_NONNULL_END
