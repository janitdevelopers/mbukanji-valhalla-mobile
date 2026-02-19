# Keep JNI native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep ValhallaModule and ValhallaPackage for React Native
-keep class com.jansoft.mbukanji.valhalla.ValhallaModule { *; }
-keep class com.jansoft.mbukanji.valhalla.ValhallaPackage { *; }
