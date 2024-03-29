#ifndef TASK_H
#define TASK_H

#include "struct.h"
#include "napi.h"
#include "atomic"

int task(whisper_params & params, std::vector<std::vector<std::string>> & result, Napi::Env env, std::atomic<bool>& is_servicing, Napi::ThreadSafeFunction tsfn);

#endif