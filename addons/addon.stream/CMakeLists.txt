if (WHISPER_SDL2)
    # stream
    set(TARGET whisper-stream)

    # 沒有要建立可執行檔了，只需建立 dylib for nodejs
    # add_executable(${TARGET} stream.cpp)

    add_definitions(-DNAPI_VERSION=4)
    include_directories(${CMAKE_JS_INC})

    add_library(${TARGET} SHARED ${CMAKE_JS_SRC} napi.cpp task.cpp)
    set_target_properties(${TARGET} PROPERTIES PREFIX "" SUFFIX ".node")

    include(DefaultTargetOptions)

    execute_process(COMMAND node -p "require('node-addon-api').include"
        WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
        OUTPUT_VARIABLE NODE_ADDON_API_DIR
        )
    string(REPLACE "\n" "" NODE_ADDON_API_DIR ${NODE_ADDON_API_DIR})
    string(REPLACE "\"" "" NODE_ADDON_API_DIR ${NODE_ADDON_API_DIR})
    target_include_directories(${TARGET} PRIVATE ${NODE_ADDON_API_DIR})

    target_link_libraries(${TARGET} ${CMAKE_JS_LIB} common common-sdl whisper ${CMAKE_THREAD_LIBS_INIT})

    if(MSVC AND CMAKE_JS_NODELIB_DEF AND CMAKE_JS_NODELIB_TARGET)
        # Generate node.lib
        execute_process(COMMAND ${CMAKE_AR} /def:${CMAKE_JS_NODELIB_DEF} /out:${CMAKE_JS_NODELIB_TARGET} ${CMAKE_STATIC_LINKER_FLAGS})
    endif()
endif ()
