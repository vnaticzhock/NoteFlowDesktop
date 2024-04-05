## TARGET=whisper-addon
set(TARGET whisper-addon)

# Base settings
#==================================================================
# env var supported by cmake-js, 設定 NAPI_VERSION 為 4 && include file 是 CMAKE_JS_INC
# CMAKE_JS_INC: include file like Node.js && V8 Engine header files
add_definitions(-DNAPI_VERSION=4)
include_directories(${CMAKE_JS_INC})
#==================================================================

## 把我的 TARGET 建立成一個 shared lib && 這個 lib 會 linking SMAKE_JS_SRC && compling cpp files.
add_library(${TARGET} SHARED ${CMAKE_JS_SRC} addon.cpp)
## output library 名稱加入 .node
set_target_properties(${TARGET} PROPERTIES PREFIX "" SUFFIX ".node")

include(DefaultTargetOptions)

# Include N-API wrappers
#==================================================================
execute_process(COMMAND node -p "require('node-addon-api').include"
        WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
        OUTPUT_VARIABLE NODE_ADDON_API_DIR
        )
string(REPLACE "\n" "" NODE_ADDON_API_DIR ${NODE_ADDON_API_DIR})
string(REPLACE "\"" "" NODE_ADDON_API_DIR ${NODE_ADDON_API_DIR})
target_include_directories(${TARGET} PRIVATE ${NODE_ADDON_API_DIR})
#==================================================================

## 把 TARGET 的 dependencies: *libraries (mxs) 都串起來
target_link_libraries(${TARGET} ${CMAKE_JS_LIB} common whisper ${CMAKE_THREAD_LIBS_INIT})

if(MSVC AND CMAKE_JS_NODELIB_DEF AND CMAKE_JS_NODELIB_TARGET)
    # Generate node.lib
    execute_process(COMMAND ${CMAKE_AR} /def:${CMAKE_JS_NODELIB_DEF} /out:${CMAKE_JS_NODELIB_TARGET} ${CMAKE_STATIC_LINKER_FLAGS})
endif()
