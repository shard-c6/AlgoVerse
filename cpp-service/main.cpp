#include "httplib.h"
#include "json.hpp"
#include "Algorithms.hpp"
#include <iostream>

using namespace httplib;
using json = nlohmann::json;

void set_cors_headers(Response& res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    res.set_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.set_header("Access-Control-Allow-Headers", "Content-Type");
}

void handle_request(const Request& req, Response& res, bool viz) {
    set_cors_headers(res);
    if (req.method == "OPTIONS") {
        res.status = 200;
        return;
    }
    
    try {
        json body = json::parse(req.body);
        std::string algo = body["algorithm"];
        std::vector<int> array = body["array"];
        std::string language = body.value("language", "cpp");
        
        json result;
        if (language == "c") {
            result = run_c_algorithm(algo, array, viz);
        } else {
            result = run_cpp_algorithm(algo, array, viz);
        }
        
        res.set_content(result.dump(), "application/json");
    } catch (const std::exception& e) {
        json err;
        err["error"] = e.what();
        res.status = 400;
        res.set_content(err.dump(), "application/json");
    }
}

int main() {
    Server svr;

    svr.Options("/visualize", [](const Request& req, Response& res) { set_cors_headers(res); res.status = 200; });
    svr.Options("/benchmark", [](const Request& req, Response& res) { set_cors_headers(res); res.status = 200; });

    svr.Post("/visualize", [](const Request& req, Response& res) { handle_request(req, res, true); });
    svr.Post("/benchmark", [](const Request& req, Response& res) { handle_request(req, res, false); });

    std::cout << "C/C++ Service running on port 8085" << std::endl;
    svr.listen("0.0.0.0", 8085);
    
    return 0;
}
