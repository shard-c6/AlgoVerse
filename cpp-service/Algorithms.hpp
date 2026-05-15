#pragma once
#include "json.hpp"
#include <vector>
#include <string>

using json = nlohmann::json;

json run_c_algorithm(const std::string& algo, std::vector<int> array, bool viz);
json run_cpp_algorithm(const std::string& algo, std::vector<int> array, bool viz);
