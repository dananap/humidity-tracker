cmake_minimum_required(VERSION 3.10)

# set the project name
project(humidity-tracker VERSION 0.1.0)
# specify the C++ standard
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED True)

if(NOT CMAKE_BUILD_TYPE)
  set(CMAKE_BUILD_TYPE Release)
endif()

set(CMAKE_CXX_FLAGS_DEBUG "-g")
set(CMAKE_CXX_FLAGS_RELEASE "-O3")

set(CMAKE_PREFIX_PATH lib)
set(REDIS_PLUS_PLUS_HEADER lib/redis-plus-plus/src)

# add the executable
add_executable(sensor src/sensor.cpp)

install(TARGETS sensor
        CONFIGURATIONS Debug
        RUNTIME DESTINATION ${CMAKE_CURRENT_SOURCE_DIR}/bin/debug)
install(TARGETS sensor
        CONFIGURATIONS Release
        RUNTIME DESTINATION ${CMAKE_CURRENT_SOURCE_DIR}/bin)
