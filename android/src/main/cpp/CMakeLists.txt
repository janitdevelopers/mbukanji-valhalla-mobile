cmake_minimum_required(VERSION 3.22.1)
project("valhalla-jni")

set(CMAKE_CXX_STANDARD 17)

# Optional: set when Valhalla is built for Android and install prefix is available.
# e.g. -DVALHALLA_PREFIX=/path/to/valhalla-install-arm64-v8a
if(DEFINED VALHALLA_PREFIX AND VALHALLA_PREFIX)
  set(USE_VALHALLA_TRUE 1)
  message(STATUS "Linking Valhalla from ${VALHALLA_PREFIX}")
else()
  set(USE_VALHALLA_TRUE 0)
  message(STATUS "Building without Valhalla (stub routing)")
endif()

add_library(valhalla-jni SHARED
  ValhallaJni.cpp
  EngineManager.cpp
  ValhallaEngineImpl.cpp
)

target_include_directories(valhalla-jni PRIVATE ${CMAKE_SOURCE_DIR})

if(USE_VALHALLA_TRUE)
  target_compile_definitions(valhalla-jni PRIVATE USE_VALHALLA=1)
  target_include_directories(valhalla-jni PRIVATE ${VALHALLA_PREFIX}/include)
  target_link_directories(valhalla-jni PRIVATE ${VALHALLA_PREFIX}/lib)
  # Link Valhalla and its dependencies (adjust lib names to match your install)
  target_link_libraries(valhalla-jni
    valhalla
    android
    log
  )
else()
  target_link_libraries(valhalla-jni
    android
    log
  )
endif()
